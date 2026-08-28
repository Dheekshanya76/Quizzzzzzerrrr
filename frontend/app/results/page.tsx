type ResultsPageProps = {
  searchParams: Promise<{
    score?: string;
    total?: string;
  }>;
};

export default async function ResultsPage({
  searchParams,
}: ResultsPageProps) {
  const params = await searchParams;

  const score = params.score || "0";
  const total = params.total || "0";

  return (
    <main className="max-w-2xl mx-auto p-8 text-center">
      <h1 className="text-3xl font-bold mb-6">
        Quiz Completed!
      </h1>

      <p className="text-xl mb-6">
        Your Score: {score} / {total}
      </p>

      <a
        href="/"
        className="inline-block bg-black text-white px-6 py-3 rounded-lg"
      >
        Back to Home
      </a>
    </main>
  );
}