import React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
  dark?: boolean;
}

export const Card: React.FC<CardProps> = ({
  className,
  hoverEffect = false,
  dark = false,
  children,
  ...props
}) => {
  const hasCustomBg = className?.includes("bg-");
  return (
    <div
      className={cn(
        "rounded-2xl border transition-all duration-250",
        !hasCustomBg && (dark ? "glass-panel-dark text-slate-100" : "glass-panel text-slate-900"),
        hoverEffect && "glass-card-hover",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn("px-6 py-5 border-b border-slate-100/80 flex items-center justify-between gap-4", className)}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <h3 className={cn("text-base sm:text-lg font-bold text-slate-900 tracking-tight", className)} {...props}>
      {children}
    </h3>
  );
};

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <p className={cn("text-xs sm:text-sm text-slate-500 mt-0.5", className)} {...props}>
      {children}
    </p>
  );
};

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div className={cn("p-6", className)} {...props}>
      {children}
    </div>
  );
};

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        "px-6 py-4 bg-slate-50/50 rounded-b-2xl border-t border-slate-100 flex items-center justify-between gap-3",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
