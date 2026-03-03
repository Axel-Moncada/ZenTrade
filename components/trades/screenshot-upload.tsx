"use client";

import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Camera, X, Upload, Lock, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";

interface ScreenshotUploadProps {
  value: string[];
  onChange: (paths: string[]) => void;
  disabled?: boolean;
  userId: string;
}

const MAX_SCREENSHOTS = 3;
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export function ScreenshotUpload({ value, onChange, disabled, userId }: ScreenshotUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  // Generate signed URLs for existing paths whenever value changes
  useEffect(() => {
    if (!value || value.length === 0) return;

    const generateUrls = async () => {
      const missing = value.filter((p) => !signedUrls[p]);
      if (missing.length === 0) return;

      const newMap: Record<string, string> = {};
      await Promise.all(
        missing.map(async (path) => {
          const { data } = await supabase.storage
            .from("trade-screenshots")
            .createSignedUrl(path, 3600);
          if (data?.signedUrl) newMap[path] = data.signedUrl;
        })
      );
      if (Object.keys(newMap).length > 0) {
        setSignedUrls((prev) => ({ ...prev, ...newMap }));
      }
    };

    generateUrls();
  }, [value]);

  const handleFileSelect = async (file: File) => {
    setError(null);

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Solo se aceptan JPG, PNG, WebP o GIF");
      return;
    }
    if (file.size > MAX_SIZE) {
      setError("La imagen no puede superar 5MB");
      return;
    }
    if (value.length >= MAX_SCREENSHOTS) return;

    setUploading(true);
    try {
      const ext = file.name.split(".").pop() ?? "jpg";
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const path = `${userId}/${filename}`;

      const { error: uploadError } = await supabase.storage
        .from("trade-screenshots")
        .upload(path, file, { upsert: false });

      if (uploadError) throw uploadError;

      const { data: signedData } = await supabase.storage
        .from("trade-screenshots")
        .createSignedUrl(path, 3600);

      if (signedData?.signedUrl) {
        setSignedUrls((prev) => ({ ...prev, [path]: signedData.signedUrl }));
      }

      onChange([...value, path]);
    } catch (err) {
      setError("Error al subir la imagen. Intenta de nuevo.");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async (path: string, idx: number) => {
    await supabase.storage.from("trade-screenshots").remove([path]);
    const newMap = { ...signedUrls };
    delete newMap[path];
    setSignedUrls(newMap);
    onChange(value.filter((_, i) => i !== idx));
  };

  const openImage = (path: string) => {
    const url = signedUrls[path];
    if (url) window.open(url, "_blank");
  };

  const canAdd = value.length < MAX_SCREENSHOTS && !disabled && !uploading;

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Camera className="h-4 w-4 text-zen-caribbean-green" />
        <Label className="text-zen-anti-flash">Capturas de pantalla</Label>
        {disabled ? (
          <span className="inline-flex items-center gap-1 text-xs bg-zen-caribbean-green/10 border border-zen-caribbean-green/30 text-zen-caribbean-green rounded-full px-2 py-0.5">
            <Lock className="h-3 w-3" /> Professional
          </span>
        ) : (
          <span className="text-xs text-zen-text-muted">
            {value.length}/{MAX_SCREENSHOTS} · max 5MB c/u
          </span>
        )}
      </div>

      <div className={`flex gap-2 flex-wrap ${disabled ? "opacity-50 pointer-events-none" : ""}`}>
        {/* Thumbnails */}
        {value.map((path, idx) => (
          <div
            key={path}
            className="relative w-20 h-20 rounded-lg overflow-hidden border border-zen-forest/40 bg-zen-surface/60 cursor-pointer group"
            onClick={() => openImage(path)}
          >
            {signedUrls[path] ? (
              <img
                src={signedUrls[path]}
                alt={`Captura ${idx + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin text-zen-caribbean-green" />
              </div>
            )}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleRemove(path, idx); }}
              className="absolute top-0.5 right-0.5 bg-zen-rich-black/80 hover:bg-red-600/80 rounded-full p-0.5 transition-colors opacity-0 group-hover:opacity-100"
            >
              <X className="w-3 h-3 text-white" />
            </button>
          </div>
        ))}

        {/* Upload button */}
        {canAdd && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-20 h-20 rounded-lg border-2 border-dashed border-zen-forest/60 hover:border-zen-caribbean-green/60 bg-zen-surface/40 hover:bg-zen-caribbean-green/5 flex flex-col items-center justify-center gap-1 transition-colors group"
          >
            {uploading ? (
              <Loader2 className="w-5 h-5 animate-spin text-zen-caribbean-green" />
            ) : (
              <>
                <Upload className="w-5 h-5 text-zen-text-muted group-hover:text-zen-caribbean-green transition-colors" />
                <span className="text-xs text-zen-text-muted group-hover:text-zen-caribbean-green transition-colors">
                  Subir
                </span>
              </>
            )}
          </button>
        )}

        {/* Placeholder when disabled and no screenshots */}
        {disabled && value.length === 0 && (
          <div className="w-20 h-20 rounded-lg border-2 border-dashed border-zen-forest/40 bg-zen-surface/20 flex flex-col items-center justify-center gap-1">
            <Camera className="w-5 h-5 text-zen-text-muted" />
            <span className="text-xs text-zen-text-muted">Pro</span>
          </div>
        )}
      </div>

      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
