"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type CreateTeamState = {
  ok: boolean;
  message: string;
  teamId?: string;
};

export type MyTeamResult = {
  ok: boolean;
  message?: string;
  team?: {
    id: string;
    name: string;
    created_at: string;
  } | null;
};

function resolveFormData(
  formDataOrState: CreateTeamState | FormData,
  maybeFormData?: FormData
) {
  if (formDataOrState instanceof FormData) {
    return formDataOrState;
  }
  return maybeFormData;
}

function normalizeTeamName(input: string) {
  return input.trim().replace(/\s+/g, " ");
}

export async function createTeamAction(
  formDataOrState: CreateTeamState | FormData,
  maybeFormData?: FormData
): Promise<CreateTeamState> {
  const formData = resolveFormData(formDataOrState, maybeFormData);
  const name = formData?.get("name");

  if (typeof name !== "string") {
    return { ok: false, message: "Team name is required." };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error: authError } = await supabase.auth.getUser();
  const user = data?.user;

  if (authError || !user) {
    redirect("/login");
  }

  const normalized = normalizeTeamName(name);
  if (normalized.length < 3) {
    return { ok: false, message: "Team name must be at least 3 characters." };
  }
  if (normalized.length > 40) {
    return { ok: false, message: "Team name must be 40 characters or less." };
  }

  try {
    const { data: existing, error: existingError } = await supabase
      .from("teams")
      .select("id,name")
      .ilike("name", normalized)
      .limit(3);

    if (!existingError && existing && existing.length > 0) {
      const normalizedLower = normalized.toLowerCase();
      const conflict = existing.some(
        (team) => normalizeTeamName(team.name).toLowerCase() === normalizedLower
      );
      if (conflict) {
        return { ok: false, message: "Team name already taken" };
      }
    }

    const { data: insertData, error } = await supabase
      .from("teams")
      .insert({
        name: normalized,
        created_by: user.id
      })
      .select("id")
      .single();

    if (error) {
      const lowerMessage = error.message.toLowerCase();
      const isUnique = error.code === "23505" || lowerMessage.includes("unique");
      const message =
        isUnique && error.message.includes("teams_created_by_unique")
          ? "This account already has a team"
          : isUnique && error.message.includes("teams_one_per_user")
            ? "This account already has a team"
            : isUnique && error.message.includes("teams_name_unique")
              ? "Team name already taken"
              : isUnique && error.message.includes("teams_name_unique_norm")
                ? "Team name already taken"
              : isUnique && lowerMessage.includes("created_by")
                ? "This account already has a team"
              : isUnique
                ? "Team name already taken"
                : "Could not create team";

      return { ok: false, message };
    }

    return { ok: true, message: "", teamId: insertData?.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create team";
    return { ok: false, message };
  }

}

export async function getMyTeamAction(): Promise<MyTeamResult> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error: authError } = await supabase.auth.getUser();
    const user = data?.user;

    if (authError || !user) {
      return { ok: false, message: authError?.message ?? "Not logged in.", team: null };
    }

    const { data: team, error } = await supabase
      .from("teams")
      .select("id,name,created_at")
      .eq("created_by", user.id)
      .maybeSingle();

    if (error) {
      return { ok: false, message: error.message, team: null };
    }

    if (!team) {
      return { ok: true, team: null };
    }

    return {
      ok: true,
      team: {
        id: team.id,
        name: team.name,
        created_at: team.created_at
      }
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { ok: false, message, team: null };
  }
}
