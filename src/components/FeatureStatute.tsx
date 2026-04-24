"use client";
// src/components/FeatureStatute.tsx
// Automated statute lookup without OpenAI API.

import { useState } from "react";
import type { GrievanceType, Jurisdiction, Statute, StatuteApiResponse } from "@/types";
import { JURISDICTION_LABELS } from "@/types";

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
  const [grievanceType, setGrievanceType] =
    useState<GrievanceType>("Unauthorized Charges");
  const [jurisdiction, setJurisdiction] = useState<Jurisdiction>("BD");
  const [claimId, setClaimId] = useState("");
  const [loading, setLoading] = useState(false);
  const [statutes, setStatutes] = useState<Statute[]>([]);
  const [lookupId, setLookupId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [textError, setTextError] = useState(false);

  const selectType = (type: GrievanceType) => {
    setGrievanceType(type);
    setStatutes([]);
    setLookupId(null);
    setError(null);
  };

  const handleClear = () => {
    setGrievanceText("");
    setGrievanceType("Unauthorized Charges");
    setJurisdiction("BD");
    setClaimId("");
    setStatutes([]);
    setLookupId(null);
    setError(null);
    setTextError(false);
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
        body: JSON.stringify({
          grievanceText,
          grievanceType,
          jurisdiction,
          claimId: claimId.trim() || undefined,
        }),
      });

      const data: StatuteApiResponse = await res.json();

      if (!data.success || !data.statutes) {
        throw new Error(data.error || "Statute lookup failed");
      }

      setStatutes(data.statutes);
      setLookupId(data.lookupId || null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="feature-card bg-bg2 border border-border rounded-2xl overflow-hidden w-full">
      <div className="p-6">
        <div className="flex items-center justify-between gap-3 mb-5">
          <div>
            <div className="font-mono text-[10px] text-faint tracking-widest mb-1">
              FEATURE 01 - MEMBER 4
            </div>
            <h2 className="text-xl font-semibold tracking-tight">
              Automated Statute Lookup
            </h2>
            <p className="text-sm text-muted mt-1">
              Match a complaint with statute records saved in your database.
            </p>
          </div>

          {(statutes.length > 0 || error || grievanceText) && (
            <button
              onClick={handleClear}
              className="font-mono text-[10px] px-3 py-1.5 rounded-lg border transition-all flex-shrink-0"
              style={{
                color: "var(--danger)",
                borderColor: "rgba(248,113,113,0.3)",
                background: "rgba(248,113,113,0.08)",
              }}
            >
              CLEAR
            </button>
          )}
        </div>

        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-md mb-4 font-mono text-[10px] font-medium tracking-wider"
          style={{
            background: "rgba(192,132,252,0.08)",
            color: "var(--violet)",
            border: "1px solid rgba(192,132,252,0.2)",
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse-dot" />
          LOCAL STATUTE ENGINE
        </div>

        <p className="text-sm text-muted leading-relaxed font-light mb-5">
          Select the complaint type and jurisdiction, then describe the grievance.
          The app scores your saved statute database using keywords, violation type,
          and jurisdiction.
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {GRIEVANCE_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => selectType(type)}
              className="px-3 py-1.5 rounded-full font-mono text-[10px] border transition-all"
              style={
                grievanceType === type
                  ? {
                      background: "rgba(192,132,252,0.12)",
                      color: "var(--violet)",
                      borderColor: "rgba(192,132,252,0.4)",
                    }
                  : {
                      background: "none",
                      color: "var(--faint)",
                      borderColor: "var(--border)",
                    }
              }
            >
              {type}
            </button>
          ))}
        </div>

        <textarea
          value={grievanceText}
          onChange={(e) => setGrievanceText(e.target.value)}
          placeholder="Describe the grievance in detail..."
          rows={5}
          className="w-full bg-bg border rounded-lg px-4 py-3 text-sm outline-none resize-y transition-all leading-relaxed font-light"
          style={{
            color: "var(--text)",
            borderColor: textError ? "rgba(248,113,113,0.6)" : "var(--border)",
            fontFamily: "var(--font-sans)",
          }}
        />

        {textError && (
          <p
            className="font-mono text-[10px] mt-1"
            style={{ color: "var(--danger)" }}
          >
            Please describe your grievance with at least 10 characters.
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-3">
          <select
            value={jurisdiction}
            onChange={(e) => setJurisdiction(e.target.value as Jurisdiction)}
            className="bg-bg border border-border rounded-lg px-3 py-2.5 text-sm outline-none font-mono"
            style={{ color: "var(--text)" }}
          >
            {(Object.entries(JURISDICTION_LABELS) as [Jurisdiction, string][]).map(
              ([code, label]) => (
                <option key={code} value={code}>
                  {label}
                </option>
              )
            )}
          </select>

          <input
            value={claimId}
            onChange={(e) => setClaimId(e.target.value)}
            placeholder="Optional Claim #"
            className="bg-bg border border-border rounded-lg px-3 py-2.5 text-sm outline-none font-mono"
            style={{ color: "var(--text)" }}
          />

          <button
            onClick={analyze}
            disabled={loading}
            className="px-5 py-2.5 rounded-lg font-mono text-[12px] font-semibold tracking-wider transition-all disabled:opacity-50"
            style={{
              background: "rgba(192,132,252,0.15)",
              color: "var(--violet)",
              border: "1px solid rgba(192,132,252,0.3)",
            }}
          >
            {loading ? "MATCHING..." : "MATCH STATUTES"}
          </button>
        </div>

        {loading && (
          <div className="flex items-center gap-3 py-3 font-mono text-[12px] text-faint mt-3">
            <div
              className="w-4 h-4 rounded-full border-2 border-border animate-spin-slow"
              style={{ borderTopColor: "var(--violet)" }}
            />
            Matching grievance against local statute rules...
          </div>
        )}

        {error && (
          <div
            className="text-sm font-mono p-3 rounded-lg border mt-3"
            style={{
              background: "rgba(248,113,113,0.08)",
              borderColor: "rgba(248,113,113,0.2)",
              color: "var(--danger)",
            }}
          >
            {error}
          </div>
        )}

        {statutes.length > 0 && (
          <div className="space-y-3 mt-4">
            {statutes.map((statute, i) => (
              <div
                key={`${statute.name}-${statute.article}`}
                className="bg-bg border border-border rounded-xl p-4 animate-fade-up"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className="flex items-start gap-2 mb-2 flex-wrap">
                  <span
                    className="text-sm font-semibold"
                    style={{ color: "var(--violet)" }}
                  >
                    {statute.name}
                  </span>

                  <span
                    className="font-mono text-[10px] px-2 py-0.5 rounded"
                    style={{
                      background: "rgba(192,132,252,0.1)",
                      color: "var(--violet)",
                      border: "1px solid rgba(192,132,252,0.2)",
                    }}
                  >
                    {statute.jurisdiction}
                  </span>

                  {statute.relevanceScore !== undefined && (
                    <span
                      className="font-mono text-[10px] px-2 py-0.5 rounded ml-auto"
                      style={{
                        background: "rgba(74,222,128,0.1)",
                        color: "var(--emerald)",
                        border: "1px solid rgba(74,222,128,0.2)",
                      }}
                    >
                      {statute.relevanceScore}% match
                    </span>
                  )}
                </div>

                <div className="font-mono text-[10px] text-faint mb-2">
                  {statute.article}
                </div>

                <p className="text-sm text-muted leading-relaxed font-light">
                  {statute.description}
                </p>

                <div
                  className="font-mono text-[11px] mt-2"
                  style={{ color: "var(--gold)" }}
                >
                  Possible remedy / consequence: {statute.maxPenalty}
                </div>
              </div>
            ))}

            {lookupId && (
              <div className="font-mono text-[10px] text-faint">
                Lookup ID:{" "}
                <span style={{ color: "var(--sky)" }}>{lookupId}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}