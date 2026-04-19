// src/app/api/settlement/route.ts
// Feature 4 (Module 3): AI Settlement Assistant — Bangladesh Consumer Law

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { prisma } from "@/lib/prisma";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Bangladesh consumer protection law context
const BD_LAW_CONTEXT = `
You are an expert in Bangladesh consumer protection law. Key laws include:
- Consumer Rights Protection Act 2009 (CRPA): Sections 38–45 on unfair trade practices, Section 23 on product defects, penalties up to BDT 2,00,000
- Digital Security Act 2018: Data privacy violations, penalties up to BDT 10,00,000 or 14 years imprisonment  
- Contract Act 1872: Breach of contract remedies, compensation principles
- Sale of Goods Act 1930: Implied warranties, right to reject defective goods
- Bangladesh Telecommunication Regulatory Commission (BTRC) regulations for telecom disputes
- Bangladesh Bank guidelines for unauthorized financial transactions
- E-Commerce Policy 2018: Online consumer protections, 7-day return window
- National Consumer Rights Protection Council (NCRPC) mediation benchmarks:
  * Typical settlements range from 60–90% of claimed amount for valid claims
  * Product defect cases: 75–100% recovery rate when documented
  * Service failure: 50–80% recovery typical
  * Data breach: BDT 50,000–5,00,000 depending on severity
  * Unauthorized charges: 100% refund + up to 15% interest under CRPA Section 44
`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { companyResponse, claimId, claimedAmount, violationType, currency = "BDT" } = body;

    if (!companyResponse) {
      return NextResponse.json(
        { success: false, error: "Company response text is required" },
        { status: 400 }
      );
    }

    // Fetch claim context if claimId provided
    let claimContext = "";
    if (claimId) {
      const claim = await prisma.claim.findUnique({
        where: { id: claimId },
        include: {
          company: true,
          statutes: { take: 1, orderBy: { createdAt: "desc" } },
          evidences: { take: 3 },
          outcome: true,
        },
      });
      if (claim) {
        claimContext = `
Claim context:
- Violation type: ${claim.violationType || "General consumer complaint"}
- Priority: ${claim.priorityLevel}
- Company: ${claim.company?.name || "Unknown"}
- Original grievance: ${claim.grievanceText || "Not specified"}
- Evidence count: ${claim.evidences.length} pieces
- Applicable statutes: ${claim.statutes[0]?.statutes ? JSON.stringify(claim.statutes[0].statutes).slice(0, 300) : "Bangladesh CRPA 2009"}
- Claimed amount: ${claim.outcome?.claimedAmount ?? claimedAmount ?? "Not specified"} ${currency}
`;
      }
    }

    const prompt = `${BD_LAW_CONTEXT}

${claimContext}

A company has responded to a consumer complaint in Bangladesh with the following offer/response:

"${companyResponse}"

The consumer originally claimed: ${claimedAmount ?? "amount not specified"} ${currency}

Analyze this settlement offer under Bangladesh consumer protection law and provide:
1. A fairness verdict: FAIR, UNFAIR, PARTIAL, or INVESTIGATE
2. A fairness score from 0–100 (100 = fully fair to consumer)  
3. A detailed explanation referencing specific Bangladesh laws
4. A recommended action for the consumer
5. 3 comparable case outcomes from Bangladesh consumer dispute history

Respond ONLY with valid JSON in this exact format:
{
  "verdict": "FAIR|UNFAIR|PARTIAL|INVESTIGATE",
  "fairnessScore": <0-100>,
  "explanation": "<detailed explanation citing BD laws>",
  "recommendedAction": "<specific next step for consumer>",
  "comparableOutcomes": [
    {
      "description": "<brief case description>",
      "originalAmount": <number in BDT>,
      "settledAmount": <number in BDT>,
      "outcome": "<what happened>",
      "law": "<BD law cited>"
    }
  ]
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 1200,
    });

    const raw = completion.choices[0]?.message?.content ?? "";
    let analysis: Record<string, unknown>;

    try {
      const clean = raw.replace(/```json|```/g, "").trim();
      analysis = JSON.parse(clean);
    } catch {
      return NextResponse.json(
        { success: false, error: "AI response could not be parsed. Please try again." },
        { status: 500 }
      );
    }

    // Persist to database if claimId provided
    let settlementId: string | undefined;
    if (claimId) {
      const saved = await prisma.settlement.create({
        data: {
          claimId,
          companyResponse,
          aiVerdict: analysis.verdict as "FAIR" | "UNFAIR" | "PARTIAL" | "INVESTIGATE",
          fairnessScore: Number(analysis.fairnessScore),
          aiExplanation: String(analysis.explanation),
          recommendedAction: String(analysis.recommendedAction),
          comparableOutcomes: analysis.comparableOutcomes as object[],
          currency,
        },
      });
      settlementId = saved.id;

      // Update claim status to RESPONSE_RECEIVED
      await prisma.claim.update({
        where: { id: claimId },
        data: { status: "RESPONSE_RECEIVED" },
      });
    }

    return NextResponse.json({
      success: true,
      data: analysis,
      settlementId,
      model: "gpt-4o",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

// GET: Fetch settlement history for a claim
export async function GET(req: NextRequest) {
  try {
    const claimId = req.nextUrl.searchParams.get("claimId");

    if (!claimId) {
      return NextResponse.json(
        { success: false, error: "claimId is required" },
        { status: 400 }
      );
    }

    const settlements = await prisma.settlement.findMany({
      where: { claimId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: settlements });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

// PATCH: Update settlement outcome (user accepts/rejects)
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, outcome, finalAmount } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "id is required" }, { status: 400 });
    }

    const updated = await prisma.settlement.update({
      where: { id },
      data: {
        ...(outcome ? { outcome } : {}),
        ...(finalAmount !== undefined ? { finalAmount: Number(finalAmount) } : {}),
      },
      include: { claim: true },
    });

    // If accepted/settled, update claim + outcome record
    if (outcome === "ACCEPTED") {
      await prisma.claim.update({
        where: { id: updated.claimId },
        data: { status: "SETTLED" },
      });

      if (finalAmount !== undefined) {
        await prisma.claimOutcome.upsert({
          where: { claimId: updated.claimId },
          update: {
            recoveredAmount: Number(finalAmount),
            isRecovered: true,
            closedAt: new Date(),
          },
          create: {
            claimId: updated.claimId,
            claimedAmount: 0,
            recoveredAmount: Number(finalAmount),
            currency: updated.currency ?? "BDT",
            isRecovered: true,
            closedAt: new Date(),
          },
        });
      }
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
