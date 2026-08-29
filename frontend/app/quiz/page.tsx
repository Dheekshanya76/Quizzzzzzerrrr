"use client";

import { useEffect, useState } from "react";

type Question = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
};

type Quiz = {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  published: boolean;
  code: string;
};

export default function QuizPage() {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [participantName, setParticipantName] = useState("");
  const [quizCode, setQuizCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const name = params.get("name") || "Participant";
    const code = (params.get("code") || "").toUpperCase();

    setParticipantName(name);
    setQuizCode(code);

    /*
     * Find the published quiz using its quiz code.
     *
     * Person 1 stores quizzes as:
     * quiz-{quizId}
     *
     * So we check localStorage for a quiz
     * whose published code matches the participant's code.
     */
    let foundQuiz: Quiz | null = null;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);

      if (!key || !key.startsWith("quiz-")) {
        continue;
      }

      const storedQuiz = localStorage.getItem(key);

      if (!storedQuiz) {
        continue;
      }

      try {
        const parsedQuiz: Quiz = JSON.parse(storedQuiz);

        if (
          parsedQuiz.published &&
          parsedQuiz.code.toUpperCase() === code
        ) {
          foundQuiz = parsedQuiz;
          break;
        }
      } catch {
        // Ignore invalid localStorage entries
      }
    }

    if (!foundQuiz) {
      setError(
        "Quiz not found. Please check the quiz code and make sure the host has published the quiz."
      );
      setLoading(false);
      return;
    }

    if (foundQuiz.questions.length === 0) {
      setError("This quiz does not contain any questions.");
      setLoading(false);
      return;
    }

    setQuiz(foundQuiz);
    setAnswers(new Array(foundQuiz.questions.length).fill(-1));
    setLoading(false);
  }, []);

  function selectAnswer(optionIndex: number) {
    setSelected(optionIndex);
    setError("");
  }

  function next() {
    if (!quiz) return;

    if (selected === null) {
      setError("Please select an answer.");
      return;
    }

    const updatedAnswers = [...answers];
    updatedAnswers[current] = selected;

    setAnswers(updatedAnswers);

    if (current === quiz.questions.length - 1) {
      submitQuiz(updatedAnswers);
      return;
    }

    const nextQuestion = current + 1;

    setCurrent(nextQuestion);
    setSelected(
      updatedAnswers[nextQuestion] !== -1
        ? updatedAnswers[nextQuestion]
        : null
    );

    setError("");
  }

  function previous() {
    if (!quiz || current === 0) {
      return;
    }

    const updatedAnswers = [...answers];

    if (selected !== null) {
      updatedAnswers[current] = selected;
    }

    setAnswers(updatedAnswers);

    const previousQuestion = current - 1;

    setCurrent(previousQuestion);

    setSelected(
      updatedAnswers[previousQuestion] !== -1
        ? updatedAnswers[previousQuestion]
        : null
    );

    setError("");
  }

  function submitQuiz(finalAnswers: number[]) {
    if (!quiz) return;

    let score = 0;

    quiz.questions.forEach((question, index) => {
      if (finalAnswers[index] === question.correctAnswer) {
        score++;
      }
    });

    const percentage =
      quiz.questions.length > 0
        ? Math.round(
            (score / quiz.questions.length) * 100
          )
        : 0;

    const result = {
      name: participantName,
      code: quizCode,
      quizId: quiz.id,
      quizTitle: quiz.title,
      score,
      total: quiz.questions.length,
      percentage,
    };

    /*
     * Save result locally so the result page
     * can display the participant's score.
     */
    localStorage.setItem(
      "latest-result",
      JSON.stringify(result)
    );

    window.location.href =
      `/results?name=${encodeURIComponent(
        participantName
      )}&code=${encodeURIComponent(
        quizCode
      )}&score=${score}&total=${quiz.questions.length}`;
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <p className="text-lg">Loading quiz...</p>
      </main>
    );
  }

  if (error && !quiz) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-xl rounded-2xl border p-8 text-center shadow-sm">
          <h1 className="mb-4 text-2xl font-bold">
            Unable to Join Quiz
          </h1>

          <p className="mb-6 text-red-600">
            {error}
          </p>

          <button
            onClick={() => {
              window.location.href = "/join";
            }}
            className="rounded-lg bg-black px-6 py-3 font-semibold text-white"
          >
            Back to Join
          </button>
        </div>
      </main>
    );
  }

  if (!quiz) {
    return null;
  }

  const question = quiz.questions[current];

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-4xl">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">

          <div>
            <h1 className="text-3xl font-bold">
              QUIZER
            </h1>

            <p className="mt-1 text-gray-600">
              Quiz Code: {quiz.code}
            </p>
          </div>

          <div className="text-right">
            <p className="font-medium">
              {participantName}
            </p>

            <p className="text-gray-600">
              Question {current + 1} of{" "}
              {quiz.questions.length}
            </p>
          </div>

        </div>

        {/* Quiz title */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold">
            {quiz.title}
          </h2>

          {quiz.description && (
            <p className="mt-1 text-gray-600">
              {quiz.description}
            </p>
          )}
        </div>

        {/* Question */}
        <div className="rounded-2xl border p-6 shadow-sm">

          <h3 className="mb-6 text-xl font-semibold">
            {question.question}
          </h3>

          {/* Options */}
          <div className="space-y-3">

            {question.options.map(
              (option, optionIndex) => {

                const isSelected =
                  selected === optionIndex;

                return (
                  <button
                    key={optionIndex}
                    onClick={() =>
                      selectAnswer(optionIndex)
                    }
                    className={`w-full rounded-lg border p-4 text-left transition ${
                      isSelected
                        ? "border-black bg-gray-200"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <span className="mr-3 font-semibold">
                      {String.fromCharCode(
                        65 + optionIndex
                      )}
                      .
                    </span>

                    {option}
                  </button>
                );
              }
            )}

          </div>

          {/* Error */}
          {error && (
            <p className="mt-4 rounded-lg bg-red-50 p-3 text-red-600">
              {error}
            </p>
          )}

          {/* Navigation */}
          <div className="mt-6 flex gap-3">

            <button
              onClick={previous}
              disabled={current === 0}
              className="w-1/2 rounded-lg border px-6 py-3 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>

            <button
              onClick={next}
              className="w-1/2 rounded-lg bg-black px-6 py-3 font-semibold text-white"
            >
              {current === quiz.questions.length - 1
                ? "Submit Quiz"
                : "Next"}
            </button>

          </div>

        </div>

        {/* Progress */}
        <div className="mt-6">

          <div className="mb-2 flex justify-between text-sm text-gray-600">
            <span>Progress</span>

            <span>
              {current + 1} / {quiz.questions.length}
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full bg-black transition-all"
              style={{
                width: `${
                  ((current + 1) /
                    quiz.questions.length) *
                  100
                }%`,
              }}
            />
          </div>

        </div>

      </div>
    </main>
  );
}