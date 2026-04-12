"use client";

import Link from "next/link";
import FeatureExtract from "@/components/FeatureExtract";
import FeatureHash from "@/components/FeatureHash";
import FeatureCompany from "@/components/FeatureCompany";
import FeatureStatute from "@/components/FeatureStatute";
import FeatureTriage from "@/components/FeatureTriage";

export default function Module1Page() {
  return (
    <div className="min-h-screen flex flex-col relative z-10">

      {/* ── Header ── */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-10 h-16 border-b border-border bg-bg/95 backdrop-blur-sm">
        <div className="font-playfair text-lg font-bold tracking-tight">
          ACRLE <span className="text-gold">//</span> Legal Recovery Engine
        </div>
        <nav className="flex gap-1">
          {["MODULE 1", "MODULE 2", "MODULE 3"].map((mod, i) => (
            <Link 
              key={mod} 
              href={i === 2 ? "/dashboard" : "/"} 
              style={{ textDecoration: 'none' }}
            >
              <button
                className="px-4 py-1.5 rounded-lg font-mono text-[11px] tracking-wider transition-all hover:opacity-80"
                style={i === 0
                  ? { background: "var(--bg3)", color: "var(--gold)", border: "1px solid rgba(200,169,110,0.3)" }
                  : { color: "var(--faint)" }
                }
              >
                {mod}
              </button>
            </Link>
          ))}
        </nav>
        <div className="font-mono text-[11px] text-faint border border-border px-3 py-1.5 rounded">
          FOUNDATION &amp; VERIFICATION
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="px-10 py-12 border-b border-border">
        <div className="flex items-end justify-between gap-10">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 font-mono text-[11px] text-gold tracking-widest uppercase mb-4">
              <span className="w-6 h-px bg-gold" />
              CSE471 · Group 07 · Spring 2026 · BRAC University
            </div>
            <h1 className="font-playfair text-5xl font-black tracking-tight leading-tight">
              Foundation &amp; <em className="italic text-gold">Verification</em>
            </h1>
            <p className="mt-4 text-muted text-sm leading-relaxed font-light max-w-lg">
              Autonomous evidence extraction, cryptographic integrity verification, corporate
              intelligence lookup, and AI-powered statutory analysis — the bedrock of every
              legal recovery claim.
            </p>
          </div>

          {/* Module progress widget */}
          <div className="flex-shrink-0 border border-border rounded-xl p-5 bg-bg3 text-center min-w-40">
            <div className="font-mono text-[10px] text-faint tracking-widest mb-3 uppercase">
              Module Progress
            </div>
            <svg viewBox="0 0 80 80" className="w-20 h-20 mx-auto">
              <circle cx="40" cy="40" r="32" fill="none" stroke="#1e2230" strokeWidth="6" />
              <circle
                cx="40" cy="40" r="32" fill="none"
                stroke="#c8a96e" strokeWidth="6"
                strokeDasharray="201" strokeDashoffset="0"
                strokeLinecap="round"
                transform="rotate(-90 40 40)"
              />
              <text x="40" y="38" textAnchor="middle" fill="#c8a96e"
                style={{ fontFamily: "var(--font-playfair)", fontSize: "16px", fontWeight: 700 }}>
                4/4
              </text>
              <text x="40" y="50" textAnchor="middle" fill="#545870"
                style={{ fontFamily: "var(--font-mono)", fontSize: "7px" }}>
                FEATURES
              </text>
            </svg>
            <div className="font-mono text-[11px] mt-2" style={{ color: "var(--emerald)" }}>
              ✓ ALL LIVE
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature Grid ── */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 p-10">
        <FeatureExtract />
        <FeatureHash />
        <FeatureCompany />
        <FeatureStatute />
        <FeatureTriage />
      </main>

      {/* ── Status Bar ── */}
      <footer className="flex flex-wrap items-center gap-6 px-10 py-3 border-t border-border bg-bg2">
        {[
          { dot: "var(--emerald)", label: "Vision API: ACTIVE" },
          { dot: "var(--emerald)", label: "SHA-256: NATIVE" },
          { dot: "var(--gold)",    label: "Maps API: DEMO MODE" },
          { dot: "var(--emerald)", label: "OpenAI GPT-4: ACTIVE" },
        ].map(({ dot, label }) => (
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