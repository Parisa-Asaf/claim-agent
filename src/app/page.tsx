"use client";
// src/app/page.tsx
import { useState } from "react";
import FeatureExtract from "@/components/FeatureExtract";
import FeatureHash from "@/components/FeatureHash";
import FeatureCompany from "@/components/FeatureCompany";
import FeatureStatute from "@/components/FeatureStatute";
import FeatureTriage from "@/components/FeatureTriage";
import FeatureLetter from "@/components/FeatureLetter";
import FeatureDashboard from "@/components/FeatureDashboard";
import FeatureSettlement from "@/components/FeatureSettlement";

const MODULES = [
  {
    id: 1,
    label: "MODULE 1",
    title: "Foundation & Verification",
    subtitle: "Evidence extraction, cryptographic hashing, corporate intelligence, and statutory analysis.",
    badge: "FOUNDATION & VERIFICATION",
    features: "4/4",
    statusDots: [
      { dot: "var(--emerald)", label: "Vision API: ACTIVE" },
      { dot: "var(--emerald)", label: "SHA-256: NATIVE" },
      { dot: "var(--gold)",    label: "Maps API: DEMO MODE" },
      { dot: "var(--emerald)", label: "OpenAI GPT-4: ACTIVE" },
    ],
  },
  {
    id: 2,
    label: "MODULE 2",
    title: "Workflow & Automation",
    subtitle: "Demand letter generation, claim triage, direct dispatch, and currency conversion.",
    badge: "WORKFLOW & AUTOMATION",
    features: "4/4",
    statusDots: [
      { dot: "var(--emerald)", label: "PDF Engine: ACTIVE" },
      { dot: "var(--emerald)", label: "Triage: ACTIVE" },
      { dot: "var(--gold)",    label: "SendGrid: DEMO MODE" },
      { dot: "var(--gold)",    label: "Currency API: DEMO MODE" },
    ],
  },
  {
    id: 3,
    label: "MODULE 3",
    title: "Intelligence & Assessment",
    subtitle: "Recovery dashboard with refund matrix, AI settlement fairness analysis under Bangladesh consumer law.",
    badge: "INTELLIGENCE & ASSESSMENT",
    features: "2/4",
    statusDots: [
      { dot: "var(--emerald)", label: "Dashboard: ACTIVE" },
      { dot: "var(--emerald)", label: "GPT-4o: ACTIVE" },
      { dot: "var(--emerald)", label: "CRPA 2009: BD LAW" },
      { dot: "var(--emerald)", label: "Seed API: ACTIVE" },
    ],
  },
];

export default function ACRLEPage() {
  const [activeModule, setActiveModule] = useState(1);
  const mod = MODULES.find((m) => m.id === activeModule)!;

  const titleParts = mod.title.split("&");

  return (
    <div className="min-h-screen flex flex-col relative z-10">

      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-10 h-16 border-b border-border bg-bg/95 backdrop-blur-sm">
        <div className="font-playfair text-lg font-bold tracking-tight">
          ACRLE <span className="text-gold">//</span> Legal Recovery Engine
        </div>
        <nav className="flex gap-1">
          {MODULES.map((m) => (
            <button
              key={m.id}
              onClick={() => setActiveModule(m.id)}
              className="px-4 py-1.5 rounded-lg font-mono text-[11px] tracking-wider transition-all"
              style={activeModule === m.id
                ? { background: "var(--bg3)", color: "var(--gold)", border: "1px solid rgba(200,169,110,0.3)" }
                : { color: "var(--faint)", border: "1px solid transparent" }
              }
            >
              {m.label}
            </button>
          ))}
        </nav>
        <div className="font-mono text-[11px] text-faint border border-border px-3 py-1.5 rounded">
          {mod.badge}
        </div>
      </header>

      {/* Hero */}
      <section className="px-10 py-12 border-b border-border">
        <div className="flex items-end justify-between gap-10">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 font-mono text-[11px] text-gold tracking-widest uppercase mb-4">
              <span className="w-6 h-px bg-gold" />
              CSE471 · Group 07 · Spring 2026 · BRAC University
            </div>
            <h1 className="font-playfair text-5xl font-black tracking-tight leading-tight">
              {titleParts.length === 2 ? (
                <>
                  {titleParts[0].trim()} &amp;{" "}
                  <em className="italic text-gold">{titleParts[1].trim()}</em>
                </>
              ) : (
                <em className="italic text-gold">{mod.title}</em>
              )}
            </h1>
            <p className="mt-4 text-muted text-sm leading-relaxed font-light max-w-lg">
              {mod.subtitle}
            </p>
          </div>

          <div className="flex-shrink-0 border border-border rounded-xl p-5 bg-bg3 text-center min-w-40">
            <div className="font-mono text-[10px] text-faint tracking-widest mb-3 uppercase">
              Module {activeModule} Progress
            </div>
            <svg viewBox="0 0 80 80" className="w-20 h-20 mx-auto">
              <circle cx="40" cy="40" r="32" fill="none" stroke="#1e2230" strokeWidth="6" />
              <circle
                cx="40" cy="40" r="32" fill="none"
                stroke="#c8a96e" strokeWidth="6"
                strokeDasharray="201"
                strokeDashoffset={activeModule === 3 ? "100" : "0"}
                strokeLinecap="round"
                transform="rotate(-90 40 40)"
              />
              <text x="40" y="38" textAnchor="middle" fill="#c8a96e"
                style={{ fontFamily: "var(--font-playfair)", fontSize: "16px", fontWeight: 700 }}>
                {mod.features}
              </text>
              <text x="40" y="50" textAnchor="middle" fill="#545870"
                style={{ fontFamily: "var(--font-mono)", fontSize: "7px" }}>
                FEATURES
              </text>
            </svg>
            <div className="font-mono text-[11px] mt-2" style={{ color: "var(--emerald)" }}>
              {activeModule === 3 ? "✓ M1-1 LIVE" : "✓ ALL LIVE"}
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 p-10">
        {activeModule === 1 && (
          <>
            <FeatureExtract />
            <FeatureHash />
            <FeatureCompany />
            <FeatureStatute />
          </>
        )}
        {activeModule === 2 && (
          <>
            <FeatureLetter />
            <FeatureTriage />
          </>
        )}
        {activeModule === 3 && (
          <>
            <FeatureDashboard />
            <FeatureSettlement />
          </>
        )}
      </main>

      {/* Status Bar */}
      <footer className="flex flex-wrap items-center gap-6 px-10 py-3 border-t border-border bg-bg2">
        {mod.statusDots.map(({ dot, label }) => (
          <div key={label} className="flex items-center gap-2 font-mono text-[11px] text-faint">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: dot, boxShadow: `0 0 5px ${dot}` }} />
            {label}
          </div>
        ))}
        <div className="ml-auto font-mono text-[11px] text-faint">
          Group 07 · CSE471 · Spring 2026 · BRAC University
        </div>
      </footer>

    </div>
  );
}
