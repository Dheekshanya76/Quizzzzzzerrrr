import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center">

        <h1 className="text-5xl font-bold">
          QUIZER
        </h1>

        <p className="text-gray-600 mt-3 mb-8">
          Test your knowledge with fun quizzes.
        </p>

        <Link
          href="/join"
          className="inline-block bg-black text-white px-8 py-3 rounded-lg"
        >
          Join Quiz
        </Link>

      </div>
    </main>
  );
}