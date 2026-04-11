"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type TimelineItem = {
  id: number;
  event: string;
  description: string;
  date: string;
  fileName?: string | null;
};

type LawMatchItem = {
  lawTitle: string;
  confidence: number;
  keywords: string[];
  summary: string;
  category: string;
};

type ReportResponse = {
  caseOverview: {
    caseId: string;
    title: string;
    location: string;
    category: string;
    filingDate: string;
    closureDate: string | null;
    status: string;
    totalEvents: number;
  };
  complainantDetails: {
    name: string;
    email: string;
    supportingFile: string;
  };
  grievanceSummary: string;
  investigationFindings: string;
  outcome: {
    status: string;
    latestUpdate: string;
    closureDate: string | null;
    recoveryAmount: string | null;
    claimedLoss: string | null;
    recoveryRate: string | null;
    matchedLawsCount: number;
    resolutionNote: string;
  };
  lawMatch: {
    confidence: number;
    totalMatches: number;
    categoryDistribution: Array<{
      category: string;
      count: number;
      percent: number;
    }>;
    matches: LawMatchItem[];
  };
  timelineSummary: TimelineItem[];
};

export default function FinalReportPage() {
  const searchParams = useSearchParams();
  const caseId = searchParams.get("caseId");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [report, setReport] = useState<ReportResponse | null>(null);

  useEffect(() => {
    async function loadReport() {
      if (!caseId) {
        setError("Missing caseId");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/final-report?caseId=${encodeURIComponent(caseId)}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Failed to load final report");
          return;
        }

        setReport(data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch final report");
      } finally {
        setLoading(false);
      }
    }

    loadReport();
  }, [caseId]);

  const donutStyle = useMemo(() => {
    const distribution = report?.lawMatch?.categoryDistribution || [];
    const colors = ["#8ab4f8", "#34a853", "#fbbc04", "#ea4335", "#a142f4", "#24c1a7"];

    if (!distribution.length) {
      return {
        background: "conic-gradient(#d1d5db 0deg 360deg)",
      };
    }

    let currentDeg = 0;
    const parts = distribution.map((item, index) => {
      const slice = (item.percent / 100) * 360;
      const start = currentDeg;
      const end = currentDeg + slice;
      currentDeg = end;
      return `${colors[index % colors.length]} ${start}deg ${end}deg`;
    });

    return {
      background: `conic-gradient(${parts.join(", ")})`,
    };
  }, [report]);

  function handlePrint() {
    window.print();
  }

  function formatDate(value: string | null | undefined) {
    if (!value) return "N/A";
    return new Date(value).toLocaleDateString();
  }

  function formatDateTime(value: string | null | undefined) {
    if (!value) return "N/A";
    return new Date(value).toLocaleString();
  }

  function safeLabel(value: string | null | undefined, fallback = "Not specified") {
    const text = String(value || "").trim();
    return text || fallback;
  }

  return (
    <main className="min-h-screen bg-[#efefef] px-6 py-8 print:bg-white print:px-0">
      <div className="mx-auto max-w-7xl rounded-2xl bg-white shadow print:shadow-none">
        <div className="flex items-center justify-between rounded-t-2xl bg-[#d9d9d9] px-6 py-5 print:bg-white">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Final Case Summary Report
            </h1>
            <p className="text-gray-600">Final report</p>
          </div>

          <button
            onClick={handlePrint}
            className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700 print:hidden"
          >
            Download / Print PDF
          </button>
        </div>

        {loading && <div className="p-8 text-gray-600">Loading report...</div>}

        {error && !loading && (
          <div className="p-8">
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
              {error}
            </div>
          </div>
        )}

        {!loading && !error && report && (
          <div className="p-6 md:p-10">
            <div className="mb-8 rounded-2xl bg-[#eeeeee] p-6 shadow-sm">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-white text-4xl shadow">
                ⚖️
              </div>
            </div>

            <div className="mb-8 grid gap-4 md:grid-cols-2">
              <div className="flex items-center gap-3 text-xl text-gray-900">
                <span className="h-3 w-3 rounded-full bg-blue-700" />
                <span>Case ID: #{report.caseOverview.caseId}</span>
              </div>

              <div className="flex items-center gap-3 text-xl text-gray-900">
                <span className="h-3 w-3 rounded-full bg-blue-700" />
                <span>Complaint Title: {safeLabel(report.caseOverview.title, "Untitled complaint")}</span>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.8fr_0.7fr]">
              <section className="space-y-5">
                <div className="rounded-2xl bg-[#eeeeee] p-6 shadow-sm">
                  <h2 className="mb-5 text-2xl font-semibold text-gray-900">
                    Case overview
                  </h2>

                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="space-y-4 text-gray-700">
                      <p>• Case ID: #{report.caseOverview.caseId}</p>
                      <p>• Complaint Title: {safeLabel(report.caseOverview.title, "Untitled complaint")}</p>
                      <p>• Category: {safeLabel(report.caseOverview.category)}</p>
                      <p>• Location: {safeLabel(report.caseOverview.location)}</p>
                    </div>

                    <div className="space-y-4 text-gray-700">
                      <p>• Status: {safeLabel(report.caseOverview.status, "Unknown")}</p>
                      <p>• Filing Date: {formatDate(report.caseOverview.filingDate)}</p>
                      <p>• Closure Date: {formatDate(report.caseOverview.closureDate)}</p>
                      <p>• Total Events: {report.caseOverview.totalEvents}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-[#eeeeee] p-6 shadow-sm">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <h2 className="mb-4 text-2xl font-semibold text-gray-900">
                        Complainant details
                      </h2>

                      <div className="space-y-3 text-gray-700">
                        <p>• Name: {safeLabel(report.complainantDetails.name, "Not provided")}</p>
                        <p>• Email: {safeLabel(report.complainantDetails.email, "Not provided")}</p>
                        <p>• Supporting File: {safeLabel(report.complainantDetails.supportingFile, "N/A")}</p>
                      </div>
                    </div>

                    <div>
                      <h2 className="mb-4 text-2xl font-semibold text-gray-900">
                        Grievance summary
                      </h2>

                      <p className="whitespace-pre-wrap text-gray-700">
                        {safeLabel(report.grievanceSummary, "No grievance summary available.")}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-[#eeeeee] p-6 shadow-sm">
                  <h2 className="mb-4 text-2xl font-semibold text-gray-900">
                    Investigation findings
                  </h2>

                  <div className="mb-5 rounded-xl bg-white p-4 text-gray-700">
                    {safeLabel(report.investigationFindings, "No investigation findings available.")}
                  </div>

                  <div className="space-y-4 text-gray-700">
                    {report.timelineSummary.length === 0 ? (
                      <p>No findings available.</p>
                    ) : (
                      report.timelineSummary.map((event) => (
                        <div key={event.id} className="rounded-xl bg-white p-4">
                          <p className="font-semibold text-gray-900">{safeLabel(event.event, "Timeline event")}</p>
                          <p className="mt-2 whitespace-pre-wrap">
                            {safeLabel(event.description, "No description available.")}
                          </p>
                          {event.fileName && (
                            <p className="mt-2 text-sm text-gray-600">
                              File: {event.fileName}
                            </p>
                          )}
                          <p className="mt-2 text-sm text-gray-500">
                            {formatDateTime(event.date)}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="rounded-2xl bg-[#eeeeee] p-6 shadow-sm">
                  <h2 className="mb-4 text-2xl font-semibold text-gray-900">
                    Outcome & recovery
                  </h2>

                  <div className="space-y-3 text-gray-700">
                    <p>• Final Status: {safeLabel(report.outcome.status, "Unknown")}</p>
                    <p>• Latest Update: {safeLabel(report.outcome.latestUpdate, "No update available")}</p>
                    <p>• Closure Date: {formatDate(report.outcome.closureDate)}</p>
                    <p>• Matched Laws: {report.outcome.matchedLawsCount}</p>
                    <p>• Recovery Amount: {report.outcome.recoveryAmount || "Not recorded"}</p>
                    <p>• Claimed Loss: {report.outcome.claimedLoss || "Not recorded"}</p>
                    <p>• Recovery Rate: {report.outcome.recoveryRate || "Not recorded"}</p>
                    <p className="whitespace-pre-wrap">
                      • Resolution Note: {safeLabel(report.outcome.resolutionNote, "No resolution note available.")}
                    </p>
                  </div>
                </div>
              </section>

              <aside className="space-y-5">
                <div className="rounded-2xl bg-white p-5 shadow-sm">
                  <h3 className="mb-4 text-xl font-bold text-gray-800">
                    Law Match Confidence
                  </h3>

                  <div className="mb-4 flex items-center justify-center">
                    <div
                      className="relative flex h-32 w-32 items-center justify-center rounded-full"
                      style={donutStyle}
                    >
                      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white text-3xl font-bold text-gray-800">
                        {report.lawMatch.confidence}%
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-700">
                    {report.lawMatch.categoryDistribution.length === 0 ? (
                      <p>No law match data available.</p>
                    ) : (
                      report.lawMatch.categoryDistribution.map((item) => (
                        <p key={item.category}>
                          {item.category} — {item.percent}%
                        </p>
                      ))
                    )}
                  </div>

                  {report.lawMatch.matches.length > 0 && (
                    <div className="mt-4 border-t pt-4">
                      <p className="mb-2 text-sm font-semibold text-gray-800">
                        Top matched laws
                      </p>
                      <div className="space-y-2">
                        {report.lawMatch.matches.slice(0, 3).map((item, index) => (
                          <div key={`${item.lawTitle}-${index}`} className="rounded-lg bg-[#f7f7f7] p-3">
                            <p className="text-sm font-semibold text-gray-900">
                              {item.lawTitle}
                            </p>
                            <p className="text-xs text-gray-600">
                              {item.category} • {item.confidence}%
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="rounded-2xl bg-white p-5 shadow-sm">
                  <h3 className="mb-4 text-xl font-bold text-gray-800">
                    Timeline Summary
                  </h3>

                  <div className="space-y-3">
                    {report.timelineSummary.length === 0 ? (
                      <p className="text-gray-600">No timeline data.</p>
                    ) : (
                      report.timelineSummary.map((event, index) => {
                        const colors = [
                          "bg-green-500",
                          "bg-cyan-500",
                          "bg-yellow-500",
                          "bg-red-400",
                          "bg-purple-500",
                        ];

                        return (
                          <div
                            key={event.id}
                            className="flex items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className={`h-3 w-3 rounded-full ${colors[index % colors.length]}`}
                              />
                              <span className="text-sm text-gray-700">
                                {safeLabel(event.event, "Timeline event")}
                              </span>
                            </div>
                            <span className="text-sm text-gray-500">
                              {formatDate(event.date)}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </aside>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}