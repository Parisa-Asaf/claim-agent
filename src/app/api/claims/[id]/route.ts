import { NextRequest, NextResponse } from "next/server";
import { ClaimStatus, PriorityLevel, type Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { ClaimsApiResponse } from "@/types";

export const runtime = "nodejs";

const STATUSES = new Set<string>(Object.values(ClaimStatus));
const PRIORITIES = new Set<string>(Object.values(PriorityLevel));

function clean(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function amount(value: unknown): number | undefined {
  if (value === "" || value === null || value === undefined) return undefined;
  const parsed = Number(String(value).replace(/,/g, ""));
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

async function resolveClaim(ref: string) {
  if (/^\d+$/.test(ref)) return prisma.claim.findUnique({ where: { claimNumber: Number(ref) } });
  return prisma.claim.findUnique({ where: { id: ref } });
}

async function findOrCreateCompany(name: string, address: string, country: string) {
  const existing = await prisma.company.findFirst({
    where: { name: { equals: name, mode: "insensitive" } },
  });

  if (existing) {
    return prisma.company.update({
      where: { id: existing.id },
      data: { address, country },
    });
  }

  return prisma.company.create({
    data: {
      name,
      address,
      country,
      countryCode: "BD",
      verified: false,
    },
  });
}

function serializeClaim(claim: Prisma.ClaimGetPayload<{ include: { company: true; outcome: true } }>) {
  return {
    id: claim.id,
    claimNumber: claim.claimNumber,
    title: claim.title || "Untitled Claim",
    status: claim.status,
    grievanceText: claim.grievanceText,
    grievanceType: claim.grievanceType,
    violationType: claim.violationType,
    priorityLevel: claim.priorityLevel,
    companyName: claim.company?.name || null,
    companyAddress: claim.company?.address || null,
    companyCountry: claim.company?.country || null,
    createdAt: claim.createdAt.toISOString(),
    updatedAt: claim.updatedAt.toISOString(),
    claimedAmount: claim.outcome?.claimedAmount ?? null,
    recoveredAmount: claim.outcome?.recoveredAmount ?? null,
    currency: claim.outcome?.currency ?? null,
  };
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse<ClaimsApiResponse>> {
  try {
    const existing = await resolveClaim(params.id);
    if (!existing) {
      return NextResponse.json({ success: false, error: "Claim not found" }, { status: 404 });
    }

    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const statusInput = clean(body.status).toUpperCase();
    const priorityInput = clean(body.priorityLevel).toUpperCase();
    const claimedAmount = amount(body.claimedAmount);
    const recoveredAmount = amount(body.recoveredAmount);
    const currency = clean(body.currency).toUpperCase() || undefined;

    if (body.companyName !== undefined) {
      const companyName = clean(body.companyName);
      if (companyName) {
        const company = await findOrCreateCompany(
          companyName,
          clean(body.companyAddress) || "Address not provided",
          clean(body.companyCountry) || "Bangladesh"
        );
        await prisma.claim.update({ where: { id: existing.id }, data: { companyId: company.id } });
      }
    }

    const updateData: Prisma.ClaimUpdateInput = {};
    if (body.title !== undefined) updateData.title = clean(body.title);
    if (body.grievanceText !== undefined) updateData.grievanceText = clean(body.grievanceText);
    if (body.grievanceType !== undefined) updateData.grievanceType = clean(body.grievanceType);
    if (body.violationType !== undefined) updateData.violationType = clean(body.violationType);
    if (body.status !== undefined && STATUSES.has(statusInput)) updateData.status = statusInput as ClaimStatus;
    if (body.priorityLevel !== undefined && PRIORITIES.has(priorityInput)) updateData.priorityLevel = priorityInput as PriorityLevel;

    await prisma.claim.update({ where: { id: existing.id }, data: updateData });

    if (claimedAmount !== undefined || recoveredAmount !== undefined || currency) {
      await prisma.claimOutcome.upsert({
        where: { claimId: existing.id },
        update: {
          ...(claimedAmount !== undefined ? { claimedAmount } : {}),
          ...(recoveredAmount !== undefined ? { recoveredAmount, isRecovered: recoveredAmount > 0, closedAt: recoveredAmount > 0 ? new Date() : null } : {}),
          ...(currency ? { currency } : {}),
        },
        create: {
          claimId: existing.id,
          claimedAmount: claimedAmount ?? 0,
          recoveredAmount,
          currency: currency || "BDT",
          isRecovered: recoveredAmount !== undefined && recoveredAmount > 0,
          closedAt: recoveredAmount !== undefined && recoveredAmount > 0 ? new Date() : undefined,
        },
      });
    }

    const claim = await prisma.claim.findUniqueOrThrow({
      where: { id: existing.id },
      include: { company: true, outcome: true },
    });

    return NextResponse.json({ success: true, claim: serializeClaim(claim) });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Could not update claim" },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const existing = await resolveClaim(params.id);
    if (!existing) return NextResponse.json({ success: false, error: "Claim not found" }, { status: 404 });

    await prisma.$transaction([
      prisma.settlement.deleteMany({ where: { claimId: existing.id } }),
      prisma.statuteLookup.deleteMany({ where: { claimId: existing.id } }),
      prisma.claimOutcome.deleteMany({ where: { claimId: existing.id } }),
      prisma.claim.delete({ where: { id: existing.id } }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Could not delete claim" },
      { status: 500 }
    );
  }
}
