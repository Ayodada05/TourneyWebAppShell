import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin";
import AdminTournamentForm from "./AdminTournamentForm";

export default async function AdminCreateTournamentPage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  if (!user) {
    redirect("/login");
  }

  if (!isAdmin(user.id)) {
    redirect("/dashboard");
  }

  return (
    <section className="space-y-8">
      <div className="space-y-2">
        <p className="text-xs font-medium text-slate-500">Admin</p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Create tournament
        </h1>
        <p className="text-slate-600">Developer only tournament creation.</p>
      </div>
      <div className="max-w-2xl">
        <AdminTournamentForm />
      </div>
    </section>
  );
}
