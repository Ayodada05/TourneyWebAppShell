"use client";

import { useActionState } from "react";
import { deleteTournamentAction, type DeleteTournamentState } from "@/app/actions/tournament-manage";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";

const initialState: DeleteTournamentState = { ok: false, message: "" };

type DeleteTournamentFormProps = {
  tournamentId: string;
  showHeader?: boolean;
};

export default function DeleteTournamentForm({
  tournamentId,
  showHeader = true
}: DeleteTournamentFormProps) {
  const [state, formAction] = useActionState(deleteTournamentAction, initialState);

  return (
    <div className="space-y-4">
      {showHeader && (
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-red-700">Danger zone</h3>
          <p className="text-sm text-slate-600">
            Deleting removes the tournament and related data. Only draft or completed tournaments
            can be deleted.
          </p>
        </div>
      )}
      <form action={formAction} className="space-y-3">
        <input type="hidden" name="tournamentId" value={tournamentId} />
        <div className="space-y-1">
          <label htmlFor="confirm-delete" className="text-sm font-medium text-red-900">
            Type DELETE to confirm
          </label>
          <Input
            id="confirm-delete"
            name="confirmText"
            type="text"
            placeholder="DELETE"
          />
        </div>
        <Button type="submit" variant="danger" className="w-full sm:w-auto">
          Delete tournament
        </Button>
        {state.message && (
          <Alert variant={state.ok ? "success" : "error"}>{state.message}</Alert>
        )}
      </form>
    </div>
  );
}
