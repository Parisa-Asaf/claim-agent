"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

type TimelineEvent = {
  id: number;
  caseId: string;
  title: string;
  description: string;
  eventDate: string;
  fileName?: string | null;
};

type Grievance = {
  id: number;
  caseId: string;
  title: string;
  description: string;
  location?: string | null;
  category?: string | null;
  documentUrl?: string | null;
  createdAt: string;
};

type LawMatch = {
  lawTitle: string;
  confidence: number;
  keywords: string[];
  summary: string;
  category: string;
};

type LawResultResponse = {
  caseId: string;
  grievanceTitle: string;
  grievanceDescription: string;
  matches: LawMatch[];
  overallSummary: string;
  fileName?: string | null;
  fileHash?: string | null;
  extractedTextPreview?: string;
  rawModelOutput?: string;
};

export default function CaseTimelinePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const caseId = searchParams.get("caseId");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [grievance, setGrievance] = useState<Grievance | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [matches, setMatches] = useState<LawMatch[]>([]);

  useEffect(() => {
    async function loadCase() {
      if (!caseId) {
        setError("Missing caseId");
        setLoading(false);
        return;
      }

      try {
        const [caseRes, lawRes] = await Promise.all([
          fetch(`/api/case/${encodeURIComponent(caseId)}`),
          fetch(`/api/grievance?caseId=${encodeURIComponent(caseId)}`),
        ]);

        const caseData = await caseRes.json();
        const lawData: LawResultResponse = await lawRes.json();

        if (!caseRes.ok) {
          setError(caseData.error || "Failed to load case");
          return;
        }

        setGrievance(caseData.grievance);
        setTimeline(caseData.timeline || []);
        setMatches(Array.isArray(lawData.matches) ? lawData.matches : []);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch case timeline");
      } finally {
        setLoading(false);
      }
    }

    loadCase();
  }, [caseId]);

  const displayTimeline =
    timeline.length > 0
      ? timeline
      : [
          {
            id: 1,
            caseId: caseId || "",
            title: "Complaint Submitted",
            description:
              grievance?.description ||
              "Complaint submitted by the user.",
            eventDate: grievance?.createdAt || new Date().toISOString(),
            fileName: grievance?.documentUrl || "grievance_document.pdf",
          },
          {
            id: 2,
            caseId: caseId || "",
            title: "Laws Matched",
            description:
              matches.length > 0
                ? `Matched ${matches.length} relevant law(s) with the complaint details.`
                : "No law matches found yet.",
            eventDate: grievance?.createdAt || new Date().toISOString(),
          },
          {
            id: 3,
            caseId: caseId || "",
            title: "Investigation Completed",
            description: "Case review completed. A report has been prepared.",
            eventDate: grievance?.createdAt || new Date().toISOString(),
          },
        ];

  const categoryData = useMemo(() => {
    if (matches.length === 0) return [];

    const counts = new Map<string, number>();

    for (const match of matches) {
      const key = (match.category || "Others").trim() || "Others";
      counts.set(key, (counts.get(key) || 0) + 1);
    }

    const total = matches.length;

    return Array.from(counts.entries()).map(([name, count]) => ({
      name,
      count,
      percent: Math.round((count / total) * 100),
    }));
  }, [matches]);

  const scoreRangeData = useMemo(() => {
    const ranges = [
      { label: "70-80", min: 70, max: 80, count: 0 },
      { label: "80-85", min: 80, max: 85, count: 0 },
      { label: "85-90", min: 85, max: 90, count: 0 },
      { label: "90-100", min: 90, max: 100, count: 0 },
    ];

    for (const match of matches) {
      const score = Number(match.confidence) || 0;

      if (score >= 70 && score < 80) ranges[0].count += 1;
      else if (score >= 80 && score < 85) ranges[1].count += 1;
      else if (score >= 85 && score < 90) ranges[2].count += 1;
      else if (score >= 90 && score <= 100) ranges[3].count += 1;
    }

    const maxCount = Math.max(...ranges.map((r) => r.count), 1);

    return ranges.map((r) => ({
      ...r,
      height: r.count === 0 ? 16 : Math.max(20, Math.round((r.count / maxCount) * 70)),
    }));
  }, [matches]);

  const chartColors = ["#4f86f7", "#f2b622", "#8bc34a", "#ff3b30", "#8b5cf6", "#14b8a6"];

  const donutStyle = useMemo(() => {
    if (categoryData.length === 0) {
      return {
        background:
          "conic-gradient(#d1d5db 0deg 360deg)",
      };
    }

    let current = 0;
    const parts = categoryData.map((item, index) => {
      const slice = (item.percent / 100) * 360;
      const start = current;
      const end = current + slice;
      current = end;
      return `${chartColors[index % chartColors.length]} ${start}deg ${end}deg`;
    });

    return {
      background: `conic-gradient(${parts.join(", ")})`,
    };
  }, [categoryData]);

  function FileChip({ name }: { name: string }) {
    return (
      <div className="inline-flex items-center gap-2 rounded-sm bg-[#d9d9d9] px-3 py-1 text-sm text-[#2d2d2d] shadow-sm">
        <span className="text-red-600">📄</span>
        <span>{name}</span>
      </div>
    );
  }

  function formatCategoryName(name: string) {
    return name.replace(/_/g, " ");
  }

  return (
    <main className="min-h-screen bg-[#f2f2f2] px-4 py-6 md:px-8">
      <div className="mx-auto max-w-[1280px] overflow-hidden rounded-sm border border-[#d8d8d8] bg-white shadow-sm">
        <header className="flex items-center justify-between bg-[#d9d9d9] px-6 py-5">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-md border border-gray-400 bg-white text-2xl shadow-sm">
              ⚖️
            </div>
            <div>
              <h1 className="text-[22px] font-semibold text-[#2d2d2d]">
                Case Timeline
              </h1>
              <p className="text-sm text-gray-500">
                Review the history of this case so far.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-full bg-white px-6 py-3 shadow-md">
            <span className="text-xl">👤</span>
            <span className="relative text-xl">
              🔔
              <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-red-500" />
            </span>
          </div>
        </header>

        {loading && <div className="p-8 text-gray-600">Loading timeline...</div>}

        {error && !loading && (
          <div className="p-8">
            <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-700">
              {error}
            </div>
          </div>
        )}

        {!loading && !error && grievance && (
          <div className="grid gap-8 px-6 py-8 lg:grid-cols-[1fr_320px]">
            <section>
              <div className="mb-3">
                <span className="text-[15px] font-semibold text-black">■ tracker</span>
              </div>

              <div className="relative ml-5 border-l-2 border-[#243cbe] pl-10">
                {displayTimeline.map((event) => (
                  <div key={event.id} className="relative pb-12 last:pb-0">
                    <div className="absolute -left-[46px] top-1.5 h-3 w-3 rounded-full bg-[#243cbe]" />

                    <h3 className="mb-3 text-[16px] font-semibold text-black">
                      {event.title}
                    </h3>

                    {event.title === "Complaint Submitted" && (
                      <div className="max-w-[740px] rounded-sm bg-[#e9e9e9] shadow-sm">
                        <div className="px-4 py-3 text-[15px] leading-7 text-[#555]">
                          {event.description}
                        </div>
                        {event.fileName && (
                          <div className="border-t border-[#d0d0d0] bg-[#d9d9d9] px-3 py-2">
                            <FileChip name={event.fileName} />
                          </div>
                        )}
                      </div>
                    )}

                    {event.title === "Laws Matched" && (
                      <div>
                        <p className="mb-3 text-[15px] text-[#555]">{event.description}</p>

                        {matches.length > 0 && (
                          <div className="space-y-2">
                            {matches.slice(0, 4).map((match, idx) => (
                              <div
                                key={`${match.lawTitle}-${idx}`}
                                className="max-w-[740px] rounded-sm bg-[#f3f3f3] px-4 py-3 text-sm text-[#444]"
                              >
                                <div className="font-semibold text-black">
                                  {match.lawTitle}
                                </div>
                                <div>
                                  {formatCategoryName(match.category)} • Confidence {match.confidence}%
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {event.title === "Investigation Completed" && (
                      <p className="text-[15px] text-[#555]">{event.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>

            <aside>
              <div className="rounded-sm bg-[#f8f8f8] p-4 shadow-sm">
                <h3 className="mb-5 text-[20px] font-semibold text-[#374151]">
                  Law Category Distribution
                </h3>

                <div className="mb-6 flex items-center gap-5">
                  <div className="relative h-28 w-28 rounded-full" style={donutStyle}>
                    <div className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#f8f8f8]" />
                  </div>

                  <div className="space-y-2 text-[14px]">
                    {categoryData.length === 0 ? (
                      <p className="text-gray-500">No category data yet.</p>
                    ) : (
                      categoryData.map((item, index) => (
                        <div key={item.name} className="flex items-start gap-2">
                          <span
                            className="mt-1 h-3 w-3 rounded-sm"
                            style={{ backgroundColor: chartColors[index % chartColors.length] }}
                          />
                          <span className="font-medium text-[#374151]">
                            {formatCategoryName(item.name)} - {item.percent}%
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="mb-8 border-t border-[#e4e4e4] pt-4">
                  <h4 className="mb-4 text-[18px] font-semibold text-[#374151]">
                    Confidence Score Range
                  </h4>

                  <div className="flex items-end justify-between gap-4">
                    {scoreRangeData.map((item, index) => (
                      <div key={item.label} className="text-center">
                        <div
                          className="mx-auto mb-2 w-8"
                          style={{
                            height: `${item.height}px`,
                            backgroundColor: chartColors[index % chartColors.length],
                          }}
                        />
                        <p className="text-[14px] text-[#374151]">{item.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {caseId && (
                  <button
                    onClick={() => router.push(`/final-report?caseId=${caseId}`)}
                    className="inline-flex items-center gap-2 bg-[#d7261f] px-3 py-2 text-[15px] font-medium text-white shadow-sm hover:bg-[#b81f19]"
                  >
                    <span>📄</span>
                    Generate final report
                  </button>
                )}
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}