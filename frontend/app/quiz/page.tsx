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
  const [participantName, setParticipantName] = useState("");
  const [quizCode, setQuizCode] = useState("");

  const q = questions[current];

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    setParticipantName(
      params.get("name") || "Participant"
    );

    setQuizCode(
      params.get("code") || "QUIZ"
    );
  }, []);

  function next() {
    if (!selected) {
      alert("Please select an answer.");
      return;
    }

    const updatedAnswers = [...answers];
    updatedAnswers[current] = selected;
    setAnswers(updatedAnswers);

    if (current === questions.length - 1) {
      const score = questions.reduce(
        (total, question, index) => {
          return (
            total +
            (updatedAnswers[index] === question.answer
              ? 1
              : 0)
          );
        },
        0
      );

      window.location.href =
        `/results?name=${encodeURIComponent(
          participantName
        )}&code=${encodeURIComponent(
          quizCode
        )}&score=${score}&total=${questions.length}`;

      return;
    }

    setCurrent(current + 1);
    setSelected(
      updatedAnswers[current + 1] || ""
    );
  }

  function previous() {
    if (current === 0) {
      return;
    }

    const updatedAnswers = [...answers];
    updatedAnswers[current] = selected;
    setAnswers(updatedAnswers);

    setCurrent(current - 1);
    setSelected(
      updatedAnswers[current - 1] || ""
    );
  }

  return (
    <main className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto">

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">
              QUIZER
            </h1>

            <p className="text-gray-600">
              Quiz Code: {quizCode}
            </p>
          </div>

          <div className="text-right">
            <p className="font-medium">
              {participantName}
            </p>

            <p className="text-gray-600">
              Question {current + 1} of{" "}
              {questions.length}
            </p>
          </div>
        </div>

        <div className="border rounded-2xl p-6 shadow-sm">

          <h2 className="text-xl font-semibold mb-6">
            {q.question}
          </h2>

          <div>
            {q.options.map((option) => (
              <button
                key={option}
                onClick={() =>
                  setSelected(option)
                }
                className={`block w-full p-4 mb-3 border rounded-lg text-left ${
                  selected === option
                    ? "bg-gray-200 border-black"
                    : "hover:bg-gray-50"
                }`}
              >
                {option}
              </button>
            ))}
          </div>

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
        </div>
      </div>
    </main>
  );
}