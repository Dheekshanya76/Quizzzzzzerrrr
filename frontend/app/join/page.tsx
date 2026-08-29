"use client";

import { useState } from "react";
import { joinQuiz } from "../../lib/api";

export default function JoinQuizPage() {
  const [name, setName] = useState("");
  const [quizCode, setQuizCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleJoinQuiz() {
    if (!name.trim() || !quizCode.trim()) {
      setError("Please enter your name and quiz code.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const participant = await joinQuiz(
        quizCode.trim().toUpperCase(),
        name.trim()
      );

      window.location.href =
        `/quiz?name=${encodeURIComponent(
          name.trim()
        )}&code=${encodeURIComponent(
          quizCode.trim().toUpperCase()
        )}&participantId=${encodeURIComponent(
          String(participant.id)
        )}`;
    } catch (err) {
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
          disabled={loading}
          className="w-full border rounded-lg p-3 mb-5 disabled:opacity-50"
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
          disabled={loading}
          className="w-full border rounded-lg p-3 mb-4 uppercase disabled:opacity-50"
        />

        {error && (
          <p className="text-red-600 text-sm mb-4">
            {error}
          </p>
        )}

        <button
          onClick={handleJoinQuiz}
          disabled={loading}
          className="w-full bg-black text-white py-3 rounded-lg font-medium disabled:opacity-50"
        >
          {loading ? "Joining..." : "Join Quiz"}
        </button>

      </div>
    </main>
  );
}