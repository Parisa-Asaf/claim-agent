// src/app/api/triage/route.ts
// Feature 2: Claim Triage — Member: Raj Rohit Nath (22201126)

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Auto-calculate priority based on days until expiration
function calculatePriority(expirationDate: string): "HIGH" | "MEDIUM" | "LOW" {
  const today = new Date();
  const expiry = new Date(expirationDate);
  const daysLeft = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (daysLeft <= 7) return "HIGH";
  if (daysLeft <= 30) return "MEDIUM";
  return "LOW";
}

// POST: Create a new triage claim
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, violationType, priorityLevel, expirationDate, grievanceText, notes } = body;

    if (!violationType) {
      return NextResponse.json(
        { success: false, error: "Violation type is required" },
        { status: 400 }
      );
    }

    // Auto-suggest priority if expiration date is provided
    const finalPriority = expirationDate
      ? calculatePriority(expirationDate)
      : priorityLevel || "MEDIUM";

    const claim = await prisma.claim.create({
      data: {
        title: title || `${violationType} Claim`,
        violationType,
        priorityLevel: finalPriority,
        expirationDate: expirationDate ? new Date(expirationDate) : null,
        grievanceText,
        notes,
        status: "DRAFT",
      },
    });

    const daysLeft = expirationDate
      ? Math.ceil((new Date(expirationDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      : null;

    return NextResponse.json({
      success: true,
      data: claim,
      priorityAutoAssigned: !!expirationDate,
      daysUntilExpiration: daysLeft,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

// GET: Fetch all claims, optionally filtered by priority or violationType
export async function GET(req: NextRequest) {
  try {
    const priority = req.nextUrl.searchParams.get("priority");
    const type = req.nextUrl.searchParams.get("type");
    const id = req.nextUrl.searchParams.get("id");

    if (id) {
      const claim = await prisma.claim.findUnique({
        where: { id },
        include: {
          company: true,
          statutes: {
            orderBy: { createdAt: "desc" },
          }
        }
      });
      if (!claim) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
      return NextResponse.json({ success: true, data: claim });
    }

    const claims = await prisma.claim.findMany({
      where: {
        ...(priority ? { priorityLevel: priority as "HIGH" | "MEDIUM" | "LOW" } : {}),
        ...(type ? { violationType: { contains: type, mode: "insensitive" } } : {}),
      },
      orderBy: [
        { priorityLevel: "asc" },
        { expirationDate: "asc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json({ success: true, data: claims, total: claims.length });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

// PATCH: Update priority or status of a claim
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, priorityLevel, status, notes } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "id is required" }, { status: 400 });
    }

    const updated = await prisma.claim.update({
      where: { id },
      data: {
        ...(priorityLevel ? { priorityLevel } : {}),
        ...(status ? { status } : {}),
        ...(notes ? { notes } : {}),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

// DELETE: Remove a claim
export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, error: "id required" }, { status: 400 });

    await prisma.claim.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Claim deleted" });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}