"use client";
// src/components/FeatureHash.tsx
// Feature 2: Evidence Hashing — Member: Raj Rohit Nath (22201126)

import { useState, useCallback } from "react";
import type { HashApiResponse, HashResult } from "@/types";

export default function FeatureHash() {
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<HashResult | null>(null);
  const [evidenceId, setEvidenceId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const processFile = useCallback(async (file: File) => {
    setError(null);
    setResult(null);
    setEvidenceId(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/hash", { method: "POST", body: formData });
      const data: HashApiResponse = await res.json();

      if (!data.success || !data.data) {
        throw new Error(data.error || "Hashing failed");
      }

      setResult(data.data);
      setEvidenceId(data.evidenceId || null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) processFile(e.target.files[0]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]);
  };

  const copyHash = async () => {
    if (!result?.sha256) return;
    await navigator.clipboard.writeText(result.sha256);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setResult(null);
    setEvidenceId(null);
    setError(null);
    setCopied(false);
  };

  return (
    <div className="feature-card bg-bg2 border border-border rounded-2xl overflow-hidden">
      <div className="h-0.5 bg-gradient-to-r from-emerald to-transparent" style={{ background: "linear-gradient(to right, var(--emerald), transparent)" }} />

      <div className="flex items-start gap-4 p-6 border-b border-border">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
          style={{ background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.2)" }}>
          🔐
        </div>
        <div className="flex-1">
          <div className="font-mono text-[10px] text-faint tracking-widest mb-1">FEATURE 02 · MEMBER-2</div>
          <div className="text-base font-semibold tracking-tight">Evidence Hashing</div>
          <div className="font-mono text-[11px] text-faint mt-1">Raj Rohit Nath · 22201126</div>
        </div>
        {(result || error) && (
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
          style={{ background: "rgba(74,222,128,0.08)", color: "var(--emerald)", border: "1px solid rgba(74,222,128,0.2)" }}>
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse-dot" />
          SHA-256 CRYPTOGRAPHY
        </div>

        <p className="text-sm text-muted leading-relaxed font-light mb-5">
          Every uploaded file receives a unique SHA-256 cryptographic fingerprint, making it
          legally tamper-proof. Any modification to the file produces a completely different hash.
        </p>

        <div
          className={`upload-zone mb-4 ${isDragging ? "drag-active" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <input type="file" accept="*/*" onChange={handleFileChange} />
          <div className="text-3xl mb-3">🗂️</div>
          <div className="text-sm font-semibold mb-1">Upload any evidence file</div>
          <div className="font-mono text-[11px] text-faint">All file types supported</div>
        </div>

        {loading && (
          <div className="flex items-center gap-3 py-3 font-mono text-[12px] text-faint animate-fade-up">
            <div className="w-4 h-4 rounded-full border-2 border-border animate-spin-slow"
              style={{ borderTopColor: "var(--emerald)" }} />
            Computing SHA-256 hash...
          </div>
        )}

        {error && (
          <div className="text-danger text-sm font-mono p-3 rounded-lg border"
            style={{ background: "rgba(248,113,113,0.08)", borderColor: "rgba(248,113,113,0.2)" }}>
            ⚠ {error}
          </div>
        )}

        {result && (
          <div className="animate-fade-up space-y-3">
            {/* Hash display */}
            <div className="bg-bg border border-border rounded-xl p-4">
              <div className="font-mono text-[9px] text-faint tracking-widest mb-2 uppercase">
                SHA-256 Fingerprint
              </div>
              <div className="font-mono text-[11px] break-all leading-relaxed"
                style={{ color: "var(--emerald)" }}>
                {result.sha256}
              </div>
            </div>

            {/* Integrity badge */}
            <div className="flex items-center justify-between rounded-xl p-3"
              style={{ background: "rgba(74,222,128,0.06)", border: "1px solid rgba(74,222,128,0.2)" }}>
              <div>
                <div className="text-sm font-semibold" style={{ color: "var(--emerald)" }}>
                  ✓ Integrity Verified
                </div>
                <div className="font-mono text-[10px] text-faint mt-0.5 truncate max-w-xs">
                  {result.fileName} · {result.fileSize ? formatSize(result.fileSize) : "—"}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={copyHash}
                  className="font-mono text-[10px] px-2 py-1 rounded border transition-all"
                  style={copied
                    ? { color: "var(--emerald)", borderColor: "rgba(74,222,128,0.4)" }
                    : { color: "var(--faint)", borderColor: "var(--border)" }
                  }
                >
                  {copied ? "COPIED" : "COPY"}
                </button>
                <span className="text-2xl">🛡️</span>
              </div>
            </div>

            {/* Details */}
            <div className="bg-bg border border-border rounded-xl p-4 space-y-2">
              {[
                { key: "ALGORITHM", val: result.algorithm, color: "var(--emerald)" },
                { key: "FILE NAME", val: result.fileName },
                { key: "TIMESTAMP", val: new Date(result.timestamp).toLocaleString() },
                { key: "LEGAL STATUS", val: "✓ TAMPER-PROOF", color: "var(--emerald)" },
              ].map(({ key, val, color }) => (
                <div key={key} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                  <span className="font-mono text-[11px] text-faint tracking-wider">{key}</span>
                  <span className="text-sm font-medium" style={{ color: color || "var(--text)" }}>{val}</span>
                </div>
              ))}
            </div>

            {evidenceId && (
              <div className="font-mono text-[10px] text-faint">
                Evidence ID: <span style={{ color: "var(--sky)" }}>{evidenceId}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
