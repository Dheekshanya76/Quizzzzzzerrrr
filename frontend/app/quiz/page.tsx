"use client";

import { useEffect, useState } from "react";

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
  const [answers, setAnswers] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);

  const q = questions[current];

  useEffect(() => {
    if (timeLeft <= 0) {
      window.location.href =
        `/results?score=${score}&total=${questions.length}`;
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((time) => time - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, score]);

  function next() {
    if (!selected) {
      alert("Please select an answer");
      return;
    }

    const updatedAnswers = [...answers];
    updatedAnswers[current] = selected;
    setAnswers(updatedAnswers);

    if (current === questions.length - 1) {
      const finalScore = questions.reduce(
        (total, question, index) =>
          total +
          (updatedAnswers[index] === question.answer ? 1 : 0),
        0
      );

      window.location.href =
        `/results?score=${finalScore}&total=${questions.length}`;

      return;
    }

    setCurrent(current + 1);
    setSelected(updatedAnswers[current + 1] || "");
  }

  function previous() {
    if (current === 0) {
      return;
    }

    const updatedAnswers = [...answers];
    updatedAnswers[current] = selected;
    setAnswers(updatedAnswers);

    setCurrent(current - 1);
    setSelected(updatedAnswers[current - 1] || "");
  }

  return (
    <main className="max-w-2xl mx-auto p-8">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">
          Quizer
        </h1>

        <div>
          <span>
            {current + 1} / {questions.length}
          </span>

          <span className="ml-6 font-semibold">
            Time: {timeLeft}s
          </span>
        </div>
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

      <div className="flex gap-3 mt-6">
        <button
          onClick={previous}
          disabled={current === 0}
          className="w-1/2 border px-6 py-3 rounded-lg disabled:opacity-40"
        >
          Previous
        </button>

        <button
          onClick={next}
          className="w-1/2 bg-black text-white px-6 py-3 rounded-lg"
        >
          {current === questions.length - 1
            ? "Submit Quiz"
            : "Next"}
        </button>
      </div>
    </main>
  );
}