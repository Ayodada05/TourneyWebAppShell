import { cn } from "@/lib/cn";
import type { HTMLAttributes } from "react";

type BadgeVariant =
  | "draft"
  | "open"
  | "pending"
  | "approved"
  | "rejected"
  | "ongoing"
  | "completed"
  | "default";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

const variantClasses: Record<BadgeVariant, string> = {
  draft: "bg-slate-100 text-slate-700",
  open: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
  ongoing: "bg-amber-100 text-amber-700",
  completed: "bg-indigo-100 text-indigo-700",
  default: "bg-slate-100 text-slate-700"
};

export default function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}
