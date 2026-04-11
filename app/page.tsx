import Link from "next/link";

export default function Page() {
  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center px-6">
      <div className="bg-white p-10 rounded-2xl shadow-md text-center max-w-xl w-full">
        <h1 className="text-3xl font-bold mb-4">Automated Statute Lookup</h1>
        <p className="text-gray-600 mb-6">
          Dashboard
        </p>

        <div className="flex flex-col items-center gap-4">
          <Link
            href="/grievance-input"
            className="inline-block rounded-lg bg-blue-600 px-6 py-3 text-white font-medium hover:bg-blue-700"
          >
            Go to Grievance Input
          </Link>

          <Link
            href="/claims"
            className="inline-block rounded-lg bg-gray-700 px-6 py-3 text-white font-medium hover:bg-gray-800"
          >
            View Timeline
          </Link>
        </div>
      </div>
    </main>
  );
}