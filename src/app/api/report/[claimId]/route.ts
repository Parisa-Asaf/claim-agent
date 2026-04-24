import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { OutcomeReportApiResponse, Statute } from "@/types";

type RouteContext = { params: { claimId: string } };

async function findClaimByReference(ref: string) {
  if (/^\d+$/.test(ref)) {
    return prisma.claim.findUnique({
      where: { claimNumber: Number(ref) },
      include: { company: true, statutes: true, settlements: true, outcome: true },
    });
  }

  return prisma.claim.findUnique({
    where: { id: ref },
    include: { company: true, statutes: true, settlements: true, outcome: true },
  });
}

export async function GET(
  _req: NextRequest,
  { params }: RouteContext
): Promise<NextResponse<OutcomeReportApiResponse>> {
  try {
    const claimReference = params.claimId;

    if (!claimReference) {
      return NextResponse.json({ success: false, error: "Claim number or ID is required" }, { status: 400 });
    }

    const claim = await findClaimByReference(claimReference);

    if (!claim) {
      return NextResponse.json({ success: false, error: "Claim not found" }, { status: 404 });
    }

    const statutes: Statute[] = claim.statutes.flatMap((lookup) => {
      const raw = lookup.statutes as unknown;
      return Array.isArray(raw) ? (raw as Statute[]) : [];
    });

    const timeline = [
      { label: "Claim Created", value: claim.createdAt.toISOString() },
      { label: "Last Updated", value: claim.updatedAt.toISOString() },
      { label: "Current Status", value: claim.status },
      { label: "Statute Matches", value: String(statutes.length) },
      { label: "Settlement Records", value: String(claim.settlements.length) },
      {
        label: "Recovery",
        value: claim.outcome?.isRecovered ? "Recovered" : "Pending / Not Recovered",
      },
    ];

    return NextResponse.json({
      success: true,
      data: {
        claimId: claim.id,
        claimNumber: claim.claimNumber,
        title: claim.title || "Untitled Claim",
        status: claim.status,
        grievanceText: claim.grievanceText,
        grievanceType: claim.grievanceType,
        violationType: claim.violationType,
        priorityLevel: claim.priorityLevel,
        companyName: claim.company?.name || null,
        companyAddress: claim.company?.address || null,
        createdAt: claim.createdAt.toISOString(),
        updatedAt: claim.updatedAt.toISOString(),
        statuteCount: statutes.length,
        settlementCount: claim.settlements.length,
        claimedAmount: claim.outcome?.claimedAmount ?? null,
        recoveredAmount: claim.outcome?.recoveredAmount ?? null,
        currency: claim.outcome?.currency ?? null,
        recoveryStatus: claim.outcome?.isRecovered ? "Recovered" : "Pending / Not Recovered",
        timeline,
        statutes,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to build report" },
      { status: 500 }
    );
  }
}
