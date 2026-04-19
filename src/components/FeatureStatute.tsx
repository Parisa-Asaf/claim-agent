"use client";
// src/components/FeatureStatute.tsx
// Feature 4: Automated Statute Lookup — Member: Nusrat Jahan (22301561)

import { useState } from "react";
import type { StatuteApiResponse, Statute, Jurisdiction, GrievanceType } from "@/types";
import { JURISDICTION_LABELS, GRIEVANCE_EXAMPLES } from "@/types";

const GRIEVANCE_TYPES: GrievanceType[] = [
  "Data Privacy Violation",
  "Unauthorized Charges",
  "Product Defect / Refund Denial",
  "False Advertising",
  "Service Failure",
  "Identity Theft",
];

export default function FeatureStatute() {
  const [grievanceText, setGrievanceText] = useState("");
  const [grievanceType, setGrievanceType] = useState<GrievanceType | null>(null);
  const [jurisdiction, setJurisdiction] = useState<Jurisdiction>("BD");
  const [loading, setLoading] = useState(false);
  const [statutes, setStatutes] = useState<Statute[]>([]);
  const [lookupId, setLookupId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [textError, setTextError] = useState(false);

  const selectType = (type: GrievanceType) => {
    setGrievanceType(type);
    if (!grievanceText) setGrievanceText(GRIEVANCE_EXAMPLES[type]);
  };

  const handleClear = () => {
    setGrievanceText("");
    setGrievanceType(null);
    setJurisdiction("BD");
    setStatutes([]);
    setLookupId(null);
    setError(null);
  };

  const analyze = async () => {
    if (grievanceText.trim().length < 10) {
      setTextError(true);
      setTimeout(() => setTextError(false), 2000);
      return;
    }

    setError(null);
    setStatutes([]);
    setLookupId(null);
    setLoading(true);

    try {
      const res = await fetch("/api/statute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ grievanceText, grievanceType, jurisdiction }),
      });

      const data: StatuteApiResponse = await res.json();
      if (!data.success || !data.statutes) throw new Error(data.error || "Analysis failed");

      setStatutes(data.statutes);
      setLookupId(data.lookupId || null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="feature-card bg-bg2 border border-border rounded-2xl overflow-hidden">
      <div className="h-0.5" style={{ background: "linear-gradient(to right, var(--violet), transparent)" }} />

      <div className="flex items-start gap-4 p-6 border-b border-border">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
          style={{ background: "rgba(192,132,252,0.1)", border: "1px solid rgba(192,132,252,0.2)" }}>
          ⚖️
        </div>
        <div className="flex-1">
          <div className="font-mono text-[10px] text-faint tracking-widest mb-1">FEATURE 04 · MEMBER-4</div>
          <div className="text-base font-semibold tracking-tight">Automated Statute Lookup</div>
          <div className="font-mono text-[11px] text-faint mt-1">Nusrat Jahan · 22301561</div>
        </div>
        {(statutes.length > 0 || error) && (
          <button
            onClick={handleClear}
            className="font-mono text-[10px] px-3 py-1.5 rounded-lg border transition-all flex-shrink-0"
            style={{ color: "var(--danger)", borderColor: "rgba(248,113,113,0.3)", background: "rgba(248,113,113,0.08)" }}
          >
            🗑 CLEAR
          </button>
        )}
      </div>

      <div className="p-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md mb-4 font-mono text-[10px] font-medium tracking-wider"
          style={{ background: "rgba(192,132,252,0.08)", color: "var(--violet)", border: "1px solid rgba(192,132,252,0.2)" }}>
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse-dot" />
          OPENAI GPT-4
        </div>

        <p className="text-sm text-muted leading-relaxed font-light mb-5">
          Describe your grievance and the system uses AI to match it with specific local and
          international consumer protection laws — citing exact articles and maximum penalties.
        </p>

        {/* Grievance type chips */}
        <div className="flex flex-wrap gap-2 mb-4">
          {GRIEVANCE_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => selectType(type)}
              className="px-3 py-1.5 rounded-full font-mono text-[10px] border transition-all"
              style={grievanceType === type
                ? { background: "rgba(192,132,252,0.12)", color: "var(--violet)", borderColor: "rgba(192,132,252,0.4)" }
                : { background: "none", color: "var(--faint)", borderColor: "var(--border)" }
              }
            >
              {type}
            </button>
          ))}
        </div>

        {/* Grievance textarea */}
        <textarea
          value={grievanceText}
          onChange={(e) => setGrievanceText(e.target.value)}
          placeholder="Describe your grievance in detail. e.g. 'Company charged my card without consent and refused to refund after multiple requests...'"
          rows={4}
          className="w-full bg-bg border rounded-lg px-4 py-3 text-sm outline-none resize-y transition-all leading-relaxed font-light"
          style={{
            color: "var(--text)",
            borderColor: textError ? "rgba(248,113,113,0.6)" : "var(--border)",
            fontFamily: "var(--font-sans)",
          }}
          onFocus={(e) => (e.target.style.borderColor = "rgba(192,132,252,0.5)")}
          onBlur={(e) => (e.target.style.borderColor = textError ? "rgba(248,113,113,0.6)" : "var(--border)")}
        />
        {textError && (
          <p className="font-mono text-[10px] text-danger mt-1">
            Please describe your grievance (min 10 characters)
          </p>
        )}

        {/* Jurisdiction + Analyze */}
        <div className="flex gap-2 mt-3">
          <select
            value={jurisdiction}
            onChange={(e) => setJurisdiction(e.target.value as Jurisdiction)}
            className="flex-1 bg-bg border border-border rounded-lg px-3 py-2.5 text-sm outline-none font-mono"
            style={{ color: "var(--text)", fontFamily: "var(--font-mono)" }}
          >
            {(Object.entries(JURISDICTION_LABELS) as [Jurisdiction, string][]).map(([code, label]) => (
              <option key={code} value={code}>{label}</option>
            ))}
          </select>
          <button
            onClick={analyze}
            disabled={loading}
            className="px-5 py-2.5 rounded-lg font-mono text-[12px] font-semibold tracking-wider transition-all disabled:opacity-50"
            style={{ background: "rgba(192,132,252,0.15)", color: "var(--violet)", border: "1px solid rgba(192,132,252,0.3)" }}
          >
            ANALYZE
          </button>
        </div>

        {loading && (
          <div className="flex items-center gap-3 py-3 font-mono text-[12px] text-faint mt-3">
            <div className="w-4 h-4 rounded-full border-2 border-border animate-spin-slow"
              style={{ borderTopColor: "var(--violet)" }} />
            Matching statutes via OpenAI...
          </div>
        )}

        {error && (
          <div className="text-danger text-sm font-mono p-3 rounded-lg border mt-3"
            style={{ background: "rgba(248,113,113,0.08)", borderColor: "rgba(248,113,113,0.2)" }}>
            ⚠ {error}
          </div>
        )}

        {/* Statute results */}
        {statutes.length > 0 && (
          <div className="space-y-3 mt-4">
            {statutes.map((statute, i) => (
              <div
                key={i}
                className="bg-bg border border-border rounded-xl p-4 animate-fade-up"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="flex items-start gap-2 mb-2 flex-wrap">
                  <span className="text-sm font-semibold" style={{ color: "var(--violet)" }}>
                    {statute.name}
                  </span>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded"
                    style={{ background: "rgba(192,132,252,0.1)", color: "var(--violet)", border: "1px solid rgba(192,132,252,0.2)" }}>
                    {statute.jurisdiction}
                  </span>
                  {statute.relevanceScore && (
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded ml-auto"
                      style={{ background: "rgba(74,222,128,0.1)", color: "var(--emerald)", border: "1px solid rgba(74,222,128,0.2)" }}>
                      {statute.relevanceScore}% match
                    </span>
                  )}
                </div>
                <div className="font-mono text-[10px] text-faint mb-2">{statute.article}</div>
                <p className="text-sm text-muted leading-relaxed font-light">{statute.description}</p>
                <div className="font-mono text-[11px] mt-2" style={{ color: "var(--danger)" }}>
                  ⚠ Max Penalty: {statute.maxPenalty}
                </div>
              </div>
            ))}

            {lookupId && (
              <div className="font-mono text-[10px] text-faint">
                Lookup ID: <span style={{ color: "var(--sky)" }}>{lookupId}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
