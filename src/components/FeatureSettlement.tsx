"use client";
// src/components/FeatureSettlement.tsx
// Feature 4 (Module 3): AI Settlement Assistant — Bangladesh Consumer Law

import { useState } from "react";

interface ComparableCase {
  description: string;
  originalAmount: number;
  settledAmount: number;
  outcome: string;
  law: string;
}

interface SettlementAnalysis {
  verdict: "FAIR" | "UNFAIR" | "PARTIAL" | "INVESTIGATE";
  fairnessScore: number;
  explanation: string;
  recommendedAction: string;
  comparableOutcomes: ComparableCase[];
}

const VERDICT_CONFIG = {
  FAIR: { label: "Fair Offer", color: "var(--emerald)", icon: "✓", bg: "rgba(74,222,128,0.08)", border: "rgba(74,222,128,0.25)" },
  UNFAIR: { label: "Unfair — Reject", color: "var(--danger)", icon: "✗", bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.25)" },
  PARTIAL: { label: "Partial — Negotiate", color: "var(--gold)", icon: "◑", bg: "rgba(200,169,110,0.08)", border: "rgba(200,169,110,0.25)" },
  INVESTIGATE: { label: "Investigate Further", color: "var(--sky)", icon: "⊙", bg: "rgba(96,165,250,0.08)", border: "rgba(96,165,250,0.25)" },
};

const BD_VIOLATION_TYPES = [
  "Unauthorized Charges",
  "Product Defect / Refund Denial",
  "False Advertising",
  "Service Failure",
  "Data Privacy Violation",
  "Identity Theft",
  "E-Commerce Fraud",
  "Banking / FinTech Dispute",
];

const SAMPLE_RESPONSES = [
  {
    label: "bKash — 60% Refund Offer",
    text: "Dear Customer, We have reviewed your complaint. As a goodwill gesture, we offer a refund of ৳7,500 (60% of your claimed ৳12,500). This is a final settlement offer. Please accept within 7 days by calling our helpline. Regards, bKash Customer Relations.",
    amount: "12500",
  },
  {
    label: "Daraz — Store Credit Only",
    text: "We have investigated your return request. Due to our return policy, we are unable to process a cash refund. However, we are offering store credit of ৳45,000 valid for 90 days as full and final settlement for your ৳65,000 laptop complaint.",
    amount: "65000",
  },
  {
    label: "Grameenphone — Free Data",
    text: "Regarding your complaint about data usage, our system records confirm the data was consumed. As a valued customer, we are offering 10GB of bonus data as compensation. We consider this matter resolved. Thank you for choosing Grameenphone.",
    amount: "4800",
  },
];

export default function FeatureSettlement() {
  const [companyResponse, setCompanyResponse] = useState("");
  const [claimedAmount, setClaimedAmount] = useState("");
  const [violationType, setViolationType] = useState("Unauthorized Charges");
  const [claimId, setClaimId] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<SettlementAnalysis | null>(null);
  const [settlementId, setSettlementId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [outcomeLoading, setOutcomeLoading] = useState(false);
  const [outcomeMsg, setOutcomeMsg] = useState<string | null>(null);
  const [finalAmount, setFinalAmount] = useState("");

  const loadSample = (sample: typeof SAMPLE_RESPONSES[0]) => {
    setCompanyResponse(sample.text);
    setClaimedAmount(sample.amount);
    setAnalysis(null);
    setError(null);
    setOutcomeMsg(null);
  };

  const analyze = async () => {
    if (!companyResponse.trim()) {
      setError("Please paste the company's response text.");
      return;
    }
    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const res = await fetch("/api/settlement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyResponse,
          claimedAmount: claimedAmount ? parseFloat(claimedAmount) : undefined,
          violationType,
          claimId: claimId || undefined,
          currency: "BDT",
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setAnalysis(data.data);
      setSettlementId(data.settlementId || null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const submitOutcome = async (outcome: string) => {
    if (!settlementId) return;
    setOutcomeLoading(true);
    try {
      const res = await fetch("/api/settlement", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: settlementId,
          outcome,
          finalAmount: finalAmount ? parseFloat(finalAmount) : undefined,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setOutcomeMsg(`✓ Outcome recorded: ${outcome.replace(/_/g, " ")}`);
    } catch (e) {
      setOutcomeMsg(`✗ ${(e as Error).message}`);
    } finally {
      setOutcomeLoading(false);
    }
  };

  const cfg = analysis ? VERDICT_CONFIG[analysis.verdict] : null;

  return (
    <div className="rounded-2xl border border-border bg-bg2 overflow-hidden" style={{ gridColumn: "1 / -1" }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-border">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: "rgba(192,132,252,0.1)", border: "1px solid rgba(192,132,252,0.3)" }}>
          <span style={{ color: "var(--violet)", fontSize: 14 }}>⚖</span>
        </div>
        <div>
          <div className="font-playfair font-bold text-base">AI Settlement Assistant</div>
          <div className="font-mono text-[10px] text-faint">Feature 4 · Module 3 · Bangladesh Consumer Law Analysis</div>
        </div>
        <div className="ml-auto flex items-center gap-2 font-mono text-[10px]" style={{ color: "var(--emerald)" }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--emerald)", boxShadow: "0 0 5px var(--emerald)" }} />
          GPT-4o · CRPA 2009
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <div className="space-y-4">
          {/* Sample quick-load */}
          <div>
            <div className="font-mono text-[10px] text-faint uppercase tracking-wider mb-2">Load Sample (Bangladesh Cases)</div>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_RESPONSES.map((s) => (
                <button key={s.label} onClick={() => loadSample(s)}
                  className="px-3 py-1.5 rounded-lg font-mono text-[10px] tracking-wider transition-all"
                  style={{ background: "var(--bg3)", border: "1px solid var(--border)", color: "var(--muted)" }}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Company Response */}
          <div>
            <label className="block font-mono text-[10px] text-faint uppercase tracking-wider mb-2">
              Company Response / Settlement Offer *
            </label>
            <textarea
              value={companyResponse}
              onChange={(e) => setCompanyResponse(e.target.value)}
              rows={7}
              placeholder="Paste the company's email, letter, or message response here…"
              className="w-full rounded-xl px-4 py-3 font-sans text-sm resize-none outline-none transition-all"
              style={{ background: "var(--bg3)", border: "1px solid var(--border)", color: "var(--text)" }}
            />
          </div>

          {/* Violation Type */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-mono text-[10px] text-faint uppercase tracking-wider mb-2">Violation Type</label>
              <select
                value={violationType}
                onChange={(e) => setViolationType(e.target.value)}
                className="w-full rounded-xl px-3 py-2.5 font-sans text-sm outline-none"
                style={{ background: "var(--bg3)", border: "1px solid var(--border)", color: "var(--text)" }}
              >
                {BD_VIOLATION_TYPES.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-mono text-[10px] text-faint uppercase tracking-wider mb-2">Claimed Amount (BDT)</label>
              <input
                type="number"
                value={claimedAmount}
                onChange={(e) => setClaimedAmount(e.target.value)}
                placeholder="e.g. 12500"
                className="w-full rounded-xl px-3 py-2.5 font-mono text-sm outline-none"
                style={{ background: "var(--bg3)", border: "1px solid var(--border)", color: "var(--text)" }}
              />
            </div>
          </div>

          {/* Optional Claim ID */}
          <div>
            <label className="block font-mono text-[10px] text-faint uppercase tracking-wider mb-2">Claim ID (optional — links to existing claim)</label>
            <input
              type="text"
              value={claimId}
              onChange={(e) => setClaimId(e.target.value)}
              placeholder="e.g. uuid from triage…"
              className="w-full rounded-xl px-3 py-2.5 font-mono text-xs outline-none"
              style={{ background: "var(--bg3)", border: "1px solid var(--border)", color: "var(--muted)" }}
            />
          </div>

          <button
            onClick={analyze}
            disabled={loading}
            className="w-full rounded-xl py-3 font-mono text-[12px] tracking-widest uppercase transition-all"
            style={{ background: loading ? "rgba(192,132,252,0.08)" : "rgba(192,132,252,0.12)", border: "1px solid rgba(192,132,252,0.3)", color: "var(--violet)" }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31" strokeDashoffset="10" />
                </svg>
                Analyzing under Bangladesh Law…
              </span>
            ) : "⚖  Analyze Settlement Fairness"}
          </button>

          {error && (
            <div className="px-4 py-3 rounded-xl font-mono text-[11px]"
              style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", color: "var(--danger)" }}>
              ✗ {error}
            </div>
          )}
        </div>

        {/* Result Panel */}
        <div>
          {!analysis && !loading && (
            <div className="h-full rounded-xl border border-border flex flex-col items-center justify-center p-8 text-center"
              style={{ background: "var(--bg3)" }}>
              <div className="font-playfair text-3xl mb-3" style={{ color: "var(--faint)" }}>⚖</div>
              <div className="font-playfair text-base text-muted">Paste a company response</div>
              <div className="font-mono text-[11px] text-faint mt-2">AI will analyze under CRPA 2009, Contract Act 1872, and BTRC regulations</div>
            </div>
          )}

          {loading && (
            <div className="h-full rounded-xl border border-border flex flex-col items-center justify-center p-8"
              style={{ background: "var(--bg3)" }}>
              <svg className="w-8 h-8 mb-4" viewBox="0 0 24 24" fill="none" style={{ color: "var(--violet)" }}>
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="31" strokeDashoffset="10"
                  className="animate-spin origin-center" style={{ animationDuration: "1s" }} />
              </svg>
              <div className="font-mono text-[12px] text-faint">Consulting Bangladesh consumer law…</div>
            </div>
          )}

          {analysis && cfg && (
            <div className="space-y-4">
              {/* Verdict banner */}
              <div className="rounded-xl p-4 border" style={{ background: cfg.bg, borderColor: cfg.border }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl" style={{ color: cfg.color }}>{cfg.icon}</span>
                    <span className="font-playfair font-bold text-lg" style={{ color: cfg.color }}>{cfg.label}</span>
                  </div>
                  <div className="font-mono text-[11px] px-3 py-1 rounded-full"
                    style={{ background: `${cfg.color}20`, color: cfg.color, border: `1px solid ${cfg.color}40` }}>
                    FAIRNESS: {analysis.fairnessScore}/100
                  </div>
                </div>
                {/* Score bar */}
                <div className="h-1.5 rounded-full" style={{ background: "var(--border)" }}>
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${analysis.fairnessScore}%`, background: cfg.color }} />
                </div>
              </div>

              {/* AI Explanation */}
              <div className="rounded-xl p-4 border border-border" style={{ background: "var(--bg3)" }}>
                <div className="font-mono text-[10px] text-faint uppercase tracking-wider mb-2">Legal Analysis (BD Law)</div>
                <p className="font-sans text-[13px] leading-relaxed text-muted">{analysis.explanation}</p>
              </div>

              {/* Recommended Action */}
              <div className="rounded-xl p-4 border" style={{ background: "rgba(200,169,110,0.05)", borderColor: "rgba(200,169,110,0.2)" }}>
                <div className="font-mono text-[10px] uppercase tracking-wider mb-2" style={{ color: "var(--gold)" }}>Recommended Action</div>
                <p className="font-sans text-[13px] leading-relaxed" style={{ color: "var(--text)" }}>{analysis.recommendedAction}</p>
              </div>

              {/* Comparable Cases */}
              {analysis.comparableOutcomes?.length > 0 && (
                <div className="rounded-xl p-4 border border-border" style={{ background: "var(--bg3)" }}>
                  <div className="font-mono text-[10px] text-faint uppercase tracking-wider mb-3">Comparable Bangladesh Cases</div>
                  <div className="space-y-2">
                    {analysis.comparableOutcomes.map((c, i) => (
                      <div key={i} className="flex items-start gap-3 py-2 border-t border-border">
                        <span className="font-mono text-[10px] text-faint mt-0.5 flex-shrink-0">#{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-sans text-[12px] text-muted">{c.description}</div>
                          <div className="flex gap-3 mt-1 flex-wrap">
                            <span className="font-mono text-[10px] text-faint">Claimed: ৳{c.originalAmount?.toLocaleString()}</span>
                            <span className="font-mono text-[10px]" style={{ color: "var(--emerald)" }}>Settled: ৳{c.settledAmount?.toLocaleString()}</span>
                            <span className="font-mono text-[10px]" style={{ color: "var(--sky)" }}>{c.law}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Outcome Actions */}
              {settlementId && (
                <div className="rounded-xl p-4 border border-border" style={{ background: "var(--bg3)" }}>
                  <div className="font-mono text-[10px] text-faint uppercase tracking-wider mb-3">Record Your Decision</div>
                  <div className="flex items-center gap-2 mb-3">
                    <input
                      type="number"
                      value={finalAmount}
                      onChange={(e) => setFinalAmount(e.target.value)}
                      placeholder="Final amount accepted (BDT)"
                      className="flex-1 rounded-lg px-3 py-2 font-mono text-[11px] outline-none"
                      style={{ background: "var(--bg)", border: "1px solid var(--border)", color: "var(--text)" }}
                    />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {[
                      { label: "Accept Offer", outcome: "ACCEPTED", color: "var(--emerald)" },
                      { label: "Reject & Counter", outcome: "COUNTERED", color: "var(--gold)" },
                      { label: "Reject & Escalate", outcome: "ESCALATED", color: "var(--danger)" },
                    ].map(({ label, outcome, color }) => (
                      <button key={outcome} onClick={() => submitOutcome(outcome)} disabled={outcomeLoading}
                        className="px-3 py-2 rounded-lg font-mono text-[10px] tracking-wider transition-all"
                        style={{ background: `${color}15`, border: `1px solid ${color}30`, color }}>
                        {label}
                      </button>
                    ))}
                  </div>
                  {outcomeMsg && (
                    <div className="mt-2 font-mono text-[10px]"
                      style={{ color: outcomeMsg.startsWith("✓") ? "var(--emerald)" : "var(--danger)" }}>
                      {outcomeMsg}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
