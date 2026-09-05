"use client";

import React, { useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface AudioReadoutButtonProps {
  textToRead: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const AudioReadoutButton: React.FC<AudioReadoutButtonProps> = ({
  textToRead,
  className = "",
  size = "md",
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const { language } = useLanguage();

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Audio playback is not supported on this browser.");
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(textToRead);
    
    // Set speech language based on app language
    if ((language as string) === "pa") {
      utterance.lang = "pa-IN";
    } else if (language === "hi") {
      utterance.lang = "hi-IN";
    } else {
      utterance.lang = "en-IN";
    }

    utterance.rate = 0.9; // Slightly slower pace for clarity

    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    setIsPlaying(true);
    window.speechSynthesis.speak(utterance);
  };

  const iconSizes = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const buttonPaddings = {
    sm: "p-1.5",
    md: "p-2",
    lg: "p-2.5",
  };

  return (
    <button
      type="button"
      onClick={handleSpeak}
      title={isPlaying ? "Stop Audio" : "Listen Audio"}
      className={`inline-flex items-center gap-1.5 ${buttonPaddings[size]} rounded-xl transition-all font-bold text-xs select-none cursor-pointer ${
        isPlaying
          ? "bg-amber-500 text-slate-950 animate-pulse shadow-lg shadow-amber-500/30"
          : "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30"
      } ${className}`}
    >
      {isPlaying ? (
        <>
          <VolumeX className={iconSizes[size]} />
          <span>Stop</span>
        </>
      ) : (
        <>
          <Volume2 className={iconSizes[size]} />
          <span>Listen 🔊</span>
        </>
      )}
    </button>
  );
};
