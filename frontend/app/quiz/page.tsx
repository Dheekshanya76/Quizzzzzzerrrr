"use client";

import { useState } from "react";

const questions = [
  {
    question: "Which language is used with React?",
    options: ["Python", "JavaScript", "Java", "C++"],
    answer: "JavaScript",
  },
  {
    question: "Which HTML tag is used for a heading?",
    options: ["<p>", "<h1>", "<div>", "<span>"],
    answer: "<h1>",
  },
  {
    question: "Which one is a JavaScript framework?",
    options: ["Next.js", "MySQL", "Git", "Linux"],
    answer: "Next.js",
  },
];

export default function QuizPage() {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState("");
  const [score, setScore] = useState(0);

  const q = questions[current];

  function next() {
    if (!selected) {
      alert("Please select an answer");
      return;
    }

    if (selected === q.answer) {
      setScore(score + 1);
    }

    if (current === questions.length - 1) {
      const finalScore = score + (selected === q.answer ? 1 : 0);

      window.location.href =
        `/results?score=${finalScore}&total=${questions.length}`;

      return;
    }

    setCurrent(current + 1);
    setSelected("");
  }

  return (
    <main className="max-w-2xl mx-auto p-8">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">Quizer</h1>

        <span>
          {current + 1} / {questions.length}
        </span>
      </div>

      <h2 className="text-xl font-semibold mb-6">
        {q.question}
      </h2>

      {q.options.map((option) => (
        <button
          key={option}
          onClick={() => setSelected(option)}
          className={`block w-full p-4 mb-3 border rounded-lg text-left ${
            selected === option
              ? "bg-gray-200 border-black"
              : ""
          }`}
        >
          {option}
        </button>
      ))}

      <button
        onClick={next}
        className="mt-4 bg-black text-white px-6 py-3 rounded-lg w-full"
      >
        {current === questions.length - 1
          ? "Submit Quiz"
          : "Next"}
      </button>
    </main>
  );
}