"use client";
// src/components/FeatureAuditLog.tsx
// Feature 4: Forensic Audit Log — Member: Raj Rohit Nath (22201126)

import { useState } from "react";

interface AuditLog {
  id: string;
  createdAt: string;
  action: string;
  entity: string;
  entityId: string | null;
  details: Record<string, unknown> | null;
  performedBy: string | null;
}

const ACTION_COLORS: Record<string, string> = {
  USER_CREATED:      "#4ade80",
  USER_DELETED:      "#f87171",
  USER_DEACTIVATED:  "#fbbf24",
  USER_ROLE_UPDATED: "#60a5fa",
  STATUTE_UPDATED:   "#c084fc",
  CLAIM_CREATED:     "#4ade80",
  EVIDENCE_UPLOADED: "#60a5fa",
};

export default function FeatureAuditLog() {
  const [logs, setLogs]           = useState<AuditLog[]>([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [filterEntity, setFilter] = useState("");

  // Manual log form
  const [action, setAction]           = useState("");
  const [entity, setEntity]           = useState("");
  const [performedBy, setPerformedBy] = useState("");
  const [logResult, setLogResult]     = useState<AuditLog | null>(null);

  const loadLogs = async () => {
    setLoading(true); setError(null);
    try {
      const url = filterEntity
        ? `/api/audit?entity=${encodeURIComponent(filterEntity)}`
        : "/api/audit";
      const res = await fetch(url);
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setLogs(data.data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const createLog = async () => {
    if (!action || !entity) { setError("Action and entity are required"); return; }
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, entity, performedBy: performedBy || "Admin", details: { manual: true } }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setLogResult(data.data);
      setAction(""); setEntity(""); setPerformedBy("");
      loadLogs();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setLogs([]); setError(null); setLogResult(null);
    setAction(""); setEntity(""); setPerformedBy(""); setFilter("");
  };

  return (
    <div className="feature-card bg-bg2 border border-border rounded-2xl overflow-hidden">
      <div className="h-0.5" style={{ background: "linear-gradient(to right, #c084fc, transparent)" }} />

      {/* Header */}
      <div className="flex items-start gap-4 p-6 border-b border-border">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
          style={{ background: "rgba(192,132,252,0.1)", border: "1px solid rgba(192,132,252,0.2)" }}>
          📋
        </div>
        <div className="flex-1">
          <div className="font-mono text-[10px] text-faint tracking-widest mb-1">FEATURE 04 · MEMBER-2</div>
          <div className="text-base font-semibold tracking-tight">Forensic Audit Log</div>
          <div className="font-mono text-[11px] text-faint mt-1">Raj Rohit Nath · 22201126</div>
        </div>
        {(logs.length > 0 || error || logResult) && (
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
          style={{ background: "rgba(192,132,252,0.08)", color: "#c084fc", border: "1px solid rgba(192,132,252,0.2)" }}>
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse-dot" />
          READ-ONLY LEDGER
        </div>

        <p className="text-sm text-muted leading-relaxed font-light mb-5">
          A chronological, read-only ledger recording every system action.
          Provides court-admissible Proof of Effort for legal proceedings.
        </p>

        {/* Manual log entry */}
        <div className="bg-bg border border-border rounded-xl p-4 mb-4">
          <div className="font-mono text-[11px] text-faint tracking-wider mb-3">LOG A SYSTEM ACTION</div>
          <div className="space-y-2">
            <input type="text" value={action} onChange={(e) => setAction(e.target.value)}
              placeholder="Action (e.g. STATUTE_UPDATED)"
              className="w-full bg-bg2 border border-border rounded-lg px-3 py-2 text-sm outline-none"
              style={{ color: "var(--text)" }} />
            <input type="text" value={entity} onChange={(e) => setEntity(e.target.value)}
              placeholder="Entity (e.g. StatuteLookup, User, Evidence)"
              className="w-full bg-bg2 border border-border rounded-lg px-3 py-2 text-sm outline-none"
              style={{ color: "var(--text)" }} />
            <input type="text" value={performedBy} onChange={(e) => setPerformedBy(e.target.value)}
              placeholder="Performed by (e.g. Admin, Legal Expert)"
              className="w-full bg-bg2 border border-border rounded-lg px-3 py-2 text-sm outline-none"
              style={{ color: "var(--text)" }} />
          </div>
          <button onClick={createLog} disabled={loading}
            className="w-full mt-3 py-2 rounded-lg font-mono text-[11px] font-semibold tracking-wider transition-all disabled:opacity-50"
            style={{ background: "rgba(192,132,252,0.15)", color: "#c084fc", border: "1px solid rgba(192,132,252,0.3)" }}>
            {loading ? "Logging..." : "📝 LOG ACTION"}
          </button>
        </div>

        {logResult && (
          <div className="animate-fade-up p-3 rounded-xl border mb-4"
            style={{ background: "rgba(192,132,252,0.06)", borderColor: "rgba(192,132,252,0.2)" }}>
            <div className="font-mono text-[10px] mb-1" style={{ color: "#c084fc" }}>✓ ACTION LOGGED</div>
            <div className="font-mono text-[11px] text-muted">{logResult.action} → {logResult.entity}</div>
            <div className="font-mono text-[10px] text-faint mt-1">ID: {logResult.id}</div>
          </div>
        )}

        {error && (
          <div className="text-danger text-sm font-mono p-3 rounded-lg border mb-4"
            style={{ background: "rgba(248,113,113,0.08)", borderColor: "rgba(248,113,113,0.2)" }}>
            ⚠ {error}
          </div>
        )}

        {/* Filter + Load */}
        <div className="flex gap-2 mb-4">
          <input type="text" value={filterEntity} onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter by entity (optional)"
            className="flex-1 bg-bg border border-border rounded-lg px-3 py-2 text-sm outline-none"
            style={{ color: "var(--text)" }} />
          <button onClick={loadLogs} disabled={loading}
            className="px-4 py-2 rounded-lg font-mono text-[11px] font-semibold border transition-all"
            style={{ background: "rgba(192,132,252,0.1)", color: "#c084fc", border: "1px solid rgba(192,132,252,0.2)" }}>
            {loading ? "..." : "LOAD LOGS"}
          </button>
        </div>

        {/* Logs list */}
        {logs.length > 0 && (
          <div>
            <div className="font-mono text-[11px] text-faint tracking-wider mb-3">
              AUDIT TRAIL ({logs.length} entries) — READ ONLY
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {logs.map((log) => (
                <div key={log.id} className="bg-bg border border-border rounded-lg px-4 py-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[11px] font-semibold"
                      style={{ color: ACTION_COLORS[log.action] || "#94a3b8" }}>
                      {log.action}
                    </span>
                    <span className="font-mono text-[10px] text-faint">
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="font-mono text-[10px] text-muted">
                    Entity: {log.entity} {log.entityId ? `· ID: ${log.entityId.slice(0, 8)}...` : ""}
                  </div>
                  {log.performedBy && (
                    <div className="font-mono text-[10px] text-faint mt-0.5">
                      By: {log.performedBy}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {logs.length === 0 && !loading && (
          <div className="text-center py-4 font-mono text-[11px] text-faint">
            Click LOAD LOGS to view the audit trail
          </div>
        )}
      </div>
    </div>
  );
}