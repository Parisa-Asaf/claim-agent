"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Claim = {
  id: number;
  caseId: string;
  title: string;
  description: string;
  category?: string | null;
  location?: string | null;
  documentUrl?: string | null;
  createdAt: string;
};

export default function ClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchClaims() {
      try {
        const res = await fetch("/api/claims");
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Failed to fetch claims");
          return;
        }

        setClaims(data.claims || []);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch claims");
      } finally {
        setLoading(false);
      }
    }

    fetchClaims();
  }, []);

  function formatDate(date: string) {
    return new Date(date).toLocaleString();
  }

  return (
    <main className="min-h-screen bg-gray-100 px-6 py-10">
      <div className="mx-auto max-w-6xl rounded-2xl bg-white p-8 shadow-md">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">All Posted Claims</h1>
          <p className="mt-2 text-gray-600">
            Select any claim to view its full case timeline.
          </p>
        </div>

        {loading && <p className="text-gray-600">Loading claims...</p>}

        {error && !loading && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && claims.length === 0 && (
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-gray-600">
            No claims found.
          </div>
        )}

        {!loading && !error && claims.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            {claims.map((claim) => (
              <Link
                key={claim.caseId}
                href={`/case-timeline?caseId=${encodeURIComponent(claim.caseId)}`}
                className="block rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <div className="mb-3 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {claim.title}
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Case ID: {claim.caseId}
                    </p>
                  </div>

                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                    Open Timeline
                  </span>
                </div>

                <p className="mb-4 line-clamp-3 text-gray-700">
                  {claim.description}
                </p>

                <div className="space-y-1 text-sm text-gray-600">
                  <p>
                    <span className="font-medium">Category:</span>{" "}
                    {claim.category || "Not specified"}
                  </p>
                  <p>
                    <span className="font-medium">Location:</span>{" "}
                    {claim.location || "Not specified"}
                  </p>
                  <p>
                    <span className="font-medium">Document:</span>{" "}
                    {claim.documentUrl || "No file"}
                  </p>
                  <p>
                    <span className="font-medium">Created:</span>{" "}
                    {formatDate(claim.createdAt)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}