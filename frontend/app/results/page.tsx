"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ResultsContent() {
  const searchParams = useSearchParams();

  const name =
    searchParams.get("name") || "Participant";

  const score =
    Number(searchParams.get("score")) || 0;

  const total =
    Number(searchParams.get("total")) || 0;

  const percentage =
    total > 0
      ? Math.round((score / total) * 100)
      : 0;

  return (
    <main className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto">

        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold">
            Quiz Completed!
          </h1>

          <p className="text-gray-600 mt-2">
            Well done, {name}!
          </p>
        </div>

        <div className="border rounded-2xl p-8 text-center shadow-sm">

          <p className="text-gray-600">
            Your Score
          </p>

          <p className="text-5xl font-bold mt-3">
            {score} / {total}
          </p>

          <p className="text-2xl font-semibold mt-4">
            {percentage}%
          </p>

        </div>

        <div className="border rounded-2xl p-6 mt-8">

          <h2 className="text-2xl font-bold mb-5">
            🏆 Leaderboard
          </h2>

          <div className="flex justify-between border-b py-3">
            <span>1. {name}</span>
            <span>
              {score} / {total}
            </span>
          </div>

          <p className="text-gray-500 text-sm mt-4">
            Other participants will appear here
            when the backend is connected.
          </p>

        </div>

        <button
          onClick={() =>
            (window.location.href = "/join")
          }
          className="w-full bg-black text-white py-3 rounded-lg mt-8"
        >
          Join Another Quiz
        </button>

      </div>
    </main>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResultsContent />
    </Suspense>
  );
}