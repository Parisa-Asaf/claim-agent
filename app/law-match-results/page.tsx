"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type LawMatchItem = {
  lawTitle: string;
  confidence: number;
  keywords: string[];
  summary: string;
  category: string;
};

type ApiResponse = {
  caseId: string;
  grievanceTitle: string;
  grievanceDescription: string;
  matches: LawMatchItem[];
  overallSummary: string;
  fileName: string | null;
  fileHash: string | null;
};

const CATEGORY_COLORS: Record<string, string> = {
  "Consumer Protection": "#4c84e8",
  Advertising: "#f1b52c",
  "Finance Regulations": "#8cc751",
  Others: "#f44336",
};

export default function LawMatchResultsPage() {
  const searchParams = useSearchParams();
  const caseId = searchParams.get("caseId");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<ApiResponse | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!caseId) {
        setError("Missing caseId in URL");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/grievance?caseId=${encodeURIComponent(caseId)}`);
        const json = await res.json();

        if (!res.ok) {
          setError(json.error || "Failed to load result");
          return;
        }

        setData(json);
      } catch (err) {
        console.error(err);
        setError("Failed to load law match result");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [caseId]);

  const matches = data?.matches || [];

  const categoryStats = useMemo(() => {
    const counts: Record<string, number> = {
      "Consumer Protection": 0,
      Advertising: 0,
      "Finance Regulations": 0,
      Others: 0,
    };

    matches.forEach((item) => {
      const category = counts[item.category] !== undefined ? item.category : "Others";
      counts[category] += 1;
    });

    const total = matches.length || 1;

    return Object.entries(counts).map(([label, count]) => ({
      label,
      count,
      percent: Math.round((count / total) * 100),
      color: CATEGORY_COLORS[label] || CATEGORY_COLORS["Others"],
    }));
  }, [matches]);

  const confidenceBuckets = useMemo(() => {
    const buckets = {
      "70-80": 0,
      "80-85": 0,
      "85-90": 0,
      "90-100": 0,
    };

    matches.forEach((law) => {
      if (law.confidence < 80) buckets["70-80"] += 1;
      else if (law.confidence < 85) buckets["80-85"] += 1;
      else if (law.confidence < 90) buckets["85-90"] += 1;
      else buckets["90-100"] += 1;
    });

    return buckets;
  }, [matches]);

  const conicGradient = useMemo(() => {
    if (!matches.length) {
      return "conic-gradient(#d1d5db 0% 100%)";
    }

    let start = 0;
    const parts = categoryStats.map((item) => {
      const next = start + item.percent;
      const str = `${item.color} ${start}% ${next}%`;
      start = next;
      return str;
    });

    return `conic-gradient(${parts.join(", ")})`;
  }, [categoryStats, matches.length]);

  return (
    <main className="min-h-screen bg-[#f3f3f3] text-[#1f1f1f]">
      <header className="flex items-center justify-between bg-[#d7d7d7] px-6 py-5 shadow-sm md:px-10">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-md border border-gray-300 bg-white shadow">
            ⚖️
          </div>

          <div>
            <h1 className="text-2xl font-semibold md:text-4xl">Law Match Results</h1>
            <p className="mt-1 text-sm text-gray-500 md:text-lg">
              Case ID: {caseId || "N/A"} - Complaint Title:{" "}
              {data?.grievanceTitle || "No complaint title found"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-full bg-white px-5 py-3 shadow-md">
          <span className="text-xl md:text-2xl">👤</span>
          <span className="relative text-xl md:text-2xl">
            🔔
            <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-red-500" />
          </span>
        </div>
      </header>

      <section className="px-6 py-6 md:px-12">
        {loading && (
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            Loading result...
          </div>
        )}

        {error && !loading && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_290px]">
            <div>
              <h2 className="mb-3 text-2xl font-semibold">
                matched laws ({matches.length})
              </h2>

              {data?.overallSummary && (
                <p className="mb-6 text-sm text-gray-600">{data.overallSummary}</p>
              )}

              <div className="space-y-5">
                {matches.length === 0 ? (
                  <div className="rounded-2xl bg-white p-6 shadow-sm">
                    No law match result found yet.
                  </div>
                ) : (
                  matches.map((law, index) => (
                    <div
                      key={`${law.lawTitle}-${index}`}
                      className="rounded-2xl bg-[#efefef] p-6 shadow-sm"
                    >
                      <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <h3 className="text-2xl font-medium">{law.lawTitle}</h3>

                        <div className="inline-flex w-fit items-center rounded-full bg-[#e2e2e2] px-5 py-2 text-xl font-medium text-gray-700">
                          {law.confidence}% confidence
                        </div>
                      </div>

                      {law.keywords.length > 0 && (
                        <div className="mb-6 flex flex-wrap items-center gap-3">
                          <span className="text-lg text-gray-700">Matched keywords :</span>
                          {law.keywords.map((keyword) => (
                            <span
                              key={keyword}
                              className="rounded-full bg-[#d9d9d9] px-7 py-2 text-base text-gray-700"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      )}

                      <p className="mb-6 text-lg leading-8 text-gray-800">
                        <span className="font-semibold">Summary: </span>
                        {law.summary}
                      </p>

                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <button
                          type="button"
                          className="rounded-md bg-[#e0e0e0] px-6 py-3 text-lg text-gray-800 transition hover:bg-[#d6d6d6]"
                        >
                          view full law
                        </button>

                        <button
                          type="button"
                          className="rounded-md border border-gray-300 bg-[#f8f8f8] px-5 py-3 text-base text-gray-700 transition hover:bg-white"
                        >
                          Mark as Relevant
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <aside className="rounded-lg bg-[#efefef] p-4 shadow-sm">
              <div className="rounded-md border border-gray-200 bg-[#f4f4f4] p-4">
                <h3 className="mb-4 text-[20px] font-semibold text-slate-700">
                  Law Category Distribution
                </h3>

                <div className="mb-5 flex items-center gap-4">
                  <div
                    className="relative h-[115px] w-[115px] rounded-full"
                    style={{ background: conicGradient }}
                  >
                    <div className="absolute left-1/2 top-1/2 h-[48px] w-[48px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#f4f4f4]" />
                  </div>

                  <div className="space-y-3">
                    {categoryStats.map((item) => (
                      <div key={item.label} className="flex items-center gap-3 text-sm">
                        <span
                          className="inline-block h-3 w-3 rounded-sm"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="font-medium text-slate-700">
                          {item.label} - {item.percent}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-5 border-t border-gray-200 pt-4">
                  <h3 className="mb-4 text-[20px] font-semibold text-slate-700">
                    Confidence Score Range
                  </h3>

                  <div className="flex items-end justify-between gap-3 border-b border-gray-200 pb-1">
                    {[
                      { label: "70-80", value: confidenceBuckets["70-80"], color: "#4c84e8" },
                      { label: "80-85", value: confidenceBuckets["80-85"], color: "#f1b52c" },
                      { label: "85-90", value: confidenceBuckets["85-90"], color: "#8cc751" },
                      { label: "90-100", value: confidenceBuckets["90-100"], color: "#f44336" },
                    ].map((item) => {
                      const height = 20 + item.value * 18;

                      return (
                        <div key={item.label} className="flex flex-col items-center gap-2">
                          <div
                            className="w-10 rounded-t-sm"
                            style={{
                              height: `${height}px`,
                              backgroundColor: item.color,
                            }}
                          />
                          <span className="text-sm text-slate-600">{item.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-6 text-xs text-gray-500">
                  {data?.fileName ? <p>Source file: {data.fileName}</p> : null}
                  {data?.fileHash ? <p>Document hash: {data.fileHash}</p> : null}
                </div>
              </div>
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}