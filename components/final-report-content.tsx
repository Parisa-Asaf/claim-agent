type TimelineItem = {
    id: number;
    title: string;
    description: string;
    eventDate: string;
    fileName?: string | null;
};

type FinalReportData = {
    id: number;
    caseId: string;
    title: string;
    description: string;
    location?: string | null;
    category?: string | null;
    documentUrl?: string | null;
    createdAt: string;
    timeline: TimelineItem[];
};

export default function FinalReportContent({
    data,
}: {
    data: FinalReportData;
}) {
    const filingDate = new Date(data.createdAt).toLocaleDateString();

    return (
        <section className="space-y-6">
            <div className="rounded-xl bg-white p-6 shadow-sm">
                <h1 className="text-3xl font-bold text-slate-900">
                    Final Case Summary Report
                </h1>
                <p className="mt-2 text-gray-500">Final report</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-2xl font-semibold">Case Overview</h2>
                    <div className="space-y-2 text-gray-700">
                        <p><span className="font-semibold">Case ID:</span> {data.caseId}</p>
                        <p><span className="font-semibold">Complaint Title:</span> {data.title}</p>
                        <p><span className="font-semibold">Status:</span> Closed</p>
                        <p><span className="font-semibold">Filing Date:</span> {filingDate}</p>
                        <p><span className="font-semibold">Category:</span> {data.category || "Not provided"}</p>
                        <p><span className="font-semibold">Location:</span> {data.location || "Not provided"}</p>
                    </div>
                </div>

                <div className="rounded-xl bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-2xl font-semibold">Grievance Summary</h2>
                    <p className="text-gray-700">{data.description}</p>

                    {data.documentUrl && (
                        <div className="mt-4 inline-block rounded bg-gray-200 px-3 py-2 text-sm">
                            📄 {data.documentUrl}
                        </div>
                    )}
                </div>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-2xl font-semibold">Timeline Details</h2>

                {data.timeline.length === 0 ? (
                    <p className="text-gray-500">No timeline events found.</p>
                ) : (
                    <div className="space-y-5">
                        {data.timeline.map((item) => (
                            <div key={item.id} className="border-l-4 border-blue-700 pl-4">
                                <h3 className="text-lg font-semibold">{item.title}</h3>
                                <p className="text-sm text-gray-500">
                                    {new Date(item.eventDate).toLocaleString()}
                                </p>
                                <p className="mt-1 text-gray-700">{item.description}</p>

                                {item.fileName && (
                                    <div className="mt-2 inline-block rounded bg-gray-200 px-3 py-2 text-sm">
                                        📄 {item.fileName}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}