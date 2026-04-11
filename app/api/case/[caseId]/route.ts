import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ caseId: string }> }
) {
  try {
    const { caseId } = await context.params;

    const grievance = await prisma.grievance.findUnique({
      where: { caseId },
      include: {
        timeline: {
          orderBy: {
            eventDate: "asc",
          },
        },
      },
    });

    if (!grievance) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    return NextResponse.json({
      grievance,
      timeline: grievance.timeline,
    });
  } catch (error) {
    console.error("Case fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch case data" },
      { status: 500 }
    );
  }
}