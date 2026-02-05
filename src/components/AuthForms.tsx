"use client";

import { useActionState } from "react";
import { signInAction, signUpAction } from "@/app/actions/auth";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

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
          <Input id="signin-email" name="email" type="email" required />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="signin-password">
            Password
          </label>
          <Input id="signin-password" name="password" type="password" required />
        </div>
        <Button type="submit" className="w-full bg-slate-900 text-white hover:bg-slate-800">
          Sign in
        </Button>
        {signInState.message && (
          <div
            className={`rounded-xl border p-3 text-sm ${
              signInState.ok
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-red-200 bg-red-50 text-red-800"
            }`}
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
          <Input id="signup-email" name="email" type="email" required />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="signup-password">
            Password
          </label>
          <Input id="signup-password" name="password" type="password" required />
        </div>
        <Button type="submit" variant="secondary" className="w-full">
          Sign up
        </Button>
        {signUpState.message && (
          <div
            className={`rounded-xl border p-3 text-sm ${
              signUpState.ok
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-red-200 bg-red-50 text-red-800"
            }`}
          >
            {signUpState.message}
          </div>
        )}
      </form>
    </div>
  );
}
