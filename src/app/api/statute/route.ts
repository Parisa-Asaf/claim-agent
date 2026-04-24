// src/app/api/statute/route.ts
// Feature: Automated Statute Lookup without OpenAI.
// It matches grievances against YOUR database-backed statute list in statute_rules.

import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { Jurisdiction, Statute, StatuteApiResponse } from "@/types";

export const runtime = "nodejs";

const VALID_JURISDICTIONS: Jurisdiction[] = ["BD", "EU", "US", "UK", "IN", "INTL"];

type LawRecord = Statute & {
  keywords: string[];
  grievanceTypes: string[];
};

const STOP_WORDS = new Set([
  "the", "and", "for", "with", "that", "this", "from", "have", "has", "had", "was", "were", "are", "is", "be", "been", "being", "into", "within", "you", "your", "their", "they", "them", "will", "would", "should", "could", "about", "after", "before", "under", "over", "also", "than", "then", "such", "where", "when", "what", "which", "while", "there", "here", "because", "against",
]);

function tokenize(input: string): string[] {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word));
}

function getString(value: FormDataEntryValue | string | undefined | null): string {
  if (typeof value === "string") return value.trim();
  return "";
}

async function readBody(req: NextRequest): Promise<Record<string, string>> {
  const contentType = req.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    return {
      grievanceText: getString(form.get("grievanceText")),
      jurisdiction: getString(form.get("jurisdiction")),
      grievanceType: getString(form.get("grievanceType")),
      claimId: getString(form.get("claimId")),
    };
  }

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  return {
    grievanceText: typeof body.grievanceText === "string" ? body.grievanceText.trim() : "",
    jurisdiction: typeof body.jurisdiction === "string" ? body.jurisdiction.trim() : "",
    grievanceType: typeof body.grievanceType === "string" ? body.grievanceType.trim() : "",
    claimId: typeof body.claimId === "string" ? body.claimId.trim() : "",
  };
}

async function loadLawDatabase(): Promise<LawRecord[]> {
  const rows = await prisma.statuteRule.findMany({
    where: { isActive: true },
    orderBy: [{ jurisdiction: "asc" }, { name: "asc" }],
  });

  return rows.map((row) => ({
    name: row.name,
    jurisdiction: row.jurisdiction,
    article: row.article,
    description: row.description,
    maxPenalty: row.maxPenalty,
    keywords: row.keywords.map((keyword) => keyword.toLowerCase()),
    grievanceTypes: row.grievanceTypes,
  }));
}

function scoreLaw(
  law: LawRecord,
  grievanceText: string,
  grievanceType: string,
  jurisdiction: Jurisdiction
) {
  const tokens = new Set(tokenize(grievanceText));
  const matchedKeywords = law.keywords.filter((keyword) => tokens.has(keyword.toLowerCase()));

  let score = matchedKeywords.length * 12;

  if (law.grievanceTypes.includes(grievanceType)) score += 28;
  if (law.jurisdiction === jurisdiction) score += 20;
  if (law.jurisdiction === "INTL") score += 6;

  const joined = grievanceText.toLowerCase();
  const searchableLawText = `${law.name} ${law.article} ${law.description} ${law.maxPenalty}`.toLowerCase();

  if (joined.includes("refund") && searchableLawText.includes("refund")) score += 6;
  if (joined.includes("privacy") && searchableLawText.includes("privacy")) score += 8;
  if (joined.includes("unauthorized") && searchableLawText.includes("unauthorized")) score += 8;
  if (joined.includes("defect") && searchableLawText.includes("defect")) score += 8;
  if (joined.includes("delivery") && searchableLawText.includes("delivery")) score += 5;
  if (joined.includes("warranty") && searchableLawText.includes("warranty")) score += 5;

  return {
    score: Math.max(0, Math.min(100, score)),
    matchedKeywords,
  };
}

function lookupStatutes(
  lawDatabase: LawRecord[],
  grievanceText: string,
  jurisdiction: Jurisdiction,
  grievanceType: string
): Statute[] {
  const primary = lawDatabase.filter(
    (law) => law.jurisdiction === jurisdiction || law.jurisdiction === "INTL"
  );
  const candidatePool = primary.length ? primary : lawDatabase;

  const ranked = candidatePool
    .map((law) => {
      const { score } = scoreLaw(law, grievanceText, grievanceType, jurisdiction);
      const { keywords: _keywords, grievanceTypes: _grievanceTypes, ...statute } = law;
      return {
        ...statute,
        relevanceScore: score,
      };
    })
    .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));

  const meaningful = ranked.filter((law) => (law.relevanceScore || 0) >= 20).slice(0, 4);

  if (meaningful.length > 0) return meaningful;

  return ranked.slice(0, 3).map((law, index) => ({
    ...law,
    relevanceScore: index === 0 ? 45 : law.relevanceScore || 20,
  }));
}

export async function POST(req: NextRequest): Promise<NextResponse<StatuteApiResponse>> {
  try {
    const body = await readBody(req);
    const grievanceText = body.grievanceText;
    const requestedJurisdiction = body.jurisdiction || "BD";
    const jurisdiction = VALID_JURISDICTIONS.includes(requestedJurisdiction as Jurisdiction)
      ? (requestedJurisdiction as Jurisdiction)
      : "BD";
    const grievanceType = body.grievanceType || "General Consumer Complaint";
    const requestedClaimId = body.claimId || undefined;

    if (grievanceText.length < 10) {
      return NextResponse.json(
        { success: false, error: "Grievance text must be at least 10 characters." },
        { status: 400 }
      );
    }

    const lawDatabase = await loadLawDatabase();

    if (lawDatabase.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No active statutes are saved yet. Add statutes at /statutes first.",
        },
        { status: 400 }
      );
    }

    let linkedClaimId: string | undefined;

    if (requestedClaimId) {
      const existingClaim = /^\d+$/.test(requestedClaimId)
        ? await prisma.claim.findUnique({
            where: { claimNumber: Number(requestedClaimId) },
            select: { id: true },
          })
        : await prisma.claim.findUnique({
            where: { id: requestedClaimId },
            select: { id: true },
          });
      linkedClaimId = existingClaim?.id;
    }

    const statutes = lookupStatutes(lawDatabase, grievanceText, jurisdiction, grievanceType);

    const rawResponse: Prisma.JsonObject = {
      source: "database-rule-engine-v2",
      jurisdiction,
      grievanceType,
      inputLength: grievanceText.length,
      matchedCount: statutes.length,
      activeStatutesInDatabase: lawDatabase.length,
      apiKeyRequired: false,
    };

    const lookup = await prisma.statuteLookup.create({
      data: {
        grievanceText,
        grievanceType,
        jurisdiction,
        rawResponse,
        statutes: statutes as unknown as Prisma.InputJsonValue,
        ...(linkedClaimId ? { claimId: linkedClaimId } : {}),
      },
    });

    if (linkedClaimId) {
      await prisma.claim.update({
        where: { id: linkedClaimId },
        data: {
          status: "STATUTES_MATCHED",
          grievanceText,
          grievanceType,
        },
      }).catch(() => undefined);
    }

    return NextResponse.json({
      success: true,
      statutes,
      lookupId: lookup.id,
      model: "database-rule-engine-v2",
      ...(requestedClaimId && !linkedClaimId
        ? { warning: "The claim ID was not found, so this lookup was saved without linking to a claim." }
        : {}),
    });
  } catch (error) {
    console.error("[/api/statute] Error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const id = req.nextUrl.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "?id= required" }, { status: 400 });
    }

    const lookup = await prisma.statuteLookup.findUnique({ where: { id } });

    if (!lookup) {
      return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: lookup });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
