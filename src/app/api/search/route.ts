import { NextRequest, NextResponse } from "next/server";
import { ClaimStatus, PriorityLevel, type Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { SearchApiResponse } from "@/types";

const STATUSES = new Set<string>(Object.values(ClaimStatus));
const PRIORITIES = new Set<string>(Object.values(PriorityLevel));

export async function GET(req: NextRequest): Promise<NextResponse<SearchApiResponse>> {
  try {
    const q = req.nextUrl.searchParams.get("q")?.trim() || "";
    const status = req.nextUrl.searchParams.get("status")?.trim().toUpperCase() || "";
    const priority = req.nextUrl.searchParams.get("priority")?.trim().toUpperCase() || "";
    const company = req.nextUrl.searchParams.get("company")?.trim() || "";

    const where: Prisma.ClaimWhereInput = {};

    if (status && STATUSES.has(status)) where.status = status as ClaimStatus;
    if (priority && PRIORITIES.has(priority)) where.priorityLevel = priority as PriorityLevel;

    if (company) {
      where.company = { name: { contains: company, mode: "insensitive" } };
    }

    if (q) {
      const numeric = /^\d+$/.test(q) ? Number(q) : undefined;
      where.OR = [
        ...(numeric ? [{ claimNumber: numeric }] : []),
        { title: { contains: q, mode: "insensitive" } },
        { grievanceText: { contains: q, mode: "insensitive" } },
        { grievanceType: { contains: q, mode: "insensitive" } },
        { violationType: { contains: q, mode: "insensitive" } },
        { company: { name: { contains: q, mode: "insensitive" } } },
      ];
    }

    const claims = await prisma.claim.findMany({
      where,
      include: { company: true, outcome: true },
      orderBy: { claimNumber: "desc" },
      take: 30,
    });

    const results = claims.map((claim) => ({
      id: claim.id,
      claimNumber: claim.claimNumber,
      title: claim.title || "Untitled Claim",
      status: claim.status,
      grievanceType: claim.grievanceType,
      priorityLevel: claim.priorityLevel,
      companyName: claim.company?.name || null,
      createdAt: claim.createdAt.toISOString(),
      updatedAt: claim.updatedAt.toISOString(),
      claimedAmount: claim.outcome?.claimedAmount ?? null,
      recoveredAmount: claim.outcome?.recoveredAmount ?? null,
      currency: claim.outcome?.currency ?? null,
    }));

    return NextResponse.json({ success: true, results, count: results.length });
  } catch (error) {
    return NextResponse.json(
      { success: false, results: [], count: 0, error: error instanceof Error ? error.message : "Search failed" },
      { status: 500 }
    );
  }
}
