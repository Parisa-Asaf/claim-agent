"use client";
// src/components/FeatureExtract.tsx
// Feature 1: AI Evidence Extraction — Member: Parisa Asaf (23101270)

import { useState, useRef, useCallback } from "react";
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

    // Preview
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
      {/* Top accent line */}
      <div className="h-0.5 bg-gradient-to-r from-gold to-transparent" />

      {/* Header */}
      <div className="flex items-start gap-4 p-6 border-b border-border">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
          style={{ background: "rgba(200,169,110,0.12)", border: "1px solid rgba(200,169,110,0.2)" }}>
          🧾
        </div>
        <div className="flex-1">
          <div className="font-mono text-[10px] text-faint tracking-widest mb-1">FEATURE 01 · MEMBER-1</div>
          <div className="text-base font-semibold tracking-tight">AI Evidence Extraction</div>
          <div className="font-mono text-[11px] text-faint mt-1">Parisa Asaf · 23101270</div>
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

      {/* Body */}
      <div className="p-6">
        {/* API Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md mb-4 font-mono text-[10px] font-medium tracking-wider"
          style={{ background: "rgba(200,169,110,0.1)", color: "var(--gold)", border: "1px solid rgba(200,169,110,0.2)" }}>
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse-dot" />
          GOOGLE VISION API
        </div>

        <p className="text-sm text-muted leading-relaxed font-light mb-5">
          Upload a receipt image. The system uses AI OCR to automatically extract the
          Merchant Name, Transaction Date, and Amount — building a verifiable evidence record.
        </p>

        {/* Receipt Preview */}
        {preview && (
          <div className="border border-border rounded-xl overflow-hidden mb-4 animate-fade-up">
            {preview.url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview.url} alt="Receipt" className="w-full h-36 object-cover" />
            )}
            <div className="flex items-center justify-between px-3 py-2 font-mono text-[11px] text-faint bg-bg border-t border-border">
              <span className="truncate">{preview.name}</span>
              <span style={{ color: "var(--gold)" }}>{preview.size}</span>
            </div>
          </div>
        )}

        {/* Upload Zone */}
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
          <div className="text-sm font-semibold mb-1">
            {preview ? "Drop another receipt" : "Drop receipt image here"}
          </div>
          <div className="font-mono text-[11px] text-faint">JPG · PNG · PDF · Max 10MB</div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center gap-3 py-3 font-mono text-[12px] text-faint animate-fade-up">
            <div className="w-4 h-4 rounded-full border-2 border-border animate-spin-slow"
              style={{ borderTopColor: "var(--gold)" }} />
            Analyzing receipt with Vision API...
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-danger text-sm font-mono p-3 rounded-lg border animate-fade-up"
            style={{ background: "rgba(248,113,113,0.08)", borderColor: "rgba(248,113,113,0.2)" }}>
            ⚠ {error}
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="animate-fade-up">
            <div className="bg-bg border border-border rounded-xl p-4 space-y-2">
              {[
                { key: "MERCHANT NAME", val: result.merchantName },
                { key: "TRANSACTION DATE", val: result.transactionDate },
                { key: "AMOUNT", val: `${result.amount} ${result.currency}`, gold: true },
                { key: "AVG CONFIDENCE", val: `${Math.round((result.confidenceMerchant + result.confidenceDate + result.confidenceAmount) / 3)}%` },
              ].map(({ key, val, gold }) => (
                <div key={key} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                  <span className="font-mono text-[11px] text-faint tracking-wider">{key}</span>
                  <span className={`text-sm font-medium ${gold ? "text-gold" : "text-text"}`}>{val}</span>
                </div>
              ))}
            </div>

            {/* Confidence Bars */}
            <div className="mt-4 px-1">
              <ConfidenceBar label="Merchant" value={result.confidenceMerchant} color="var(--gold)" />
              <ConfidenceBar label="Date" value={result.confidenceDate} color="var(--emerald)" />
              <ConfidenceBar label="Amount" value={result.confidenceAmount} color="var(--sky)" />
            </div>

            {/* Evidence ID */}
            {evidenceId && (
              <div className="mt-3 font-mono text-[10px] text-faint">
                Evidence ID: <span className="text-sky">{evidenceId}</span>
              </div>
            )}

            {/* CTA */}
            <button
              onClick={handleAddToClaim}
              className="w-full mt-4 py-2.5 rounded-lg text-sm font-semibold font-mono tracking-wider transition-all duration-200"
              style={addedToClaim
                ? { background: "rgba(74,222,128,0.15)", color: "var(--emerald)", border: "1px solid rgba(74,222,128,0.3)" }
                : { background: "var(--gold)", color: "#0a0b0f" }
              }
            >
              {addedToClaim ? "✓ Added to Claim" : "+ Add to Active Claim"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
