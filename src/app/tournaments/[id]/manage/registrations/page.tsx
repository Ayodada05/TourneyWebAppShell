import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import Button from "@/components/ui/Button";

type PageProps = {
  params: Promise<{ id: string }> | { id: string };
};

type RegistrationRow = {
  id: string;
  status: string;
  teams: { name: string } | null;
};

export default async function ManageRegistrationsPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/login");
  }

  const { data: tournament } = await supabase
    .from("tournaments")
    .select("id,name,created_by")
    .eq("id", id)
    .maybeSingle();

  if (!tournament) {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold">Tournament not found</h1>
        <Link href="/tournaments/manage" className="text-sm font-semibold text-blue-600">
          Back to manage
        </Link>
      </section>
    );
  }

  const { data: staffRows } = await supabase
    .from("tournament_staff")
    .select("id")
    .eq("tournament_id", id)
    .eq("user_id", data.user.id)
    .limit(1);

  const allowed = tournament.created_by === data.user.id || (staffRows?.length ?? 0) > 0;
  if (!allowed) {
    redirect("/dashboard");
  }

  const { data: registrations } = await supabase
    .from("registrations")
    .select("id,status,teams(name)")
    .eq("tournament_id", id)
    .order("created_at", { ascending: false });

  return (
    <section className="space-y-8">
      <div className="space-y-2">
        <p className="text-xs font-medium text-slate-500">Registrations</p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          {tournament.name}
        </h1>
        <p className="text-slate-600">Review and update registration status.</p>
      </div>

      {registrations && registrations.length > 0 ? (
        <Card className="space-y-4">
          {registrations.map((registration: RegistrationRow) => (
            <div
              key={registration.id}
              className="flex flex-col gap-3 border-b border-slate-100 pb-4 last:border-none last:pb-0 md:flex-row md:items-center md:justify-between"
            >
              <div className="space-y-1">
                <div className="text-sm font-semibold text-slate-900">
                  {registration.teams?.name ?? "Unknown team"}
                </div>
                <Badge variant={registration.status as "pending" | "approved" | "rejected"}>
                  {registration.status}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="secondary" disabled>
                  Approve
                </Button>
                <Button type="button" variant="danger" disabled>
                  Reject
                </Button>
              </div>
            </div>
          ))}
        </Card>
      ) : (
        <EmptyState title="No registrations yet" description="Check back when teams apply." />
      )}
    </section>
  );
}
