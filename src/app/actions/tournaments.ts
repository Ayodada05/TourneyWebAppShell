"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type TournamentSummary = {
  id: string;
  name: string;
  status: string;
  start_date: string | null;
  end_date: string | null;
};

export type TournamentResult = {
  ok: boolean;
  tournament: TournamentSummary | null;
  message?: string;
};

export type RegisterResult = {
  ok: boolean;
  message: string;
};

export async function getOpenTournamentsAction() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("tournaments")
      .select("id,name,status,start_date,end_date")
      .eq("status", "open")
      .order("created_at", { ascending: false });

    if (error) {
      return { ok: false, tournaments: [], message: error.message };
    }

    return { ok: true, tournaments: data ?? [] };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { ok: false, tournaments: [], message };
  }
}

export async function getTournamentByIdAction(tournamentId: string): Promise<TournamentResult> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("tournaments")
      .select("id,name,status,start_date,end_date")
      .eq("id", tournamentId)
      .maybeSingle();

    if (error) {
      return { ok: false, tournament: null, message: error.message };
    }

    return { ok: true, tournament: data ?? null };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { ok: false, tournament: null, message };
  }
}

export async function registerMyTeamAction(
  _prevState: RegisterResult,
  formData: FormData
): Promise<RegisterResult> {
  const tournamentId = formData.get("tournamentId");

  if (typeof tournamentId !== "string" || !tournamentId) {
    return { ok: false, message: "Missing tournament" };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data: authData, error: authError } = await supabase.auth.getUser();
    const user = authData?.user;

    if (authError || !user) {
      return { ok: false, message: "Not logged in" };
    }

    const { data: team, error: teamError } = await supabase
      .from("teams")
      .select("id")
      .eq("created_by", user.id)
      .maybeSingle();

    if (teamError) {
      return { ok: false, message: "Could not load team" };
    }

    if (!team) {
      return { ok: false, message: "No team found" };
    }

    const { error } = await supabase.from("registrations").insert({
      tournament_id: tournamentId,
      team_id: team.id,
      status: "pending"
    });

    if (error) {
      const lower = error.message.toLowerCase();
      const isDuplicate = error.code === "23505" || lower.includes("unique");
      if (isDuplicate) {
        return { ok: false, message: "Already registered" };
      }
      return { ok: false, message: "Could not register" };
    }

    revalidatePath(`/tournaments/${tournamentId}`);
    return { ok: true, message: "Registered successfully" };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not register";
    return { ok: false, message };
  }
}
