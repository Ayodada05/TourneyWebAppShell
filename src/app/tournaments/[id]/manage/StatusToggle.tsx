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
import { cn } from "@/lib/cn";

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

  useEffect(() => {
    if (state.ok) {
      router.refresh();
    }
  }, [state.ok, router]);

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="tournamentId" value={tournamentId} />
      <div className="inline-flex rounded-xl border border-slate-300 bg-white p-1">
        <Button
          type="submit"
          name="nextStatus"
          value="draft"
          variant="ghost"
          disabled={disabled || isDraft}
          className={cn(
            "rounded-lg px-4 py-2 text-sm font-medium",
            isDraft
              ? "bg-slate-900 text-white"
              : "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50"
          )}
        >
          Draft
        </Button>
        <Button
          type="submit"
          name="nextStatus"
          value="open"
          variant="ghost"
          disabled={disabled || isOpen}
          className={cn(
            "rounded-lg px-4 py-2 text-sm font-medium",
            isOpen
              ? "bg-slate-900 text-white"
              : "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50"
          )}
        >
          Open
        </Button>
      </div>
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
