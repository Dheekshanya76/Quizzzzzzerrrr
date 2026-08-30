"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { joinQuiz } from "../../lib/api";

export default function JoinQuizPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [quizCode, setQuizCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleJoinQuiz() {
    console.log("JOIN BUTTON CLICKED");

    const cleanName = name.trim();
    const cleanCode = quizCode.trim().toUpperCase();

    if (!cleanName) {
      setError("Please enter your name.");
      return;
    }

    if (!cleanCode) {
      setError("Please enter the quiz code.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      console.log("Joining:", cleanCode, cleanName);

      const participant = await joinQuiz(
        cleanCode,
        cleanName
      );

      console.log("Participant:", participant);

      router.push(
        `/quiz?name=${encodeURIComponent(
          cleanName
        )}&code=${encodeURIComponent(
          cleanCode
        )}&participantId=${encodeURIComponent(
          String(participant.id)
        )}`
      );
    } catch (err) {
      console.error("JOIN ERROR:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to join quiz."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md border rounded-2xl p-8 shadow-sm">

        <h1 className="text-3xl font-bold text-center">
          QUIZER
        </h1>

        <p className="text-center text-gray-600 mt-2 mb-8">
          Join a Quiz
        </p>

        <label className="block font-medium mb-2">
          Your Name
        </label>

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          className="w-full border rounded-lg p-3 mb-5"
        />

        <label className="block font-medium mb-2">
          Quiz Code
        </label>

        <input
          type="text"
          value={quizCode}
          onChange={(e) =>
            setQuizCode(e.target.value.toUpperCase())
          }
          placeholder="Enter quiz code"
          className="w-full border rounded-lg p-3 mb-5 uppercase"
        />

        {error && (
          <div className="mb-5 rounded-lg border border-red-300 bg-red-50 p-3 text-red-600">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={handleJoinQuiz}
          disabled={loading}
          className="w-full rounded-lg bg-black px-6 py-4 font-semibold text-white cursor-pointer hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Joining..." : "Join Quiz"}
        </button>

      </div>
    </main>
  );
}