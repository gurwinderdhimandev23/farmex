"use client";

import React, { useState, useRef } from "react";
import { Upload, X, Check, Loader2, Image as ImageIcon, Eye } from "lucide-react";
import { toast } from "sonner";

interface DocumentUploaderProps {
  label: string;
  value?: string | null;
  onChange: (url: string | null) => void;
  required?: boolean;
  disabled?: boolean;
  folder?: string;
  helperText?: string;
  description?: string;
  className?: string;
}

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  label,
  value,
  onChange,
  required = false,
  disabled = false,
  folder = "kyc",
  helperText,
  description,
  className = "",
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be under 10MB");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);
    if (value) {
      formData.append("oldUrl", value);
    }

    try {
      const res = await fetch("/api/v1/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.data?.url) {
        onChange(data.data.url);
        toast.success(`${label} uploaded successfully!`);
      } else {
        toast.error(data.error?.message || "Failed to upload image.");
      }
    } catch {
      toast.error("Network error during file upload.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = async () => {
    const oldVal = value;
    onChange(null);
    if (oldVal && !oldVal.startsWith("data:")) {
      try {
        await fetch(`/api/v1/upload?url=${encodeURIComponent(oldVal)}`, {
          method: "DELETE",
        });
      } catch (err) {
        console.warn("Failed to delete removed file from storage:", err);
      }
    }
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-700">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
        {value && (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <Check className="w-3 h-3 text-emerald-600" /> Uploaded
          </span>
        )}
      </div>

      {description && <p className="text-[11px] text-slate-500">{description}</p>}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/webp,image/jpg"
        className="hidden"
        disabled={disabled || isUploading}
      />

      {value ? (
        <div className="relative group rounded-2xl border-2 border-emerald-500/40 bg-emerald-50/40 p-3 flex items-center justify-between gap-3 transition-all">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-950 border border-slate-200 shrink-0 relative flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={value} alt={label} className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate">{label}</p>
              <button
                type="button"
                onClick={() => setPreviewOpen(true)}
                className="inline-flex items-center gap-1 text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold mt-0.5 cursor-pointer"
              >
                <Eye className="w-3 h-3" /> View Photo Preview
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || isUploading}
              className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer shadow-2xs"
            >
              Change
            </button>
            <button
              type="button"
              onClick={handleRemove}
              disabled={disabled || isUploading}
              className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-50 cursor-pointer"
              title="Remove"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
            disabled ? "opacity-50 cursor-not-allowed bg-slate-50" : "hover:border-emerald-500 hover:bg-emerald-50/20 bg-slate-50/80 border-slate-300"
          }`}
        >
          {isUploading ? (
            <div className="py-2 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
              <p className="text-xs font-bold text-slate-700">Uploading securely...</p>
            </div>
          ) : (
            <div className="py-2 flex flex-col items-center justify-center gap-1.5">
              <div className="w-10 h-10 rounded-2xl bg-white shadow-2xs border border-slate-200/80 flex items-center justify-center text-slate-500 group-hover:text-emerald-600">
                <Upload className="w-5 h-5 text-emerald-600" />
              </div>
              <p className="text-xs font-bold text-slate-700">
                Click to upload <span className="text-emerald-600 font-extrabold">{label}</span>
              </p>
              <p className="text-[10px] text-slate-400">JPG, PNG, WebP (Max 10MB)</p>
            </div>
          )}
        </div>
      )}

      {helperText && <p className="text-[11px] text-slate-400">{helperText}</p>}

      {/* Full Preview Modal */}
      {previewOpen && value && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setPreviewOpen(false)}
        >
          <div className="relative max-w-2xl w-full bg-slate-900 rounded-3xl p-4 shadow-2xl border border-slate-800" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-white">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-emerald-400" /> {label} Preview
              </h3>
              <button onClick={() => setPreviewOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-4 max-h-[70vh] overflow-auto flex items-center justify-center rounded-2xl bg-slate-950 p-2 border border-slate-800/80">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={value} alt={label} className="max-w-full max-h-[65vh] object-contain rounded-xl" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
