// src/app/api/dashboard/route.ts
// Feature 3 (Module 3): Recovery Dashboard & Matrix

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const now = new Date();
    const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Fetch all claims with their outcomes and settlements
    const claims = await prisma.claim.findMany({
      include: {
        outcome: true,
        settlements: { orderBy: { createdAt: "desc" }, take: 1 },
        company: true,
      },
      orderBy: [{ priorityLevel: "asc" }, { expirationDate: "asc" }],
    });

    const totalClaims = claims.length;
    const activeClaims = claims.filter((c) =>
      ["DRAFT", "EVIDENCE_COLLECTED", "STATUTES_MATCHED", "READY_FOR_DISPATCH", "SENT", "RESPONSE_RECEIVED"].includes(c.status)
    ).length;
    const settledClaims = claims.filter((c) =>
      ["SETTLED", "CLOSED"].includes(c.status)
    ).length;
    const highPriorityClaims = claims.filter((c) => c.priorityLevel === "HIGH").length;

    const expiringSoon = claims.filter((c) => {
      if (!c.expirationDate) return false;
      return c.expirationDate <= sevenDaysLater && c.expirationDate >= now;
    }).length;

    // Financial aggregates (in BDT)
    let totalPotentialRefund = 0;
    let totalRecovered = 0;

    for (const c of claims) {
      if (c.outcome) {
        totalPotentialRefund += c.outcome.claimedAmount ?? 0;
        totalRecovered += c.outcome.recoveredAmount ?? 0;
      }
    }

    const recoveryRate =
      totalPotentialRefund > 0
        ? Math.round((totalRecovered / totalPotentialRefund) * 100)
        : 0;

    const closedClaims = claims.filter((c) => ["SETTLED", "CLOSED"].includes(c.status)).length;
    const successRate =
      closedClaims > 0 ? Math.round((settledClaims / closedClaims) * 100) : 0;

    // Build countdown list for active claims with expiration dates
    const countdowns = claims
      .filter((c) => c.expirationDate && activeClaims > 0)
      .map((c) => {
        const daysLeft = Math.ceil(
          (new Date(c.expirationDate!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );
        return {
          id: c.id,
          title: c.title || `Claim #${c.id.slice(0, 8)}`,
          violationType: c.violationType || "General",
          priorityLevel: c.priorityLevel,
          expirationDate: c.expirationDate!.toISOString(),
          daysLeft,
          claimedAmount: c.outcome?.claimedAmount ?? 0,
          currency: c.outcome?.currency ?? "BDT",
          status: c.status,
          company: c.company?.name ?? null,
        };
      })
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .slice(0, 10);

    return NextResponse.json({
      success: true,
      stats: {
        totalClaims,
        activeClaims,
        settledClaims,
        totalPotentialRefund,
        totalRecovered,
        recoveryRate,
        highPriorityClaims,
        expiringSoon,
        successRate,
      },
      countdowns,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
