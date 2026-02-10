import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import { buttonClasses } from "@/components/ui/Button";

function formatDate(value: string | null) {
  if (!value) return "TBD";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "TBD";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

export default async function TournamentsPage() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("tournaments")
    .select("id,name,status,start_date,end_date")
    .eq("status", "open")
    .order("created_at", { ascending: false });

  return (
    <section className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
      <div className="space-y-2">
        <p className="text-xs font-medium text-slate-500">Browse</p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Tournaments
        </h1>
        <p className="text-slate-600">Browse open tournaments.</p>
      </div>

      {error ? (
        <p className="text-sm text-rose-600">Unable to load tournaments.</p>
      ) : data && data.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {data.map((tournament) => (
            <Card key={tournament.id} className="flex h-full flex-col gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-lg font-semibold text-slate-900">{tournament.name}</h2>
                  <Badge variant={tournament.status === "open" ? "open" : "draft"}>
                    {tournament.status}
                  </Badge>
                </div>
                <p className="text-sm text-slate-600">
                  Starts {formatDate(tournament.start_date)}
                  {tournament.end_date ? ` · Ends ${formatDate(tournament.end_date)}` : ""}
                </p>
              </div>
              <Link href={`/tournaments/${tournament.id}`} className={buttonClasses("secondary")}>
                View tournament
              </Link>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No open tournaments yet"
          description="Check back soon for upcoming events."
        />
      )}
    </section>
  );
}
