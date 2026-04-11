import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

function safeParseJson(value: string | null | undefined) {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function averageConfidence(matches: LawMatchItem[]) {
  if (!matches.length) return 0;
  const total = matches.reduce((sum, item) => sum + (Number(item.confidence) || 0), 0);
  return Math.round(total / matches.length);
}

function categoryDistribution(matches: LawMatchItem[]) {
  if (!matches.length) return [];

  const map = new Map<string, number>();

  for (const match of matches) {
    const key = String(match.category || "Others").trim() || "Others";
    map.set(key, (map.get(key) || 0) + 1);
  }

  const total = matches.length;

  return Array.from(map.entries())
    .map(([category, count]) => ({
      category,
      count,
      percent: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count);
}

function cleanLookupDescription(payload: StoredTimelinePayload | null) {
  if (!payload) {
    return "Automated statute lookup was completed.";
  }

  const summary = payload.analysis?.overallSummary?.trim();
  const matches = payload.analysis?.matches || [];

  if (matches.length > 0) {
    const lawList = matches
      .slice(0, 3)
      .map((item) => `${item.lawTitle} (${item.confidence}%)`)
      .join(", ");

    return `${summary || "Automated statute lookup completed successfully."} Top matches: ${lawList}.`;
  }

  return (
    summary ||
    "Automated statute lookup completed, but no law matches were identified."
  );
}

function buildInvestigationFindings(params: {
  grievanceDescription: string;
  totalEvents: number;
  totalMatches: number;
  pdfParseFailed: boolean;
}) {
  const parts: string[] = [];

  parts.push(
    `The case investigation reviewed the submitted complaint and the recorded timeline of ${params.totalEvents} event${params.totalEvents === 1 ? "" : "s"}.`
  );

  if (params.totalMatches > 0) {
    parts.push(
      `${params.totalMatches} relevant law match${params.totalMatches === 1 ? "" : "es"} were identified from the grievance analysis.`
    );
  } else {
    parts.push("No confirmed law matches were available in the stored analysis.");
  }

  if (params.pdfParseFailed) {
    parts.push(
      "The uploaded PDF could not be fully parsed, so the report relied more heavily on manually entered complaint details."
    );
  }

  if (params.grievanceDescription) {
    parts.push(`Complaint summary: ${params.grievanceDescription.slice(0, 250)}`);
  }

  return parts.join(" ");
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const caseId = searchParams.get("caseId");

    if (!caseId) {
      return NextResponse.json({ error: "caseId is required" }, { status: 400 });
    }

    const grievance = await prisma.grievance.findUnique({
      where: { caseId },
      include: {
        timeline: {
          orderBy: { eventDate: "asc" },
        },
      },
    });

    if (!grievance) {
      return NextResponse.json(
        { error: "No report data found" },
        { status: 404 }
      );
    }

    const lookupEvent = grievance.timeline.find(
      (event) => event.title === "Automated Statute Lookup Completed"
    );

    const parsedLookup = safeParseJson(
      lookupEvent?.description
    ) as StoredTimelinePayload | null;

    const matches = parsedLookup?.analysis?.matches || [];
    const overallSummary =
      parsedLookup?.analysis?.overallSummary?.trim() ||
      grievance.description ||
      "No summary available.";

    const latestEvent = grievance.timeline[grievance.timeline.length - 1] || null;
    const confidence = averageConfidence(matches);
    const categories = categoryDistribution(matches);

    const formattedTimeline = grievance.timeline.map((event) => {
      if (event.title === "Automated Statute Lookup Completed") {
        return {
          id: event.id,
          event: event.title,
          description: cleanLookupDescription(parsedLookup),
          date: event.eventDate,
          fileName: event.fileName || null,
        };
      }

      return {
        id: event.id,
        event: event.title,
        description: event.description,
        date: event.eventDate,
        fileName: event.fileName || null,
      };
    });

    const report = {
      caseOverview: {
        caseId: grievance.caseId,
        title: grievance.title,
        location: grievance.location || "Not specified",
        category: grievance.category || "Not specified",
        filingDate: grievance.createdAt,
        closureDate: latestEvent?.eventDate || null,
        status: "Closed",
        totalEvents: grievance.timeline.length,
      },

      complainantDetails: {
        name: "Not provided",
        email: "Not provided",
        supportingFile: grievance.documentUrl || "N/A",
      },

      grievanceSummary: overallSummary,

      investigationFindings: buildInvestigationFindings({
        grievanceDescription: grievance.description,
        totalEvents: grievance.timeline.length,
        totalMatches: matches.length,
        pdfParseFailed: Boolean(parsedLookup?.pdfParseFailed),
      }),

      outcome: {
        status: "Closed",
        latestUpdate: latestEvent?.title || "No update available",
        closureDate: latestEvent?.eventDate || null,
        recoveryAmount: null,
        claimedLoss: null,
        recoveryRate: null,
        matchedLawsCount: matches.length,
        resolutionNote:
          latestEvent?.title === "Automated Statute Lookup Completed"
            ? cleanLookupDescription(parsedLookup)
            : latestEvent?.description || "No resolution note available.",
      },

      lawMatch: {
        confidence,
        totalMatches: matches.length,
        categoryDistribution: categories,
        matches,
      },

      timelineSummary: formattedTimeline,
    };

    return NextResponse.json(report);
  } catch (error) {
    console.error("Final report API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch final report" },
      { status: 500 }
    );
  }
}