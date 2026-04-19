"use client";
// src/components/FeatureCompany.tsx
// Feature 3: Company Intelligence — Member: Md. Asif Ahsan Safwan (23101103)

import { useState, useRef } from "react";
import type { CompanyApiResponse, CompanyResult } from "@/types";

export default function FeatureCompany() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<CompanyResult[]>([]);
  const [selected, setSelected] = useState<CompanyResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [addressCopied, setAddressCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const search = async () => {
    const q = query.trim();
    if (!q) return;

    setLoading(true);
    setError(null);
    setResults([]);
    setSearched(false);

    try {
      const res = await fetch(`/api/company?q=${encodeURIComponent(q)}`);
      const data: CompanyApiResponse = await res.json();

      if (!data.success) throw new Error(data.error || "Search failed");
      setResults(data.results);
      setSearched(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") search();
  };

  const selectCompany = (company: CompanyResult) => {
    setSelected(company);
  };

  const copyAddress = async () => {
    if (!selected) return;
    const text = `${selected.name}\nAttn: ${selected.legalDept}\n${selected.address}`;
    await navigator.clipboard.writeText(text);
    setAddressCopied(true);
    setTimeout(() => setAddressCopied(false), 2000);
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setSelected(null);
    setError(null);
    setSearched(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="feature-card bg-bg2 border border-border rounded-2xl overflow-hidden">
      <div className="h-0.5" style={{ background: "linear-gradient(to right, var(--sky), transparent)" }} />

      <div className="flex items-start gap-4 p-6 border-b border-border">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
          style={{ background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.2)" }}>
          🏢
        </div>
        <div className="flex-1">
          <div className="font-mono text-[10px] text-faint tracking-widest mb-1">FEATURE 03 · MEMBER-3</div>
          <div className="text-base font-semibold tracking-tight">Company Intelligence</div>
          <div className="font-mono text-[11px] text-faint mt-1">Md. Asif Ahsan Safwan · 23101103</div>
        </div>
        {(results.length > 0 || selected || error) && (
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
          style={{ background: "rgba(96,165,250,0.08)", color: "var(--sky)", border: "1px solid rgba(96,165,250,0.2)" }}>
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse-dot" />
          GOOGLE MAPS API
        </div>

        <p className="text-sm text-muted leading-relaxed font-light mb-5">
          Search a global directory of corporate legal headquarters. Find the exact address
          required for serving formal legal notices to a company&apos;s legal department.
        </p>

        {/* Search input */}
        <div className="flex gap-2 mb-4">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. Amazon, Grameenphone, Samsung..."
            className="flex-1 bg-bg border border-border rounded-lg px-4 py-2.5 text-sm outline-none transition-all"
            style={{ color: "var(--text)", fontFamily: "var(--font-sans)" }}
            onFocus={(e) => (e.target.style.borderColor = "rgba(96,165,250,0.5)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
          />
          <button
            onClick={search}
            disabled={loading}
            className="px-4 py-2.5 rounded-lg font-mono text-[12px] font-semibold tracking-wider transition-all disabled:opacity-50"
            style={{ background: "rgba(96,165,250,0.15)", color: "var(--sky)", border: "1px solid rgba(96,165,250,0.3)" }}
          >
            SEARCH
          </button>
        </div>

        {loading && (
          <div className="flex items-center gap-3 py-2 font-mono text-[12px] text-faint">
            <div className="w-4 h-4 rounded-full border-2 border-border animate-spin-slow"
              style={{ borderTopColor: "var(--sky)" }} />
            Querying corporate directory...
          </div>
        )}

        {error && (
          <div className="text-danger text-sm font-mono p-3 rounded-lg border"
            style={{ background: "rgba(248,113,113,0.08)", borderColor: "rgba(248,113,113,0.2)" }}>
            ⚠ {error}
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {results.map((company, i) => (
              <div
                key={company.id || i}
                className="flex items-center justify-between gap-3 bg-bg border border-border rounded-lg px-4 py-3 transition-all cursor-pointer animate-fade-up hover:border-sky"
                style={{ animationDelay: `${i * 0.05}s`, borderColor: selected?.name === company.name ? "rgba(96,165,250,0.5)" : undefined }}
                onClick={() => selectCompany(company)}
              >
                <div className="min-w-0">
                  <div className="text-sm font-semibold truncate">{company.name}</div>
                  <div className="font-mono text-[10px] text-faint mt-0.5 truncate">{company.legalDept}</div>
                  <div className="font-mono text-[10px] text-muted mt-0.5 truncate">{company.address}</div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {company.verified && (
                    <span className="font-mono text-[9px] px-2 py-0.5 rounded"
                      style={{ background: "rgba(74,222,128,0.1)", color: "var(--emerald)", border: "1px solid rgba(74,222,128,0.2)" }}>
                      ✓ VERIFIED
                    </span>
                  )}
                  <button
                    className="font-mono text-[10px] px-3 py-1.5 rounded-md transition-all"
                    style={{ background: "rgba(96,165,250,0.1)", color: "var(--sky)", border: "1px solid rgba(96,165,250,0.2)" }}
                    onClick={(e) => { e.stopPropagation(); selectCompany(company); }}
                  >
                    USE →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {searched && results.length === 0 && (
          <div className="text-center py-6 font-mono text-[12px] text-faint">
            No results for &quot;{query}&quot;
            <br />
            <span className="text-[10px]">Try: Amazon, Google, Daraz, Grameenphone</span>
          </div>
        )}

        {/* Selected company */}
        {selected && (
          <div className="mt-4 p-4 rounded-xl animate-fade-up"
            style={{ background: "rgba(96,165,250,0.06)", border: "1px solid rgba(96,165,250,0.2)" }}>
            <div className="font-mono text-[10px] mb-2" style={{ color: "var(--sky)" }}>
              ⚡ SELECTED FOR NOTICE
            </div>
            <div className="font-semibold text-sm">{selected.name}</div>
            <div className="font-mono text-[11px] text-muted mt-1">{selected.legalDept}</div>
            <div className="font-mono text-[11px] text-muted">{selected.address}</div>
            {selected.industry && (
              <div className="font-mono text-[10px] text-faint mt-1">{selected.industry}</div>
            )}
            <button
              onClick={copyAddress}
              className="mt-3 px-4 py-2 rounded-lg font-mono text-[11px] font-semibold transition-all"
              style={{ background: "rgba(96,165,250,0.15)", color: "var(--sky)", border: "1px solid rgba(96,165,250,0.3)" }}
            >
              {addressCopied ? "✓ COPIED" : "📋 COPY LEGAL ADDRESS"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
