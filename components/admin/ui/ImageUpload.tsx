"use client";

import { useRef, useState } from "react";
import { ImageIcon, Loader2, Upload } from "lucide-react";
import { uploadImage } from "@/lib/admin/upload";
import { cn } from "@/lib/admin/cn";

interface ImageUploadProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  className?: string;
  previewHeightClass?: string;
  /** Square icon preview — use for favicon uploads */
  variant?: "default" | "icon";
}

export default function ImageUpload({
  label,
  value,
  onChange,
  folder = "general",
  className,
  previewHeightClass = "h-40",
  variant = "default",
}: ImageUploadProps) {
  const isIcon = variant === "icon";
  const previewClass = isIcon ? "aspect-square h-28 w-28 mx-auto" : previewHeightClass;
  const accept = isIcon
    ? "image/png,image/jpeg,image/webp,image/gif,image/x-icon,image/vnd.microsoft.icon,image/svg+xml,.ico"
    : "image/*";
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (file: File | null) => {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const url = await uploadImage(file, folder);
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Yükleme başarısız.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className={className}>
      <label className="text-xs text-[#6B7A94] mb-2 block">{label}</label>
      <div className="rounded-xl border border-white/[0.08] bg-[#0D1117] p-4">
        {value ? (
          <div
            className={cn(
              "relative w-full mb-3 rounded-lg overflow-hidden border border-white/[0.06] bg-black",
              previewClass
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt=""
              className={cn("w-full h-full", isIcon ? "object-contain p-2" : "object-cover")}
            />
          </div>
        ) : (
          <div
            className={cn(
              "mb-3 rounded-lg border border-dashed border-white/10 flex flex-col items-center justify-center gap-2 text-[#4A5568]",
              previewClass
            )}
          >
            <ImageIcon size={28} strokeWidth={1.5} />
            <span className="text-[11px]">Henüz görsel yok</span>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => void handleFile(e.target.files?.[0] ?? null)}
        />

        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="w-full flex items-center justify-center gap-2 h-11 rounded-xl bg-[#1A1A1A] border border-white/[0.08] text-sm text-[#EEE9E0] hover:border-[#C8703A]/30 transition-colors disabled:opacity-50"
        >
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {uploading ? "Yükleniyor..." : value ? "Görseli Değiştir" : "Görsel Yükle"}
        </button>

        <p className="text-[10px] text-[#4A5568] mt-2 text-center">
          {isIcon
            ? "Kare PNG veya ICO önerilir · Maks. 5MB"
            : "Telefon veya bilgisayardan seçin · Maks. 5MB"}
        </p>
        {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
      </div>
    </div>
  );
}
