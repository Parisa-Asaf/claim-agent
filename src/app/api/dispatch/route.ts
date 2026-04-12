import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { claimId } = await req.json();

    // 1. Fetch the claim details
    const claim = await prisma.claim.findUnique({
      where: { id: claimId },
      include: { company: true },
    });

    if (!claim) return NextResponse.json({ error: "Claim not found" }, { status: 404 });

    // 2. Setup Nodemailer (Your existing config)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // 3. Send the Email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: "parisa.asaf@g.bracu.ac.bd", // Or claim.company.email if you have it
      subject: `LEGAL NOTICE: Claim #${claim.id.slice(0, 8)}`,
      text: `Official notice for ${(claim as any).title}. Amount: ${(claim as any).amount}.`,
    });

    // 4. ✨ THE MISSING PART: Update the Database Status ✨
    await prisma.claim.update({
      where: { id: claimId },
      data: { status: "DISPATCHED" }, // This changes the green badge!
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to dispatch" }, { status: 500 });
  }
}