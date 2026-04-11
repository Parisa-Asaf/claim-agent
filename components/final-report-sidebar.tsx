type TimelineItem = {
    id: number;
    title: string;
    description: string;
    eventDate: string;
    fileName?: string | null;
};

export default function FinalReportSidebar({
    timeline = [],
}: {
    timeline?: TimelineItem[];
}) {
    return (
        <aside className="rounded-xl bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-slate-700">
                Timeline Summary
            </h2>

            {timeline.length === 0 ? (
                <p className="text-sm text-gray-500">No summary data found.</p>
            ) : (
                <div className="space-y-3">
                    {timeline.map((item) => (
                        <div key={item.id}>
                            <p className="font-medium text-slate-800">{item.title}</p>
                            <p className="text-xs text-gray-500">
                                {new Date(item.eventDate).toLocaleDateString()}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </aside>
    );
}