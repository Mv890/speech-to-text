import { JSX } from "react";
import Header from "../../components/Header";

export default function HistoryPage(): JSX.Element {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="max-w-4xl mx-auto py-10 px-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Recording History</h2>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <p className="text-gray-500 italic">No past recordings found yet.</p>
        </div>
      </main>
    </div>
  );
}