import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getMyTeamAction } from "@/app/actions/teams";
import TeamForm from "./TeamForm";

export default async function NewTeamPage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/login");
  }

  const myTeam = await getMyTeamAction();
  if (myTeam.ok && myTeam.team) {
    redirect("/dashboard");
  }

  return (
    <section className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
      <div className="space-y-2">
        <p className="text-xs font-medium text-slate-500">Team setup</p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Create team
        </h1>
        <p className="text-slate-600">Each account can create one team.</p>
      </div>
      <div className="max-w-xl">
        <TeamForm />
      </div>
    </section>
  );
}
