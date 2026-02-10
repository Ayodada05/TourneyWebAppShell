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
      <div className="min-h-[calc(100vh-64px)] bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <section className="space-y-4">
            <h1 className="text-2xl font-semibold text-slate-900">
              Unable to load tournament
            </h1>
            <p className="text-sm text-rose-600">{error.message}</p>
            <Link
              href="/dashboard"
              className="text-sm font-semibold text-indigo-700 hover:text-indigo-800"
            >
              Back to dashboard
            </Link>
          </section>
        </div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <section className="space-y-4">
            <h1 className="text-2xl font-semibold text-slate-900">
              Tournament not found
            </h1>
            <Link
              href="/dashboard"
              className="text-sm font-semibold text-indigo-700 hover:text-indigo-800"
            >
              Back to dashboard
            </Link>
          </section>
        </div>
      </div>
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
      <div className="min-h-[calc(100vh-64px)] bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <section className="space-y-4">
            <h1 className="text-2xl font-semibold text-slate-900">
              Unable to load tournament
            </h1>
            <p className="text-sm text-rose-600">{staffError.message}</p>
            <Link
              href="/dashboard"
              className="text-sm font-semibold text-indigo-700 hover:text-indigo-800"
            >
              Back to dashboard
            </Link>
          </section>
        </div>
      </div>
    );
  }

  const allowed = tournament.created_by === user.id || (staffRows?.length ?? 0) > 0;
  if (!allowed) {
    redirect("/dashboard");
  }

  return (
    <div>
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-500">Manage tournament</p>
            <h1 className="mt-1 truncate text-3xl font-bold tracking-tight text-slate-900">
              {tournament.name}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-sm text-slate-600">Status</span>
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
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 hover:bg-slate-50"
              href={`/tournaments/${id}`}
            >
              View tournament
            </Link>
            <Link
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 hover:bg-slate-50"
              href="/tournaments/manage"
            >
              Back to manage list
            </Link>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8 space-y-6">
            <Card className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Tournament controls
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Toggle draft and open states.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <StatusToggle
                    tournamentId={tournament.id}
                    currentStatus={tournament.status}
                  />
                </div>
              </div>
            </Card>

            <Card className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Registrations</h2>
              <p className="mt-1 text-sm text-slate-600">
                Review teams and approve or reject registrations.
              </p>
              <Link
                href={`/tournaments/${tournament.id}/manage/registrations`}
                className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 sm:w-auto"
              >
                Manage registrations
              </Link>
            </Card>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <Card className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Tournament summary</h2>
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
                className="mt-3"
              >
                {tournament.status}
              </Badge>
              <dl className="mt-4 space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-sm text-slate-600">Starts</dt>
                  <dd className="text-sm font-medium text-slate-900">
                    {formatDate(tournament.start_date)}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-sm text-slate-600">Ends</dt>
                  <dd className="text-sm font-medium text-slate-900">
                    {tournament.end_date ? formatDate(tournament.end_date) : "TBD"}
                  </dd>
                </div>
              </dl>
            </Card>

            <Card className="w-full rounded-2xl border border-red-200 bg-red-50/40 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-red-700">Danger zone</h2>
              <p className="mt-1 text-sm text-slate-600">
                Deleting removes the tournament and related data. Only draft or completed
                tournaments can be deleted.
              </p>
              <div className="mt-4">
                <DeleteTournamentForm tournamentId={tournament.id} showHeader={false} />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
