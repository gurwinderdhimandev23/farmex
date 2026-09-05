import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "emerald" | "amber" | "blue" | "rose" | "slate" | "outline";
  size?: "sm" | "md";
  dotColor?: string;
  withDot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = "emerald",
  size = "md",
  dotColor,
  withDot = false,
  children,
  ...props
}) => {
  const variantStyles = {
    emerald: "bg-emerald-50 text-emerald-800 border-emerald-200/80",
    amber: "bg-amber-50 text-amber-800 border-amber-200/80",
    blue: "bg-blue-50 text-blue-800 border-blue-200/80",
    rose: "bg-rose-50 text-rose-800 border-rose-200/80",
    slate: "bg-slate-100 text-slate-700 border-slate-200/80",
    outline: "bg-white/70 text-slate-700 border-slate-300 backdrop-blur-2xs",
  };

  const defaultDots = {
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
    blue: "bg-blue-500",
    rose: "bg-rose-500",
    slate: "bg-slate-400",
    outline: "bg-slate-500",
  };

  const sizeStyles = {
    sm: "text-[11px] px-2 py-0.5 font-medium rounded-md gap-1",
    md: "text-xs px-2.5 py-1 font-semibold rounded-lg gap-1.5",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center border tracking-wide select-none shadow-2xs",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {withDot && (
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full shrink-0",
            dotColor || defaultDots[variant]
          )}
        />
      )}
      {children}
    </span>
  );
};
