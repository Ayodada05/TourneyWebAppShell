import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type AlertVariant = "success" | "error" | "info";

type AlertProps = HTMLAttributes<HTMLDivElement> & {
  variant?: AlertVariant;
};

const variantClasses: Record<AlertVariant, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  error: "border-red-200 bg-red-50 text-red-700",
  info: "border-slate-200 bg-white text-slate-700"
};

export default function Alert({ className, variant = "info", ...props }: AlertProps) {
  return (
    <div
      role="status"
      className={cn("rounded-xl border px-4 py-3 text-sm", variantClasses[variant], className)}
      {...props}
    />
  );
}
