"use client";

import React, { useState } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
  className?: string;
}

export function VoiceInputButton({ onTranscript, className = "" }: VoiceInputButtonProps) {
  const { language } = useLanguage();
  const [isListening, setIsListening] = useState(false);

  const langCodeMap: Record<string, string> = {
    hi: "hi-IN",
    en: "en-IN",
    pa: "pa-IN",
  };

  const handleToggleListen = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any }).SpeechRecognition ||
      (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in this browser. Please type manually.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = langCodeMap[language] || "hi-IN";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          onTranscript(transcript);
        }
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggleListen}
      title="Tap to speak / बोलकर दर्ज करें"
      className={`p-2.5 rounded-xl flex items-center justify-center transition-all duration-200 ${
        isListening
          ? "bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/50 scale-105"
          : "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/40"
      } ${className}`}
    >
      {isListening ? (
        <Loader2 className="w-5 h-5 animate-spin text-white" />
      ) : (
        <Mic className="w-5 h-5 text-emerald-400" />
      )}
    </button>
  );
}
