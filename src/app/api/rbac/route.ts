// src/app/api/rbac/route.ts
// Feature 3: Role-Based Access Control — Member: Raj Rohit Nath (22201126)

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Helper: log every action to audit log
async function logAction(action: string, entity: string, entityId: string, details: object, performedBy: string) {
  await prisma.auditLog.create({
    data: { action, entity, entityId, details, performedBy },
  });
}

// POST: Create a new user (Admin only)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, role, assignedBy } = body;

    if (!name || !email) {
      return NextResponse.json(
        { success: false, error: "Name and email are required" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "A user with this email already exists" },
        { status: 409 }
      );
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        role: role || "LEGAL_EXPERT",
        assignedBy: assignedBy || "Admin",
      },
    });

    // Log this action
    await logAction("USER_CREATED", "User", user.id, { name, email, role: user.role }, assignedBy || "Admin");

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

// GET: List all users, optionally filter by role
export async function GET(req: NextRequest) {
  try {
    const role = req.nextUrl.searchParams.get("role");
    const id   = req.nextUrl.searchParams.get("id");

    if (id) {
      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
      return NextResponse.json({ success: true, data: user });
    }

    const users = await prisma.user.findMany({
      where: role ? { role: role as "ADMIN" | "LEGAL_EXPERT" | "VIEWER" } : {},
      orderBy: [{ role: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ success: true, data: users, total: users.length });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

// PATCH: Update user role or active status
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, role, isActive, performedBy } = body;

    if (!id) return NextResponse.json({ success: false, error: "id is required" }, { status: 400 });

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(role     ? { role }     : {}),
        ...(isActive !== undefined ? { isActive } : {}),
      },
    });

    await logAction(
      isActive === false ? "USER_DEACTIVATED" : "USER_ROLE_UPDATED",
      "User", id,
      { newRole: role, isActive },
      performedBy || "Admin"
    );

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

// DELETE: Remove a user
export async function DELETE(req: NextRequest) {
  try {
    const id          = req.nextUrl.searchParams.get("id");
    const performedBy = req.nextUrl.searchParams.get("performedBy") || "Admin";

    if (!id) return NextResponse.json({ success: false, error: "id required" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });

    await logAction("USER_DELETED", "User", id, { name: user.name, email: user.email }, performedBy);
    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "User deleted" });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}