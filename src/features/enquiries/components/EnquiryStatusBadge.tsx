"use client";

import React from "react";
import { EnquiryStatus } from "@/types/api";
import { getEnquiryStatusConfig, cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";

export const EnquiryStatusBadge: React.FC<{ status: EnquiryStatus; className?: string }> = ({
  status,
  className,
}) => {
  const { t } = useLanguage();
  const config = getEnquiryStatusConfig(status);
  const translatedLabel = t(`status${status}`) !== `status${status}` ? t(`status${status}`) : config.label;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border shadow-2xs select-none",
        config.badgeClass,
        className
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full shrink-0 animate-pulse", config.dotColor)} />
      {translatedLabel}
    </span>
  );
};
