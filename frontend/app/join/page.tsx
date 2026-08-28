"use client";

import { useState } from "react";

export default function JoinQuizPage() {
  const [name, setName] = useState("");
  const [quizCode, setQuizCode] = useState("");
  const [error, setError] = useState("");

  function joinQuiz() {
    if (!name.trim() || !quizCode.trim()) {
      setError("Please enter your name and quiz code.");
      return;
    }

    setError("");

    const encodedName = encodeURIComponent(name.trim());
    const encodedCode = encodeURIComponent(
      quizCode.trim().toUpperCase()
    );

    window.location.href =
      `/quiz?name=${encodedName}&code=${encodedCode}`;
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md border rounded-2xl p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-center mb-2">
          QUIZER
        </h1>

        <p className="text-center text-gray-600 mb-8">
          Join a Quiz
        </p>

        <div className="mb-5">
          <label className="block font-medium mb-2">
            Your Name
          </label>

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            className="w-full border rounded-lg p-3 outline-none focus:ring-2"
          />
        </div>

        <div className="mb-5">
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
            className="w-full border rounded-lg p-3 outline-none focus:ring-2 uppercase"
          />
        </div>

        {error && (
          <p className="text-red-600 text-sm mb-4">
            {error}
          </p>
        )}

        <button
          onClick={joinQuiz}
          className="w-full bg-black text-white py-3 rounded-lg font-medium hover:opacity-80"
        >
          Join Quiz
        </button>
      </div>
    </main>
  );
}