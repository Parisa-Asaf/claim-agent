import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PATCH(req: Request) {
  try {
    // 1. Get the data from the frontend
    const { claimId, newTitle } = await req.json();

    // 2. Tell Prisma to find that ID and change the title
    const updatedClaim = await prisma.claim.update({
      where: { id: claimId },
      data: { 
        title: newTitle 
      },
    });

    // 3. Send back the updated data so the frontend knows it worked
    return NextResponse.json(updatedClaim);
  } catch (error) {
    console.error("UPDATE ERROR:", error);
    return NextResponse.json({ error: "Failed to update claim" }, { status: 500 });
  }
}