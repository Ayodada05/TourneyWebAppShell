import Link from "next/link";

export default function MatchDetailPage() {
  return (
    <section className="space-y-3">
      <h1 className="text-3xl font-semibold">Match Details</h1>
      <p className="text-slate-700">
        Match summary and scoring details will appear here.
      </p>
      <nav className="flex gap-4 text-sm font-semibold text-slate-900">
        <Link href="/" className="hover:underline">
          Home
        </Link>
        <Link href="/tournaments" className="hover:underline">
          Tournaments
        </Link>
      </nav>
    </section>
  );
}
