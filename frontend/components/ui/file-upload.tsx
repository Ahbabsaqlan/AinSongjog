"use client";

import { useState } from "react";
import api from "@/lib/axios";
import { Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface FileUploadProps {
  onUploadComplete: (url: string) => void;
  defaultImage?: string;
  // NEW PROPS MUST BE DEFINED HERE
  variant?: "avatar" | "document";
  accept?: string; 
  label?: string;
}

export default function FileUpload({ 
  onUploadComplete, 
  defaultImage, 
  variant = "avatar",
  // Default values if not passed
  accept = variant === "avatar" ? "image/png, image/jpeg, image/jpg, image/webp" : "*",
  label = variant === "avatar" ? "Change Photo" : "Click to upload file"
}: FileUploadProps) {
  const [preview, setPreview] = useState<string | null>(defaultImage || null);
  const [uploading, setUploading] = useState(false);

  // Determine endpoint based on variant
  const endpoint = variant === "avatar" ? "/storage/upload/avatar" : "/storage/upload/document";
  const maxSize = variant === "avatar" ? 10 * 1024 * 1024 : 50 * 1024 * 1024;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > maxSize) {
      toast.error(`File too large. Limit is ${maxSize / 1024 / 1024}MB`);
      return;
    }

    if (file.type.startsWith("image/")) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null);
    }
    
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onUploadComplete(res.data.url);
      toast.success("Upload successful");
    } catch (error) {
      toast.error("Upload failed");
      setPreview(defaultImage || null);
    } finally {
      setUploading(false);
    }
  };

  // --- AVATAR LAYOUT ---
  if (variant === "avatar") {
    return (
      <div className="flex items-center gap-5">
        <div className="relative w-24 h-24 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden bg-slate-50 shadow-inner">
          {uploading ? <Loader2 className="animate-spin text-blue-600" /> : 
           preview ? <img src={preview} alt="Preview" className="w-full h-full object-cover" /> : 
           <Upload className="text-slate-400" />}
        </div>
        <div>
          <label className="cursor-pointer bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-800 transition shadow-md hover:shadow-lg">
            {uploading ? "Uploading..." : label}
            <input type="file" className="hidden" accept={accept} onChange={handleFileChange} disabled={uploading} />
          </label>
          <p className="text-xs text-slate-500 mt-2 font-medium">Max 10MB (JPG/PNG)</p>
        </div>
      </div>
    );
  }

  // --- DOCUMENT LAYOUT ---
  return (
    <div className="w-full">
      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer bg-slate-50 hover:bg-white hover:border-blue-400 transition group">
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          {uploading ? (
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
          ) : (
            <Upload className="w-8 h-8 text-slate-400 group-hover:text-blue-500 mb-2 transition-colors" />
          )}
          <p className="text-sm text-slate-700 font-semibold group-hover:text-blue-600">
            {uploading ? "Uploading..." : label}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Max 50MB (PDF, DOC, Images)
          </p>
        </div>
        <input type="file" className="hidden" accept={accept} onChange={handleFileChange} disabled={uploading} />
      </label>
    </div>
  );
}