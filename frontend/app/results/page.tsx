"use client";

import {
  useEffect,
  useState,
  Suspense,
} from "react";

import { useSearchParams } from "next/navigation";

import {
  getLeaderboard,
  type LeaderboardEntry,
} from "../../lib/api";

function ResultsContent() {
  const searchParams = useSearchParams();

  const name =
    searchParams.get("name") || "Participant";

  const code =
    searchParams.get("code") || "";

  const score =
    Number(searchParams.get("score")) || 0;

  const [leaderboard, setLeaderboard] =
    useState<LeaderboardEntry[]>([]);

  const [loadingLeaderboard, setLoadingLeaderboard] =
    useState(true);

  const [leaderboardError, setLeaderboardError] =
    useState("");

  /*
   * IMPORTANT:
   *
   * Do NOT use ?total= from the URL.
   *
   * The backend leaderboard already gives us
   * the correct totalQuestions.
   */
  const [totalQuestions, setTotalQuestions] =
    useState(0);

  useEffect(() => {
    if (!code) {
      setLoadingLeaderboard(false);
      return;
    }

    let cancelled = false;

    async function loadLeaderboard() {
      try {
        const data =
          await getLeaderboard(code);

        if (cancelled) return;

        setLeaderboard(data);

        /*
         * Every leaderboard entry belongs to the
         * same quiz, so totalQuestions is the same.
         *
         * Get it directly from the backend.
         */
        if (data.length > 0) {
          setTotalQuestions(
            Number(data[0].totalQuestions) || 0
          );
        }

        setLeaderboardError("");
      } catch (err) {
        if (!cancelled) {
          setLeaderboardError(
            err instanceof Error
              ? err.message
              : "Failed to load leaderboard."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingLeaderboard(false);
        }
      }
    }

    loadLeaderboard();

    /*
     * Refresh leaderboard every 3 seconds.
     * This allows multiple players to see
     * new submissions.
     */
    const interval =
      window.setInterval(
        loadLeaderboard,
        3000
      );

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [code]);

  /*
   * Calculate percentage using the real
   * number of questions from the backend.
   */
  const percentage =
    totalQuestions > 0
      ? Math.round(
          (score / totalQuestions) * 100
        )
      : 0;

  /*
   * Find the current player's rank.
   */
  const myIndex =
    leaderboard.findIndex(
      (entry) =>
        entry.participantName === name &&
        Number(entry.score) === score
    );

  const myRank =
    myIndex >= 0
      ? myIndex + 1
      : null;

  return (
    <main className="min-h-screen p-6">

      <div className="mx-auto max-w-4xl">

        {/* ================= HEADER ================= */}

        <div className="mb-10 text-center">

          <h1 className="text-4xl font-bold">
            Quiz Completed!
          </h1>

          <p className="mt-2 text-lg text-gray-600">
            Well done, {name}!
          </p>

          {code && (
            <p className="mt-2 text-gray-500">
              Quiz Code: {code}
            </p>
          )}

        </div>

        {/* ================= SCORE ================= */}

        <div className="rounded-2xl border p-10 text-center shadow-sm">

          <p className="text-lg text-gray-600">
            Your Score
          </p>

          <p className="mt-3 text-6xl font-bold">
            {score} / {totalQuestions}
          </p>

          <p className="mt-4 text-3xl font-semibold">
            {percentage}%
          </p>

          {myRank !== null && (
            <p className="mt-4 text-lg text-gray-600">
              Your Rank:{" "}
              <span className="font-bold text-black">
                #{myRank}
              </span>
            </p>
          )}

        </div>

        {/* ================= LEADERBOARD ================= */}

        <div className="mt-8 rounded-2xl border p-8 shadow-sm">

          <div className="mb-6 flex items-center justify-between">

            <h2 className="text-3xl font-bold">
              🏆 Leaderboard
            </h2>

            <span className="text-sm text-gray-500">
              Live
            </span>

          </div>

          {loadingLeaderboard ? (

            <p className="py-8 text-center text-gray-500">
              Loading leaderboard...
            </p>

          ) : leaderboardError ? (

            <p className="rounded-lg bg-red-50 p-4 text-red-600">
              {leaderboardError}
            </p>

          ) : leaderboard.length === 0 ? (

            <p className="py-8 text-center text-gray-500">
              No completed participants yet.
            </p>

          ) : (

            <div className="space-y-3">

              {leaderboard.map(
                (entry, index) => {

                  const rank =
                    index + 1;

                  const isCurrentPlayer =
                    entry.participantName ===
                      name &&
                    Number(entry.score) ===
                      score;

                  return (
                    <div
                      key={`${entry.participantName}-${index}`}
                      className={`flex items-center justify-between rounded-xl border p-5 ${
                        isCurrentPlayer
                          ? "bg-gray-100"
                          : ""
                      }`}
                    >

                      {/* PLAYER */}

                      <div className="flex items-center gap-4">

                        <div className="w-10 text-center text-2xl">

                          {rank === 1
                            ? "🥇"
                            : rank === 2
                              ? "🥈"
                              : rank === 3
                                ? "🥉"
                                : `#${rank}`}

                        </div>

                        <div>

                          <p className="font-semibold">

                            {entry.participantName}

                            {isCurrentPlayer && (
                              <span className="ml-2 text-sm text-gray-500">
                                (You)
                              </span>
                            )}

                          </p>

                          <p className="text-gray-500">
                            {entry.score} /{" "}
                            {entry.totalQuestions}
                          </p>

                        </div>

                      </div>

                      {/* PERCENTAGE */}

                      <div className="text-right">

                        <p className="font-bold">
                          {Number(
                            entry.percentage
                          ).toFixed(2)}
                          %
                        </p>

                      </div>

                    </div>
                  );
                }
              )}

            </div>
          )}

          <p className="mt-6 text-center text-sm text-gray-500">
            Leaderboard updates automatically
          </p>

        </div>

        {/* ================= JOIN ANOTHER ================= */}

        <button
          onClick={() =>
            (window.location.href =
              "/join")
          }
          className="mt-8 w-full rounded-lg bg-black py-4 font-semibold text-white"
        >
          Join Another Quiz
        </button>

      </div>

    </main>
  );
}

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center">
          <p>Loading...</p>
        </main>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}