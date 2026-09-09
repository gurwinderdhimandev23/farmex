import React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: "default" | "dark";
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, id, rows = 3, variant = "default", ...props }, ref) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
    const isDark =
      variant === "dark" ||
      Boolean(
        className &&
          (className.includes("bg-slate-9") ||
            className.includes("bg-slate-8") ||
            className.includes("text-white"))
      );

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={textareaId}
            className={cn(
              "block text-xs font-semibold uppercase tracking-wider",
              isDark ? "text-emerald-300" : "text-slate-600"
            )}
          >
            {label}
            {props.required && <span className="text-emerald-500 ml-1">*</span>}
          </label>
        )}

        <textarea
          id={textareaId}
          ref={ref}
          rows={rows}
          className={cn(
            "w-full rounded-xl p-3 text-sm transition-all duration-200 shadow-2xs resize-y focus:outline-none",
            isDark
              ? "bg-slate-950/90 text-white placeholder:text-slate-400 border border-emerald-500/30 focus:border-emerald-400 focus:ring-3 focus:ring-emerald-500/20 focus:bg-slate-900 focus:text-white"
              : "bg-white/80 backdrop-blur-xs text-slate-900 placeholder:text-slate-400 border border-slate-200/90 focus:border-emerald-500 focus:ring-3 focus:ring-emerald-500/15 focus:bg-white focus:text-slate-900",
            "disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed",
            error && "border-rose-400 focus:border-rose-500 focus:ring-rose-500/15 bg-rose-50/20",
            className
          )}
          {...props}
        />

        {error ? (
          <p className="text-xs text-rose-500 font-medium">{error}</p>
        ) : helperText ? (
          <p className={cn("text-xs font-medium", isDark ? "text-slate-400" : "text-slate-500")}>
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
