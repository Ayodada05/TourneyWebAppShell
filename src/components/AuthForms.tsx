"use client";

import { useActionState } from "react";
import { signInAction, signUpAction } from "@/app/actions/auth";

const initialState = { ok: false, message: "" };

export default function AuthForms() {
  const [signUpState, signUpFormAction] = useActionState(signUpAction, initialState);
  const [signInState, signInFormAction] = useActionState(signInAction, initialState);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <form action={signUpFormAction} className="space-y-3 rounded border border-slate-200 p-4">
        <div>
          <h2 className="text-lg font-semibold">Sign up</h2>
          <p className="text-sm text-slate-600">Create a new account.</p>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="signup-email">
            Email
          </label>
          <input
            id="signup-email"
            name="email"
            type="email"
            required
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="signup-password">
            Password
          </label>
          <input
            id="signup-password"
            name="password"
            type="password"
            required
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Sign up
        </button>
        {signUpState.message && (
          <p className={`text-sm ${signUpState.ok ? "text-emerald-600" : "text-rose-600"}`}>
            {signUpState.message}
          </p>
        )}
      </form>

      <form action={signInFormAction} className="space-y-3 rounded border border-slate-200 p-4">
        <div>
          <h2 className="text-lg font-semibold">Sign in</h2>
          <p className="text-sm text-slate-600">Use an existing account.</p>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="signin-email">
            Email
          </label>
          <input
            id="signin-email"
            name="email"
            type="email"
            required
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="signin-password">
            Password
          </label>
          <input
            id="signin-password"
            name="password"
            type="password"
            required
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded border border-slate-900 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100"
        >
          Sign in
        </button>
        {signInState.message && (
          <p className={`text-sm ${signInState.ok ? "text-emerald-600" : "text-rose-600"}`}>
            {signInState.message}
          </p>
        )}
      </form>
    </div>
  );
}
