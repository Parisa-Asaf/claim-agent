"use client";
// src/components/FeatureDashboard.tsx
// Feature 3 (Module 3): Recovery Dashboard & Matrix

import { useState, useEffect, useCallback } from "react";

interface DashboardStats {
  totalClaims: number;
  activeClaims: number;
  settledClaims: number;
  totalPotentialRefund: number;
  totalRecovered: number;
  recoveryRate: number;
  highPriorityClaims: number;
  expiringSoon: number;
  successRate: number;
}

interface ClaimCountdown {
  id: string;
  title: string;
  violationType: string;
  priorityLevel: string;
  expirationDate: string;
  daysLeft: number;
  claimedAmount: number;
  currency: string;
  status: string;
  company?: string | null;
}

const PRIORITY_COLORS: Record<string, string> = {
  HIGH: "var(--danger)",
  MEDIUM: "var(--gold)",
  LOW: "var(--emerald)",
};

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "var(--faint)",
  EVIDENCE_COLLECTED: "var(--sky)",
  STATUTES_MATCHED: "var(--violet)",
  READY_FOR_DISPATCH: "var(--gold)",
  SENT: "var(--sky)",
  RESPONSE_RECEIVED: "var(--violet)",
  SETTLED: "var(--emerald)",
  CLOSED: "var(--emerald)",
};

function fmtBDT(n: number) {
  if (n >= 100000) return `৳${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `৳${(n / 1000).toFixed(1)}K`;
  return `৳${n.toFixed(0)}`;
}

export default function FeatureDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [countdowns, setCountdowns] = useState<ClaimCountdown[]>([]);
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [seedMsg, setSeedMsg] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/dashboard");
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setStats(data.stats);
      setCountdowns(data.countdowns || []);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleSeed = async () => {
    setSeeding(true);
    setSeedMsg(null);
    try {
      const res = await fetch("/api/seed", { method: "POST" });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setSeedMsg(`✓ Seeded ${data.counts.claims} Bangladesh claims & ${data.counts.companies} companies`);
      await fetchDashboard();
    } catch (e) {
      setSeedMsg(`✗ ${(e as Error).message}`);
    } finally {
      setSeeding(false);
    }
  };

  const arcPath = (score: number, r = 32, cx = 40, cy = 40) => {
    const circ = 2 * Math.PI * r;
    const offset = circ - (score / 100) * circ;
    return { strokeDasharray: circ.toFixed(1), strokeDashoffset: offset.toFixed(1) };
  };

  return (
    <div className="rounded-2xl border border-border bg-bg2 overflow-hidden" style={{ gridColumn: "1 / -1" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(200,169,110,0.1)", border: "1px solid rgba(200,169,110,0.3)" }}>
            <span style={{ color: "var(--gold)", fontSize: 14 }}>◈</span>
          </div>
          <div>
            <div className="font-playfair font-bold text-base">Recovery Dashboard & Matrix</div>
            <div className="font-mono text-[10px] text-faint">Feature 3 · Module 3 · Intelligence & Assessment</div>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="px-3 py-1.5 rounded-lg font-mono text-[10px] tracking-wider transition-all"
            style={{ background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.2)", color: "var(--sky)" }}
          >
            {seeding ? "SEEDING…" : "SEED BD DATA"}
          </button>
          <button
            onClick={fetchDashboard}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg font-mono text-[10px] tracking-wider transition-all"
            style={{ background: "rgba(200,169,110,0.1)", border: "1px solid rgba(200,169,110,0.2)", color: "var(--gold)" }}
          >
            {loading ? "LOADING…" : "↻ REFRESH"}
          </button>
        </div>
      </div>

      {seedMsg && (
        <div className="mx-6 mt-4 px-4 py-2 rounded-lg font-mono text-[11px]"
          style={{ background: seedMsg.startsWith("✓") ? "rgba(74,222,128,0.08)" : "rgba(248,113,113,0.08)", border: `1px solid ${seedMsg.startsWith("✓") ? "rgba(74,222,128,0.2)" : "rgba(248,113,113,0.2)"}`, color: seedMsg.startsWith("✓") ? "var(--emerald)" : "var(--danger)" }}>
          {seedMsg}
        </div>
      )}

      {error && (
        <div className="mx-6 mt-4 px-4 py-2 rounded-lg font-mono text-[11px]"
          style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", color: "var(--danger)" }}>
          ✗ {error}
        </div>
      )}

      <div className="p-6">
        {/* KPI Cards */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { label: "Total Potential Refund", value: fmtBDT(stats.totalPotentialRefund), sub: "Claimed across all cases", color: "var(--gold)" },
              { label: "Total Recovered", value: fmtBDT(stats.totalRecovered), sub: `${stats.recoveryRate}% recovery rate`, color: "var(--emerald)" },
              { label: "Active Claims", value: stats.activeClaims.toString(), sub: `${stats.highPriorityClaims} high priority`, color: "var(--sky)" },
              { label: "Expiring Soon", value: stats.expiringSoon.toString(), sub: "Within 7 days", color: stats.expiringSoon > 0 ? "var(--danger)" : "var(--faint)" },
            ].map(({ label, value, sub, color }) => (
              <div key={label} className="rounded-xl p-4 border border-border" style={{ background: "var(--bg3)" }}>
                <div className="font-mono text-[10px] text-faint uppercase tracking-wider mb-2">{label}</div>
                <div className="font-playfair text-2xl font-bold" style={{ color }}>{value}</div>
                <div className="font-mono text-[10px] text-faint mt-1">{sub}</div>
              </div>
            ))}
          </div>
        )}

        {/* Visual Matrix Row */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {/* Recovery Rate Arc */}
            <div className="rounded-xl border border-border p-4 flex flex-col items-center" style={{ background: "var(--bg3)" }}>
              <div className="font-mono text-[10px] text-faint uppercase tracking-wider mb-3">Recovery Rate</div>
              <svg viewBox="0 0 80 80" className="w-16 h-16">
                <circle cx="40" cy="40" r="32" fill="none" stroke="#1e2230" strokeWidth="6" />
                <circle cx="40" cy="40" r="32" fill="none" stroke="var(--emerald)" strokeWidth="6"
                  {...arcPath(stats.recoveryRate)} strokeLinecap="round" transform="rotate(-90 40 40)" />
                <text x="40" y="38" textAnchor="middle" fill="var(--emerald)"
                  style={{ fontFamily: "var(--font-playfair)", fontSize: "14px", fontWeight: 700 }}>
                  {stats.recoveryRate}%
                </text>
                <text x="40" y="50" textAnchor="middle" fill="var(--faint)"
                  style={{ fontFamily: "var(--font-mono)", fontSize: "6px" }}>RECOVERED</text>
              </svg>
            </div>

            {/* Success Rate Arc */}
            <div className="rounded-xl border border-border p-4 flex flex-col items-center" style={{ background: "var(--bg3)" }}>
              <div className="font-mono text-[10px] text-faint uppercase tracking-wider mb-3">Success Rate</div>
              <svg viewBox="0 0 80 80" className="w-16 h-16">
                <circle cx="40" cy="40" r="32" fill="none" stroke="#1e2230" strokeWidth="6" />
                <circle cx="40" cy="40" r="32" fill="none" stroke="var(--gold)" strokeWidth="6"
                  {...arcPath(stats.successRate)} strokeLinecap="round" transform="rotate(-90 40 40)" />
                <text x="40" y="38" textAnchor="middle" fill="var(--gold)"
                  style={{ fontFamily: "var(--font-playfair)", fontSize: "14px", fontWeight: 700 }}>
                  {stats.successRate}%
                </text>
                <text x="40" y="50" textAnchor="middle" fill="var(--faint)"
                  style={{ fontFamily: "var(--font-mono)", fontSize: "6px" }}>SUCCESS</text>
              </svg>
            </div>

            {/* Claims breakdown bar */}
            <div className="rounded-xl border border-border p-4" style={{ background: "var(--bg3)" }}>
              <div className="font-mono text-[10px] text-faint uppercase tracking-wider mb-3">Claim Status</div>
              <div className="space-y-2">
                {[
                  { label: "Active", val: stats.activeClaims, total: stats.totalClaims, color: "var(--sky)" },
                  { label: "Settled", val: stats.settledClaims, total: stats.totalClaims, color: "var(--emerald)" },
                ].map(({ label, val, total, color }) => (
                  <div key={label}>
                    <div className="flex justify-between font-mono text-[10px] mb-1">
                      <span style={{ color }}>{label}</span>
                      <span className="text-faint">{val}/{total}</span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ background: "var(--border)" }}>
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: total > 0 ? `${(val / total) * 100}%` : "0%", background: color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial summary */}
            <div className="rounded-xl border border-border p-4" style={{ background: "var(--bg3)" }}>
              <div className="font-mono text-[10px] text-faint uppercase tracking-wider mb-3">Financial Summary</div>
              <div className="space-y-2">
                <div className="flex justify-between font-mono text-[11px]">
                  <span className="text-faint">Claimed</span>
                  <span style={{ color: "var(--gold)" }}>{fmtBDT(stats.totalPotentialRefund)}</span>
                </div>
                <div className="flex justify-between font-mono text-[11px]">
                  <span className="text-faint">Recovered</span>
                  <span style={{ color: "var(--emerald)" }}>{fmtBDT(stats.totalRecovered)}</span>
                </div>
                <div className="h-px bg-border my-1" />
                <div className="flex justify-between font-mono text-[11px]">
                  <span className="text-faint">Pending</span>
                  <span style={{ color: "var(--sky)" }}>{fmtBDT(stats.totalPotentialRefund - stats.totalRecovered)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Active Claim Countdowns */}
        <div>
          <div className="font-mono text-[11px] text-faint uppercase tracking-widest mb-3 flex items-center gap-2">
            <span className="w-4 h-px bg-faint" />
            Active Claim Countdowns
          </div>

          {countdowns.length === 0 && !loading && (
            <div className="text-center py-8 font-mono text-[12px] text-faint">
              No active claims. Click "SEED BD DATA" to load Bangladesh demo data.
            </div>
          )}

          <div className="space-y-2">
            {countdowns.map((c) => (
              <div key={c.id} className="rounded-xl border px-4 py-3 flex items-center gap-4 transition-all hover:border-gold/30"
                style={{ background: "var(--bg3)", borderColor: "var(--border)" }}>
                {/* Days left badge */}
                <div className="flex-shrink-0 w-14 text-center">
                  <div className="font-playfair text-xl font-bold"
                    style={{ color: c.daysLeft <= 7 ? "var(--danger)" : c.daysLeft <= 14 ? "var(--gold)" : "var(--emerald)" }}>
                    {c.daysLeft}
                  </div>
                  <div className="font-mono text-[9px] text-faint">DAYS</div>
                </div>

                {/* Thin separator */}
                <div className="w-px h-8 bg-border flex-shrink-0" />

                {/* Claim info */}
                <div className="flex-1 min-w-0">
                  <div className="font-sans text-[13px] font-medium truncate">{c.title}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-[10px] text-faint">{c.violationType}</span>
                    {c.company && <span className="font-mono text-[10px] text-faint">· {c.company}</span>}
                  </div>
                </div>

                {/* Priority badge */}
                <div className="flex-shrink-0 px-2 py-0.5 rounded font-mono text-[10px] tracking-wider"
                  style={{ color: PRIORITY_COLORS[c.priorityLevel], background: `${PRIORITY_COLORS[c.priorityLevel]}18`, border: `1px solid ${PRIORITY_COLORS[c.priorityLevel]}33` }}>
                  {c.priorityLevel}
                </div>

                {/* Status badge */}
                <div className="flex-shrink-0 px-2 py-0.5 rounded font-mono text-[9px] tracking-wider"
                  style={{ color: STATUS_COLORS[c.status] || "var(--faint)", background: `${STATUS_COLORS[c.status] || "var(--faint)"}15` }}>
                  {c.status.replace(/_/g, " ")}
                </div>

                {/* Amount */}
                {c.claimedAmount > 0 && (
                  <div className="flex-shrink-0 font-mono text-[12px]" style={{ color: "var(--gold)" }}>
                    {fmtBDT(c.claimedAmount)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
