// src/app/api/hash/route.ts
// Feature 2: Evidence Hashing — SHA-256 cryptographic fingerprinting
// Member: Raj Rohit Nath (22201126)

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { HashApiResponse, HashResult } from "@/types";
import crypto from "crypto";

// ─── Route Handler ────────────────────────────────────────────────────────────
export async function POST(req: NextRequest): Promise<NextResponse<HashApiResponse>> {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const claimId = formData.get("claimId") as string | null;
    const existingEvidenceId = formData.get("evidenceId") as string | null;

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    // ── Compute SHA-256 ──
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const sha256 = crypto.createHash("sha256").update(buffer).digest("hex");
    const timestamp = new Date().toISOString();

    const hashResult: HashResult = {
      sha256,
      algorithm: "SHA-256",
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type || "application/octet-stream",
      timestamp,
      legalStatus: "TAMPER_PROOF",
    };

    // ── Persist to database ──
    let evidenceId: string;

    if (existingEvidenceId) {
      // Update existing evidence record with hash
      const updated = await prisma.evidence.update({
        where: { id: existingEvidenceId },
        data: {
          sha256Hash: sha256,
          hashAlgorithm: "SHA-256",
          hashVerified: true,
          hashTimestamp: new Date(timestamp),
        },
      });
      evidenceId = updated.id;
    } else {
      // Check if this exact file hash already exists
      const existing = await prisma.evidence.findUnique({
        where: { sha256Hash: sha256 },
      });

      if (existing) {
        return NextResponse.json({
          success: true,
          data: hashResult,
          evidenceId: existing.id,
        });
      }

      // Create new evidence record (hash-only, no extraction data)
      const evidence = await prisma.evidence.create({
        data: {
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type || "application/octet-stream",
          sha256Hash: sha256,
          hashAlgorithm: "SHA-256",
          hashVerified: true,
          hashTimestamp: new Date(timestamp),
          ...(claimId ? { claimId } : {}),
        },
      });
      evidenceId = evidence.id;
    }

    return NextResponse.json({
      success: true,
      data: hashResult,
      evidenceId,
    });
  } catch (error) {
    console.error("[/api/hash] Error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}

// GET: Verify a hash — check if a file's hash matches a stored record
export async function GET(req: NextRequest): Promise<NextResponse> {
  const hash = req.nextUrl.searchParams.get("hash");
  const evidenceId = req.nextUrl.searchParams.get("evidenceId");

  if (hash) {
    const evidence = await prisma.evidence.findUnique({
      where: { sha256Hash: hash },
    });

    return NextResponse.json({
      success: true,
      verified: !!evidence,
      evidence: evidence || null,
      message: evidence
        ? "✓ Hash verified — file is authentic and untampered"
        : "⚠ Hash not found in records",
    });
  }

  if (evidenceId) {
    const evidence = await prisma.evidence.findUnique({
      where: { id: evidenceId },
    });

    if (!evidence) {
      return NextResponse.json({ success: false, error: "Evidence not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: evidence });
  }

  return NextResponse.json(
    { success: false, error: "Provide ?hash=<sha256> or ?evidenceId=<id>" },
    { status: 400 }
  );
}
