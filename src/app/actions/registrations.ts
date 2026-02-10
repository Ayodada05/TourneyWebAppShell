"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type RegistrationActionResult = {
  ok: boolean;
  message: string;
};

export async function registerForTournamentAction(
  tournamentId: string
): Promise<RegistrationActionResult> {
  if (!tournamentId) {
    return { ok: false, message: "Missing tournament." };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data: authData, error: authError } = await supabase.auth.getUser();
    const user = authData?.user;

    if (authError || !user) {
      return { ok: false, message: "Not logged in." };
    }

    const { data: tournament, error: tournamentError } = await supabase
      .from("tournaments")
      .select("id,status")
      .eq("id", tournamentId)
      .maybeSingle();

    if (tournamentError) {
      return { ok: false, message: tournamentError.message };
    }

    if (!tournament) {
      return { ok: false, message: "Tournament not found." };
    }

    if (tournament.status !== "open") {
      return { ok: false, message: "Registrations are closed." };
    }

    const { data: team, error: teamError } = await supabase
      .from("teams")
      .select("id")
      .eq("created_by", user.id)
      .maybeSingle();

    if (teamError) {
      return { ok: false, message: "Could not load team." };
    }

    if (!team) {
      return { ok: false, message: "No team found." };
    }

    const { data: existing, error: existingError } = await supabase
      .from("registrations")
      .select("id")
      .eq("tournament_id", tournamentId)
      .eq("team_id", team.id)
      .maybeSingle();

    if (existingError) {
      return { ok: false, message: existingError.message };
    }

    if (existing) {
      return { ok: false, message: "Already registered." };
    }

    const { error: insertError } = await supabase.from("registrations").insert({
      tournament_id: tournamentId,
      team_id: team.id,
      status: "pending"
    });

    if (insertError) {
      const lower = insertError.message.toLowerCase();
      const isDuplicate = insertError.code === "23505" || lower.includes("unique");
      if (isDuplicate) {
        return { ok: false, message: "Already registered." };
      }
      return { ok: false, message: "Could not register." };
    }

    revalidatePath(`/tournaments/${tournamentId}`);
    revalidatePath(`/tournaments/${tournamentId}/manage/registrations`);

    return { ok: true, message: "Registration submitted." };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not register.";
    return { ok: false, message };
  }
}

export async function setRegistrationStatusAction(
  registrationId: string,
  status: "approved" | "rejected"
): Promise<RegistrationActionResult> {
  if (!registrationId) {
    return { ok: false, message: "Missing registration." };
  }

  if (status !== "approved" && status !== "rejected") {
    return { ok: false, message: "Invalid status." };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data: authData, error: authError } = await supabase.auth.getUser();
    const user = authData?.user;

    if (authError || !user) {
      return { ok: false, message: "Not logged in." };
    }

    const { data: registration, error: registrationError } = await supabase
      .from("registrations")
      .select("id,tournament_id,status")
      .eq("id", registrationId)
      .maybeSingle();

    if (registrationError) {
      return { ok: false, message: registrationError.message };
    }

    if (!registration) {
      return { ok: false, message: "Registration not found." };
    }

    const { data: tournament, error: tournamentError } = await supabase
      .from("tournaments")
      .select("created_by")
      .eq("id", registration.tournament_id)
      .maybeSingle();

    if (tournamentError) {
      return { ok: false, message: tournamentError.message };
    }

    if (!tournament) {
      return { ok: false, message: "Tournament not found." };
    }

    const { data: staffRows, error: staffError } = await supabase
      .from("tournament_staff")
      .select("id")
      .eq("tournament_id", registration.tournament_id)
      .eq("user_id", user.id)
      .limit(1);

    if (staffError) {
      return { ok: false, message: staffError.message };
    }

    const allowed = tournament.created_by === user.id || (staffRows?.length ?? 0) > 0;
    if (!allowed) {
      return { ok: false, message: "Forbidden." };
    }

    const { data: updated, error: updateError } = await supabase
      .from("registrations")
      .update({ status })
      .eq("id", registration.id)
      .select("id,status")
      .single();

    if (updateError) {
      return { ok: false, message: updateError.message };
    }

    if (!updated) {
      return { ok: false, message: "Update failed." };
    }

    revalidatePath(`/tournaments/${registration.tournament_id}`);
    revalidatePath(`/tournaments/${registration.tournament_id}/manage/registrations`);

    return {
      ok: true,
      message: status === "approved" ? "Registration approved." : "Registration rejected."
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update registration.";
    return { ok: false, message };
  }
}
