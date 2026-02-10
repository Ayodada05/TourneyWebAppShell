import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth/admin";
import AuthForms from "@/components/AuthForms";

export default async function LoginPage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();

  if (data.user) {
    redirect(isAdmin(data.user.id) ? "/admin" : "/dashboard");
  }

  return (
    <section className="flex min-h-[70vh] items-center justify-center">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <p className="text-xs font-medium text-slate-500">Auto Webify</p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Login</h1>
          <p className="text-slate-600">Use your email and password to access your tournaments.</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur">
          <AuthForms variant="panel" />
        </div>
      </div>
    </section>
  );
}
