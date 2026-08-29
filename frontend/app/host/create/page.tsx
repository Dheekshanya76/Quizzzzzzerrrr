"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createQuiz } from "../../../lib/api";

export default function CreateQuizPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreateQuiz() {
    if (!title.trim()) {
      setError("Quiz title is required.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const quiz = await createQuiz({
        title: title.trim(),
        description: description.trim(),
      });

      router.push(`/host/quiz/${quiz.id}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create quiz."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-2xl">

        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold">
            Quizora
          </h1>

          <p className="mt-2 text-gray-600">
            Create a Quiz
          </p>
        </div>

        <div className="rounded-2xl border p-6 shadow-sm">

          <h2 className="mb-6 text-2xl font-bold">
            Quiz Details
          </h2>

          <label className="mb-2 block font-medium">
            Quiz Title
          </label>

          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter quiz title"
            disabled={loading}
            className="mb-5 w-full rounded-lg border p-3 outline-none focus:ring-2 disabled:opacity-50"
          />

          <label className="mb-2 block font-medium">
            Description
          </label>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter quiz description"
            rows={4}
            disabled={loading}
            className="mb-5 w-full rounded-lg border p-3 outline-none focus:ring-2 disabled:opacity-50"
          />

          {error && (
            <p className="mb-4 rounded-lg bg-red-50 p-3 text-red-600">
              {error}
            </p>
          )}

          <button
            onClick={handleCreateQuiz}
            disabled={loading}
            className="w-full rounded-lg bg-black px-6 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Creating Quiz..." : "Create Quiz"}
          </button>

        </div>
      </div>
    </main>
  );
}