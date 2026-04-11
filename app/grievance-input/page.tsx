"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function GrievanceInputPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/grievance", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        // same redirect flow as your code
        router.push(`/law-match-results?caseId=${data.caseId}`);
      } else {
        alert(data.error || "Something went wrong");
      }
    } catch (error) {
      console.error("Submit Error:", error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-[#222]">
      {/* Header */}
      <header className="flex items-center justify-between bg-[#d9d9d9] px-6 py-5 shadow-sm md:px-10">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-md border border-gray-400 bg-white text-2xl shadow-sm">
            ⚖️
          </div>

          <div>
            <h1 className="text-2xl font-semibold md:text-4xl">
              Automated statute lookup
            </h1>
            <p className="mt-1 text-sm text-gray-600 md:text-base">
              Dashboard &gt; statute Lookup
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

      {/* Body */}
      <main className="px-6 py-10 md:px-12">
        <div className="mx-auto max-w-[1120px]">
          <h2 className="text-3xl font-semibold md:text-5xl">Grievance Input</h2>
          <p className="mt-3 text-sm text-gray-600 md:text-base">
            Enter complaint details relevant to laws.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-8 rounded-[24px] bg-[#dddddd] px-6 py-8 shadow-sm md:px-12 md:py-10"
          >
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
              {/* Left side */}
              <div className="space-y-6">
                <Field label="Case ID">
                  <input
                    type="text"
                    name="caseId"
                    className="h-12 w-full rounded-md bg-[#f7f3f3] px-4 text-base outline-none"
                  />
                </Field>

                <Field label="Complaint Title">
                  <input
                    type="text"
                    name="title"
                    required
                    className="h-12 w-full rounded-md bg-[#f7f3f3] px-4 text-base outline-none"
                  />
                </Field>

                <Field label="Detailed description">
                  <textarea
                    name="description"
                    required
                    rows={5}
                    className="w-full rounded-md bg-[#f7f3f3] px-4 py-3 text-base outline-none resize-none"
                    placeholder="Describe the issue in detail..."
                  />
                </Field>

                <Field label="Category">
                  <input
                    type="text"
                    name="category"
                    className="h-12 w-full rounded-md bg-[#f7f3f3] px-4 text-base outline-none"
                  />
                </Field>

                <div>
                  <label className="mb-3 block text-lg font-medium text-gray-800">
                    Upload Supporting Document
                  </label>

                  <label className="flex cursor-pointer items-center gap-4 rounded-md border-2 border-dashed border-gray-400 bg-[#e9e9e9] px-4 py-5 transition hover:bg-[#ececec]">
                    <span className="text-3xl text-gray-600">📄</span>

                    <div className="min-w-0">
                      <p className="text-lg font-semibold text-gray-700">
                        Upload Supporting Document
                      </p>
                      <p className="text-sm text-gray-500">
                        PDF up to 25MB
                      </p>
                      {selectedFileName && (
                        <p className="mt-1 truncate text-sm text-gray-700">
                          Selected: {selectedFileName}
                        </p>
                      )}
                    </div>

                    <input
                      type="file"
                      name="file"
                      accept=".pdf,application/pdf"
                      required
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        setSelectedFileName(file ? file.name : "");
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Right side */}
              <div className="flex flex-col">
                <div className="space-y-6">

                  <Field label="Location (optional)">
                    <input
                      type="text"
                      name="location"
                      className="h-12 w-full rounded-md bg-[#f7f3f3] px-4 text-base outline-none"
                    />
                  </Field>
                </div>

                <div className="mt-auto flex justify-end pt-10">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-3 rounded-md bg-[#e8e8e8] px-5 py-3 text-lg font-medium text-gray-800 shadow-sm transition hover:bg-[#dedede] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <span>🔍</span>
                    {loading ? "Analyzing..." : "analyze and match laws"}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-base font-medium text-gray-800 md:text-lg">
        {label}
      </label>
      {children}
    </div>
  );
}