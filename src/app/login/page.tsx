import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import AuthForms from "@/components/AuthForms";

export default async function LoginPage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();

  if (data.user) {
    redirect("/dashboard");
  }

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">Login</h1>
        <p className="text-slate-700">
          Use your email and password to access your tournaments.
        </p>
      </div>
      <AuthForms />
    </section>
  );
}
