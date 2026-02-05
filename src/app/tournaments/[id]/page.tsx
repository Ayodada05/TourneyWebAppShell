import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import RegisterCard from "./RegisterCard";

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

type PageProps = {
  params: Promise<{ id: string }> | { id: string };
};

export default async function TournamentDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: tournament } = await supabase
    .from("tournaments")
    .select("id,name,status,start_date,end_date,created_by")
    .eq("id", id)
    .maybeSingle();

  if (!tournament) {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold">Tournament not found</h1>
        <Link href="/tournaments" className="text-sm text-blue-600 hover:text-blue-700">
          Back to tournaments
        </Link>
      </section>
    );
  }

  const { data: authData } = await supabase.auth.getUser();
  const user = authData?.user ?? null;

  let canManage = false;
  let team: { id: string; name: string } | null = null;
  let registration: { id: string; status: string } | null = null;
  if (user) {
    const { data: teamRow } = await supabase
      .from("teams")
      .select("id,name")
      .eq("created_by", user.id)
      .maybeSingle();
    team = teamRow ?? null;

    if (tournament.created_by === user.id) {
      canManage = true;
    } else {
      const { data: staffRows } = await supabase
        .from("tournament_staff")
        .select("id")
        .eq("tournament_id", tournament.id)
        .eq("user_id", user.id)
        .limit(1);
      canManage = (staffRows?.length ?? 0) > 0;
    }

    if (team) {
      const { data: registrationRow } = await supabase
        .from("registrations")
        .select("id,status,team_id")
        .eq("tournament_id", tournament.id)
        .eq("team_id", team.id)
        .maybeSingle();
      registration = registrationRow ?? null;
    }
  }

  return (
    <section className="space-y-8">
      <Card className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {tournament.name}
          </h1>
          <Badge
            variant={
              tournament.status === "open"
                ? "open"
                : tournament.status === "draft"
                  ? "draft"
                  : tournament.status === "ongoing"
                    ? "ongoing"
                    : "completed"
            }
          >
            {tournament.status}
          </Badge>
        </div>
        <p className="text-slate-600">
          Starts {formatDate(tournament.start_date)}
          {tournament.end_date ? ` · Ends ${formatDate(tournament.end_date)}` : ""}
        </p>
        {canManage ? (
          <Link
            href={`/tournaments/${tournament.id}/manage`}
            className="text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            Manage tournament
          </Link>
        ) : null}
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-7">
          <Card className="space-y-3">
            <h2 className="text-lg font-semibold">Tournament details</h2>
            <p className="text-sm text-slate-600">
              Schedules, matchups, and updates will appear here once the event is live.
            </p>
          </Card>
          <Card className="space-y-3">
            <h3 className="text-lg font-semibold">Schedule</h3>
            <p className="text-sm text-slate-600">Schedule data will be published soon.</p>
          </Card>
        </div>
        <div className="lg:col-span-5">
          <RegisterCard
            tournamentId={tournament.id}
            loggedIn={!!user}
            team={team}
            registration={registration}
          />
        </div>
      </div>
    </section>
  );
}
