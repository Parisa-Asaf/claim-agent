// src/app/api/extract/route.ts
// Feature 1: AI Evidence Extraction — Google Vision API + Prisma storage
// Member: Parisa Asaf (23101270)

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ExtractApiResponse, ExtractedReceiptData } from "@/types";
import crypto from "crypto";

// ─── Google Vision API call ───────────────────────────────────────────────────
async function callGoogleVisionAPI(base64Image: string, mimeType: string) {
  const apiKey = process.env.GOOGLE_VISION_API_KEY;

  if (!apiKey) {
    throw new Error("GOOGLE_VISION_API_KEY not set in environment variables");
  }

  const response = await fetch(
    `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requests: [
          {
            image: { content: base64Image },
            features: [
              { type: "TEXT_DETECTION", maxResults: 1 },
              { type: "DOCUMENT_TEXT_DETECTION", maxResults: 1 },
            ],
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    const err = await response.json();
    throw new Error(`Vision API error: ${JSON.stringify(err)}`);
  }

  return response.json();
}

// ─── Parse raw Vision text into structured fields ─────────────────────────────
async function parseReceiptWithAI(rawText: string): Promise<ExtractedReceiptData> {
  const OpenAI = (await import("openai")).default;
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You are a receipt parser. Extract structured data from raw OCR text. Return JSON only.",
      },
      {
        role: "user",
        content: `Extract these fields from the receipt text below. Return JSON with: merchant_name, transaction_date (ISO format), amount (number only), currency (3-letter code), confidence_merchant (0-100), confidence_date (0-100), confidence_amount (0-100).\n\nReceipt text:\n${rawText}`,
      },
    ],
  });

  const parsed = JSON.parse(completion.choices[0].message.content || "{}");

  return {
    merchantName: parsed.merchant_name || "Unknown Merchant",
    transactionDate: parsed.transaction_date || new Date().toISOString().split("T")[0],
    amount: parsed.amount?.toString() || "0.00",
    currency: parsed.currency || "USD",
    confidenceMerchant: parsed.confidence_merchant || 85,
    confidenceDate: parsed.confidence_date || 80,
    confidenceAmount: parsed.confidence_amount || 90,
    rawText,
  };
}

// ─── Route Handler ────────────────────────────────────────────────────────────
export async function POST(req: NextRequest): Promise<NextResponse<ExtractApiResponse>> {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const claimId = formData.get("claimId") as string | null;

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: `Unsupported file type: ${file.type}` },
        { status: 400 }
      );
    }

    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString("base64");

    // Compute SHA-256 hash for this file (reused by Feature 2 if called together)
    const sha256Hash = crypto.createHash("sha256").update(buffer).digest("hex");

    let extractedData: ExtractedReceiptData;

    if (process.env.GOOGLE_VISION_API_KEY) {
      // ── PRODUCTION: Real Google Vision API ──
      const visionResponse = await callGoogleVisionAPI(base64, file.type);
      const rawText =
        visionResponse.responses?.[0]?.fullTextAnnotation?.text ||
        visionResponse.responses?.[0]?.textAnnotations?.[0]?.description ||
        "";

      if (!rawText) {
        return NextResponse.json(
          { success: false, error: "Could not extract text from image. Please use a clearer receipt image." },
          { status: 422 }
        );
      }

      extractedData = await parseReceiptWithAI(rawText);
    } else {
      // ── DEVELOPMENT FALLBACK: Simulate extraction ──
      console.warn("⚠ GOOGLE_VISION_API_KEY not set — using demo extraction");
      await new Promise((r) => setTimeout(r, 600)); // Simulate latency

      const demoData = [
        { merchant: "TechMart Electronics", date: "2025-02-14", amount: "349.99", currency: "USD", cm: 96, cd: 91, ca: 97 },
        { merchant: "Daraz Bangladesh", date: "2025-01-28", amount: "2500.00", currency: "BDT", cm: 93, cd: 88, ca: 95 },
        { merchant: "Amazon.com", date: "2025-03-05", amount: "89.99", currency: "USD", cm: 98, cd: 94, ca: 99 },
      ];
      const demo = demoData[Math.floor(Math.random() * demoData.length)];

      extractedData = {
        merchantName: demo.merchant,
        transactionDate: demo.date,
        amount: demo.amount,
        currency: demo.currency,
        confidenceMerchant: demo.cm,
        confidenceDate: demo.cd,
        confidenceAmount: demo.ca,
        rawText: `DEMO: ${demo.merchant} — ${demo.amount} ${demo.currency}`,
      };
    }

    // ── Persist to database ──
    const evidence = await prisma.evidence.create({
      data: {
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        merchantName: extractedData.merchantName,
        transactionDate: extractedData.transactionDate
          ? new Date(extractedData.transactionDate)
          : null,
        amount: parseFloat(extractedData.amount) || null,
        currency: extractedData.currency,
        rawExtraction: extractedData as object,
        confidenceScore:
          (extractedData.confidenceMerchant +
            extractedData.confidenceDate +
            extractedData.confidenceAmount) /
          3,
        sha256Hash,
        hashTimestamp: new Date(),
        ...(claimId ? { claimId } : {}),
      },
    });

    return NextResponse.json({
      success: true,
      data: extractedData,
      evidenceId: evidence.id,
    });
  } catch (error) {
    console.error("[/api/extract] Error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}

// GET: Retrieve a single evidence record
export async function GET(req: NextRequest): Promise<NextResponse> {
  const id = req.nextUrl.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ success: false, error: "id param required" }, { status: 400 });
  }

  const evidence = await prisma.evidence.findUnique({ where: { id } });

  if (!evidence) {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: evidence });
}
