import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { signOutAction } from "@/app/actions/auth";

const links = [
  { href: "/", label: "Home" },
  { href: "/tournaments", label: "Tournaments" }
];

export default async function Header() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  return (
    <header className="bg-slate-900 text-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-6 px-6 py-4">
        <nav className="flex items-center gap-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-semibold uppercase tracking-wide hover:text-slate-200"
            >
              {link.label}
            </Link>
          ))}
          {!user && (
            <Link
              href="/login"
              className="text-sm font-semibold uppercase tracking-wide hover:text-slate-200"
            >
              Login
            </Link>
          )}
          {user && (
            <Link
              href="/dashboard"
              className="text-sm font-semibold uppercase tracking-wide hover:text-slate-200"
            >
              Dashboard
            </Link>
          )}
        </nav>
        {user && (
          <form action={signOutAction}>
            <button
              type="submit"
              className="rounded border border-white/50 px-3 py-1 text-xs font-semibold uppercase tracking-wide hover:bg-white/10"
            >
              Sign out
            </button>
          </form>
        )}
      </div>
    </header>
  );
}
