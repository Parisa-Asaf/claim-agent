"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import type { ClaimInputRecord, ClaimsApiResponse, GrievanceType } from "@/types";

const STATUSES = ["DRAFT", "STATUTES_MATCHED", "RESPONSE_RECEIVED", "SETTLED", "CLOSED"];
const PRIORITIES = ["HIGH", "MEDIUM", "LOW"];
const GRIEVANCE_TYPES: GrievanceType[] = [
  "Product Defect / Refund Denial",
  "False Advertising",
  "Service Failure",
  "Unauthorized Charges",
  "Data Privacy Violation",
  "Identity Theft",
];

type FormState = {
  title: string;
  companyName: string;
  companyAddress: string;
  companyCountry: string;
  grievanceText: string;
  grievanceType: GrievanceType;
  status: string;
  priorityLevel: string;
  claimedAmount: string;
  recoveredAmount: string;
  currency: string;
};

const EMPTY_FORM: FormState = {
  title: "",
  companyName: "",
  companyAddress: "",
  companyCountry: "Bangladesh",
  grievanceText: "",
  grievanceType: "Product Defect / Refund Denial",
  status: "DRAFT",
  priorityLevel: "MEDIUM",
  claimedAmount: "",
  recoveredAmount: "",
  currency: "BDT",
};

export default function ClaimDatabasePage() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [claims, setClaims] = useState<ClaimInputRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function loadClaims() {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/claims", { cache: "no-store" });
      const data: ClaimsApiResponse = await res.json();
      if (!data.success) throw new Error(data.error || "Could not load claims");
      setClaims(data.claims || []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadClaims();
  }, []);

  async function saveClaim(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const res = await fetch("/api/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data: ClaimsApiResponse = await res.json();
      if (!data.success || !data.claim) throw new Error(data.error || "Could not save claim");

      setMessage(`Claim #${data.claim.claimNumber} saved. Use this number in statute lookup, currency, search, and report.`);
      setForm(EMPTY_FORM);
      await loadClaims();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteClaim(claimNumber: number) {
    const ok = window.confirm(`Delete Claim #${claimNumber}?`);
    if (!ok) return;

    try {
      const res = await fetch(`/api/claims/${claimNumber}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Could not delete claim");
      setMessage(`Claim #${claimNumber} deleted.`);
      await loadClaims();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div className="min-h-screen relative z-10 px-6 py-8 md:px-10">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <div className="font-mono text-[11px] text-gold tracking-widest uppercase mb-2">
            MEMBER 4 - GLOBAL SEARCH DATABASE INPUT
          </div>
          <h1 className="font-playfair text-4xl font-black tracking-tight">Claim Input</h1>
          <p className="text-muted text-sm mt-3 max-w-2xl leading-relaxed">
            Add real claim records here.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link href="/" className="font-mono text-[11px] px-4 py-2 rounded-lg border border-border text-faint hover:text-gold transition-all">
            BACK TO MEMBER 4
          </Link>
          <Link href="/statutes" className="font-mono text-[11px] px-4 py-2 rounded-lg border border-border text-faint hover:text-gold transition-all">
            STATUTE DB
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-[440px_1fr] gap-6">
        <section className="bg-bg2 border border-border rounded-2xl overflow-hidden h-fit">
          <div className="p-5 border-b border-border">
            <div className="font-mono text-[10px] text-faint tracking-widest mb-1">ADD SEARCHABLE CLAIM</div>
            <h2 className="text-lg font-semibold">Store claim data</h2>
          </div>

          <form onSubmit={saveClaim} className="p-5 space-y-4">
            <div>
              <label className="font-mono text-[10px] text-faint tracking-wider">CLAIM TITLE</label>
              <input value={form.title} onChange={(e) => updateField("title", e.target.value)} placeholder="Defective laptop refund claim" className="mt-1 w-full bg-bg border border-border rounded-lg px-3 py-2.5 text-sm outline-none" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="font-mono text-[10px] text-faint tracking-wider">COMPANY NAME</label>
                <input value={form.companyName} onChange={(e) => updateField("companyName", e.target.value)} placeholder="Daraz Bangladesh" className="mt-1 w-full bg-bg border border-border rounded-lg px-3 py-2.5 text-sm outline-none" />
              </div>
              <div>
                <label className="font-mono text-[10px] text-faint tracking-wider">COUNTRY</label>
                <input value={form.companyCountry} onChange={(e) => updateField("companyCountry", e.target.value)} placeholder="Bangladesh" className="mt-1 w-full bg-bg border border-border rounded-lg px-3 py-2.5 text-sm outline-none" />
              </div>
            </div>

            <div>
              <label className="font-mono text-[10px] text-faint tracking-wider">COMPANY ADDRESS</label>
              <input value={form.companyAddress} onChange={(e) => updateField("companyAddress", e.target.value)} placeholder="Dhaka, Bangladesh" className="mt-1 w-full bg-bg border border-border rounded-lg px-3 py-2.5 text-sm outline-none" />
            </div>

            <div>
              <label className="font-mono text-[10px] text-faint tracking-wider">GRIEVANCE TEXT</label>
              <textarea value={form.grievanceText} onChange={(e) => updateField("grievanceText", e.target.value)} rows={5} placeholder="Write the complaint details that should be searchable..." className="mt-1 w-full bg-bg border border-border rounded-lg px-3 py-2.5 text-sm outline-none resize-y" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="font-mono text-[10px] text-faint tracking-wider">GRIEVANCE TYPE</label>
                <select value={form.grievanceType} onChange={(e) => updateField("grievanceType", e.target.value as GrievanceType)} className="mt-1 w-full bg-bg border border-border rounded-lg px-3 py-2.5 text-sm outline-none">
                  {GRIEVANCE_TYPES.map((item) => <option key={item}>{item}</option>)}
                </select>
              </div>
              <div>
                <label className="font-mono text-[10px] text-faint tracking-wider">PRIORITY</label>
                <select value={form.priorityLevel} onChange={(e) => updateField("priorityLevel", e.target.value)} className="mt-1 w-full bg-bg border border-border rounded-lg px-3 py-2.5 text-sm outline-none">
                  {PRIORITIES.map((item) => <option key={item}>{item}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="font-mono text-[10px] text-faint tracking-wider">STATUS</label>
                <select value={form.status} onChange={(e) => updateField("status", e.target.value)} className="mt-1 w-full bg-bg border border-border rounded-lg px-3 py-2.5 text-sm outline-none">
                  {STATUSES.map((item) => <option key={item}>{item}</option>)}
                </select>
              </div>
              <div>
                <label className="font-mono text-[10px] text-faint tracking-wider">CLAIMED AMOUNT</label>
                <input value={form.claimedAmount} onChange={(e) => updateField("claimedAmount", e.target.value)} placeholder="12000" className="mt-1 w-full bg-bg border border-border rounded-lg px-3 py-2.5 text-sm outline-none" />
              </div>
              <div>
                <label className="font-mono text-[10px] text-faint tracking-wider">CURRENCY</label>
                <input value={form.currency} onChange={(e) => updateField("currency", e.target.value.toUpperCase())} placeholder="BDT" className="mt-1 w-full bg-bg border border-border rounded-lg px-3 py-2.5 text-sm outline-none" />
              </div>
            </div>

            <div>
              <label className="font-mono text-[10px] text-faint tracking-wider">RECOVERED AMOUNT OPTIONAL</label>
              <input value={form.recoveredAmount} onChange={(e) => updateField("recoveredAmount", e.target.value)} placeholder="Leave blank if not settled" className="mt-1 w-full bg-bg border border-border rounded-lg px-3 py-2.5 text-sm outline-none" />
            </div>

            {message && <div className="text-sm font-mono p-3 rounded-lg border" style={{ color: "var(--emerald)", borderColor: "rgba(74,222,128,0.2)", background: "rgba(74,222,128,0.08)" }}>{message}</div>}
            {error && <div className="text-sm font-mono p-3 rounded-lg border" style={{ color: "var(--danger)", borderColor: "rgba(248,113,113,0.2)", background: "rgba(248,113,113,0.08)" }}>{error}</div>}

            <div className="flex flex-wrap gap-2 pt-2">
              <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-lg font-mono text-[12px] font-semibold tracking-wider transition-all disabled:opacity-50" style={{ background: "rgba(200,169,110,0.16)", color: "var(--gold)", border: "1px solid rgba(200,169,110,0.3)" }}>
                {saving ? "SAVING..." : "SAVE CLAIM"}
              </button>
              <button type="button" onClick={() => setForm(EMPTY_FORM)} className="px-4 py-2.5 rounded-lg font-mono text-[11px] border border-border text-faint hover:text-gold transition-all">
                CLEAR
              </button>
            </div>
          </form>
        </section>

        <section className="bg-bg2 border border-border rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-border flex items-center justify-between gap-4">
            <div>
              <div className="font-mono text-[10px] text-faint tracking-widest mb-1">SAVED CLAIMS</div>
              <h2 className="text-lg font-semibold">Database List ({claims.length})</h2>
            </div>
            <button type="button" onClick={loadClaims} className="px-4 py-2 rounded-lg font-mono text-[11px] border border-border text-faint hover:text-gold transition-all">REFRESH</button>
          </div>

          <div className="p-5 space-y-3">
            {loading && <div className="font-mono text-[12px] text-faint">Loading claims...</div>}
            {!loading && claims.length === 0 && <div className="border border-border rounded-xl p-5 text-muted text-sm leading-relaxed">No claims saved yet. Add one with the form.</div>}

            {!loading && claims.map((claim) => (
              <article key={claim.id} className="bg-bg border border-border rounded-xl p-4">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded" style={{ color: "var(--gold)", border: "1px solid rgba(200,169,110,0.3)", background: "rgba(200,169,110,0.08)" }}>CLAIM #{claim.claimNumber}</span>
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded border border-border text-faint">{claim.status}</span>
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded border border-border text-faint">{claim.priorityLevel}</span>
                    </div>
                    <h3 className="font-semibold text-base">{claim.title}</h3>
                    <p className="text-sm text-muted mt-1">{claim.companyName || "No company"} · {claim.grievanceType}</p>
                    <p className="text-sm text-muted leading-relaxed mt-2 line-clamp-3">{claim.grievanceText}</p>
                    <div className="grid md:grid-cols-3 gap-2 mt-3 text-xs">
                      <span className="rounded-lg border border-border bg-bg2 px-2 py-1">Claimed: {claim.claimedAmount ?? 0} {claim.currency || ""}</span>
                      <span className="rounded-lg border border-border bg-bg2 px-2 py-1">Recovered: {claim.recoveredAmount ?? "N/A"} {claim.currency || ""}</span>
                      <span className="rounded-lg border border-border bg-bg2 px-2 py-1">Updated: {new Date(claim.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 flex-shrink-0">
                    <Link href={`/?claim=${claim.claimNumber}`} className="font-mono text-[10px] px-3 py-1.5 rounded-lg border border-border text-faint hover:text-gold transition-all">USE #</Link>
                    <button type="button" onClick={() => deleteClaim(claim.claimNumber)} className="font-mono text-[10px] px-3 py-1.5 rounded-lg border transition-all" style={{ color: "var(--danger)", borderColor: "rgba(248,113,113,0.25)" }}>DELETE</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
