import { HTMLAttributes } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "purple" | "green" | "yellow" | "red" | "blue";
}

const variants = {
  purple: "bg-violet-500/20 text-violet-300 border-violet-500/30",
  green: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  yellow: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  red: "bg-red-500/20 text-red-300 border-red-500/30",
  blue: "bg-blue-500/20 text-blue-300 border-blue-500/30",
};

export function Badge({
  variant = "purple",
  children,
  className = "",
  ...props
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
