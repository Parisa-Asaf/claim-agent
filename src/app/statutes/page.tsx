"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import type { GrievanceType, Jurisdiction } from "@/types";
import { JURISDICTION_LABELS } from "@/types";

type StatuteRule = {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  jurisdiction: string;
  article: string;
  description: string;
  maxPenalty: string;
  keywords: string[];
  grievanceTypes: string[];
  isActive: boolean;
};

type FormState = {
  name: string;
  jurisdiction: Jurisdiction;
  article: string;
  description: string;
  maxPenalty: string;
  keywords: string;
  grievanceTypes: string;
  isActive: boolean;
};

const GRIEVANCE_TYPES: GrievanceType[] = [
  "Data Privacy Violation",
  "Unauthorized Charges",
  "Product Defect / Refund Denial",
  "False Advertising",
  "Service Failure",
  "Identity Theft",
];

const EMPTY_FORM: FormState = {
  name: "",
  jurisdiction: "BD",
  article: "",
  description: "",
  maxPenalty: "",
  keywords: "",
  grievanceTypes: "Product Defect / Refund Denial, Service Failure",
  isActive: true,
};

export default function StatuteManagerPage() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [statutes, setStatutes] = useState<StatuteRule[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadStatutes() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/statutes", { cache: "no-store" });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Could not load statutes");
      setStatutes(data.statutes || []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStatutes();
  }, []);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function addType(type: GrievanceType) {
    const current = form.grievanceTypes
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    if (!current.includes(type)) updateField("grievanceTypes", [...current, type].join(", "));
  }

  function editStatute(rule: StatuteRule) {
    setEditingId(rule.id);
    setForm({
      name: rule.name,
      jurisdiction: rule.jurisdiction as Jurisdiction,
      article: rule.article,
      description: rule.description,
      maxPenalty: rule.maxPenalty,
      keywords: rule.keywords.join(", "),
      grievanceTypes: rule.grievanceTypes.join(", "),
      isActive: rule.isActive,
    });
    setMessage("Editing selected statute. Update the form and save.");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setMessage(null);
    setError(null);
  }

  async function saveStatute(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch(editingId ? `/api/statutes/${editingId}` : "/api/statutes", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Could not save statute");

      setMessage(editingId ? "Statute updated successfully." : "Statute saved successfully.");
      setForm(EMPTY_FORM);
      setEditingId(null);
      await loadStatutes();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteStatute(id: string) {
    const confirmed = window.confirm("Delete this statute from your database?");
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/statutes/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Could not delete statute");
      setMessage("Statute deleted.");
      await loadStatutes();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div className="min-h-screen relative z-10 px-6 py-8 md:px-10">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <div className="font-mono text-[11px] text-gold tracking-widest uppercase mb-2">
            MEMBER 4 - STATUTE DATABASE
          </div>
          <h1 className="font-playfair text-4xl font-black tracking-tight">Statute List</h1>
          <p className="text-muted text-sm mt-3 max-w-2xl leading-relaxed">
            Store your own statute data here. 
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link href="/" className="font-mono text-[11px] px-4 py-2 rounded-lg border border-border text-faint hover:text-gold transition-all">BACK TO MEMBER 4</Link>
          <Link href="/claims" className="font-mono text-[11px] px-4 py-2 rounded-lg border border-border text-faint hover:text-gold transition-all">CLAIM DB</Link>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-6">
        <section className="bg-bg2 border border-border rounded-2xl overflow-hidden h-fit">
          <div className="p-5 border-b border-border">
            <div className="font-mono text-[10px] text-faint tracking-widest mb-1">{editingId ? "EDIT STATUTE" : "ADD NEW STATUTE"}</div>
            <h2 className="text-lg font-semibold">{editingId ? "Update saved statute" : "Store statute data"}</h2>
          </div>

          <form onSubmit={saveStatute} className="p-5 space-y-4">
            <div>
              <label className="font-mono text-[10px] text-faint tracking-wider">LAW NAME</label>
              <input value={form.name} onChange={(e) => updateField("name", e.target.value)} placeholder="Consumer Rights Protection Act, 2009" className="mt-1 w-full bg-bg border border-border rounded-lg px-3 py-2.5 text-sm outline-none" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="font-mono text-[10px] text-faint tracking-wider">JURISDICTION</label>
                <select value={form.jurisdiction} onChange={(e) => updateField("jurisdiction", e.target.value as Jurisdiction)} className="mt-1 w-full bg-bg border border-border rounded-lg px-3 py-2.5 text-sm outline-none">
                  {(Object.entries(JURISDICTION_LABELS) as [Jurisdiction, string][]).map(([code, label]) => <option key={code} value={code}>{label}</option>)}
                </select>
              </div>
              <div>
                <label className="font-mono text-[10px] text-faint tracking-wider">ARTICLE / SECTION</label>
                <input value={form.article} onChange={(e) => updateField("article", e.target.value)} placeholder="Sections 37-45" className="mt-1 w-full bg-bg border border-border rounded-lg px-3 py-2.5 text-sm outline-none" />
              </div>
            </div>

            <div>
              <label className="font-mono text-[10px] text-faint tracking-wider">DESCRIPTION</label>
              <textarea value={form.description} onChange={(e) => updateField("description", e.target.value)} rows={4} placeholder="Write what this statute covers..." className="mt-1 w-full bg-bg border border-border rounded-lg px-3 py-2.5 text-sm outline-none resize-y" />
            </div>

            <div>
              <label className="font-mono text-[10px] text-faint tracking-wider">MAX PENALTY / REMEDY</label>
              <textarea value={form.maxPenalty} onChange={(e) => updateField("maxPenalty", e.target.value)} rows={3} placeholder="Refund, replacement, compensation, fine, etc." className="mt-1 w-full bg-bg border border-border rounded-lg px-3 py-2.5 text-sm outline-none resize-y" />
            </div>

            <div>
              <label className="font-mono text-[10px] text-faint tracking-wider">KEYWORDS</label>
              <input value={form.keywords} onChange={(e) => updateField("keywords", e.target.value)} placeholder="refund, defect, warranty, delivery" className="mt-1 w-full bg-bg border border-border rounded-lg px-3 py-2.5 text-sm outline-none" />
              <p className="font-mono text-[10px] text-faint mt-1">Separate keywords with commas. These are used for matching complaints.</p>
            </div>

            <div>
              <label className="font-mono text-[10px] text-faint tracking-wider">GRIEVANCE TYPES</label>
              <input value={form.grievanceTypes} onChange={(e) => updateField("grievanceTypes", e.target.value)} placeholder="Product Defect / Refund Denial, Service Failure" className="mt-1 w-full bg-bg border border-border rounded-lg px-3 py-2.5 text-sm outline-none" />
              <div className="flex flex-wrap gap-2 mt-2">
                {GRIEVANCE_TYPES.map((type) => (
                  <button type="button" key={type} onClick={() => addType(type)} className="font-mono text-[9px] px-2 py-1 rounded-full border border-border text-faint hover:text-gold transition-all">+ {type}</button>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-2 font-mono text-[11px] text-faint">
              <input type="checkbox" checked={form.isActive} onChange={(e) => updateField("isActive", e.target.checked)} />
              Active for statute lookup
            </label>

            {message && <div className="text-sm font-mono p-3 rounded-lg border" style={{ color: "var(--emerald)", borderColor: "rgba(74,222,128,0.2)", background: "rgba(74,222,128,0.08)" }}>{message}</div>}
            {error && <div className="text-sm font-mono p-3 rounded-lg border" style={{ color: "var(--danger)", borderColor: "rgba(248,113,113,0.2)", background: "rgba(248,113,113,0.08)" }}>{error}</div>}

            <div className="flex flex-wrap gap-2 pt-2">
              <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-lg font-mono text-[12px] font-semibold tracking-wider transition-all disabled:opacity-50" style={{ background: "rgba(200,169,110,0.16)", color: "var(--gold)", border: "1px solid rgba(200,169,110,0.3)" }}>
                {saving ? "SAVING..." : editingId ? "UPDATE STATUTE" : "SAVE STATUTE"}
              </button>
              {(editingId || form.name) && (
                <button type="button" onClick={resetForm} className="px-4 py-2.5 rounded-lg font-mono text-[11px] border transition-all" style={{ color: "var(--danger)", borderColor: "rgba(248,113,113,0.3)" }}>CLEAR</button>
              )}
            </div>
          </form>
        </section>

        <section className="bg-bg2 border border-border rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-border flex items-center justify-between gap-4">
            <div>
              <div className="font-mono text-[10px] text-faint tracking-widest mb-1">SAVED STATUTES</div>
              <h2 className="text-lg font-semibold">Database List ({statutes.length})</h2>
            </div>
            <button type="button" onClick={loadStatutes} className="px-4 py-2 rounded-lg font-mono text-[11px] border border-border text-faint hover:text-gold transition-all">REFRESH</button>
          </div>

          <div className="p-5 space-y-3">
            {loading && <div className="font-mono text-[12px] text-faint">Loading statutes...</div>}
            {!loading && statutes.length === 0 && <div className="border border-border rounded-xl p-5 text-muted text-sm leading-relaxed">No statutes saved yet. Use the form to add your first statute.</div>}

            {!loading && statutes.map((rule) => (
              <article key={rule.id} className="bg-bg border border-border rounded-xl p-4">
                <div className="flex flex-col lg:flex-row lg:items-start gap-3 lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="font-semibold text-base" style={{ color: "var(--gold)" }}>{rule.name}</h3>
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded border border-border text-faint">{rule.jurisdiction}</span>
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded border border-border text-faint">{rule.article}</span>
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded" style={{ color: rule.isActive ? "var(--emerald)" : "var(--danger)", border: "1px solid var(--border)" }}>{rule.isActive ? "ACTIVE" : "INACTIVE"}</span>
                    </div>
                    <p className="text-sm text-muted leading-relaxed">{rule.description}</p>
                    <p className="text-xs text-faint leading-relaxed mt-2"><b>Remedy:</b> {rule.maxPenalty}</p>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {rule.keywords.map((keyword) => <span key={keyword} className="font-mono text-[9px] px-2 py-0.5 rounded bg-bg2 border border-border text-faint">{keyword}</span>)}
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {rule.grievanceTypes.map((type) => <span key={type} className="font-mono text-[9px] px-2 py-0.5 rounded" style={{ color: "var(--violet)", border: "1px solid rgba(192,132,252,0.2)", background: "rgba(192,132,252,0.08)" }}>{type}</span>)}
                    </div>
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    <button type="button" onClick={() => editStatute(rule)} className="font-mono text-[10px] px-3 py-1.5 rounded-lg border border-border text-faint hover:text-gold transition-all">EDIT</button>
                    <button type="button" onClick={() => deleteStatute(rule.id)} className="font-mono text-[10px] px-3 py-1.5 rounded-lg border transition-all" style={{ color: "var(--danger)", borderColor: "rgba(248,113,113,0.25)" }}>DELETE</button>
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
