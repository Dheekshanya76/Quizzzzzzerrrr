"use client";

import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md text-center">

        <h1 className="text-5xl font-bold">
          QUIZER
        </h1>

        <p className="mt-3 mb-8 text-gray-600">
          Create, host, and join quizzes.
        </p>

        <div className="rounded-2xl border p-8 shadow-sm">

          <h2 className="text-2xl font-bold mb-6">
            Welcome to Quizer
          </h2>

          {/* HOST */}
          <button
            onClick={() => router.push("/host")}
            className="w-full rounded-lg bg-black px-6 py-3 font-semibold text-white"
          >
            Host a Quiz
          </button>

          {/* PARTICIPANT */}
          <button
            onClick={() => router.push("/join")}
            className="mt-3 w-full rounded-lg border px-6 py-3 font-semibold"
          >
            Join a Quiz
          </button>

        </div>
      </div>
    </main>
  );
}