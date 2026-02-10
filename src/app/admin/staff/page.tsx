import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth/admin";
import Card from "@/components/ui/Card";

export default async function AdminStaffPage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  if (!user || !isAdmin(user.id)) {
    redirect("/dashboard");
  }

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs font-medium text-slate-500">Admin</p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Staff management
        </h1>
        <p className="text-slate-600">Assign staff to tournaments.</p>
      </div>
      <Card>
        <p className="text-sm text-slate-600">Staff management tools will be added here.</p>
      </Card>
    </section>
  );
}
