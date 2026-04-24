"use client";

import Link from "next/link";
import { useState } from "react";
import FeatureStatute from "@/components/FeatureStatute";
import FeatureCurrencySettlement from "@/components/FeatureCurrencySettlement";
import FeatureGlobalSearch from "@/components/FeatureGlobalSearch";
import FeatureOutcomeReport from "@/components/FeatureOutcomeReport";

const MEMBER4_FEATURES = [
  {
    id: 1,
    label: "FEATURE 1",
    shortLabel: "STATUTE",
    title: "Automated Statute Lookup",
    subtitle:
      "Matches a user's grievance with relevant consumer protection laws.",
    badge: "MEMBER 4 - MODULE 1",
    progress: "1/4",
    statusDots: [
      { dot: "var(--emerald)", label: "No OpenAI API: READY" },
      { dot: "var(--violet)", label: "Rule Matching: ACTIVE" },
      { dot: "var(--gold)", label: "Jurisdiction Logic: READY" },
    ],
  },
  {
    id: 2,
    label: "FEATURE 2",
    shortLabel: "CURRENCY",
    title: "Currency & Settlement Engine",
    subtitle:
      "Converts foreign transaction values into local currency and evaluates settlement offers fairly.",
    badge: "MEMBER 4 - MODULE 2",
    progress: "2/4",
    statusDots: [
      { dot: "var(--sky)", label: "FX Conversion: ACTIVE" },
      { dot: "var(--emerald)", label: "Settlement Check: ACTIVE" },
      { dot: "var(--gold)", label: "Fallback Rates: READY" },
    ],
  },
  {
    id: 3,
    label: "FEATURE 3",
    shortLabel: "SEARCH",
    title: "Global Search & Filter Engine",
    subtitle:
      "Allows users to search claims by keyword, company name, status, and priority using fast filters.",
    badge: "MEMBER 4 - MODULE 3",
    progress: "3/4",
    statusDots: [
      { dot: "var(--violet)", label: "Search API: ACTIVE" },
      { dot: "var(--emerald)", label: "Filters: ACTIVE" },
      { dot: "var(--sky)", label: "Claim Querying: READY" },
    ],
  },
  {
    id: 4,
    label: "FEATURE 4",
    shortLabel: "REPORT",
    title: "Automated Outcome Reports",
    subtitle:
      "Generates downloadable case summary reports showing the claim timeline, matched statutes, and recovery outcome.",
    badge: "MEMBER 4 - MODULE 3",
    progress: "4/4",
    statusDots: [
      { dot: "var(--gold)", label: "PDF Export: ACTIVE" },
      { dot: "var(--emerald)", label: "Case Summary: ACTIVE" },
      { dot: "var(--violet)", label: "Timeline Report: READY" },
    ],
  },
];

export default function Member4Page() {
  const [activeFeature, setActiveFeature] = useState(1);
  const current = MEMBER4_FEATURES.find((f) => f.id === activeFeature)!;

  return (
    <div className="min-h-screen flex flex-col relative z-10">
      <header className="sticky top-0 z-50 flex items-center justify-between px-10 h-16 border-b border-border bg-bg/95 backdrop-blur-sm">
        <div className="font-playfair text-lg font-bold tracking-tight">
          ACRLE <span className="text-gold">//</span> Member 4 Workspace
        </div>

        <nav className="flex gap-1 flex-wrap">
          <Link
            href="/claims"
            className="px-4 py-1.5 rounded-lg font-mono text-[11px] tracking-wider transition-all"
            style={{ color: "var(--faint)", border: "1px solid transparent" }}
          >
            CLAIM DB
          </Link>
          <Link
            href="/statutes"
            className="px-4 py-1.5 rounded-lg font-mono text-[11px] tracking-wider transition-all"
            style={{ color: "var(--faint)", border: "1px solid transparent" }}
          >
            STATUTE DB
          </Link>
          {MEMBER4_FEATURES.map((feature) => (
            <button
              key={feature.id}
              onClick={() => setActiveFeature(feature.id)}
              className="px-4 py-1.5 rounded-lg font-mono text-[11px] tracking-wider transition-all"
              style={
                activeFeature === feature.id
                  ? {
                      background: "var(--bg3)",
                      color: "var(--gold)",
                      border: "1px solid rgba(200,169,110,0.3)",
                    }
                  : {
                      color: "var(--faint)",
                      border: "1px solid transparent",
                    }
              }
            >
              {feature.shortLabel}
            </button>
          ))}
        </nav>

        <div className="font-mono text-[11px] text-faint border border-border px-3 py-1.5 rounded">
          {current.badge}
        </div>
      </header>

      <section className="px-10 py-12 border-b border-border">
        <div className="flex items-end justify-between gap-10">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 font-mono text-[11px] text-gold tracking-widest uppercase mb-4">
              <span className="w-6 h-px bg-gold" />
              CSE471 - Group 07 - Spring 2026 - BRAC University
            </div>

            <h1 className="font-playfair text-5xl font-black tracking-tight leading-tight">
              {current.title}
            </h1>

            <p className="mt-4 text-muted text-sm leading-relaxed font-light max-w-lg">
              {current.subtitle}
            </p>
          </div>

          <div className="flex-shrink-0 border border-border rounded-xl p-5 bg-bg3 text-center min-w-40">
            <div className="font-mono text-[10px] text-faint tracking-widest mb-3 uppercase">
              Member 4 Progress
            </div>

            <svg viewBox="0 0 80 80" className="w-20 h-20 mx-auto">
              <circle cx="40" cy="40" r="32" fill="none" stroke="#1e2230" strokeWidth="6" />
              <circle
                cx="40"
                cy="40"
                r="32"
                fill="none"
                stroke="#c8a96e"
                strokeWidth="6"
                strokeDasharray="201"
                strokeDashoffset={0}
                strokeLinecap="round"
                transform="rotate(-90 40 40)"
              />
              <text
                x="40"
                y="38"
                textAnchor="middle"
                fill="#c8a96e"
                style={{
                  fontFamily: "var(--font-playfair)",
                  fontSize: "16px",
                  fontWeight: 700,
                }}
              >
                {current.progress}
              </text>
              <text
                x="40"
                y="50"
                textAnchor="middle"
                fill="#545870"
                style={{ fontFamily: "var(--font-mono)", fontSize: "7px" }}
              >
                FEATURES
              </text>
            </svg>

            <div className="font-mono text-[11px] mt-2" style={{ color: "var(--emerald)" }}>
              MEMBER 4
            </div>
          </div>
        </div>
      </section>

      <main className="flex-1 w-full max-w-7xl mx-auto px-10 py-10">
        <div className="w-full">
          {activeFeature === 1 && <FeatureStatute />}
          {activeFeature === 2 && <FeatureCurrencySettlement />}
          {activeFeature === 3 && <FeatureGlobalSearch />}
          {activeFeature === 4 && <FeatureOutcomeReport />}
        </div>
      </main>

      <footer className="flex flex-wrap items-center gap-6 px-10 py-3 border-t border-border bg-bg2">
        {current.statusDots.map(({ dot, label }) => (
          <div key={label} className="flex items-center gap-2 font-mono text-[11px] text-faint">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: dot, boxShadow: `0 0 5px ${dot}` }}
            />
            {label}
          </div>
        ))}

        <div className="ml-auto font-mono text-[11px] text-faint">
          Group 07 - Nusrat Jahan - Member 4
        </div>
      </footer>
    </div>
  );
}
