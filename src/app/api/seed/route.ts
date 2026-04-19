// src/app/api/seed/route.ts
// Populates the database with Bangladesh-specific demo data for Module 3 features

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

const BD_COMPANIES = [
  { name: "Grameenphone Ltd.", legalDept: "Legal & Regulatory Affairs", address: "GPHouse, Bashundhara, Dhaka-1229", city: "Dhaka", industry: "Telecom", countryCode: "BD" },
  { name: "Robi Axiata Limited", legalDept: "Corporate Legal", address: "53, Gulshan South, Dhaka-1212", city: "Dhaka", industry: "Telecom", countryCode: "BD" },
  { name: "Daraz Bangladesh", legalDept: "Consumer Affairs", address: "Level 7, Noor Tower, Banani, Dhaka-1213", city: "Dhaka", industry: "E-Commerce", countryCode: "BD" },
  { name: "bKash Limited", legalDept: "Compliance & Legal", address: "bKash Tower, 4 Sylhet Highway, Dhaka", city: "Dhaka", industry: "FinTech", countryCode: "BD" },
  { name: "BRAC Bank PLC", legalDept: "Legal Division", address: "1 Gulshan Avenue, Dhaka-1212", city: "Dhaka", industry: "Banking", countryCode: "BD" },
  { name: "Pathao Ltd.", legalDept: "Legal Team", address: "Plot 67, Gulshan-2, Dhaka-1212", city: "Dhaka", industry: "Ride-sharing", countryCode: "BD" },
];

const CLAIM_SEEDS = [
  {
    title: "Unauthorized bKash Transaction — ৳12,500",
    violationType: "Unauthorized Charges",
    grievanceText: "৳12,500 was debited from my bKash account without authorization. Three transactions on March 15, 2026 that I never initiated. bKash support has not responded in 10 days.",
    priorityLevel: "HIGH" as const,
    status: "RESPONSE_RECEIVED" as const,
    daysOffset: 5,
    claimedAmount: 12500,
    companyIdx: 3,
  },
  {
    title: "Grameenphone Data Plan Fraud — ৳4,800",
    violationType: "False Advertising",
    grievanceText: "Purchased a 30-day 30GB data plan for ৳499. Data exhausted in 8 days. GP claims I used it but I was in Cox's Bazar with minimal usage. Violation of advertised terms.",
    priorityLevel: "MEDIUM" as const,
    status: "SENT" as const,
    daysOffset: 12,
    claimedAmount: 4800,
    companyIdx: 0,
  },
  {
    title: "Daraz Defective Laptop — ৳65,000",
    violationType: "Product Defect / Refund Denial",
    grievanceText: "Purchased Lenovo IdeaPad from Daraz for ৳65,000. Screen failure within 14 days. Daraz refused return citing 'physical damage' though the box was unopened. CRPA Section 23 violation.",
    priorityLevel: "HIGH" as const,
    status: "READY_FOR_DISPATCH" as const,
    daysOffset: 4,
    claimedAmount: 65000,
    companyIdx: 2,
  },
  {
    title: "BRAC Bank Credit Card Overcharge — ৳8,200",
    violationType: "Unauthorized Charges",
    grievanceText: "BRAC Bank charged ৳8,200 in undisclosed annual fees and late fees that were not in the card agreement. Bank insists charges are 'standard'. Demanded itemized breakdown — refused.",
    priorityLevel: "HIGH" as const,
    status: "EVIDENCE_COLLECTED" as const,
    daysOffset: 8,
    claimedAmount: 8200,
    companyIdx: 4,
  },
  {
    title: "Robi Internet Speed Misrepresentation — ৳2,400",
    violationType: "Service Failure",
    grievanceText: "Paid ৳2,400/month for 'up to 50 Mbps' broadband. Consistent speed tests show 1.2–3 Mbps. Filed complaint with BTRC. Robi acknowledged issue but only offered 1-month free — insufficient.",
    priorityLevel: "MEDIUM" as const,
    status: "SETTLED" as const,
    daysOffset: 20,
    claimedAmount: 14400,
    recoveredAmount: 10800,
    companyIdx: 1,
  },
  {
    title: "Pathao Ride Overcharge — ৳1,850",
    violationType: "False Advertising",
    grievanceText: "Pathao app showed ৳350 fare estimate; charged ৳2,200 citing 'surge pricing' — no surge warning shown. 6 incidents in 2 months totaling ৳1,850 in unexplained overcharges.",
    priorityLevel: "LOW" as const,
    status: "DRAFT" as const,
    daysOffset: 45,
    claimedAmount: 1850,
    companyIdx: 5,
  },
];

export async function POST() {
  try {
    // Clear existing seed data (for re-seeding)
    await prisma.settlement.deleteMany();
    await prisma.claimOutcome.deleteMany();
    await prisma.demandLetter.deleteMany();
    await prisma.statuteLookup.deleteMany();
    await prisma.evidence.deleteMany();
    await prisma.claim.deleteMany();
    await prisma.company.deleteMany();

    // Insert companies
    const companies = await Promise.all(
      BD_COMPANIES.map((c) =>
        prisma.company.create({
          data: { ...c, country: "Bangladesh", verified: true },
        })
      )
    );

    // Insert claims, evidences, and outcomes
    for (const seed of CLAIM_SEEDS) {
      const company = companies[seed.companyIdx];
      const expDate = new Date();
      expDate.setDate(expDate.getDate() + seed.daysOffset);

      const claim = await prisma.claim.create({
        data: {
          title: seed.title,
          violationType: seed.violationType,
          grievanceText: seed.grievanceText,
          priorityLevel: seed.priorityLevel,
          status: seed.status,
          expirationDate: expDate,
          companyId: company.id,
          grievanceType: seed.violationType,
        },
      });

      // Add evidence
      const hash = crypto.createHash("sha256").update(seed.title + Date.now()).digest("hex");
      await prisma.evidence.create({
        data: {
          fileName: `evidence_${claim.id.slice(0, 8)}.jpg`,
          fileSize: 245760,
          mimeType: "image/jpeg",
          merchantName: company.name,
          amount: seed.claimedAmount,
          currency: "BDT",
          sha256Hash: hash,
          claimId: claim.id,
          confidenceScore: 87.5,
        },
      });

      // Add statute lookup
      await prisma.statuteLookup.create({
        data: {
          grievanceText: seed.grievanceText,
          grievanceType: seed.violationType,
          jurisdiction: "BD",
          rawResponse: {},
          statutes: [
            { name: "Consumer Rights Protection Act 2009", jurisdiction: "BD", article: "Section 23", description: "Protection against defective products", maxPenalty: "BDT 2,00,000" },
            { name: "Contract Act 1872", jurisdiction: "BD", article: "Section 73", description: "Compensation for breach of contract", maxPenalty: "Full damage recovery" },
          ],
          claimId: claim.id,
        },
      });

      // Add ClaimOutcome
      await prisma.claimOutcome.create({
        data: {
          claimId: claim.id,
          claimedAmount: seed.claimedAmount,
          recoveredAmount: seed.recoveredAmount ?? null,
          currency: "BDT",
          isRecovered: !!seed.recoveredAmount,
          closedAt: seed.status === "SETTLED" ? new Date() : null,
        },
      });

      // Add settlement for RESPONSE_RECEIVED claims
      if (seed.status === "RESPONSE_RECEIVED") {
        await prisma.settlement.create({
          data: {
            claimId: claim.id,
            companyResponse: `Dear Customer, We have reviewed your complaint regarding the transaction. As a goodwill gesture, we are offering a refund of ৳${Math.round(seed.claimedAmount * 0.6).toLocaleString()} (60% of claimed amount). This settlement is full and final. Please contact our customer care within 7 days to accept. Regards, ${company.name} Customer Relations.`,
            aiVerdict: "PARTIAL",
            fairnessScore: 62,
            aiExplanation: `Under CRPA 2009 Section 44, unauthorized transactions entitle consumers to 100% refund plus up to 15% interest. The company's 60% offer is below the legal minimum. Bangladesh Bank circulars on mobile financial services require full restitution for unauthorized debits.`,
            recommendedAction: `Reject this offer and escalate to Bangladesh Bank Financial Intelligence Unit (FIU). File complaint with NCRPC under CRPA 2009. Quote Section 44 for unauthorized MFS transactions — you are entitled to ৳${seed.claimedAmount.toLocaleString()} + interest.`,
            comparableOutcomes: [
              { description: "Mobile banking unauthorized debit — Dhaka 2025", originalAmount: 15000, settledAmount: 15000, outcome: "Full refund + compensation after NCRPC mediation", law: "CRPA 2009 S.44" },
              { description: "Digital wallet fraud — Chittagong 2024", originalAmount: 9500, settledAmount: 9500, outcome: "100% recovery via Bangladesh Bank complaint", law: "Bangladesh Bank MFS Guideline 2022" },
              { description: "Sim-swap unauthorized transaction — 2023", originalAmount: 22000, settledAmount: 18700, outcome: "85% settlement after police report", law: "Digital Security Act 2018" },
            ],
            currency: "BDT",
            outcome: "PENDING",
          },
        });
      }

      // Add settled claim's settlement record
      if (seed.status === "SETTLED") {
        await prisma.settlement.create({
          data: {
            claimId: claim.id,
            companyResponse: `We acknowledge your complaint about internet speed issues. As per BTRC regulation, we offer 3 months of free service valued at ৳7,200 and credit ৳3,600 to your account as compensation. Total value: ৳10,800.`,
            aiVerdict: "PARTIAL",
            fairnessScore: 75,
            aiExplanation: `BTRC regulations mandate service quality standards. The offered ৳10,800 represents 75% of your 6-month claim of ৳14,400. While below maximum entitlement, this is within acceptable NCRPC settlement range (60-80%) for service quality disputes.`,
            recommendedAction: `This offer is reasonable. Accept if you need quick resolution. For full recovery, you may escalate to BTRC Consumer Affairs division.`,
            comparableOutcomes: [],
            currency: "BDT",
            outcome: "ACCEPTED",
            finalAmount: seed.recoveredAmount,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Database seeded with Bangladesh demo data",
      counts: {
        companies: BD_COMPANIES.length,
        claims: CLAIM_SEEDS.length,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const [claims, companies, settlements] = await Promise.all([
      prisma.claim.count(),
      prisma.company.count(),
      prisma.settlement.count(),
    ]);
    return NextResponse.json({ success: true, counts: { claims, companies, settlements } });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
