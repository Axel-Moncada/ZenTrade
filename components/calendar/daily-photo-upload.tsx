"use client";

import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";

interface DailyPhotoUploadProps {
  label: string;
  description: string;
  path: string | null;
  userId: string;
  accountId: string;
  summaryDate: string;
  photoType: "micro" | "macro";
  readOnly?: boolean;
}

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export function DailyPhotoUpload({
  label,
  description,
  path,
  userId,
  accountId,
  summaryDate,
  photoType,
  readOnly = false,
}: DailyPhotoUploadProps) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  // Generate signed URL when path exists
  useEffect(() => {
    if (!path) {
      setSignedUrl(null);
      return;
    }
    supabase.storage
      .from("trade-screenshots")
      .createSignedUrl(path, 3600)
      .then(({ data }) => {
        setSignedUrl(data?.signedUrl ?? null);
      });
  }, [path]);

  const savePath = async (newPath: string | null) => {
    await fetch("/api/daily-summaries", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        account_id: accountId,
        summary_date: summaryDate,
        [`${photoType}_photo_path`]: newPath,
      }),
    });
  };

  const handleFileSelect = async (file: File) => {
    setError(null);
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Solo JPG, PNG, WebP o GIF");
      return;
    }
    if (file.size > MAX_SIZE) {
      setError("Máximo 5MB");
      return;
    }

    setUploading(true);
    try {
      // Delete old file if exists
      if (path) {
        await supabase.storage.from("trade-screenshots").remove([path]);
      }

      const ext = file.name.split(".").pop() ?? "jpg";
      const timestamp = Date.now();
      const newPath = `${userId}/daily/${summaryDate}/${photoType}-${timestamp}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("trade-screenshots")
        .upload(newPath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: signedData } = await supabase.storage
        .from("trade-screenshots")
        .createSignedUrl(newPath, 3600);

      setSignedUrl(signedData?.signedUrl ?? null);
      await savePath(newPath);
    } catch (err) {
      setError("Error al subir. Intenta de nuevo.");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!path) return;
    setDeleting(true);
    try {
      await supabase.storage.from("trade-screenshots").remove([path]);
      setSignedUrl(null);
      await savePath(null);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const hasPhoto = !!signedUrl || (!!path && !signedUrl);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-zen-anti-flash">{label}</p>
          <p className="text-[10px] text-zen-anti-flash/40">{description}</p>
        </div>
        {hasPhoto && !readOnly && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-zen-danger/20 text-zen-danger/60 hover:text-zen-danger transition-colors"
          >
            {deleting ? <Loader2 className="h-3 w-3 animate-spin" /> : <X className="h-3 w-3" />}
          </button>
        )}
      </div>

      {/* Photo area */}
      {signedUrl ? (
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          className="w-full h-40 rounded-lg overflow-hidden border border-zen-forest/40 hover:border-zen-caribbean-green/60 transition-colors group relative"
        >
          <img
            src={signedUrl}
            alt={label}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
          <div className="absolute inset-0 bg-zen-rich-black/0 group-hover:bg-zen-rich-black/20 transition-colors flex items-center justify-center">
            <span className="opacity-0 group-hover:opacity-100 text-xs text-white font-medium bg-zen-rich-black/60 px-2 py-1 rounded transition-opacity">
              Ver completo
            </span>
          </div>
        </button>
      ) : path && !signedUrl ? (
        // Loading state
        <div className="w-full h-40 rounded-lg border border-zen-forest/40 flex items-center justify-center bg-zen-surface/40">
          <Loader2 className="h-5 w-5 animate-spin text-zen-caribbean-green/60" />
        </div>
      ) : readOnly ? (
        <div className="w-full h-40 rounded-lg border border-dashed border-zen-forest/30 flex flex-col items-center justify-center gap-2 bg-zen-surface/20">
          <ImageIcon className="h-6 w-6 text-zen-anti-flash/20" />
          <p className="text-xs text-zen-anti-flash/30">Sin foto</p>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full h-40 rounded-lg border-2 border-dashed border-zen-forest/40 hover:border-zen-caribbean-green/50 bg-zen-surface/20 hover:bg-zen-caribbean-green/5 flex flex-col items-center justify-center gap-2 transition-colors group"
        >
          {uploading ? (
            <Loader2 className="h-6 w-6 animate-spin text-zen-caribbean-green" />
          ) : (
            <>
              <Upload className="h-6 w-6 text-zen-anti-flash/30 group-hover:text-zen-caribbean-green transition-colors" />
              <span className="text-xs text-zen-anti-flash/40 group-hover:text-zen-caribbean-green/70 transition-colors">
                Click o arrastra imagen
              </span>
            </>
          )}
        </button>
      )}

      {error && <p className="text-[10px] text-zen-danger">{error}</p>}

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

      {/* Lightbox */}
      {lightboxOpen && signedUrl && (
        <div
          className="fixed inset-0 z-[9999] bg-zen-rich-black/90 flex items-center justify-center"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 h-9 w-9 rounded-full bg-zen-surface/60 hover:bg-zen-surface flex items-center justify-center text-zen-anti-flash"
          >
            <X className="h-5 w-5" />
          </button>
          <img
            src={signedUrl}
            alt={label}
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-zen-anti-flash/60">
            {label}
          </p>
        </div>
      )}
    </div>
  );
}
