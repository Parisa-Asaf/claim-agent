// src/app/api/statute/route.ts
// Feature 4: Automated Statute Lookup — OpenAI GPT-4 matching
// Member: Nusrat Jahan (22301561)

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { StatuteApiResponse, Statute, Jurisdiction } from "@/types";

// ─── System prompt for the legal AI ──────────────────────────────────────────
const LEGAL_SYSTEM_PROMPT = `You are an expert consumer protection legal analyst with comprehensive knowledge of global consumer rights legislation. Your task is to match user grievances to specific applicable laws and statutes.

When given a grievance description and jurisdiction, you must:
1. Identify the most relevant consumer protection laws
2. Cite specific articles, sections, or provisions
3. Explain precisely how each law applies to the stated grievance
4. Provide accurate penalty information

Always return valid JSON only. No markdown formatting, no preamble.`;

// ─── Jurisdiction-specific law database (context injection) ───────────────────
const JURISDICTION_CONTEXT: Record<string, string> = {
  BD: `Key Bangladesh consumer protection laws:
- Consumer Rights Protection Act 2009 (Ain 26 of 2009)
- Digital Security Act 2018
- Competition Act 2012
- Contract Act 1872
- Penal Code 1860 (fraud sections)
- Bangladesh Bank Payment System Regulations
- Telecom Regulatory Authority rules`,

  EU: `Key EU consumer protection laws:
- GDPR (General Data Protection Regulation) 2016/679
- Consumer Rights Directive 2011/83/EU
- Unfair Commercial Practices Directive 2005/29/EC
- Product Liability Directive 85/374/EEC
- E-Commerce Directive 2000/31/EC
- Payment Services Directive 2 (PSD2)
- Digital Services Act (DSA) 2022`,

  US: `Key US consumer protection laws:
- California Consumer Privacy Act (CCPA) / CPRA
- Federal Trade Commission Act (Section 5)
- Consumer Financial Protection Act (CFPA)
- Fair Credit Billing Act (FCBA)
- Electronic Fund Transfer Act (EFTA)
- Magnuson-Moss Warranty Act
- CAN-SPAM Act / Telephone Consumer Protection Act`,

  UK: `Key UK consumer protection laws:
- Consumer Rights Act 2015
- Consumer Protection from Unfair Trading Regulations 2008
- UK GDPR / Data Protection Act 2018
- Consumer Contracts Regulations 2013
- Financial Services and Markets Act 2000
- Payment Services Regulations 2017`,

  IN: `Key India consumer protection laws:
- Consumer Protection Act 2019
- Information Technology Act 2000 / IT (Amendment) Act 2008
- Personal Data Protection Bill
- Competition Act 2002
- Reserve Bank of India (RBI) guidelines
- Telecom Regulatory Authority of India (TRAI) regulations`,

  INTL: `Key international consumer protection frameworks:
- UN Guidelines for Consumer Protection (UNGCP) 2015
- OECD Guidelines for Consumer Protection in E-Commerce
- ISO 10002 (Customer Satisfaction / Complaints Handling)
- UNCITRAL Model Law on Electronic Commerce
- WTO Agreement on Trade-Related Aspects of IP (TRIPS)`,
};

// ─── Route Handler ────────────────────────────────────────────────────────────
export async function POST(req: NextRequest): Promise<NextResponse<StatuteApiResponse>> {
  try {
    const body = await req.json();
    const {
      grievanceText,
      grievanceType,
      jurisdiction = "BD",
      claimId,
    }: {
      grievanceText: string;
      grievanceType?: string;
      jurisdiction: Jurisdiction;
      claimId?: string;
    } = body;

    if (!grievanceText || grievanceText.trim().length < 10) {
      return NextResponse.json(
        { success: false, error: "Grievance text must be at least 10 characters" },
        { status: 400 }
      );
    }

    const jurisdictionContext = JURISDICTION_CONTEXT[jurisdiction] || JURISDICTION_CONTEXT.INTL;

    let statutes: Statute[];
    let modelUsed = "gpt-4o-mini";

    if (process.env.OPENAI_API_KEY) {
      // ── PRODUCTION: Real OpenAI call ──
      const OpenAI = (await import("openai")).default;
      const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      const completion = await client.chat.completions.create({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        temperature: 0.2,
        messages: [
          { role: "system", content: LEGAL_SYSTEM_PROMPT },
          {
            role: "user",
            content: `Grievance Type: ${grievanceType || "General Consumer Complaint"}
Jurisdiction: ${jurisdiction}
Grievance Description: "${grievanceText}"

Relevant legislation context:
${jurisdictionContext}

Return a JSON object with key "statutes" containing an array of 2-4 most applicable laws. Each statute must have:
- name: Official full name of the law/regulation
- jurisdiction: Country or region where this law applies
- article: Specific article, section, or provision number (e.g., "Article 83(4)", "Section 15(1)")
- description: 2-3 sentences explaining exactly how this law applies to the stated grievance
- maxPenalty: Exact maximum penalty, fine, or legal consequence
- relevanceScore: Number 0-100 indicating how relevant this statute is`,
          },
        ],
      });

      modelUsed = completion.model;
      const raw = JSON.parse(completion.choices[0].message.content || '{"statutes":[]}');
      statutes = raw.statutes || raw;
    } else {
      // ── DEVELOPMENT FALLBACK ──
      console.warn("⚠ OPENAI_API_KEY not set — using fallback statutes");
      await new Promise((r) => setTimeout(r, 800));

      const fallbackStatutes: Record<string, Statute[]> = {
        BD: [
          { name: "Consumer Rights Protection Act 2009", jurisdiction: "Bangladesh", article: "Section 45 — Adulteration / Defective Goods", description: "Prohibits sale of defective products. Applicable when a company sells a product that fails to meet advertised standards or causes harm to the consumer.", maxPenalty: "BDT 2,00,000 fine + 3 years imprisonment", relevanceScore: 92 },
          { name: "Digital Security Act 2018", jurisdiction: "Bangladesh", article: "Section 26 — Unauthorized Data Collection", description: "Governs illegal collection and processing of personal data without explicit consent. Applies when companies collect user data beyond stated purposes.", maxPenalty: "BDT 10,00,000 fine + 5 years imprisonment", relevanceScore: 85 },
          { name: "Bangladesh Penal Code 1860", jurisdiction: "Bangladesh", article: "Section 415-420 — Cheating and Fraud", description: "Covers fraudulent inducement, dishonest misrepresentation, and financial deception. Applicable to unauthorized charges and false advertising claims.", maxPenalty: "7 years imprisonment + unlimited fine", relevanceScore: 78 },
        ],
        EU: [
          { name: "General Data Protection Regulation (GDPR)", jurisdiction: "European Union", article: "Article 83(4) — Infringements", description: "Mandates explicit consent for data processing. Violations include unauthorized data collection, processing beyond stated purposes, and failure to honor deletion requests.", maxPenalty: "€20 million or 4% of global annual turnover", relevanceScore: 95 },
          { name: "Consumer Rights Directive 2011/83/EU", jurisdiction: "European Union", article: "Article 9 — Right of Withdrawal", description: "Grants consumers a 14-day cooling-off period for online purchases. Applies when companies refuse refunds within the mandatory withdrawal period.", maxPenalty: "Extended to 12 months + full refund obligation", relevanceScore: 88 },
        ],
        US: [
          { name: "Federal Trade Commission Act", jurisdiction: "United States", article: "Section 5 — Unfair or Deceptive Acts", description: "Prohibits unfair or deceptive business practices in commerce. Covers false advertising, unauthorized charges, and deceptive subscription practices.", maxPenalty: "$51,744 per violation per day", relevanceScore: 90 },
          { name: "California Consumer Privacy Act (CCPA)", jurisdiction: "California, USA", article: "Section 1798.100 — Consumer Right to Know", description: "Grants consumers rights over personal data collected by businesses. Applicable to companies that collect, sell, or disclose personal information without proper notice.", maxPenalty: "$7,500 per intentional violation", relevanceScore: 87 },
        ],
      };

      statutes = fallbackStatutes[jurisdiction] || fallbackStatutes.BD;
    }

    // ── Persist lookup to database ──
    const lookup = await prisma.statuteLookup.create({
      data: {
        grievanceText,
        grievanceType,
        jurisdiction,
        rawResponse: { model: modelUsed, statutes } as object,
        statutes: statutes as object,
        ...(claimId ? { claimId } : {}),
      },
    });

    return NextResponse.json({
      success: true,
      statutes,
      lookupId: lookup.id,
      model: modelUsed,
    });
  } catch (error) {
    console.error("[/api/statute] Error:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}

// GET: Retrieve a past statute lookup
export async function GET(req: NextRequest): Promise<NextResponse> {
  const id = req.nextUrl.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ success: false, error: "?id= required" }, { status: 400 });
  }

  const lookup = await prisma.statuteLookup.findUnique({ where: { id } });

  if (!lookup) {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: lookup });
}
