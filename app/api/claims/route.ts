import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const claims = await prisma.grievance.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ claims });
  } catch (error) {
    console.error("Claims fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch claims" },
      { status: 500 }
    );
  }
}