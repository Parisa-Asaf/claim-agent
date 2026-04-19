"use client";
// src/components/FeatureLetter.tsx
// Feature 5: Automated Letter Architect
// Generates professional demand letters based on claim data and statutes.

import { useState, useEffect } from "react";
import { generateDemandLetterPDF } from "@/lib/pdf";

interface LetterPreview {
    id: string;
    date: string;
    senderName: string;
    senderAddress: string;
    recipientName: string;
    recipientAddress: string;
    subject: string;
    body: string;
    statutes: { name: string; article: string; description: string }[];
}

export default function FeatureLetter() {
    const [claimId, setClaimId] = useState("");
    const [senderName, setSenderName] = useState("");
    const [senderAddress, setSenderAddress] = useState("");
    const [senderEmail, setSenderEmail] = useState("");
    const [senderPhone, setSenderPhone] = useState("");
    const [recipientName, setRecipientName] = useState("");
    const [recipientAddress, setRecipientAddress] = useState("");

    const [availableStatutes, setAvailableStatutes] = useState<any[]>([]);
    const [selectedStatuteIndices, setSelectedStatuteIndices] = useState<number[]>([]);

    const [loading, setLoading] = useState(false);
    const [claims, setClaims] = useState<{ id: string; title: string }[]>([]);
    const [preview, setPreview] = useState<LetterPreview | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadClaims();
    }, []);

    useEffect(() => {
        if (claimId) {
            loadClaimDetails(claimId);
        } else {
            setRecipientName("");
            setRecipientAddress("");
            setAvailableStatutes([]);
            setSelectedStatuteIndices([]);
        }
    }, [claimId]);

    const loadClaimDetails = async (id: string) => {
        try {
            const res = await fetch(`/api/triage?id=${id}`);
            const data = await res.json();
            if (data.success) {
                const claim = data.data;
                if (claim.company) {
                    setRecipientName(claim.company.name);
                    setRecipientAddress(claim.company.address);
                }
                const latestLookup = claim.statutes?.[0];
                const statutes = latestLookup ? (latestLookup.statutes as any[]) : [];
                setAvailableStatutes(statutes);
                setSelectedStatuteIndices(statutes.map((_, i) => i)); // Select all by default
            }
        } catch (err) {
            console.error("Failed to load claim details", err);
        }
    };

    const loadClaims = async () => {
        try {
            const res = await fetch("/api/triage");
            const data = await res.json();
            if (data.success) setClaims(data.data);
        } catch (err) {
            console.error("Failed to load claims", err);
        }
    };

    const handleGenerate = async () => {
        if (!claimId || !senderName || !senderAddress) {
            setError("Please fill in all fields and select a claim.");
            return;
        }

        setLoading(true);
        setError(null);
        setPreview(null);

        try {
            const selectedStatutes = availableStatutes.filter((_, i) => selectedStatuteIndices.includes(i));

            const res = await fetch("/api/letter", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    claimId,
                    senderName,
                    senderAddress,
                    senderEmail,
                    senderPhone,
                    recipientName,
                    recipientAddress,
                    selectedStatutes
                }),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);

            setPreview(data.data);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const downloadPDF = () => {
        if (!preview) return;
        const doc = generateDemandLetterPDF(preview);
        doc.save(`Demand_Letter_${preview.id.slice(0, 8)}.pdf`);
    };

    return (
        <div className="feature-card bg-bg2 border border-border rounded-2xl overflow-hidden">
            <div className="h-0.5" style={{ background: "linear-gradient(to right, #c8a96e, transparent)" }} />

            {/* Header */}
            <div className="flex items-start gap-4 p-6 border-b border-border">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ background: "rgba(200,169,110,0.1)", border: "1px solid rgba(200,169,110,0.2)" }}>
                    ⚖️
                </div>
                <div className="flex-1">
                    <div className="font-mono text-[10px] text-faint tracking-widest mb-1">FEATURE 05 · NEW</div>
                    <div className="text-base font-semibold tracking-tight">Letter Architect</div>
                    <div className="font-mono text-[11px] text-faint mt-1">Automated Legal Demand Generator</div>
                </div>
            </div>

            <div className="p-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md mb-4 font-mono text-[10px] font-medium tracking-wider"
                    style={{ background: "rgba(200,169,110,0.08)", color: "#c8a96e", border: "1px solid rgba(200,169,110,0.2)" }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    PDF ENGINE READY
                </div>

                <p className="text-sm text-muted leading-relaxed font-light mb-5">
                    Generate a professional legal "Demand Letter" by merging your claim data with AI-cited statutes.
                </p>

                <div className="space-y-4">
                    {/* Select Claim */}
                    <div>
                        <label className="font-mono text-[11px] text-faint tracking-wider block mb-2">SELECT ACTIVE CLAIM</label>
                        <select
                            value={claimId}
                            onChange={(e) => setClaimId(e.target.value)}
                            className="w-full bg-bg border border-border rounded-lg px-4 py-2.5 text-sm outline-none appearance-none"
                            style={{ color: "var(--text)", fontFamily: "var(--font-mono)" }}
                        >
                            <option value="">-- Select a Claim --</option>
                            {claims.map((c) => (
                                <option key={c.id} value={c.id}>{c.title || `Claim ${c.id.slice(0, 8)}`}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="font-mono text-[11px] text-faint tracking-wider block mb-2">SENDER NAME</label>
                            <input
                                type="text"
                                placeholder="Your Full Name"
                                value={senderName}
                                onChange={(e) => setSenderName(e.target.value)}
                                className="w-full bg-bg border border-border rounded-lg px-4 py-2.5 text-sm outline-none"
                                style={{ color: "var(--text)" }}
                            />
                        </div>
                        <div>
                            <label className="font-mono text-[11px] text-faint tracking-wider block mb-2">SENDER EMAIL</label>
                            <input
                                type="email"
                                placeholder="your@email.com"
                                value={senderEmail}
                                onChange={(e) => setSenderEmail(e.target.value)}
                                className="w-full bg-bg border border-border rounded-lg px-4 py-2.5 text-sm outline-none"
                                style={{ color: "var(--text)" }}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="font-mono text-[11px] text-faint tracking-wider block mb-2">SENDER PHONE</label>
                            <input
                                type="text"
                                placeholder="+880..."
                                value={senderPhone}
                                onChange={(e) => setSenderPhone(e.target.value)}
                                className="w-full bg-bg border border-border rounded-lg px-4 py-2.5 text-sm outline-none"
                                style={{ color: "var(--text)" }}
                            />
                        </div>
                        <div>
                            <label className="font-mono text-[11px] text-faint tracking-wider block mb-2">SENDER ADDRESS</label>
                            <input
                                type="text"
                                placeholder="Your Address"
                                value={senderAddress}
                                onChange={(e) => setSenderAddress(e.target.value)}
                                className="w-full bg-bg border border-border rounded-lg px-4 py-2.5 text-sm outline-none"
                                style={{ color: "var(--text)" }}
                            />
                        </div>
                    </div>

                    <div className="border-t border-border pt-4 mt-4">
                        <label className="font-mono text-[11px] text-gold tracking-wider block mb-3 uppercase">Recipient Information (Pre-filled)</label>
                        <div className="space-y-4">
                            <div>
                                <label className="font-mono text-[10px] text-faint tracking-wider block mb-1">RECIPIENT NAME / COMPANY</label>
                                <input
                                    type="text"
                                    value={recipientName}
                                    onChange={(e) => setRecipientName(e.target.value)}
                                    className="w-full bg-bg border border-border rounded-lg px-4 py-2.5 text-sm outline-none"
                                    style={{ color: "var(--text)" }}
                                />
                            </div>
                            <div>
                                <label className="font-mono text-[10px] text-faint tracking-wider block mb-1">RECIPIENT ADDRESS</label>
                                <textarea
                                    value={recipientAddress}
                                    onChange={(e) => setRecipientAddress(e.target.value)}
                                    className="w-full bg-bg border border-border rounded-lg px-4 py-2 text-sm outline-none min-h-[60px]"
                                    style={{ color: "var(--text)" }}
                                />
                            </div>
                        </div>
                    </div>

                    {availableStatutes.length > 0 && (
                        <div className="border-t border-border pt-4 mt-4">
                            <label className="font-mono text-[11px] text-gold tracking-wider block mb-3 uppercase">Select Applicable Laws</label>
                            <div className="space-y-2">
                                {availableStatutes.map((s, i) => (
                                    <label key={i} className="flex items-start gap-3 p-3 rounded-lg border border-border bg-bg3/50 cursor-pointer hover:border-gold/30 transition-all">
                                        <input
                                            type="checkbox"
                                            checked={selectedStatuteIndices.includes(i)}
                                            onChange={(e) => {
                                                if (e.target.checked) setSelectedStatuteIndices([...selectedStatuteIndices, i]);
                                                else setSelectedStatuteIndices(selectedStatuteIndices.filter(idx => idx !== i));
                                            }}
                                            className="mt-1"
                                        />
                                        <div className="flex-1">
                                            <div className="text-[12px] font-semibold">{s.name}</div>
                                            <div className="text-[10px] text-gold font-mono uppercase">{s.article}</div>
                                            <div className="text-[11px] text-muted font-light mt-1 leading-tight">{s.description}</div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="text-danger text-sm font-mono p-3 rounded-lg border"
                            style={{ background: "rgba(248,113,113,0.08)", borderColor: "rgba(248,113,113,0.2)" }}>
                            ⚠ {error}
                        </div>
                    )}

                    <button
                        onClick={handleGenerate}
                        disabled={loading || !claimId}
                        className="w-full py-2.5 rounded-lg text-sm font-semibold font-mono tracking-wider transition-all disabled:opacity-50"
                        style={{ background: "#c8a96e", color: "#0a0b0f" }}
                    >
                        {loading ? "ARCHITECTING..." : "GENERATE DEMAND LETTER"}
                    </button>
                </div>

                {/* Preview & Download */}
                {preview && (
                    <div className="mt-6 animate-fade-up border border-gold/20 rounded-xl p-4 bg-gold/5">
                        <div className="flex items-center justify-between mb-3">
                            <div className="font-mono text-[10px] text-gold tracking-widest uppercase">
                                ✓ Draft Prepared
                            </div>
                            <button
                                onClick={downloadPDF}
                                className="font-mono text-[10px] px-3 py-1.5 rounded-lg border border-gold/30 text-gold hover:bg-gold/10 transition-all"
                            >
                                💾 DOWNLOAD PDF
                            </button>
                        </div>

                        <div className="text-[11px] text-muted space-y-1 font-serif line-clamp-6 opacity-70 italic">
                            <div>{preview.senderName}</div>
                            <div>{preview.senderAddress}</div>
                            <div className="py-2">Date: {preview.date}</div>
                            <div>{preview.recipientName}</div>
                            <div>{preview.recipientAddress}</div>
                            <div className="font-bold py-2">RE: {preview.subject}</div>
                            <div className="whitespace-pre-line">{preview.body}</div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gold/10 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm" />
                            <span className="font-mono text-[9px] text-faint">
                                {preview.statutes.length} statutes automatically cited and merged
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
