import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "accent" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98] select-none cursor-pointer";

    const variantStyles = {
      primary:
        "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow-md shadow-emerald-600/20 focus:ring-emerald-500 border border-emerald-500/30",
      secondary:
        "bg-slate-800 hover:bg-slate-900 text-white shadow-sm hover:shadow-md focus:ring-slate-700 border border-slate-700/50",
      accent:
        "bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold shadow-sm hover:shadow-md shadow-amber-500/20 focus:ring-amber-400 border border-amber-400/50",
      outline:
        "bg-white/80 hover:bg-emerald-50/60 text-slate-700 hover:text-emerald-700 border border-slate-200/80 hover:border-emerald-300 shadow-xs focus:ring-emerald-500 backdrop-blur-xs",
      ghost:
        "bg-transparent hover:bg-emerald-50/80 text-slate-600 hover:text-emerald-700 focus:ring-emerald-500",
      destructive:
        "bg-rose-600 hover:bg-rose-700 text-white shadow-sm hover:shadow-md shadow-rose-600/20 focus:ring-rose-500 border border-rose-500/30",
    };

    const sizeStyles = {
      sm: "text-xs px-3 py-1.5 gap-1.5 font-medium",
      md: "text-sm px-4 py-2.5 gap-2",
      lg: "text-base px-5 py-3 gap-2.5 font-semibold",
      icon: "h-10 w-10 p-0 items-center justify-center",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-current shrink-0" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        {children}
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";
