import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import StatusToggle from "./StatusToggle";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";

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

type TournamentRow = {
  id: string;
  name: string;
  status: string;
  start_date: string | null;
  end_date: string | null;
  created_at: string | null;
  created_by: string | null;
};

export default async function ManageTournamentsPage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  if (!user) {
    redirect("/login");
  }

  const { data: staffRows, error: staffError } = await supabase
    .from("tournament_staff")
    .select("tournament_id")
    .eq("user_id", user.id);

  if (staffError) {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold">My Tournaments</h1>
        <p className="text-sm text-rose-600">{staffError.message}</p>
      </section>
    );
  }

  const staffIds = (staffRows ?? []).map((row) => row.tournament_id);

  let query = supabase
    .from("tournaments")
    .select("id,name,status,start_date,end_date,created_at,created_by")
    .order("created_at", { ascending: false })
    .limit(50);

  if (staffIds.length > 0) {
    query = query.or(`created_by.eq.${user.id},id.in.(${staffIds.join(",")})`);
  } else {
    query = query.eq("created_by", user.id);
  }

  const { data: tournaments, error } = await query;

  return (
    <section className="space-y-8">
      <div className="space-y-2">
        <p className="text-xs font-medium text-slate-500">Manage</p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          My tournaments
        </h1>
        <p className="text-slate-600">Tournaments you can manage.</p>
      </div>

      {error ? (
        <p className="text-sm text-rose-600">Unable to load tournaments.</p>
      ) : tournaments && tournaments.length > 0 ? (
        <Card className="space-y-4">
          {tournaments.map((tournament: TournamentRow) => (
            <div
              key={tournament.id}
              className="flex flex-col gap-4 border-b border-slate-100 pb-4 last:border-none last:pb-0 md:flex-row md:items-center md:justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/tournaments/${tournament.id}`}
                    className="text-base font-semibold text-slate-900 hover:text-blue-600"
                  >
                    {tournament.name}
                  </Link>
                  <Badge variant={tournament.status as "draft" | "open" | "ongoing" | "completed"}>
                    {tournament.status}
                  </Badge>
                </div>
                <div className="text-xs text-slate-500">
                  Starts {formatDate(tournament.start_date)}
                  {tournament.end_date ? ` · Ends ${formatDate(tournament.end_date)}` : ""}
                </div>
                <Link
                  href={`/tournaments/${tournament.id}/manage`}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                >
                  Manage tournament
                </Link>
              </div>
              <StatusToggle tournamentId={tournament.id} currentStatus={tournament.status} />
            </div>
          ))}
        </Card>
      ) : (
        <EmptyState
          title="No tournaments to manage yet"
          description="Create a tournament or ask a staff member to add you."
        />
      )}
    </section>
  );
}
