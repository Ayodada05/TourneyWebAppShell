"use client";

import Link from "next/link";
import { useActionState } from "react";
import { registerMyTeamAction, type RegisterResult } from "@/app/actions/tournaments";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Alert from "@/components/ui/Alert";

const initialState: RegisterResult = { ok: false, message: "" };

type RegisterCardProps = {
  tournamentId: string;
  loggedIn: boolean;
  team: { id: string; name: string } | null;
  registration: { id: string; status: string } | null;
};

export default function RegisterCard({
  tournamentId,
  loggedIn,
  team,
  registration
}: RegisterCardProps) {
  const [state, formAction] = useActionState(registerMyTeamAction, initialState);

  if (!loggedIn) {
    return (
      <Card className="space-y-3">
        <h3 className="text-lg font-semibold">Registration</h3>
        <Alert variant="info">Login to register a team.</Alert>
        <Link href="/login" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
          Go to login
        </Link>
      </Card>
    );
  }

  if (!team) {
    return (
      <Card className="space-y-3">
        <h3 className="text-lg font-semibold">Registration</h3>
        <Alert variant="info">Create a team to register.</Alert>
        <Link
          href="/teams/new"
          className="text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          Create a team
        </Link>
      </Card>
    );
  }

  if (registration) {
    return (
      <Card className="space-y-3">
        <h3 className="text-lg font-semibold">Registration</h3>
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-600">{team.name}</div>
          <Badge variant={registration.status as "pending" | "approved" | "rejected"}>
            {registration.status}
          </Badge>
        </div>
        <p className="text-sm text-slate-600">You are already registered for this tournament.</p>
      </Card>
    );
  }

  return (
    <Card className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Registration</h3>
        <p className="text-sm text-slate-600">Register your team to reserve a slot.</p>
      </div>
      <div className="space-y-2">
        <div className="text-sm font-semibold text-slate-900">{team.name}</div>
        <div className="text-xs text-slate-500">Team id: {team.id}</div>
      </div>
      <form action={formAction} className="space-y-3">
        <input type="hidden" name="tournamentId" value={tournamentId} />
        <Button type="submit">Register team</Button>
        {state.message && (
          <Alert variant={state.ok ? "success" : "error"}>{state.message}</Alert>
        )}
      </form>
    </Card>
  );
}
