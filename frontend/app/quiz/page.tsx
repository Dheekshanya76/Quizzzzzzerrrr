"use client";

import { useEffect, useState } from "react";
import {
  getQuizByCode,
  submitQuiz as submitQuizApi,
  type QuizResponse,
} from "../../lib/api";

export default function QuizPage() {
  const [quiz, setQuiz] = useState<QuizResponse | null>(null);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<
    (number | null)[]
  >([]);
  const [participantName, setParticipantName] =
    useState("");
  const [participantId, setParticipantId] =
    useState("");
  const [quizCode, setQuizCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadQuiz() {
      const params = new URLSearchParams(
        window.location.search
      );

      const name =
        params.get("name") || "Participant";

      const code = (
        params.get("code") || ""
      ).toUpperCase();

      const id =
        params.get("participantId") || "";

      setParticipantName(name);
      setQuizCode(code);
      setParticipantId(id);

      if (!code) {
        setError("Quiz code is missing.");
        setLoading(false);
        return;
      }

      if (!id) {
        setError(
          "Participant information is missing. Please join the quiz again."
        );
        setLoading(false);
        return;
      }

      try {
        const quizData =
          await getQuizByCode(code);

        if (
          !quizData.questions ||
          quizData.questions.length === 0
        ) {
          setError(
            "This quiz does not contain any questions."
          );
          setLoading(false);
          return;
        }

        setQuiz(quizData);

        setAnswers(
          new Array(
            quizData.questions.length
          ).fill(null)
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load quiz."
        );
      } finally {
        setLoading(false);
      }
    }

    loadQuiz();
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

    if (
      current ===
      quiz.questions.length - 1
    ) {
      submitQuiz(updatedAnswers);
      return;
    }

    const nextQuestion = current + 1;

    setCurrent(nextQuestion);

    setSelected(
      updatedAnswers[nextQuestion] ?? null
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
      updatedAnswers[previousQuestion] ?? null
    );

    setError("");
  }

  async function submitQuiz(
    finalAnswers: (number | null)[]
  ) {
    if (!quiz) return;

    if (!participantId) {
      setError(
        "Participant ID is missing. Please join the quiz again."
      );
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const formattedAnswers =
        quiz.questions.map(
          (question, index) => {
            const selectedIndex =
              finalAnswers[index];

            if (
              selectedIndex === null ||
              selectedIndex === undefined
            ) {
              return null;
            }

            const selectedOption =
              question.options[selectedIndex];

            if (!selectedOption) {
              return null;
            }

            return {
              questionId: question.id,
              selectedOptionId:
                selectedOption.id,
            };
          }
        ).filter(
          (
            answer
          ): answer is {
            questionId: string | number;
            selectedOptionId: string | number;
          } => answer !== null
        );

      const result =
        await submitQuizApi(
          quizCode,
          participantId,
          formattedAnswers
        );

      window.location.href =
        `/results?name=${encodeURIComponent(
          participantName
        )}&code=${encodeURIComponent(
          quizCode
        )}&score=${result.score}&total=${result.total}&participantId=${encodeURIComponent(
          participantId
        )}`;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to submit quiz."
      );
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <p className="text-lg">
          Loading quiz...
        </p>
      </main>
    );
  }

  if (error && !quiz) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-xl rounded-2xl border p-8 text-center shadow-sm">
          <h1 className="mb-4 text-2xl font-bold">
            Unable to Load Quiz
          </h1>

          <p className="mb-6 text-red-600">
            {error}
          </p>

          <button
            onClick={() => {
              window.location.href =
                "/join";
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

  const question =
    quiz.questions[current];

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
              Quiz Code: {quizCode}
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

        {/* Quiz information */}
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
            {question.questionText}
          </h3>

          {/* Question image */}
          {question.imageUrl && (
            <img
              src={question.imageUrl}
              alt="Question"
              className="mb-6 max-h-80 w-full rounded-lg object-contain"
            />
          )}

          {/* Options */}
          <div className="space-y-3">

            {question.options.map(
              (option, optionIndex) => {
                const isSelected =
                  selected === optionIndex;

                return (
                  <button
                    key={String(option.id)}
                    onClick={() =>
                      selectAnswer(optionIndex)
                    }
                    disabled={submitting}
                    className={`w-full rounded-lg border p-4 text-left transition ${
                      isSelected
                        ? "border-black bg-gray-200"
                        : "hover:bg-gray-50"
                    } disabled:cursor-not-allowed disabled:opacity-60`}
                  >
                    <span className="mr-3 font-semibold">
                      {String.fromCharCode(
                        65 + optionIndex
                      )}
                      .
                    </span>

                    {option.text}
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
              disabled={
                current === 0 ||
                submitting
              }
              className="w-1/2 rounded-lg border px-6 py-3 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>

            <button
              onClick={next}
              disabled={submitting}
              className="w-1/2 rounded-lg bg-black px-6 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting
                ? "Submitting..."
                : current ===
                    quiz.questions.length - 1
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
              {current + 1} /{" "}
              {quiz.questions.length}
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