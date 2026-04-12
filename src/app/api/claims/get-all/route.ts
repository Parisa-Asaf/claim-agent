import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const claims = await prisma.claim.findMany({
      include: { company: true },
    });
    return NextResponse.json(claims);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch claims" }, { status: 500 });
  }
}