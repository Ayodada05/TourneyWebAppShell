"use client";

import { useEffect } from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { createTeamAction, type CreateTeamState } from "@/app/actions/teams";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import Alert from "@/components/ui/Alert";

const initialState: CreateTeamState = { ok: false, message: "" };

export default function TeamForm() {
  const [state, formAction] = useActionState(createTeamAction, initialState);
  const router = useRouter();

  useEffect(() => {
    if (state.ok) {
      router.push("/dashboard");
    }
  }, [state.ok, router]);

  return (
    <Card>
      <form action={formAction} className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700" htmlFor="team-name">
            Team name
          </label>
          <Input id="team-name" name="name" type="text" required placeholder="Enter team name" />
          <p className="text-xs text-slate-500">3 to 40 characters, unique name.</p>
        </div>
        <Button type="submit">Create team</Button>
        {state.message && (
          <Alert variant={state.ok ? "success" : "error"}>{state.message}</Alert>
        )}
        <p className="text-xs text-slate-500">
          One team per account. Team names are globally unique.
        </p>
      </form>
    </Card>
  );
}
