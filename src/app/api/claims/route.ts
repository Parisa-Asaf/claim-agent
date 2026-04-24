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

async function findOrCreateCompany(name: string, address: string, country: string, countryCode: string) {
  const existing = await prisma.company.findFirst({
    where: { name: { equals: name, mode: "insensitive" } },
  });

  if (existing) {
    return prisma.company.update({
      where: { id: existing.id },
      data: {
        address,
        country,
        countryCode: countryCode.slice(0, 2) || "BD",
      },
    });
  }

  return prisma.company.create({
    data: {
      name,
      address,
      country,
      countryCode: countryCode.slice(0, 2) || "BD",
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

export async function GET(): Promise<NextResponse<ClaimsApiResponse>> {
  try {
    const claims = await prisma.claim.findMany({
      include: { company: true, outcome: true },
      orderBy: { claimNumber: "desc" },
      take: 50,
    });

    return NextResponse.json({
      success: true,
      claims: claims.map(serializeClaim),
      count: claims.length,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Could not load claims" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest): Promise<NextResponse<ClaimsApiResponse>> {
  try {
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;

    const title = clean(body.title);
    const grievanceText = clean(body.grievanceText);
    const grievanceType = clean(body.grievanceType) || "Product Defect / Refund Denial";
    const violationType = clean(body.violationType) || grievanceType;
    const companyName = clean(body.companyName);
    const companyAddress = clean(body.companyAddress) || "Address not provided";
    const companyCountry = clean(body.companyCountry) || "Bangladesh";
    const companyCountryCode = clean(body.companyCountryCode).toUpperCase() || "BD";
    const statusInput = clean(body.status).toUpperCase();
    const priorityInput = clean(body.priorityLevel).toUpperCase();
    const claimedAmount = amount(body.claimedAmount) ?? 0;
    const recoveredAmount = amount(body.recoveredAmount);
    const currency = clean(body.currency).toUpperCase() || "BDT";

    if (!title || !companyName || !grievanceText) {
      return NextResponse.json(
        { success: false, error: "Title, company name, and grievance text are required." },
        { status: 400 }
      );
    }

    const status = STATUSES.has(statusInput) ? (statusInput as ClaimStatus) : ClaimStatus.DRAFT;
    const priorityLevel = PRIORITIES.has(priorityInput) ? (priorityInput as PriorityLevel) : PriorityLevel.MEDIUM;
    const company = await findOrCreateCompany(companyName, companyAddress, companyCountry, companyCountryCode);

    const claim = await prisma.claim.create({
      data: {
        title,
        status,
        grievanceText,
        grievanceType,
        violationType,
        priorityLevel,
        companyId: company.id,
        outcome: {
          create: {
            claimedAmount,
            recoveredAmount,
            currency,
            isRecovered: recoveredAmount !== undefined && recoveredAmount > 0,
            closedAt: recoveredAmount !== undefined && recoveredAmount > 0 ? new Date() : undefined,
          },
        },
      },
      include: { company: true, outcome: true },
    });

    return NextResponse.json({ success: true, claim: serializeClaim(claim) }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Could not create claim" },
      { status: 500 }
    );
  }
}
