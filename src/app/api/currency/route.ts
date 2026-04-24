import { NextRequest, NextResponse } from "next/server";
import { Prisma, SettlementVerdict } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { CurrencyApiResponse, CurrencyFairnessLabel } from "@/types";

export const runtime = "nodejs";

const FALLBACK_RATES_TO_USD_BASE: Record<string, number> = {
  USD: 1,
  BDT: 117.5,
  EUR: 0.92,
  GBP: 0.79,
  INR: 83.2,
  CAD: 1.36,
  AUD: 1.52,
  SGD: 1.35,
  AED: 3.67,
  SAR: 3.75,
  MYR: 4.72,
  JPY: 155.5,
};

function cleanCurrency(value: unknown, fallback: string): string {
  const code = typeof value === "string" ? value.trim().toUpperCase() : "";
  return /^[A-Z]{3}$/.test(code) ? code : fallback;
}

function toAmount(value: unknown, fallback = 0): number {
  if (value === "" || value === null || value === undefined) return fallback;
  const parsed = Number(String(value).replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function roundMoney(value: number): number {
  return Number(value.toFixed(2));
}

function fallbackRate(fromCurrency: string, toCurrency: string): number {
  const fromBase = FALLBACK_RATES_TO_USD_BASE[fromCurrency];
  const toBase = FALLBACK_RATES_TO_USD_BASE[toCurrency];

  if (!fromBase || !toBase) {
    throw new Error(`Unsupported currency pair: ${fromCurrency} to ${toCurrency}`);
  }

  return toBase / fromBase;
}

async function getRate(fromCurrency: string, toCurrency: string) {
  if (fromCurrency === toCurrency) return { exchangeRate: 1, source: "fallback" as const };

  try {
    const live = await fetch(`https://open.er-api.com/v6/latest/${fromCurrency}`, {
      cache: "no-store",
    });

    if (!live.ok) throw new Error("Live exchange request failed");
    const json = await live.json();
    const rate = Number(json?.rates?.[toCurrency]);
    if (!Number.isFinite(rate) || rate <= 0) throw new Error("Target currency missing from live response");

    return { exchangeRate: rate, source: "live_api" as const };
  } catch {
    return { exchangeRate: fallbackRate(fromCurrency, toCurrency), source: "fallback" as const };
  }
}

async function resolveClaimReference(claimReference?: string) {
  const ref = claimReference?.trim();
  if (!ref) return null;

  if (/^\d+$/.test(ref)) {
    return prisma.claim.findUnique({ where: { claimNumber: Number(ref) } });
  }

  return prisma.claim.findUnique({ where: { id: ref } });
}

function labelFromScore(score: number): CurrencyFairnessLabel {
  if (score >= 95) return "FAIR";
  if (score >= 80) return "ACCEPTABLE";
  if (score >= 55) return "PARTIAL";
  return "LOW";
}

function actionFromLabel(label: CurrencyFairnessLabel) {
  if (label === "FAIR") return "Accept" as const;
  if (label === "ACCEPTABLE") return "Consider Accepting" as const;
  if (label === "PARTIAL") return "Negotiate" as const;
  return "Reject" as const;
}

function verdictFromLabel(label: CurrencyFairnessLabel): SettlementVerdict {
  if (label === "FAIR") return "FAIR";
  if (label === "LOW") return "UNFAIR";
  return "PARTIAL";
}

export async function POST(req: NextRequest): Promise<NextResponse<CurrencyApiResponse>> {
  try {
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;

    const originalAmount = toAmount(body.amount);
    const extraFeesLocal = Math.max(0, toAmount(body.extraFeesLocal));
    const compensationRequestedLocal = Math.max(0, toAmount(body.compensationRequestedLocal));
    const offerAmountInput = body.offerAmount === "" || body.offerAmount === undefined ? undefined : toAmount(body.offerAmount);
    const fromCurrency = cleanCurrency(body.fromCurrency, "USD");
    const toCurrency = cleanCurrency(body.toCurrency, "BDT");
    const offerCurrency = cleanCurrency(body.offerCurrency, toCurrency);
    const transactionDate = typeof body.transactionDate === "string" && body.transactionDate.trim() ? body.transactionDate.trim() : null;
    const claimReference = typeof body.claimId === "string" ? body.claimId.trim() : "";

    if (!Number.isFinite(originalAmount) || originalAmount <= 0) {
      return NextResponse.json(
        { success: false, error: "Original amount must be a positive number." },
        { status: 400 }
      );
    }

    if (offerAmountInput !== undefined && offerAmountInput < 0) {
      return NextResponse.json(
        { success: false, error: "Company offer cannot be negative." },
        { status: 400 }
      );
    }

    const { exchangeRate, source } = await getRate(fromCurrency, toCurrency);
    const convertedAmount = roundMoney(originalAmount * exchangeRate);
    const totalClaimValue = roundMoney(convertedAmount + extraFeesLocal + compensationRequestedLocal);

    let offerAmountLocal: number | undefined;
    let offerPercentage: number | undefined;
    let shortfall: number | undefined;
    let surplus: number | undefined;

    if (offerAmountInput !== undefined) {
      const offerRate = offerCurrency === toCurrency ? 1 : (await getRate(offerCurrency, toCurrency)).exchangeRate;
      offerAmountLocal = roundMoney(offerAmountInput * offerRate);
      offerPercentage = roundMoney((offerAmountLocal / totalClaimValue) * 100);
      shortfall = roundMoney(Math.max(0, totalClaimValue - offerAmountLocal));
      surplus = roundMoney(Math.max(0, offerAmountLocal - totalClaimValue));
    }

    const fairnessScore = offerPercentage === undefined ? 0 : Math.max(0, Math.min(100, Math.round(offerPercentage)));
    const fairnessLabel = offerPercentage === undefined ? "PARTIAL" : labelFromScore(fairnessScore);
    const suggestedAction = offerPercentage === undefined ? "Negotiate" : actionFromLabel(fairnessLabel);
    const negotiationTarget = roundMoney(totalClaimValue);

    let recommendation =
      `Use ${totalClaimValue.toLocaleString()} ${toCurrency} as the evidence-backed claim value. ` +
      `This includes the converted transaction amount, extra fees, and requested compensation.`;

    if (offerAmountLocal !== undefined && offerPercentage !== undefined) {
      if (fairnessLabel === "FAIR") {
        recommendation =
          `The offer covers ${offerPercentage}% of the total claim value. It is fair if the company confirms payment in writing.`;
      } else if (fairnessLabel === "ACCEPTABLE") {
        recommendation =
          `The offer covers ${offerPercentage}% of the total claim value. Consider accepting only if fast payment is more important than full recovery.`;
      } else if (fairnessLabel === "PARTIAL") {
        recommendation =
          `The offer covers ${offerPercentage}% of the total claim value. Negotiate toward ${negotiationTarget.toLocaleString()} ${toCurrency}.`;
      } else {
        recommendation =
          `The offer covers only ${offerPercentage}% of the total claim value. Reject or counter-offer with the full calculation and supporting evidence.`;
      }
    }

    let savedToClaim = false;
    let linkedClaimId: string | null = null;
    let linkedClaimNumber: number | null = null;
    let warning: string | undefined;

    const claim = await resolveClaimReference(claimReference);
    if (claimReference && !claim) {
      warning = "Claim number/ID was not found, so the settlement calculation was not saved to a claim.";
    }

    if (claim) {
      linkedClaimId = claim.id;
      linkedClaimNumber = claim.claimNumber;
      savedToClaim = true;

      await prisma.claimOutcome.upsert({
        where: { claimId: claim.id },
        update: {
          claimedAmount: totalClaimValue,
          currency: toCurrency,
        },
        create: {
          claimId: claim.id,
          claimedAmount: totalClaimValue,
          currency: toCurrency,
          isRecovered: false,
        },
      });

      if (offerAmountLocal !== undefined) {
        await prisma.settlement.create({
          data: {
            claimId: claim.id,
            companyResponse:
              `Currency & Settlement Engine calculation: company offered ${offerAmountInput} ${offerCurrency}, equal to ${offerAmountLocal} ${toCurrency}.`,
            aiVerdict: verdictFromLabel(fairnessLabel),
            fairnessScore,
            aiExplanation:
              `Total claim value is ${totalClaimValue} ${toCurrency}. Offer percentage is ${offerPercentage}%. Extra fees: ${extraFeesLocal} ${toCurrency}. Requested compensation: ${compensationRequestedLocal} ${toCurrency}.`,
            recommendedAction: recommendation,
            comparableOutcomes: [
              {
                description: "Currency-converted claim value",
                originalAmount: originalAmount,
                settledAmount: offerAmountLocal,
                outcome: suggestedAction,
                law: "Member 4 Currency & Settlement Engine",
              },
            ] as Prisma.InputJsonValue,
            currency: toCurrency,
            finalAmount: offerAmountLocal,
          },
        });

        await prisma.claim.update({
          where: { id: claim.id },
          data: { status: fairnessLabel === "FAIR" ? "SETTLED" : "RESPONSE_RECEIVED" },
        });
      }
    }

    return NextResponse.json({
      success: true,
      warning,
      data: {
        claimNumber: linkedClaimNumber,
        claimId: linkedClaimId,
        fromCurrency,
        toCurrency,
        offerCurrency,
        originalAmount,
        convertedAmount,
        exchangeRate: Number(exchangeRate.toFixed(6)),
        transactionDate,
        extraFeesLocal,
        compensationRequestedLocal,
        totalClaimValue,
        offerAmount: offerAmountInput,
        offerAmountLocal,
        offerPercentage,
        shortfall,
        surplus,
        fairnessScore,
        fairnessLabel,
        suggestedAction,
        negotiationTarget,
        recommendation,
        savedToClaim,
        timestamp: new Date().toISOString(),
        source,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Currency & settlement calculation failed" },
      { status: 500 }
    );
  }
}
