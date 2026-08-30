"use client";

import { useRouter } from "next/navigation";

export default function HostPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        <h1 className="text-5xl font-bold">
          QUIZER
        </h1>

        <p className="mt-3 mb-8 text-gray-600">
          Create and host your quiz
        </p>

        <div className="rounded-2xl border p-8 shadow-sm">
          <h2 className="mb-3 text-2xl font-bold">
            Host a Quiz
          </h2>

          <p className="mb-6 text-gray-600">
            Create a quiz, add questions, and publish it
            for participants.
          </p>

          <button
            onClick={() => router.push("/host/create")}
            className="w-full rounded-lg bg-black px-6 py-3 font-semibold text-white"
          >
            Create Quiz
          </button>

          <button
            onClick={() => router.push("/")}
            className="mt-3 w-full rounded-lg border px-6 py-3 font-semibold"
          >
            Back to Home
          </button>
        </div>
      </div>
    </main>
  );
}