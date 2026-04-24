// src/app/api/statutes/route.ts
// Simple dynamic statute list API. This is the database where Member 4 stores law/statute data.

import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const VALID_JURISDICTIONS = new Set(["BD", "EU", "US", "UK", "IN", "INTL"]);

function cleanText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function parseStringList(value: unknown): string[] {
  const raw = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(/[,\n]/)
      : [];

  return Array.from(
    new Set(
      raw
        .map((item) => (typeof item === "string" ? item.trim() : ""))
        .filter(Boolean)
    )
  );
}

function normalizeJurisdiction(value: unknown): string {
  const jurisdiction = cleanText(value).toUpperCase();
  return VALID_JURISDICTIONS.has(jurisdiction) ? jurisdiction : "BD";
}

export async function GET(req: NextRequest) {
  try {
    const query = req.nextUrl.searchParams.get("q")?.trim() || "";
    const jurisdiction = req.nextUrl.searchParams.get("jurisdiction")?.trim().toUpperCase() || "";
    const active = req.nextUrl.searchParams.get("active");

    const filters: Prisma.StatuteRuleWhereInput[] = [];

    if (query) {
      filters.push({
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { article: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
          { maxPenalty: { contains: query, mode: "insensitive" } },
        ],
      });
    }

    if (jurisdiction) filters.push({ jurisdiction });
    if (active === "true") filters.push({ isActive: true });
    if (active === "false") filters.push({ isActive: false });

    const where: Prisma.StatuteRuleWhereInput = filters.length ? { AND: filters } : {};

    const statutes = await prisma.statuteRule.findMany({
      where,
      orderBy: [{ jurisdiction: "asc" }, { name: "asc" }],
    });

    return NextResponse.json({ success: true, statutes, count: statutes.length });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;

    const name = cleanText(body.name);
    const article = cleanText(body.article);
    const description = cleanText(body.description);
    const maxPenalty = cleanText(body.maxPenalty);
    const jurisdiction = normalizeJurisdiction(body.jurisdiction);
    const keywords = parseStringList(body.keywords).map((keyword) => keyword.toLowerCase());
    const grievanceTypes = parseStringList(body.grievanceTypes);
    const isActive = typeof body.isActive === "boolean" ? body.isActive : true;

    if (!name || !article || !description || !maxPenalty) {
      return NextResponse.json(
        { success: false, error: "Name, article, description, and max penalty are required." },
        { status: 400 }
      );
    }

    const statute = await prisma.statuteRule.create({
      data: {
        name,
        jurisdiction,
        article,
        description,
        maxPenalty,
        keywords,
        grievanceTypes,
        isActive,
      },
    });

    return NextResponse.json({ success: true, data: statute }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
