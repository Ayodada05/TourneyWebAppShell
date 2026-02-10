import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { signOutAction } from "@/app/actions/auth";
import AuthForms from "@/components/AuthForms";

const features = [
  {
    title: "Fast team registration",
    description: "Get captains signed up quickly with clear status tracking.",
    icon: "⚡"
  },
  {
    title: "Score confirmation and disputes",
    description: "Resolve score issues with consistent confirmation flows.",
    icon: "✅"
  },
  {
    title: "Auto progression to knockout",
    description: "Move teams through brackets without manual updates.",
    icon: "🏆"
  }
];

export default async function HomePage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  let hasTeam = false;
  if (user) {
    const { data: team } = await supabase
      .from("teams")
      .select("id")
      .eq("created_by", user.id)
      .limit(1)
      .maybeSingle();
    hasTeam = !!team;
  }

  const cta = !user
    ? { href: "/login", label: "Login to get started" }
    : !hasTeam
      ? { href: "/teams/new", label: "Create your team" }
      : { href: "/tournaments", label: "Browse tournaments" };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
      <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12">
        <div className="space-y-8 lg:col-span-7">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-100">
              EA FC Clubs Tournament Manager
            </span>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Run EA FC Clubs tournaments without the chaos.
            </h1>
            <p className="max-w-prose text-base leading-relaxed text-slate-600 sm:text-lg">
              Organizers create tournaments, captains register teams, captains submit scores, and
              staff resolve disputes with confidence and clear standings.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {features.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100">
                  <span className="text-sm">{item.icon}</span>
                </div>
                <h3 className="mt-3 text-sm font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{item.description}</p>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap gap-3">
              <Link
                href={cta.href}
                className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
              >
                {cta.label}
              </Link>
              <Link
                href="/tournaments"
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-900 hover:bg-slate-50"
              >
                Browse tournaments
              </Link>
            </div>
            <Link
              href="/tournaments"
              className="text-sm font-medium text-indigo-700 hover:text-indigo-800"
            >
              View all tournaments
            </Link>
          </div>

          <p className="text-sm text-slate-500">Built for captains and organizers.</p>
        </div>

        <div className="lg:col-span-5">
          {!user ? (
            <div className="space-y-6 rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm">
              <div className="space-y-2">
                <h2 className="text-lg font-semibold text-slate-900">Access Auto Webify</h2>
                <p className="text-sm text-slate-600">Sign in or create a new account.</p>
              </div>
              <div className="space-y-6">
                <AuthForms variant="panel" />
              </div>
            </div>
          ) : (
            <div className="space-y-4 rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm">
              <div className="space-y-1">
                <p className="text-sm text-slate-600">Signed in as {user.email}</p>
                <h2 className="text-lg font-semibold text-slate-900">Access Auto Webify</h2>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-900 hover:bg-slate-50"
                >
                  Dashboard
                </Link>
                <form action={signOutAction} className="w-full sm:w-auto">
                  <button
                    type="submit"
                    className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 sm:w-auto"
                  >
                    Sign out
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
