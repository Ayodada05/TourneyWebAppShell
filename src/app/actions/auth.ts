"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth/admin";

export type AuthActionState = {
  ok: boolean;
  message: string;
};

const missingFields: AuthActionState = {
  ok: false,
  message: "Email and password are required."
};

export async function signUpAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
    return missingFields;
  }

  let userId: string | null = null;

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      return { ok: false, message: error.message };
    }

    userId = data.user?.id ?? null;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { ok: false, message };
  }

  if (userId) {
    redirect(isAdmin(userId) ? "/admin" : "/dashboard");
  }

  return { ok: true, message: "Sign up successful. Check your email if confirmation is required." };
}

export async function signInAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
    return missingFields;
  }

  let userId: string | null = null;

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return { ok: false, message: error.message };
    }

    userId = data.user?.id ?? null;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { ok: false, message };
  }

  if (userId) {
    redirect(isAdmin(userId) ? "/admin" : "/dashboard");
  }

  return { ok: true, message: "Signed in." };
}

export async function signOutAction(): Promise<void> {
  try {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  } catch {
    // Ignore sign-out errors to avoid breaking navigation.
  }
}
