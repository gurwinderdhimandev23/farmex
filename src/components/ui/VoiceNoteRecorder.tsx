"use client";

import React, { useState, useRef } from "react";
import { Mic, Square, Play, Pause, Trash2, Volume2 } from "lucide-react";

interface VoiceNoteRecorderProps {
  onAudioChange?: (audioBase64: string | null) => void;
}

export const VoiceNoteRecorder: React.FC<VoiceNoteRecorderProps> = ({ onAudioChange }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);

        // Convert to Base64
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          if (onAudioChange) {
            onAudioChange(reader.result as string);
          }
        };
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch {
      alert("Microphone permission denied or unsupported device.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const deleteRecording = () => {
    setAudioUrl(null);
    setRecordingTime(0);
    setIsPlaying(false);
    if (onAudioChange) onAudioChange(null);
  };

  const togglePlayback = () => {
    if (!audioUrl) return;
    if (!audioRef.current) {
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => setIsPlaying(false);
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="p-4 rounded-2xl bg-slate-950/80 border border-emerald-500/30 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5 uppercase tracking-wider">
          <Volume2 className="w-4 h-4 text-emerald-400" /> Voice Instruction Note / आवाज मैसेज
        </span>
        {isRecording && (
          <span className="text-xs font-bold text-rose-400 animate-pulse flex items-center gap-1">
            🔴 Recording ({recordingTime}s)
          </span>
        )}
      </div>

      {!audioUrl && !isRecording && (
        <button
          type="button"
          onClick={startRecording}
          className="w-full py-3 bg-emerald-500/20 border border-emerald-500/40 hover:bg-emerald-500/30 text-emerald-300 font-extrabold rounded-xl transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
        >
          <Mic className="w-4 h-4 text-amber-400" /> Record Voice Instructions (बोल कर रिकॉर्ड करें)
        </button>
      )}

      {isRecording && (
        <button
          type="button"
          onClick={stopRecording}
          className="w-full py-3 bg-rose-600 text-white font-extrabold rounded-xl shadow-lg hover:bg-rose-500 transition-all flex items-center justify-center gap-2 text-sm cursor-pointer animate-pulse"
        >
          <Square className="w-4 h-4 fill-white" /> Stop Recording (रिकॉर्डिंग बंद करें)
        </button>
      )}

      {audioUrl && !isRecording && (
        <div className="flex items-center justify-between bg-slate-900 border border-emerald-500/40 p-3 rounded-xl">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={togglePlayback}
              className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold hover:scale-105 transition-transform cursor-pointer"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-slate-950" />}
            </button>
            <div>
              <span className="text-xs font-bold text-white block">Voice Note Recorded 🎙️</span>
              <span className="text-[11px] text-emerald-400">Duration: {recordingTime} sec</span>
            </div>
          </div>

          <button
            type="button"
            onClick={deleteRecording}
            className="p-2 text-slate-400 hover:text-rose-400 transition-colors"
            title="Delete Audio"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
