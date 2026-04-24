// src/app/api/statutes/[id]/route.ts
// Update/delete one saved statute rule.

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

function normalizeJurisdiction(value: unknown): string | undefined {
  const jurisdiction = cleanText(value).toUpperCase();
  return VALID_JURISDICTIONS.has(jurisdiction) ? jurisdiction : undefined;
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const data: Prisma.StatuteRuleUpdateInput = {};

    if (body.name !== undefined) data.name = cleanText(body.name);
    if (body.article !== undefined) data.article = cleanText(body.article);
    if (body.description !== undefined) data.description = cleanText(body.description);
    if (body.maxPenalty !== undefined) data.maxPenalty = cleanText(body.maxPenalty);
    if (body.jurisdiction !== undefined) data.jurisdiction = normalizeJurisdiction(body.jurisdiction) || "BD";
    if (body.keywords !== undefined) data.keywords = parseStringList(body.keywords).map((keyword) => keyword.toLowerCase());
    if (body.grievanceTypes !== undefined) data.grievanceTypes = parseStringList(body.grievanceTypes);
    if (body.isActive !== undefined) data.isActive = Boolean(body.isActive);

    const statute = await prisma.statuteRule.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json({ success: true, data: statute });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.statuteRule.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
