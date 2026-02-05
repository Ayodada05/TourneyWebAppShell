import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { signOutAction } from "@/app/actions/auth";
import { buttonClasses } from "@/components/ui/Button";
import HeaderNav from "@/components/HeaderNav";

export default async function SiteHeader() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  const links = [
    { href: "/", label: "Home" },
    { href: "/tournaments", label: "Tournaments" },
    ...(user ? [{ href: "/tournaments/manage", label: "Manage" }] : [])
  ];

  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-semibold tracking-tight text-slate-900">
            Auto Webify
          </Link>
          <HeaderNav links={links} />
        </div>
        <div className="flex items-center gap-3">
          {!user && (
            <Link href="/login" className={buttonClasses("primary")}>
              Login
            </Link>
          )}
          {user && (
            <Link href="/dashboard" className={buttonClasses("secondary")}>
              Dashboard
            </Link>
          )}
          {user && (
            <form action={signOutAction}>
              <button type="submit" className={buttonClasses("secondary")}>
                Sign out
              </button>
            </form>
          )}
        </div>
      </div>
    </header>
  );
}
