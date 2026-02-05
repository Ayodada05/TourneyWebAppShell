import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getMyTeamAction } from "@/app/actions/teams";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import { buttonClasses } from "@/components/ui/Button";

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/login");
  }

  const myTeam = await getMyTeamAction();

  return (
    <section className="space-y-8">
      <div className="space-y-2">
        <p className="text-xs font-medium text-slate-500">Dashboard</p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Your overview
        </h1>
        <p className="text-slate-600">Logged in as {data.user.email}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <Card className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">My Team</h2>
              <p className="text-sm text-slate-600">Your captain team profile.</p>
            </div>
            {!myTeam.ok ? (
              <p className="text-sm text-rose-600">Failed to load team info.</p>
            ) : myTeam.team ? (
              <div className="space-y-2 text-sm text-slate-700">
                <div className="space-y-1">
                  <div className="text-base font-semibold text-slate-900">{myTeam.team.name}</div>
                  <div className="font-mono text-xs text-slate-500">{myTeam.team.id}</div>
                </div>
              </div>
            ) : (
              <EmptyState
                title="No team yet"
                description="Create your team to start registering for tournaments."
                action={
                  <Link href="/teams/new" className={buttonClasses("primary")}>
                    Create a team
                  </Link>
                }
              />
            )}
          </Card>
        </div>

        <div className="lg:col-span-5">
          <Card className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Quick actions</h2>
              <p className="text-sm text-slate-600">Common places to jump to.</p>
            </div>
            <div className="space-y-2">
              <Link href="/tournaments" className={buttonClasses("secondary")}>
                Browse tournaments
              </Link>
              <Link href="/tournaments/manage" className={buttonClasses("secondary")}>
                Manage tournaments
              </Link>
              {!myTeam.team && (
                <Link href="/teams/new" className={buttonClasses("primary")}>
                  Create a team
                </Link>
              )}
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
