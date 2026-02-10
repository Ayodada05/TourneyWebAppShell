import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getMyTeamAction } from "@/app/actions/teams";
import Card from "@/components/ui/Card";
import { buttonClasses } from "@/components/ui/Button";

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/login");
  }

  const myTeam = await getMyTeamAction();

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <section className="py-10">
        <div className="mb-8 space-y-2">
          <p className="text-sm text-slate-500">Dashboard</p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Your overview</h1>
          <p className="text-slate-600">Logged in as {data.user.email}</p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Card className="space-y-4 p-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">My Team</h2>
                <p className="text-sm text-slate-600">Your captain team profile.</p>
              </div>
              {!myTeam.ok ? (
                <p className="text-sm text-rose-600">Failed to load team info.</p>
              ) : myTeam.team ? (
                <div className="space-y-2 text-sm text-slate-700">
                  <div className="space-y-1">
                    <div className="text-base font-semibold text-slate-900">
                      {myTeam.team.name}
                    </div>
                    <div className="font-mono text-xs text-slate-500">{myTeam.team.id}</div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-8 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-700">
                    <span className="text-lg">🏆</span>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-semibold text-slate-900">No team yet</h3>
                    <p className="text-sm text-slate-600">
                      Create your team to start registering for tournaments.
                    </p>
                  </div>
                  <Link
                    href="/teams/new"
                    className="inline-flex max-w-[240px] items-center justify-center rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
                  >
                    Create a team
                  </Link>
                </div>
              )}
            </Card>
          </div>

          <div className="lg:col-span-5">
            <Card className="space-y-4 p-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Quick actions</h2>
                <p className="text-sm text-slate-600">Common places to jump to.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                {!myTeam.team && (
                  <Link href="/teams/new" className={buttonClasses("primary") + " py-2.5"}>
                    Create a team
                  </Link>
                )}
                <Link href="/tournaments" className={buttonClasses("secondary") + " py-2.5"}>
                  Browse tournaments
                </Link>
                <Link href="/tournaments/manage" className={buttonClasses("secondary") + " py-2.5"}>
                  Manage tournaments
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
