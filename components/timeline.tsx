type TimelineItem = {
    id: number;
    title: string;
    description: string;
    eventDate: string;
    fileName?: string | null;
};

export default function Timeline({ items = [] }: { items?: TimelineItem[] }) {
    if (items.length === 0) {
        return <div className="p-4">No timeline data found.</div>;
    }

    return (
        <div className="space-y-8">
            {items.map((item) => (
                <div key={item.id} className="relative border-l-2 border-blue-700 pl-6">
                    <div className="absolute -left-[7px] top-1 h-3 w-3 rounded-full bg-blue-700" />
                    <h2 className="text-xl font-bold">{item.title}</h2>
                    <p className="text-sm text-gray-500">
                        {new Date(item.eventDate).toLocaleString()}
                    </p>
                    <p className="mt-2 text-gray-700">{item.description}</p>

                    {item.fileName && (
                        <div className="mt-2 inline-block rounded bg-gray-200 px-3 py-2">
                            📄 {item.fileName}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}