import Link from "next/link";
import Card from "@/components/ui/Card";

export default function MatchDetailPage() {
  return (
    <section className="space-y-8">
      <div className="space-y-2">
        <p className="text-xs font-medium text-slate-500">Match</p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Match details
        </h1>
        <p className="text-slate-600">Match summary and scoring details will appear here.</p>
      </div>
      <Card className="space-y-3">
        <p className="text-sm text-slate-600">Score reporting and highlights are coming soon.</p>
        <div className="flex flex-wrap gap-3">
          <Link href="/" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
            Home
          </Link>
          <Link
            href="/tournaments"
            className="text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            Tournaments
          </Link>
        </div>
      </Card>
    </section>
  );
}
