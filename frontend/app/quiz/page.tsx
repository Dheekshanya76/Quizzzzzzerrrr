"use client";

import { useState } from "react";

export default function QuizPage() {
  const [answer, setAnswer] = useState("");

  return (
    <main className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Quiz</h1>

      <h2 className="text-xl mb-4">
        Which language is used with React?
      </h2>

      {["Python", "JavaScript", "Java", "C++"].map((option) => (
        <button
          key={option}
          onClick={() => setAnswer(option)}
          className={`block w-full p-3 mb-3 border rounded ${
            answer === option ? "bg-gray-200" : ""
          }`}
        >
          {option}
        </button>
      ))}

      <button
        className="mt-4 bg-black text-white px-6 py-3 rounded"
        onClick={() => alert(`Answer submitted: ${answer}`)}
      >
        Submit
      </button>
    </main>
  );
}
