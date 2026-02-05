"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

type NavLink = {
  href: string;
  label: string;
};

type HeaderNavProps = {
  links: NavLink[];
};

export default function HeaderNav({ links }: HeaderNavProps) {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-2">
      {links.map((link) => {
        const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm font-medium transition",
              active ? "text-indigo-700" : "text-slate-700 hover:text-slate-900"
            )}
            aria-current={active ? "page" : undefined}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
