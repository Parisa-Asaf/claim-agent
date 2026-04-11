"use client";
// src/components/FeatureTriage.tsx
// Feature 2: Claim Triage — Member: Raj Rohit Nath (22201126)

import { useState, type ChangeEvent } from "react";

const VIOLATION_TYPES = [
  "Product Defect / Refund Denial",
  "Unauthorized Charges",
  "Data Privacy Violation",
  "False Advertising",
  "Service Failure",
  "Identity Theft",
];

type Priority = "HIGH" | "MEDIUM" | "LOW";

interface Claim {
  id: string;
  title: string;
  violationType: string;
  priorityLevel: Priority;
  expirationDate: string | null;
  status: string;
  notes: string | null;
  daysUntilExpiration?: number | null;
}

const PRIORITY_STYLES: Record<Priority, { bg: string; color: string; border: string; label: string }> = {
  HIGH:   { bg: "rgba(248,113,113,0.1)",  color: "#f87171", border: "rgba(248,113,113,0.3)",  label: "🔴 HIGH"   },
  MEDIUM: { bg: "rgba(251,191,36,0.1)",   color: "#fbbf24", border: "rgba(251,191,36,0.3)",   label: "🟡 MEDIUM" },
  LOW:    { bg: "rgba(74,222,128,0.1)",   color: "#4ade80", border: "rgba(74,222,128,0.3)",   label: "🟢 LOW"    },
};

export default function FeatureTriage() {
  const [violationType, setViolationType] = useState("");
  const [customType, setCustomType]       = useState("");
  const [priority, setPriority]           = useState<Priority>("MEDIUM");
  const [expirationDate, setExpiration]   = useState("");
  const [notes, setNotes]                 = useState("");
  const [loading, setLoading]             = useState(false);
  const [claims, setClaims]               = useState<Claim[]>([]);
  const [result, setResult]               = useState<Claim | null>(null);
  const [error, setError]                 = useState<string | null>(null);
  const [autoAssigned, setAutoAssigned]   = useState(false);

  const suggestPriority = (date: string) => {
    if (!date) return;
    const days = Math.ceil((new Date(date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (days <= 7)  setPriority("HIGH");
    else if (days <= 30) setPriority("MEDIUM");
    else setPriority("LOW");
    setAutoAssigned(true);
  };

  const submit = async () => {
    const finalType = violationType === "Other" ? customType : violationType;
    if (!finalType) { setError("Please select a violation type"); return; }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          violationType: finalType,
          priorityLevel: priority,
          expirationDate: expirationDate || null,
          notes,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setResult({ ...data.data, daysUntilExpiration: data.daysUntilExpiration });
      setAutoAssigned(data.priorityAutoAssigned);
      loadClaims();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const loadClaims = async () => {
    const res = await fetch("/api/triage");
    const data = await res.json();
    if (data.success) setClaims(data.data);
  };

  const deleteClaim = async (id: string) => {
    await fetch(`/api/triage?id=${id}`, { method: "DELETE" });
    setClaims((prev: Claim[]) => prev.filter((c: Claim) => c.id !== id));
    if (result?.id === id) setResult(null);
  };

  const handleClear = () => {
    setViolationType(""); setCustomType(""); setPriority("MEDIUM");
    setExpiration(""); setNotes(""); setResult(null); setError(null);
    setAutoAssigned(false); setClaims([]);
  };

  return (
    <div className="feature-card bg-bg2 border border-border rounded-2xl overflow-hidden">
      <div className="h-0.5" style={{ background: "linear-gradient(to right, #fbbf24, transparent)" }} />

      {/* Header */}
      <div className="flex items-start gap-4 p-6 border-b border-border">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
          style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.2)" }}>
          🗂️
        </div>
        <div className="flex-1">
          <div className="font-mono text-[10px] text-faint tracking-widest mb-1">FEATURE 02 · MEMBER-2</div>
          <div className="text-base font-semibold tracking-tight">Claim Triage</div>
          <div className="font-mono text-[11px] text-faint mt-1">Raj Rohit Nath · 22201126</div>
        </div>
        {(result || error || claims.length > 0) && (
          <button onClick={handleClear}
            className="font-mono text-[10px] px-3 py-1.5 rounded-lg border transition-all flex-shrink-0"
            style={{ color: "var(--danger)", borderColor: "rgba(248,113,113,0.3)", background: "rgba(248,113,113,0.08)" }}>
            🗑 CLEAR
          </button>
        )}
      </div>

      <div className="p-6">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md mb-4 font-mono text-[10px] font-medium tracking-wider"
          style={{ background: "rgba(251,191,36,0.08)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.2)" }}>
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse-dot" />
          PRIORITY ENGINE
        </div>

        <p className="text-sm text-muted leading-relaxed font-light mb-5">
          Categorize claims by Violation Type and assign Priority Levels based on legal expiration dates.
          The system auto-suggests priority when a deadline is set.
        </p>

        {/* Violation Type */}
        <div className="mb-4">
          <label className="font-mono text-[11px] text-faint tracking-wider block mb-2">VIOLATION TYPE</label>
          <div className="flex flex-wrap gap-2">
            {VIOLATION_TYPES.map((type) => (
              <button key={type} onClick={() => setViolationType(type)}
                className="px-3 py-1.5 rounded-full font-mono text-[10px] border transition-all"
                style={violationType === type
                  ? { background: "rgba(251,191,36,0.12)", color: "#fbbf24", borderColor: "rgba(251,191,36,0.4)" }
                  : { background: "none", color: "var(--faint)", borderColor: "var(--border)" }}>
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Expiration Date */}
        <div className="mb-4">
          <label className="font-mono text-[11px] text-faint tracking-wider block mb-2">
            LEGAL EXPIRATION DATE <span className="text-[9px]">(auto-sets priority)</span>
          </label>
          <input type="date" value={expirationDate}
            onChange={(e: ChangeEvent<HTMLInputElement>) => { setExpiration(e.target.value); suggestPriority(e.target.value); }}
            className="w-full bg-bg border border-border rounded-lg px-4 py-2.5 text-sm outline-none"
            style={{ color: "var(--text)", fontFamily: "var(--font-mono)" }} />
        </div>

        {/* Priority */}
        <div className="mb-4">
          <label className="font-mono text-[11px] text-faint tracking-wider block mb-2">
            PRIORITY LEVEL {autoAssigned && <span style={{ color: "#fbbf24" }}>(auto-assigned)</span>}
          </label>
          <div className="flex gap-2">
            {(["HIGH", "MEDIUM", "LOW"] as Priority[]).map((p) => (
              <button key={p} onClick={() => { setPriority(p); setAutoAssigned(false); }}
                className="flex-1 py-2.5 rounded-lg font-mono text-[11px] font-semibold border transition-all"
                style={priority === p
                  ? { background: PRIORITY_STYLES[p].bg, color: PRIORITY_STYLES[p].color, borderColor: PRIORITY_STYLES[p].border }
                  : { background: "none", color: "var(--faint)", borderColor: "var(--border)" }}>
                {PRIORITY_STYLES[p].label}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="mb-4">
          <label className="font-mono text-[11px] text-faint tracking-wider block mb-2">NOTES (optional)</label>
          <textarea value={notes} onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
            placeholder="Additional details about this claim..."
            rows={2}
            className="w-full bg-bg border border-border rounded-lg px-4 py-3 text-sm outline-none resize-none"
            style={{ color: "var(--text)", fontFamily: "var(--font-sans)" }} />
        </div>

        {error && (
          <div className="text-danger text-sm font-mono p-3 rounded-lg border mb-4"
            style={{ background: "rgba(248,113,113,0.08)", borderColor: "rgba(248,113,113,0.2)" }}>
            ⚠ {error}
          </div>
        )}

        <button onClick={submit} disabled={loading}
          className="w-full py-2.5 rounded-lg text-sm font-semibold font-mono tracking-wider transition-all mb-4 disabled:opacity-50"
          style={{ background: "#fbbf24", color: "#0a0b0f" }}>
          {loading ? "Creating Claim..." : "+ CREATE TRIAGE CLAIM"}
        </button>

        {/* Result */}
        {result && (
          <div className="animate-fade-up p-4 rounded-xl border mb-4"
            style={{ background: PRIORITY_STYLES[result.priorityLevel].bg, borderColor: PRIORITY_STYLES[result.priorityLevel].border }}>
            <div className="font-mono text-[10px] mb-2" style={{ color: PRIORITY_STYLES[result.priorityLevel].color }}>
              ✓ CLAIM CREATED — {PRIORITY_STYLES[result.priorityLevel].label} PRIORITY
              {autoAssigned && " (auto-assigned from expiration date)"}
            </div>
            <div className="text-sm font-semibold">{result.title}</div>
            <div className="font-mono text-[11px] text-muted mt-1">{result.violationType}</div>
            {result.daysUntilExpiration !== null && result.daysUntilExpiration !== undefined && (
              <div className="font-mono text-[11px] mt-1" style={{ color: PRIORITY_STYLES[result.priorityLevel].color }}>
                ⏰ {result.daysUntilExpiration} days until expiration
              </div>
            )}
            <div className="font-mono text-[10px] text-faint mt-2">ID: {result.id}</div>
          </div>
        )}

        {/* Claims list */}
        {claims.length > 0 && (
          <div>
            <div className="font-mono text-[11px] text-faint tracking-wider mb-3">
              ALL CLAIMS ({claims.length})
              <button onClick={loadClaims} className="ml-3 text-[10px]" style={{ color: "#fbbf24" }}>↻ REFRESH</button>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {claims.map((claim) => (
                <div key={claim.id} className="flex items-center justify-between bg-bg border border-border rounded-lg px-4 py-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold truncate">{claim.title}</div>
                    <div className="font-mono text-[10px] text-faint mt-0.5">{claim.violationType}</div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="font-mono text-[9px] px-2 py-0.5 rounded border"
                      style={{ color: PRIORITY_STYLES[claim.priorityLevel].color, borderColor: PRIORITY_STYLES[claim.priorityLevel].border }}>
                      {claim.priorityLevel}
                    </span>
                    <button onClick={() => deleteClaim(claim.id)}
                      className="font-mono text-[10px] px-2 py-1 rounded border"
                      style={{ color: "var(--danger)", borderColor: "rgba(248,113,113,0.3)" }}>
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {claims.length === 0 && !result && (
          <button onClick={loadClaims}
            className="w-full py-2 rounded-lg font-mono text-[11px] border transition-all"
            style={{ color: "var(--faint)", borderColor: "var(--border)" }}>
            ↻ Load Existing Claims
          </button>
        )}
      </div>
    </div>
  );
}
