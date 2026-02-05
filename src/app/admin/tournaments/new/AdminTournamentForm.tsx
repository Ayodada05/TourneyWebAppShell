"use client";

import { useActionState } from "react";
import { createTournamentAction, type CreateTournamentState } from "@/app/actions/tournament-admin";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";

const initialState: CreateTournamentState = { ok: false, message: "" };

export default function AdminTournamentForm() {
  const [state, formAction] = useActionState(createTournamentAction, initialState);

  return (
    <Card>
      <form action={formAction} className="space-y-4">
        <div className="space-y-1">
          <label htmlFor="tournament-name" className="text-sm font-medium text-slate-700">
            Name
          </label>
          <Input
            id="tournament-name"
            name="name"
            type="text"
            required
            placeholder="Enter tournament name"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <label htmlFor="start-date" className="text-sm font-medium text-slate-700">
              Start date
            </label>
            <Input id="start-date" name="start_date" type="date" />
          </div>
          <div className="space-y-1">
            <label htmlFor="end-date" className="text-sm font-medium text-slate-700">
              End date
            </label>
            <Input id="end-date" name="end_date" type="date" />
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="status" className="text-sm font-medium text-slate-700">
            Initial status
          </label>
          <select
            id="status"
            name="status"
            defaultValue="draft"
            className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
          >
            <option value="draft">Draft</option>
            <option value="open">Open</option>
          </select>
        </div>

        <Button type="submit">Create tournament</Button>

        {state.message && (
          <Alert variant={state.ok ? "success" : "error"}>{state.message}</Alert>
        )}
      </form>
    </Card>
  );
}
