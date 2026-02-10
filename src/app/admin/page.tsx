import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth/admin";
import Card from "@/components/ui/Card";
import { buttonClasses } from "@/components/ui/Button";

export default async function AdminPage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  if (!user || !isAdmin(user.id)) {
    redirect("/dashboard");
  }

  return (
    <section className="mx-auto max-w-6xl space-y-8">
      <div className="space-y-2">
        <p className="text-xs font-medium text-slate-500">Admin</p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Admin tools
        </h1>
        <p className="text-slate-600">Developer only tools.</p>
      </div>
      <Card className="space-y-3">
        <Link href="/admin/tournaments/new" className={buttonClasses("primary")}>
          Create tournament
        </Link>
        <Link href="/admin/staff" className={buttonClasses("secondary")}>
          Manage tournament staff
        </Link>
      </Card>
    </section>
  );
}
