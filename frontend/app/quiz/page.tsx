"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getQuizByCode,
  submitQuiz,
  type QuizResponse,
} from "../../lib/api";

export default function QuizPage() {
  const router = useRouter();

  const [quiz, setQuiz] =
    useState<QuizResponse | null>(null);

  const [current, setCurrent] = useState(0);

  const [answers, setAnswers] =
    useState<Record<string, string>>({});

  const [participantName, setParticipantName] =
    useState("");

  const [participantId, setParticipantId] =
    useState("");

  const [quizCode, setQuizCode] =
    useState("");

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

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

      try {
        const data =
          await getQuizByCode(code);

        if (
          !data.questions ||
          data.questions.length === 0
        ) {
          setError(
            "This quiz does not contain any questions."
          );
          setLoading(false);
          return;
        }

        setQuiz(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load quiz."
        );
      } finally {
        setLoading(false);
      }
    }

    loadQuiz();
  }, []);

  function selectAnswer(
    optionId: string
  ) {
    if (!quiz) return;

    const questionId = String(
      quiz.questions[current].id
    );

    setAnswers((previous) => ({
      ...previous,
      [questionId]: optionId,
    }));

    setError("");
  }

  async function next() {
    if (!quiz) return;

    const question =
      quiz.questions[current];

    const selectedOptionId =
      answers[String(question.id)];

    if (!selectedOptionId) {
      setError(
        "Please select an answer."
      );
      return;
    }

    if (
      current <
      quiz.questions.length - 1
    ) {
      setCurrent(
        (previous) => previous + 1
      );
      setError("");
      return;
    }

    if (!participantId) {
      setError(
        "Participant ID is missing."
      );
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const result =
        await submitQuiz(
          quizCode,
          participantId,
          quiz.questions.map(
            (item) => ({
              questionId: item.id,
              selectedOptionId:
                answers[String(item.id)],
            })
          )
        );

      /*
       * IMPORTANT:
       * Backend returns totalQuestions,
       * NOT total.
       */
      const totalQuestions =
        result.totalQuestions;

      router.push(
        `/results?name=${encodeURIComponent(
          participantName
        )}&code=${encodeURIComponent(
          quizCode
        )}&score=${encodeURIComponent(
          String(result.score)
        )}&total=${encodeURIComponent(
          String(totalQuestions)
        )}`
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to submit quiz."
      );
    } finally {
      setSubmitting(false);
    }
  }

  function previous() {
    if (current > 0) {
      setCurrent(
        (previous) => previous - 1
      );
      setError("");
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

  if (!quiz) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-xl rounded-2xl border p-8 text-center shadow-sm">
          <h1 className="mb-4 text-2xl font-bold">
            Unable to Load Quiz
          </h1>

          <p className="mb-6 text-red-600">
            {error || "Quiz not found."}
          </p>

          <button
            onClick={() =>
              router.push("/join")
            }
            className="rounded-lg bg-black px-6 py-3 font-semibold text-white"
          >
            Back to Join
          </button>
        </div>
      </main>
    );
  }

  const question =
    quiz.questions[current];

  const selectedOptionId =
    answers[String(question.id)];

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-4xl">

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

        <div className="rounded-2xl border p-6 shadow-sm">

          <h3 className="mb-6 text-xl font-semibold">
            {question.questionText}
          </h3>

          {question.imageUrl && (
            <img
              src={question.imageUrl}
              alt="Question"
              className="mb-6 max-h-80 w-full rounded-lg object-contain"
            />
          )}

          <div className="space-y-3">

            {question.options.map(
              (option, optionIndex) => {

                const isSelected =
                  selectedOptionId ===
                  String(option.id);

                return (
                  <button
                    key={String(option.id)}
                    onClick={() =>
                      selectAnswer(
                        String(option.id)
                      )
                    }
                    disabled={submitting}
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

                    {option.text}
                  </button>
                );
              }
            )}

          </div>

          {error && (
            <p className="mt-4 rounded-lg bg-red-50 p-3 text-red-600">
              {error}
            </p>
          )}

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
              className="w-1/2 rounded-lg bg-black px-6 py-3 font-semibold text-white disabled:opacity-50"
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

        <div className="mt-6">

          <div className="mb-2 flex justify-between text-sm text-gray-600">
            <span>
              Progress
            </span>

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