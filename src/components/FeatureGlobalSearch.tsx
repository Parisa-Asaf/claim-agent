"use client";

import Link from "next/link";
import { useState } from "react";
import type { SearchApiResponse } from "@/types";

const statuses = ["", "DRAFT", "STATUTES_MATCHED", "RESPONSE_RECEIVED", "SETTLED", "CLOSED"];
const priorities = ["", "HIGH", "MEDIUM", "LOW"];

export default function FeatureGlobalSearch() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<SearchApiResponse["results"]>([]);
  const [count, setCount] = useState(0);

  async function searchNow() {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (status) params.set("status", status);
      if (priority) params.set("priority", priority);
      if (company) params.set("company", company);

      const res = await fetch(`/api/search?${params.toString()}`);
      const data: SearchApiResponse = await res.json();
      if (!data.success) throw new Error(data.error || "Search failed");

      setResults(data.results);
      setCount(data.count);
    } catch (err) {
      setError((err as Error).message);
      setResults([]);
      setCount(0);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="feature-card border border-border rounded-2xl bg-bg2 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <p className="font-mono text-[11px] tracking-widest text-gold uppercase">Module 3 · Member 4</p>
          <h2 className="font-playfair text-2xl font-bold mt-1">Global Search & Filter Engine</h2>
          <p className="text-sm text-muted mt-2 max-w-2xl">
            Search the claim records you add in the Claim Database page. You can search by Claim #, company, keyword, status, or priority.
          </p>
        </div>
        <Link href="/claims" className="font-mono text-[10px] px-3 py-2 rounded border border-border text-violet-300 hover:text-gold transition-all">
          ADD CLAIM DATA
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search claim #, keyword, grievance..." className="rounded-xl border border-border bg-bg3 px-4 py-3 outline-none" />
        <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Filter by company" className="rounded-xl border border-border bg-bg3 px-4 py-3 outline-none" />

        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-xl border border-border bg-bg3 px-4 py-3 outline-none">
          {statuses.map((item) => <option key={item || "all"} value={item}>{item || "All Statuses"}</option>)}
        </select>

        <select value={priority} onChange={(e) => setPriority(e.target.value)} className="rounded-xl border border-border bg-bg3 px-4 py-3 outline-none">
          {priorities.map((item) => <option key={item || "all"} value={item}>{item || "All Priorities"}</option>)}
        </select>
      </div>

      <button onClick={searchNow} disabled={loading} className="w-full mt-4 rounded-xl px-4 py-3 font-semibold transition disabled:opacity-60" style={{ background: "linear-gradient(135deg, rgba(192,132,252,0.18), rgba(96,165,250,0.16))", border: "1px solid rgba(192,132,252,0.25)" }}>
        {loading ? "Searching..." : "Search Claims"}
      </button>

      {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300 mt-4">{error}</div>}

      <div className="mt-5">
        <p className="text-sm text-muted mb-3">Results found: {count}</p>
        <div className="space-y-3">
          {results.map((item) => (
            <article key={item.id} className="rounded-2xl border border-border bg-bg3 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className="font-mono text-[11px] px-2 py-0.5 rounded" style={{ color: "var(--gold)", border: "1px solid rgba(200,169,110,0.3)", background: "rgba(200,169,110,0.08)" }}>CLAIM #{item.claimNumber}</span>
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded border border-border text-faint">{item.status}</span>
                  </div>
                  <h3 className="font-semibold text-lg">{item.title}</h3>
                  <p className="text-sm text-muted mt-1">{item.companyName || "No company"} · {item.grievanceType || "No type"}</p>
                </div>
                <div className="text-right text-xs text-muted">
                  <p>Priority: {item.priorityLevel || "N/A"}</p>
                  <p>Updated: {new Date(item.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-4 gap-3 mt-4 text-sm">
                <div className="rounded-xl border border-border bg-bg px-3 py-2">
                  <p className="text-muted text-xs mb-1">Use in Report</p>
                  <p>#{item.claimNumber}</p>
                </div>
                <div className="rounded-xl border border-border bg-bg px-3 py-2">
                  <p className="text-muted text-xs mb-1">Claimed</p>
                  <p>{item.claimedAmount ?? "N/A"} {item.currency || ""}</p>
                </div>
                <div className="rounded-xl border border-border bg-bg px-3 py-2">
                  <p className="text-muted text-xs mb-1">Recovered</p>
                  <p>{item.recoveredAmount ?? "N/A"} {item.currency || ""}</p>
                </div>
                <div className="rounded-xl border border-border bg-bg px-3 py-2">
                  <p className="text-muted text-xs mb-1">Database ID</p>
                  <p className="break-all text-[11px] text-faint">{item.id}</p>
                </div>
              </div>
            </article>
          ))}

          {!loading && results.length === 0 && (
            <div className="rounded-2xl border border-border bg-bg3 p-5 text-sm text-muted">
              No claims matched your filters yet. Add records at /claims first.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
