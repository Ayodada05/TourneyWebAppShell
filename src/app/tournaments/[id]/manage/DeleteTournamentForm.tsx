"use client";

import { useActionState } from "react";
import { deleteTournamentAction, type DeleteTournamentState } from "@/app/actions/tournament-manage";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";

const initialState: DeleteTournamentState = { ok: false, message: "" };

type DeleteTournamentFormProps = {
  tournamentId: string;
};

export default function DeleteTournamentForm({ tournamentId }: DeleteTournamentFormProps) {
  const [state, formAction] = useActionState(deleteTournamentAction, initialState);

  return (
    <Card className="border-rose-200 bg-rose-50">
      <form action={formAction} className="space-y-3">
        <input type="hidden" name="tournamentId" value={tournamentId} />
        <div className="space-y-1">
          <label htmlFor="confirm-delete" className="text-sm font-medium text-rose-900">
            Type DELETE to confirm
          </label>
          <Input
            id="confirm-delete"
            name="confirmText"
            type="text"
            placeholder="DELETE"
            className="border-rose-300 bg-white"
          />
        </div>
        <Button type="submit" variant="danger">
          Delete tournament
        </Button>
        {state.message && (
          <Alert variant={state.ok ? "success" : "error"}>{state.message}</Alert>
        )}
      </form>
    </Card>
  );
}
