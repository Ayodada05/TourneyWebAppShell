"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth/admin";

export type CreateTournamentState = {
  ok: boolean;
  message: string;
};

function normalizeText(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export async function createTournamentAction(
  _prevState: CreateTournamentState,
  formData: FormData
): Promise<CreateTournamentState> {
  const nameInput = formData.get("name");
  const statusInput = formData.get("status");
  const startDateInput = formData.get("start_date");
  const endDateInput = formData.get("end_date");

  if (typeof nameInput !== "string") {
    return { ok: false, message: "Tournament name is required." };
  }

  const name = normalizeText(nameInput);
  if (name.length < 3) {
    return { ok: false, message: "Tournament name must be at least 3 characters." };
  }
  if (name.length > 80) {
    return { ok: false, message: "Tournament name must be 80 characters or less." };
  }

  if (statusInput !== "draft" && statusInput !== "open") {
    return { ok: false, message: "Invalid status selected." };
  }

  const startDate = typeof startDateInput === "string" && startDateInput ? startDateInput : null;
  const endDate = typeof endDateInput === "string" && endDateInput ? endDateInput : null;

  const supabase = await createSupabaseServerClient();
  const { data, error: authError } = await supabase.auth.getUser();
  const user = data?.user;

  if (authError || !user) {
    redirect("/login");
  }

  if (!isAdmin(user.id)) {
    return { ok: false, message: "Forbidden" };
  }

  const { data: insertData, error } = await supabase
    .from("tournaments")
    .insert({
      name,
      status: statusInput,
      start_date: startDate,
      end_date: endDate,
      created_by: user.id
    })
    .select("id")
    .single();

  if (error) {
    return { ok: false, message: error.message };
  }

  const tournamentId = insertData?.id;
  if (!tournamentId) {
    return { ok: false, message: "Tournament created but missing id." };
  }

  const { error: staffError } = await supabase.from("tournament_staff").insert({
    tournament_id: tournamentId,
    user_id: user.id,
    role: "owner"
  });

  if (staffError) {
    return { ok: false, message: staffError.message };
  }

  revalidatePath("/tournaments");
  revalidatePath(`/tournaments/${tournamentId}`);
  revalidatePath(`/tournaments/${tournamentId}/manage`);
  redirect(`/tournaments/${tournamentId}/manage`);
}
