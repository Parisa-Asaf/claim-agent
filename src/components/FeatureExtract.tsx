"use client";
// src/components/FeatureExtract.tsx
// Features 1, 2, & 3 — Member: Parisa Asaf (23101270)

import { useState, useRef, useCallback } from "react";
import Link from "next/link"; // Added for navigation
import type { ExtractApiResponse, ExtractedReceiptData } from "@/types";

interface ConfidenceBarProps {
  label: string;
  value: number;
  color: string;
}

function ConfidenceBar({ label, value, color }: ConfidenceBarProps) {
  return (
    <div className="flex items-center gap-3 mt-2">
      <span className="font-mono text-[10px] text-faint w-24">{label}</span>
      <div className="flex-1 h-1 rounded-full" style={{ background: "var(--border)" }}>
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{ width: `${value}%`, background: color }}
        />
      </div>
      <span className="font-mono text-[10px] text-muted w-8 text-right">{value}%</span>
    </div>
  );
}

export default function FeatureExtract() {
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<{ url: string; name: string; size: string } | null>(null);
  const [result, setResult] = useState<ExtractedReceiptData | null>(null);
  const [evidenceId, setEvidenceId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [addedToClaim, setAddedToClaim] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const processFile = useCallback(async (file: File) => {
    setError(null);
    setResult(null);
    setEvidenceId(null);

    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setPreview({ url, name: file.name, size: formatSize(file.size) });
    } else {
      setPreview({ url: "", name: file.name, size: formatSize(file.size) });
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/extract", { method: "POST", body: formData });
      const data: ExtractApiResponse = await res.json();

      if (!data.success || !data.data) {
        throw new Error(data.error || "Extraction failed");
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

  const handleAddToClaim = () => {
    setAddedToClaim(true);
    setTimeout(() => setAddedToClaim(false), 2500);
  };

  const handleClear = () => {
    setPreview(null);
    setResult(null);
    setEvidenceId(null);
    setError(null);
    setAddedToClaim(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="feature-card bg-bg2 border border-border rounded-2xl overflow-hidden">
      <div className="h-0.5 bg-gradient-to-r from-gold to-transparent" />

      {/* Header */}
      <div className="flex items-start gap-4 p-6 border-b border-border">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
          style={{ background: "rgba(200,169,110,0.12)", border: "1px solid rgba(200,169,110,0.2)" }}>
          ⚖️
        </div>
        <div className="flex-1">
          <div className="font-mono text-[10px] text-faint tracking-widest mb-1">MODULES 01, 02, 03 · PARISA ASAF</div>
          <div className="text-base font-semibold tracking-tight">AI Evidence & Dispatch System</div>
          <div className="font-mono text-[11px] text-gold mt-1">23101270 · Google Vision + SMTP</div>
        </div>
        {(result || preview || error) && (
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
          style={{ background: "rgba(200,169,110,0.1)", color: "var(--gold)", border: "1px solid rgba(200,169,110,0.2)" }}>
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse-dot" />
          ACTIVE SYSTEM
        </div>

        <p className="text-sm text-muted leading-relaxed font-light mb-5">
          Process legal evidence and manage recovery claims. Extract data from receipts, 
          review claim records, and dispatch formal notices to legal departments.
        </p>

        {/* Upload Zone */}
        {!result && (
          <div
            className={`upload-zone mb-4 ${isDragging ? "drag-active" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileChange}
            />
            <div className="text-3xl mb-3">📎</div>
            <div className="text-sm font-semibold mb-1">Drop receipt to begin</div>
            <div className="font-mono text-[11px] text-faint">Vision OCR Extraction</div>
          </div>
        )}

        {/* Loading/Error States */}
        {loading && <div className="text-sm font-mono text-faint py-4">Processing with Vision API...</div>}
        {error && <div className="text-danger text-sm font-mono p-3 bg-red-900/10 border border-red-900/20 rounded-lg">{error}</div>}

        {/* Extraction Result Preview */}
        {result && (
          <div className="animate-fade-up bg-bg border border-border rounded-xl p-4 space-y-2 mb-4">
            <div className="flex justify-between items-center py-1 border-b border-border text-[11px] font-mono">
              <span className="text-faint uppercase">Merchant</span>
              <span className="text-white">{result.merchantName}</span>
            </div>
            <div className="flex justify-between items-center py-1 text-[11px] font-mono">
              <span className="text-faint uppercase">Amount</span>
              <span className="text-gold">{result.amount} {result.currency}</span>
            </div>
          </div>
        )}

        {/* --- MODULE 2 & 3 REDIRECT SECTION --- */}
        <div className="mt-6 pt-6 border-t border-border/50">
          <div className="flex items-center justify-between mb-4">
            <div className="font-mono text-[10px] text-faint tracking-wider uppercase">Claim Management Portal</div>
            <div className="h-1 w-12 bg-gold/30 rounded-full" />
          </div>
          
          <button 
            type="button"
            onClick={() => window.location.href = '/dashboard'}
            className="w-full py-3 px-4 bg-bg3 border border-gold/20 hover:border-gold/50 text-gold rounded-xl font-mono text-[11px] tracking-widest uppercase transition-all flex items-center justify-center gap-2 cursor-pointer hover:bg-gold/5"
          >
            <span>Go to Claims Dashboard</span>
            <span>→</span>
          </button>
        </div>
      </div>
    </div>
  );
}