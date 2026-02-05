import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import StatusToggle from "./StatusToggle";
import DeleteTournamentForm from "./DeleteTournamentForm";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

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

export default async function ManageTournamentPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  if (!user) {
    redirect("/login");
  }

  const { data: tournament, error } = await supabase
    .from("tournaments")
    .select("id,name,status,start_date,end_date,created_by")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold">Unable to load tournament</h1>
        <p className="text-sm text-rose-600">{error.message}</p>
        <Link href="/dashboard" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
          Back to dashboard
        </Link>
      </section>
    );
  }

  if (!tournament) {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold">Tournament not found</h1>
        <Link href="/dashboard" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
          Back to dashboard
        </Link>
      </section>
    );
  }

  const { data: staffRows, error: staffError } = await supabase
    .from("tournament_staff")
    .select("id")
    .eq("tournament_id", id)
    .eq("user_id", user.id)
    .limit(1);

  if (staffError) {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold">Unable to load tournament</h1>
        <p className="text-sm text-rose-600">{staffError.message}</p>
        <Link href="/dashboard" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
          Back to dashboard
        </Link>
      </section>
    );
  }

  const allowed = tournament.created_by === user.id || (staffRows?.length ?? 0) > 0;
  if (!allowed) {
    redirect("/dashboard");
  }

  return (
    <section className="space-y-8">
      <Card className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-slate-500">Manage tournament</p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              {tournament.name}
            </h1>
          </div>
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
      </Card>

      <Card className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold">Status</h2>
        <p className="text-slate-600">Toggle draft and open states.</p>
        </div>
        <StatusToggle tournamentId={tournament.id} currentStatus={tournament.status} />
      </Card>

      <Card className="space-y-2">
        <h2 className="text-lg font-semibold">Manage registrations</h2>
        <p className="text-slate-600">Review teams and update registration status.</p>
        <Link
          href={`/tournaments/${tournament.id}/manage/registrations`}
          className="text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          Go to registrations
        </Link>
      </Card>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-rose-700">Delete tournament</h2>
        <p className="text-slate-600">
          Deleting removes the tournament and related data. Only draft or completed tournaments can
          be deleted.
        </p>
        <DeleteTournamentForm tournamentId={tournament.id} />
      </section>
    </section>
  );
}
