"use client";

import React, { useState, useRef } from "react";
import { Mic, Sparkles, Loader2, Square, Volume2 } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";

export interface AIVoiceBookingData {
  materialName?: string;
  quantityKg?: number | string;
  pickupLocation?: string;
  destinationLocation?: string;
  distanceKm?: number | string;
  pickupDate?: string;
  preferredTimeSlot?: string;
  labourRequired?: boolean;
  notes?: string;
}

interface AIVoiceBookingButtonProps {
  onDataExtracted: (data: AIVoiceBookingData) => void;
}

export const AIVoiceBookingButton: React.FC<AIVoiceBookingButtonProps> = ({ onDataExtracted }) => {
  const { t, language } = useLanguage();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const speechRecognitionRef = useRef<any>(null);
  const liveTranscriptRef = useRef("");

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      setLiveTranscript("");
      liveTranscriptRef.current = "";

      // Also start browser speech recognition simultaneously for real-time speech feedback
      const SpeechRecognition =
        (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any }).SpeechRecognition ||
        (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any }).webkitSpeechRecognition;

      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = language === "hi" ? "hi-IN" : "en-IN";

          recognition.onresult = (event: any) => {
            let interim = "";
            for (let i = 0; i < event.results.length; i++) {
              interim += event.results[i][0].transcript + " ";
            }
            const clean = interim.trim();
            setLiveTranscript(clean);
            liveTranscriptRef.current = clean;
          };

          recognition.start();
          speechRecognitionRef.current = recognition;
        } catch {
          // Speech recognition fallback silently
        }
      }

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        await processAudioWithAI(audioBlob, liveTranscriptRef.current);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setSeconds(0);

      timerRef.current = setInterval(() => {
        setSeconds((prev) => {
          if (prev >= 45) {
            // Auto stop after 45 seconds
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } catch {
      toast.error("Microphone permission denied or not available in browser.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      try {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      } catch {}
    }
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch {}
    }
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const processAudioWithAI = async (audioBlob: Blob, capturedTranscript: string) => {
    setIsProcessing(true);
    toast.info(t("aiProcessingMsg"));

    try {
      const text = (capturedTranscript || liveTranscriptRef.current || "").trim();

      const payload: Record<string, unknown> = {
        textTranscript: text,
        language,
      };

      // If speech recognition didn't catch text, read audioBlob as fallback
      if (!text && audioBlob.size > 0) {
        const reader = new FileReader();
        const base64Audio = await new Promise<string>((resolve) => {
          reader.readAsDataURL(audioBlob);
          reader.onloadend = () => resolve((reader.result as string) || "");
        });
        payload.audioBase64 = base64Audio;
        payload.mimeType = "audio/webm";
      }

      const res = await fetch("/api/v1/ai/voice-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setIsProcessing(false);

      if (data.success && data.data) {
        onDataExtracted(data.data);
        const weightQnt = data.data.quantityKg
          ? Number(data.data.quantityKg) > 150
            ? `${Math.round(Number(data.data.quantityKg) / 100)} ${language === "hi" ? "क्विंटल" : "Qnt"}`
            : `${data.data.quantityKg} ${language === "hi" ? "क्विंटल" : "Qnt"}`
          : null;

        const fieldsSummary = [
          data.data.materialName,
          weightQnt,
          data.data.pickupLocation && data.data.destinationLocation
            ? `${data.data.pickupLocation} ➔ ${data.data.destinationLocation}`
            : null,
        ]
          .filter(Boolean)
          .join(" • ");

        toast.success(
          fieldsSummary
            ? `AI Auto-Fill: ${fieldsSummary}`
            : t("aiSuccessToast")
        );
      } else {
        toast.error(data.error?.message || "Could not parse recording. Please try speaking again or fill manually.");
      }
    } catch {
      setIsProcessing(false);
      toast.error("Error processing voice booking.");
    }
  };

  return (
    <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 border-2 border-emerald-400/60 p-5 rounded-3xl shadow-2xl my-3 transition-all">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 via-green-500 to-amber-400 p-0.5 shadow-xl shadow-emerald-500/30 shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-emerald-400 animate-pulse" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-black tracking-wide border border-emerald-500/40 uppercase">
              <Volume2 className="w-3.5 h-3.5 text-amber-400" />
              <span>{language === "hi" ? "स्मार्ट AI वॉयस असिस्टेंट" : "Smart AI Voice Assistant"}</span>
            </div>
            <h4 className="text-lg font-black text-white tracking-tight">
              {t("aiVoiceTitle")}
            </h4>
            <p className="text-xs text-emerald-200/90 max-w-xl">
              {t("aiVoiceDesc")}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
          {!isRecording && !isProcessing && (
            <button
              type="button"
              onClick={startRecording}
              className="w-full sm:w-auto px-7 py-4 bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-500 text-slate-950 font-black rounded-2xl shadow-xl shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 text-base cursor-pointer whitespace-nowrap"
            >
              <Mic className="w-6 h-6 text-slate-950 fill-slate-950" />
              <span>{t("aiRecordBtn")}</span>
            </button>
          )}

          {isRecording && (
            <button
              type="button"
              onClick={stopRecording}
              className="w-full sm:w-auto px-7 py-4 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-2xl shadow-xl shadow-rose-600/40 active:scale-95 transition-all flex items-center justify-center gap-3 text-base cursor-pointer animate-pulse whitespace-nowrap"
            >
              <Square className="w-5 h-5 fill-white" />
              <span>{t("aiStopBtn")} ({seconds}s)</span>
            </button>
          )}

          {isProcessing && (
            <div className="w-full sm:w-auto px-7 py-4 bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold rounded-2xl flex items-center justify-center gap-3 text-base whitespace-nowrap shadow-lg">
              <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
              <span>{t("aiProcessingMsg")}</span>
            </div>
          )}
        </div>
      </div>

      {/* Recording State & Live Transcript */}
      {isRecording && (
        <div className="mt-4 pt-4 border-t border-emerald-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-emerald-950/40 p-3 rounded-2xl border">
          <div className="flex items-center gap-3">
            <span className="flex h-3.5 w-3.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-500"></span>
            </span>
            <div className="text-xs font-semibold text-emerald-200">
              {liveTranscript ? (
                <span>
                  <span className="text-emerald-400 font-bold">
                    {language === "hi" ? "सुन रहा हूँ:" : "Listening:"}
                  </span>{" "}
                  &ldquo;{liveTranscript}&rdquo;
                </span>
              ) : (
                <span className="animate-pulse">
                  {language === "hi"
                    ? "बोलिए... (उदा. 'कल सुबह रामपुर से खन्ना मंडी 50 क्विंटल गेहूं भेजना है, लेबर चाहिए')"
                    : "Listening... (e.g. 'Wheat 50 quintals from Rampur to Khanna Mandi tomorrow with labour')"}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            <span className="w-1.5 h-4 bg-emerald-400 rounded-full animate-bounce"></span>
            <span className="w-1.5 h-6 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
            <span className="w-1.5 h-3 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            <span className="w-1.5 h-5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.1s]"></span>
          </div>
        </div>
      )}

      {/* Example Prompt Helper */}
      {!isRecording && !isProcessing && (
        <div className="mt-3 pt-3 border-t border-emerald-500/20 text-[11px] text-emerald-300/80 flex items-center gap-2">
          <span className="font-bold text-amber-400">💡 {language === "hi" ? "उदाहरण वाक्य:" : "Sample sentence:"}</span>
          <span className="italic">
            {language === "hi"
              ? '"कल सुबह रामपुर से खन्ना मंडी 50 क्विंटल गेहूं भेजना है, 2 लेबर चाहिए और दूरी 25 किमी है"'
              : '"Wheat 50 quintal from Rampur farm to Khanna mandi tomorrow morning with labour distance 25 km"'}
          </span>
        </div>
      )}
    </div>
  );
};

