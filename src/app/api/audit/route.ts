// src/app/api/audit/route.ts
// Feature 4: Forensic Audit Log — Member: Raj Rohit Nath (22201126)

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST: Manually log any system action
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, entity, entityId, details, performedBy, ipAddress } = body;

    if (!action || !entity) {
      return NextResponse.json(
        { success: false, error: "action and entity are required" },
        { status: 400 }
      );
    }

    const log = await prisma.auditLog.create({
      data: { action, entity, entityId, details, performedBy, ipAddress },
    });

    return NextResponse.json({ success: true, data: log });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

// GET: Read audit logs (read-only ledger)
export async function GET(req: NextRequest) {
  try {
    const entity      = req.nextUrl.searchParams.get("entity");
    const performedBy = req.nextUrl.searchParams.get("performedBy");
    const limit       = parseInt(req.nextUrl.searchParams.get("limit") || "50");

    const logs = await prisma.auditLog.findMany({
      where: {
        ...(entity      ? { entity }      : {}),
        ...(performedBy ? { performedBy } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { user: { select: { name: true, email: true, role: true } } },
    });

    return NextResponse.json({ success: true, data: logs, total: logs.length });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}