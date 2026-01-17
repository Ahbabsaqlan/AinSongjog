"use client";

import { useState } from "react";
import api from "@/lib/axios";
import { Upload, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface FileUploadProps {
  onUploadComplete: (url: string) => void;
  defaultImage?: string;
}

export default function FileUpload({ onUploadComplete, defaultImage }: FileUploadProps) {
  const [preview, setPreview] = useState<string | null>(defaultImage || null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Local Preview
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file); // Key must be 'file'

    try {
      const res = await api.post("/storage/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data", // Axios handles boundaries automatically
        },
      });

      const uploadedUrl = res.data.url;
      onUploadComplete(uploadedUrl); // Send URL back to parent form
      toast.success("Image uploaded!");
    } catch (error) {
      console.error(error);
      toast.error("Upload failed");
      setPreview(null); // Revert preview on failure
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      {/* Preview Circle */}
      <div className="relative w-24 h-24 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50">
        {uploading ? (
          <Loader2 className="animate-spin text-blue-500" />
        ) : preview ? (
          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
        ) : (
          <Upload className="text-gray-400" />
        )}
      </div>

      {/* Upload Button */}
      <div>
        <label className="cursor-pointer bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition shadow-sm">
          {uploading ? "Uploading..." : "Change Photo"}
          <input 
            type="file" 
            className="hidden" 
            accept="image/png, image/jpeg, image/jpg"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </label>
        <p className="text-xs text-gray-500 mt-2">Max 5MB. JPG or PNG.</p>
      </div>
    </div>
  );
}