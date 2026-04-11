"use client";

import { useRouter } from "next/navigation";

export default function ReportSummary() {
    const router = useRouter();

    return (
        <div className="min-h-[200px] rounded-sm bg-[#e9e9e9] p-4 shadow-sm">
            <button
                onClick={() => router.push("/final-report")}
                className="inline-flex items-center gap-3 text-2xl font-medium text-black"
            >
                <span>📄</span>
                Generate final report
            </button>
        </div>
    );
}