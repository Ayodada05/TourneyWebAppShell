import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/login");
  }

  return (
    <section className="space-y-3">
      <h1 className="text-3xl font-semibold">Dashboard</h1>
      <p className="text-slate-700">Logged in as {data.user.email}</p>
    </section>
  );
}
