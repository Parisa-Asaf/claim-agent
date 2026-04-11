import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";
import crypto from "crypto";
import { createRequire } from "module";

export const runtime = "nodejs";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function generateCaseId() {
  return `CASE-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

type PdfParseResult = {
  text?: string;
};

type LawMatchItem = {
  lawTitle: string;
  confidence: number;
  keywords: string[];
  summary: string;
  category: string;
};

type StructuredAnalysis = {
  matches: LawMatchItem[];
  overallSummary: string;
};

type StoredTimelinePayload = {
  fileHash: string;
  extractedTextPreview: string;
  analysis: StructuredAnalysis;
  rawModelOutput?: string;
  pdfParseFailed?: boolean;
};

async function extractTextFromPdf(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const pdfBuffer = Buffer.from(arrayBuffer);

  const fileHash = crypto.createHash("sha256").update(pdfBuffer).digest("hex");
  const parsed = (await pdfParse(pdfBuffer)) as PdfParseResult;
  const extractedText = parsed?.text?.trim() || "";

  return {
    extractedText,
    fileHash,
  };
}

function cleanString(value: unknown) {
  return String(value ?? "").trim();
}

function normalizeConfidence(value: unknown) {
  const num = Number(value);
  if (Number.isNaN(num)) return 0;
  return Math.max(0, Math.min(100, Math.round(num)));
}

function sanitizeAnalysis(data: any): StructuredAnalysis {
  const matchesRaw = Array.isArray(data?.matches) ? data.matches : [];

  const matches: LawMatchItem[] = matchesRaw
    .map((item: any) => ({
      lawTitle: cleanString(item?.lawTitle),
      confidence: normalizeConfidence(item?.confidence),
      keywords: Array.isArray(item?.keywords)
        ? item.keywords
            .map((k: unknown) => cleanString(k))
            .filter(Boolean)
            .slice(0, 8)
        : [],
      summary: cleanString(item?.summary),
      category: cleanString(item?.category),
    }))
    .filter(
      (item) =>
        item.lawTitle &&
        item.summary &&
        item.category &&
        item.confidence > 0
    );

  return {
    matches,
    overallSummary: cleanString(data?.overallSummary),
  };
}

function extractJsonObject(text: string) {
  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");

  if (first === -1 || last === -1 || last <= first) {
    throw new Error("No JSON object found in model output");
  }

  return text.slice(first, last + 1);
}

function buildFailureAnalysis(
  title: string,
  description: string,
  reason?: string
): StructuredAnalysis {
  const extra = reason ? ` Reason: ${reason}.` : "";

  return {
    matches: [],
    overallSummary: `Analysis could not be generated for "${title}".${extra} Complaint summary: ${description.slice(
      0,
      300
    )}`,
  };
}

async function generateStructuredAnalysis(params: {
  title: string;
  description: string;
  category: string;
  location: string;
  extractedText: string;
}) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is missing");
  }

  const prompt = `
Analyze this grievance using the user-entered details and extracted PDF text.

Return ONLY valid JSON in this exact format:

{
  "matches": [
    {
      "lawTitle": "string",
      "confidence": 0,
      "keywords": ["string"],
      "summary": "string",
      "category": "string"
    }
  ],
  "overallSummary": "string"
}

Rules:
- Do not use markdown code fences.
- Do not add explanation outside the JSON.
- Use the actual complaint details and PDF text.
- confidence must be 0 to 100.
- If nothing can be inferred, return "matches": [].
`.trim();

  const userContent = `
Complaint Title: ${params.title}
Category: ${params.category}
Location: ${params.location}
User Description:
${params.description}

Extracted PDF Text:
${params.extractedText}
`.trim();

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.1,
    messages: [
      { role: "system", content: prompt },
      { role: "user", content: userContent.slice(0, 18000) },
    ],
  });

  const raw = completion.choices[0]?.message?.content?.trim() || "";

  if (!raw) {
    throw new Error("Empty model response");
  }

  let parsed: any;
  try {
    parsed = JSON.parse(raw);
  } catch {
    const jsonText = extractJsonObject(raw);
    parsed = JSON.parse(jsonText);
  }

  const analysis = sanitizeAnalysis(parsed);

  return {
    analysis,
    rawModelOutput: raw,
  };
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const title = cleanString(formData.get("title"));
    const description = cleanString(formData.get("description"));
    const category = cleanString(formData.get("category"));
    const location = cleanString(formData.get("location"));
    const manualCaseId = cleanString(formData.get("caseId"));
    const file = formData.get("file") as File | null;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    if (!description) {
      return NextResponse.json(
        { error: "Description is required" },
        { status: 400 }
      );
    }

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "Please upload a PDF file" },
        { status: 400 }
      );
    }

    if (
      file.type !== "application/pdf" &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      return NextResponse.json(
        { error: "Only PDF files are allowed" },
        { status: 400 }
      );
    }

    let extractedText = "";
    let fileHash = "";
    let pdfParseFailed = false;

    try {
      const parsed = await extractTextFromPdf(file);
      extractedText = parsed.extractedText;
      fileHash = parsed.fileHash;

      console.log("PDF text preview:", extractedText.slice(0, 1000));
    } catch (err) {
      console.error("PDF Parsing Error:", err);
      extractedText = "";
      fileHash = crypto.createHash("sha256").update(file.name).digest("hex");
      pdfParseFailed = true;
    }

    let analysis: StructuredAnalysis;
    let rawModelOutput = "";

    try {
      const result = await generateStructuredAnalysis({
        title,
        description,
        category,
        location,
        extractedText:
          extractedText || "No readable PDF text could be extracted.",
      });

      analysis = result.analysis;
      rawModelOutput = result.rawModelOutput;

      console.log("RAW AI OUTPUT:", rawModelOutput);
      console.log("SANITIZED MATCHES:", analysis.matches);
    } catch (err: any) {
      console.error("OpenAI Analysis Error:", err);

      if (err?.status === 429 || err?.code === "insufficient_quota") {
        analysis = buildFailureAnalysis(
          title,
          description,
          "OpenAI API quota exceeded"
        );
      } else {
        analysis = buildFailureAnalysis(
          title,
          description,
          "OpenAI analysis failed"
        );
      }
    }

    const caseId = manualCaseId || generateCaseId();

    const payload: StoredTimelinePayload = {
      fileHash,
      extractedTextPreview: extractedText.slice(0, 1500),
      analysis,
      rawModelOutput,
      pdfParseFailed,
    };

    await prisma.$transaction(async (tx) => {
      await tx.grievance.create({
        data: {
          caseId,
          title,
          description,
          location: location || null,
          category: category || null,
          documentUrl: file.name,
        },
      });

      await tx.timelineEvent.createMany({
        data: [
          {
            caseId,
            title: "Complaint Submitted",
            description,
            fileName: file.name,
          },
          {
            caseId,
            title: "Laws Matched",
            description:
              analysis.matches.length > 0
                ? `Matched ${analysis.matches.length} relevant law(s) with the complaint details.`
                : "No law match result found yet.",
            fileName: file.name,
          },
          {
            caseId,
            title: "Automated Statute Lookup Completed",
            description: JSON.stringify(payload),
            fileName: file.name,
          },
          {
            caseId,
            title: "Investigation Completed",
            description:
              "Initial automated review completed. A report has been prepared.",
            fileName: null,
          },
        ],
      });
    });

    return NextResponse.json({
      success: true,
      caseId,
    });
  } catch (err) {
    console.error("Unexpected Error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const caseId = searchParams.get("caseId");

    if (!caseId) {
      return NextResponse.json(
        { error: "caseId is required" },
        { status: 400 }
      );
    }

    const grievance = await prisma.grievance.findUnique({
      where: { caseId },
    });

    if (!grievance) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    const latestTimeline = await prisma.timelineEvent.findFirst({
      where: {
        caseId,
        title: "Automated Statute Lookup Completed",
      },
      orderBy: { eventDate: "desc" },
    });

    let parsedPayload: StoredTimelinePayload | null = null;

    try {
      parsedPayload = latestTimeline?.description
        ? JSON.parse(latestTimeline.description)
        : null;
    } catch (err) {
      console.error("Stored payload parse error:", err);
    }

    return NextResponse.json({
      caseId: grievance.caseId,
      grievanceTitle: grievance.title,
      grievanceDescription: grievance.description,
      matches: parsedPayload?.analysis?.matches || [],
      overallSummary:
        parsedPayload?.analysis?.overallSummary || "No analysis summary found.",
      fileName: latestTimeline?.fileName || null,
      fileHash: parsedPayload?.fileHash || null,
      extractedTextPreview: parsedPayload?.extractedTextPreview || "",
      rawModelOutput: parsedPayload?.rawModelOutput || "",
      pdfParseFailed: parsedPayload?.pdfParseFailed || false,
    });
  } catch (err) {
    console.error("GET Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch case result" },
      { status: 500 }
    );
  }
}