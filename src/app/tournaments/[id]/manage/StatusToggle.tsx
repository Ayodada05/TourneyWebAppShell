"use client";

import { useActionState } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  toggleDraftOpenAction,
  type ToggleStatusState
} from "@/app/actions/tournament-manage";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";

const initialState: ToggleStatusState = { ok: false, message: "" };

type StatusToggleProps = {
  tournamentId: string;
  currentStatus: string;
};

export default function StatusToggle({ tournamentId, currentStatus }: StatusToggleProps) {
  const [state, formAction] = useActionState(toggleDraftOpenAction, initialState);
  const router = useRouter();

  const isDraft = currentStatus === "draft";
  const isOpen = currentStatus === "open";
  const disabled = !isDraft && !isOpen;
  const nextStatus = isDraft ? "open" : "draft";

  useEffect(() => {
    if (state.ok) {
      router.refresh();
    }
  }, [state.ok, router]);

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="tournamentId" value={tournamentId} />
      <input type="hidden" name="nextStatus" value={nextStatus} />
      <Button type="submit" variant="secondary" disabled={disabled}>
        {isDraft ? "Open tournament" : "Set back to draft"}
      </Button>
      {disabled && (
        <Alert variant="info" className="text-xs">
          Toggle disabled for this status.
        </Alert>
      )}
      {state.message && (
        <Alert variant={state.ok ? "success" : "error"} className="text-xs">
          {state.message}
        </Alert>
      )}
    </form>
  );
}
