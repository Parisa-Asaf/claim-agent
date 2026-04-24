"use client";

import { useState } from "react";
import type { OutcomeReportApiResponse } from "@/types";
import { downloadCaseSummaryPdf } from "@/lib/pdf";

export default function FeatureOutcomeReport() {
  const [claimId, setClaimId] = useState("");
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");
  const [report, setReport] = useState<OutcomeReportApiResponse["data"]>();

  async function fetchReport() {
    try {
      setLoading(true);
      setError("");
      setReport(undefined);

      const res = await fetch(`/api/report/${claimId.trim()}`);
      const data: OutcomeReportApiResponse = await res.json();
      if (!data.success || !data.data) throw new Error(data.error || "Report generation failed");

      setReport(data.data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function downloadPdf() {
    if (!report) return;
    try {
      setDownloading(true);
      await downloadCaseSummaryPdf(report);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <section className="w-full feature-card border border-border rounded-2xl bg-bg2 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <p className="font-mono text-[11px] tracking-widest text-gold uppercase">Module 3 · Member 4</p>
          <h2 className="font-playfair text-2xl font-bold mt-1">Automated Outcome Reports</h2>
          <p className="text-sm text-muted mt-2 max-w-2xl">
            Enter the simple Claim # from the Claim Database or Global Search result. The PDF uses stored claim, statute, settlement, and recovery data.
          </p>
        </div>
        <span className="font-mono text-[10px] px-2 py-1 rounded border border-border text-emerald-300">PDF SUMMARY</span>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <input value={claimId} onChange={(e) => setClaimId(e.target.value)} placeholder="Enter Claim #, e.g. 1" className="flex-1 rounded-xl border border-border bg-bg3 px-4 py-3 outline-none" />
        <button onClick={fetchReport} disabled={loading || !claimId.trim()} className="rounded-xl px-4 py-3 font-semibold transition disabled:opacity-60" style={{ background: "linear-gradient(135deg, rgba(74,222,128,0.18), rgba(200,169,110,0.16))", border: "1px solid rgba(74,222,128,0.25)" }}>
          {loading ? "Loading..." : "Generate Report"}
        </button>
      </div>

      {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300 mt-4">{error}</div>}

      {report && (
        <div className="mt-5 space-y-4">
          <div className="rounded-2xl border border-border bg-bg3 p-4">
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="font-mono text-[11px] px-2 py-0.5 rounded" style={{ color: "var(--gold)", border: "1px solid rgba(200,169,110,0.3)", background: "rgba(200,169,110,0.08)" }}>CLAIM #{report.claimNumber}</span>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded border border-border text-faint">{report.status}</span>
            </div>
            <h3 className="text-lg font-semibold">{report.title}</h3>
            <p className="text-sm text-muted mt-1">{report.companyName || "No company"}</p>
            <p className="text-sm mt-3 leading-6 text-text">{report.grievanceText || "No grievance text recorded."}</p>
          </div>

          <div className="grid md:grid-cols-4 gap-3">
            <div className="rounded-xl border border-border bg-bg3 p-4">
              <p className="text-xs text-muted mb-2">Claimed</p>
              <p className="text-xl font-bold">{report.claimedAmount ?? "N/A"} {report.currency || ""}</p>
            </div>
            <div className="rounded-xl border border-border bg-bg3 p-4">
              <p className="text-xs text-muted mb-2">Recovered</p>
              <p className="text-xl font-bold">{report.recoveredAmount ?? "N/A"} {report.currency || ""}</p>
            </div>
            <div className="rounded-xl border border-border bg-bg3 p-4">
              <p className="text-xs text-muted mb-2">Statutes</p>
              <p className="text-xl font-bold">{report.statuteCount}</p>
            </div>
            <div className="rounded-xl border border-border bg-bg3 p-4">
              <p className="text-xs text-muted mb-2">Settlements</p>
              <p className="text-xl font-bold">{report.settlementCount}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-bg3 p-4">
            <h4 className="font-semibold mb-3">Timeline</h4>
            <div className="grid md:grid-cols-2 gap-3 text-sm">
              {report.timeline.map((item) => (
                <div key={item.label} className="rounded-xl border border-border bg-bg px-3 py-2">
                  <p className="text-muted text-xs mb-1">{item.label}</p>
                  <p>{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <button onClick={downloadPdf} disabled={downloading} className="w-full rounded-xl px-4 py-3 font-semibold transition disabled:opacity-60" style={{ background: "linear-gradient(135deg, rgba(200,169,110,0.18), rgba(192,132,252,0.16))", border: "1px solid rgba(200,169,110,0.25)" }}>
            {downloading ? "Preparing PDF..." : "Download Case Summary PDF"}
          </button>
        </div>
      )}
    </section>
  );
}
