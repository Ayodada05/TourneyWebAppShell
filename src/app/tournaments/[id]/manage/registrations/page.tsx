import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { setRegistrationStatusAction } from "@/app/actions/registrations";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import Button from "@/components/ui/Button";

type PageProps = {
  params: Promise<{ id: string }> | { id: string };
};

type RegistrationRow = {
  id: string;
  status: string;
  created_at: string | null;
  teams: { name: string } | null;
};

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

export default async function ManageRegistrationsPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/login");
  }

  const { data: tournament } = await supabase
    .from("tournaments")
    .select("id,name,created_by")
    .eq("id", id)
    .maybeSingle();

  if (!tournament) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="space-y-4">
          <h1 className="text-2xl font-semibold">Tournament not found</h1>
          <Link
            href="/tournaments/manage"
            className="text-sm font-semibold text-indigo-700 hover:text-indigo-800"
          >
            Back to manage
          </Link>
        </section>
      </div>
    );
  }

  const { data: staffRows } = await supabase
    .from("tournament_staff")
    .select("id")
    .eq("tournament_id", id)
    .eq("user_id", data.user.id)
    .limit(1);

  const allowed = tournament.created_by === data.user.id || (staffRows?.length ?? 0) > 0;
  if (!allowed) {
    redirect("/tournaments");
  }

  const { data: registrations } = await supabase
    .from("registrations")
    .select("id,status,created_at,teams(name)")
    .eq("tournament_id", id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="space-y-8">
        <div className="space-y-2">
          <p className="text-sm text-slate-500">Manage</p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Manage registrations
          </h1>
          <p className="text-slate-600">{tournament.name}</p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-slate-500">Manage tournament registrations</div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={`/tournaments/${id}/manage`}
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 hover:bg-slate-50"
            >
              Back to tournament
            </Link>
          </div>
        </div>

        {registrations && registrations.length > 0 ? (
          <Card className="space-y-3 p-6">
            <div className="hidden grid-cols-12 gap-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:grid">
              <div className="col-span-5">Team</div>
              <div className="col-span-3">Status</div>
              <div className="col-span-2">Submitted</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>
            {registrations.map((registration: RegistrationRow) => (
              <div
                key={registration.id}
                className="grid grid-cols-1 gap-3 border-t border-slate-100 pt-3 sm:grid-cols-12 sm:items-center"
              >
                <div className="col-span-5">
                  <div className="text-sm font-semibold text-slate-900">
                    {registration.teams?.name ?? "Unknown team"}
                  </div>
                </div>
                <div className="col-span-3">
                  <Badge variant={registration.status as "pending" | "approved" | "rejected"}>
                    {registration.status}
                  </Badge>
                </div>
                <div className="col-span-2 text-sm text-slate-600">
                  {formatDate(registration.created_at)}
                </div>
                <div className="col-span-2 flex flex-wrap justify-start gap-2 sm:justify-end">
                  {registration.status === "pending" ? (
                    <>
                      <form
                        action={setRegistrationStatusAction.bind(
                          null,
                          registration.id,
                          "approved"
                        )}
                      >
                        <Button
                          type="submit"
                          variant="secondary"
                          className="bg-emerald-600 px-3 py-2 text-xs text-white hover:bg-emerald-700"
                        >
                          Approve
                        </Button>
                      </form>
                      <form
                        action={setRegistrationStatusAction.bind(
                          null,
                          registration.id,
                          "rejected"
                        )}
                      >
                        <Button type="submit" variant="danger" className="px-3 py-2 text-xs">
                          Reject
                        </Button>
                      </form>
                    </>
                  ) : (
                    <span className="text-xs text-slate-500">No actions</span>
                  )}
                </div>
              </div>
            ))}
          </Card>
        ) : (
          <Card className="p-6">
            <EmptyState
              title="No teams have registered yet."
              description="Check back when teams apply."
            />
          </Card>
        )}
      </section>
    </div>
  );
}
