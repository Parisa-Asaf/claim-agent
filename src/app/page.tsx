"use client";

import { useState } from "react";
import Link from "next/link";
import FeatureExtract from "@/components/FeatureExtract";
import FeatureHash from "@/components/FeatureHash";
import FeatureCompany from "@/components/FeatureCompany";
import FeatureStatute from "@/components/FeatureStatute";
import FeatureTriage from "@/components/FeatureTriage";
import FeatureRBAC from "@/components/FeatureRBAC";
import FeatureAuditLog from "@/components/FeatureAuditLog";

export default function Module1Page() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <div className="min-h-screen flex flex-col relative z-10">

      {/* ── Professional Header (Navbar) ── */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-10 h-16 border-b border-border bg-bg/95 backdrop-blur-sm">
        <div className="font-playfair font-bold tracking-tight">
             <span className="text-2xl">ACRLE</span> 
             <span className="text-gold text-xl mx-1">:</span> 
             <span className="text-lg opacity-80">Legal Recovery Engine</span>
        </div>
        
        <nav className="flex gap-6 items-center">
          {/* Functional Professional Links */}
          <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="font-mono text-[11px] tracking-widest text-white/60 hover:text-gold transition-all uppercase">
            Dashboard
          </button>
          
          <button onClick={() => alert("Redirecting to Encrypted Evidence Vault...")} className="font-mono text-[11px] tracking-widest text-white/60 hover:text-gold transition-all uppercase">
            Intel Hub
          </button>

          <Link 
             href="http://bdlaws.minlaw.gov.bd/act-1014.html" 
             target="_blank" 
             rel="noopener noreferrer"
             className="font-mono text-[11px] tracking-widest text-white/60 hover:text-gold transition-all uppercase flex items-center gap-1"
          >
             Statutes <span className="text-[8px] opacity-40">↗</span>
          </Link>
          {/* User Profile / Mock Login Toggle */}
          {!isLoggedIn ? (
            <button 
              onClick={() => setIsLoggedIn(true)}
              className="ml-4 px-4 py-1.5 rounded-lg font-mono text-[10px] tracking-wider transition-all bg-gold/10 text-gold border border-gold/30 hover:bg-gold hover:text-black"
            >
              SECURE LOGIN
            </button>
          ) : (
            <div 
              onClick={() => setIsLoggedIn(false)}
              className="ml-4 flex items-center gap-3 bg-white/5 pl-1 pr-3 py-1 rounded-full border border-border cursor-pointer hover:bg-white/10 transition-all"
            >
              <div className="w-7 h-7 rounded-full bg-gold flex items-center justify-center text-[10px] font-bold text-black">
                PA
              </div>
              <span className="font-mono text-[10px] text-white/70 uppercase">Adv. Parisa</span>
            </div>
          )}
        </nav>
      </header>

      {/* ── Professional Hero ── */}
      <section className="px-10 py-12 border-b border-border bg-gradient-to-b from-bg to-bg2">
        <div className="flex items-end justify-between gap-10">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 font-mono text-[11px] text-gold tracking-widest uppercase mb-4">
              <span className="w-6 h-px bg-gold" />
              Autonomous Consumer Rights Enforcement
            </div>
            <h1 className="font-playfair text-5xl font-black tracking-tight leading-tight">
              Legal Intelligence & <em className="italic text-gold">Recovery</em>
            </h1>
            <p className="mt-4 text-muted text-sm leading-relaxed font-light max-w-lg">
              The ACRLE engine provides a cryptographic chain of custody for consumer disputes. 
              From autonomous evidence verification to statutory notice dispatch, 
              we bridge the gap between corporate negligence and legal accountability.
            </p>
          </div>

          {/* System Health Widget (Replaces Progress Widget) */}
          <div className="flex-shrink-0 border border-border rounded-xl p-5 bg-bg3 text-center min-w-40 shadow-xl">
            <div className="font-mono text-[10px] text-faint tracking-widest mb-3 uppercase">
              System Integrity
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
              <text x="40" y="42" textAnchor="middle" fill="#c8a96e"
                style={{ fontFamily: "var(--font-mono)", fontSize: "12px", fontWeight: 700 }}>
                100%
              </text>
            </svg>
            <div className="font-mono text-[11px] mt-2 text-emerald-500 animate-pulse">
              ● ENCRYPTED
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature Grid ── */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 p-10 bg-bg">
        <FeatureExtract />
        <FeatureHash />
        <FeatureCompany />
        <FeatureStatute />
        <FeatureTriage />
        <FeatureRBAC />
        <FeatureAuditLog />
      </main>

      {/* ── Status Bar ── */}
      <footer className="flex flex-wrap items-center gap-6 px-10 py-3 border-t border-border bg-bg2">
        {[
          { dot: "var(--emerald)", label: "Vision API: ACTIVE" },
          { dot: "var(--emerald)", label: "SHA-256: NATIVE" },
          { dot: "var(--gold)",    label: "Trust Ledger: CONNECTED" },
          { dot: "var(--emerald)", label: "Firebase Vault: SECURE" },
        ].map(({ dot, label }) => (
          <div key={label} className="flex items-center gap-2 font-mono text-[11px] text-faint">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: dot, boxShadow: `0 0 5px ${dot}` }} />
            {label}
          </div>
        ))}
        <div className="ml-auto font-mono text-[11px] text-faint">
          ACRLE v2.4.0 · Group 07 · BRACU
        </div>
      </footer>

    </div>
  );
}