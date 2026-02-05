"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
export type ToggleStatusState = {
  ok: boolean;
  message: string;
};

export type DeleteTournamentState = {
  ok: boolean;
  message: string;
};

export async function toggleDraftOpenAction(
  _prevState: ToggleStatusState,
  formData: FormData
): Promise<ToggleStatusState> {
  const tournamentId = formData.get("tournamentId");
  const nextStatus = formData.get("nextStatus");

  if (typeof tournamentId !== "string" || !tournamentId) {
    return { ok: false, message: "Missing tournament." };
  }

  if (nextStatus !== "draft" && nextStatus !== "open") {
    return { ok: false, message: "Invalid status" };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error: authError } = await supabase.auth.getUser();
  const user = data?.user;

  if (authError || !user) {
    redirect("/login");
  }

  const { data: tournament, error: tournamentError } = await supabase
    .from("tournaments")
    .select("created_by")
    .eq("id", tournamentId)
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
    .eq("tournament_id", tournamentId)
    .eq("user_id", user.id)
    .limit(1);

  if (staffError) {
    return { ok: false, message: staffError.message };
  }

  const allowed = tournament.created_by === user.id || (staffRows?.length ?? 0) > 0;
  if (!allowed) {
    return { ok: false, message: "Forbidden" };
  }

  const { data: updated, error } = await supabase
    .from("tournaments")
    .update({ status: nextStatus })
    .eq("id", tournamentId)
    .select("id,status,updated_at")
    .single();

  if (error) {
    return { ok: false, message: error.message };
  }

  if (!updated) {
    return { ok: false, message: "No rows updated (likely RLS blocked)" };
  }

  if (updated.status !== nextStatus) {
    return { ok: false, message: "Update did not persist" };
  }

  revalidatePath("/tournaments");
  revalidatePath(`/tournaments/${tournamentId}`);
  revalidatePath(`/tournaments/${tournamentId}/manage`);
  revalidatePath("/tournaments/manage");

  return { ok: true, message: `Status is now ${updated.status}` };
}

export async function deleteTournamentAction(
  _prevState: DeleteTournamentState,
  formData: FormData
): Promise<DeleteTournamentState> {
  const tournamentId = formData.get("tournamentId");
  const confirmText = formData.get("confirmText");

  if (typeof tournamentId !== "string" || !tournamentId) {
    return { ok: false, message: "Missing tournament." };
  }

  if (confirmText !== "DELETE") {
    return { ok: false, message: "Type DELETE to confirm." };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error: authError } = await supabase.auth.getUser();
  const user = data?.user;

  if (authError || !user) {
    redirect("/login");
  }

  const { data: tournament, error: tournamentError } = await supabase
    .from("tournaments")
    .select("status,created_by")
    .eq("id", tournamentId)
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
    .eq("tournament_id", tournamentId)
    .eq("user_id", user.id)
    .limit(1);

  if (staffError) {
    return { ok: false, message: staffError.message };
  }

  const allowed = tournament.created_by === user.id || (staffRows?.length ?? 0) > 0;
  if (!allowed) {
    return { ok: false, message: "Forbidden" };
  }

  if (tournament.status !== "draft" && tournament.status !== "completed") {
    return { ok: false, message: "Only draft or completed tournaments can be deleted." };
  }

  const { data: deleted, error } = await supabase
    .from("tournaments")
    .delete()
    .eq("id", tournamentId)
    .select("id")
    .single();

  if (error) {
    return { ok: false, message: error.message };
  }

  if (!deleted) {
    return { ok: false, message: "No rows deleted (likely RLS blocked)" };
  }

  revalidatePath("/tournaments");
  revalidatePath(`/tournaments/${tournamentId}`);
  revalidatePath(`/tournaments/${tournamentId}/manage`);
  redirect("/tournaments");
}
