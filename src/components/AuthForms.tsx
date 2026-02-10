"use client";

import { useActionState } from "react";
import { signInAction, signUpAction } from "@/app/actions/auth";

const initialState = { ok: false, message: "" };

type AuthFormsProps = {
  variant?: "stacked" | "panel";
};

export default function AuthForms({ variant = "stacked" }: AuthFormsProps) {
  const [signUpState, signUpFormAction] = useActionState(signUpAction, initialState);
  const [signInState, signInFormAction] = useActionState(signInAction, initialState);

  const sectionClass = variant === "panel" ? "space-y-6" : "space-y-4";

  return (
    <div className={sectionClass}>
      <form action={signInFormAction} className="space-y-3">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-slate-900">Sign in</h3>
          <p className="text-xs text-slate-500">Use your email and password.</p>
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
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
        >
          Sign in
        </button>
        {signInState.message && (
          <div
            className={
              signInState.ok
                ? "rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800"
                : "rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800"
            }
          >
            {signInState.message}
          </div>
        )}
      </form>

      <div className="border-t border-slate-200" />

      <form action={signUpFormAction} className="space-y-3">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-slate-900">Sign up</h3>
          <p className="text-xs text-slate-500">Create a new account.</p>
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
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
        >
          Sign up
        </button>
        {signUpState.message && (
          <div
            className={
              signUpState.ok
                ? "rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800"
                : "rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800"
            }
          >
            {signUpState.message}
          </div>
        )}
      </form>
    </div>
  );
}
