// Modal for you to select what equipment you have access to + upload gym photos
"use client";

import { useState } from "react";
import { EQUIPMENT_OPTIONS } from "@/lib/types";

interface MyEquipmentModalProps {
  selected: string[];
  gymPhotos: string[];
  onSave: (equipment: string[], gymPhotos: string[]) => void;
  onClose: () => void;
}

export default function MyEquipmentModal({ selected, gymPhotos: initialPhotos, onSave, onClose }: MyEquipmentModalProps) {
  const [local, setLocal] = useState<string[]>(selected);
  const [photos, setPhotos] = useState<string[]>(initialPhotos);
  const [uploading, setUploading] = useState(false);

  function toggle(id: string) {
    setLocal((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) {
        setPhotos((prev) => [...prev, data.url]);
      }
    } catch {
      // upload failed silently
    }
    setUploading(false);
    // Reset the input so the same file can be uploaded again
    e.target.value = "";
  }

  function removePhoto(url: string) {
    setPhotos((prev) => prev.filter((p) => p !== url));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[85vh] overflow-y-auto p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-extrabold text-[#49443D]">My Equipment</h2>
          <button onClick={onClose} className="p-2 text-[#49443D]/30 hover:text-[#49443D]/60 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className="text-[#49443D]/40 text-sm mb-5">
          Select what you have access to so Jamie knows what to include in your workouts.
        </p>

        {/* Equipment grid */}
        <div className="grid grid-cols-2 gap-2.5 mb-6">
          {EQUIPMENT_OPTIONS.map((item) => {
            const isSelected = local.includes(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => toggle(item.id)}
                className={`flex items-center gap-2.5 px-3.5 py-3.5 rounded-xl text-left transition-all text-sm font-medium ${
                  isSelected
                    ? "bg-[#C4706E]/10 text-[#C4706E] ring-2 ring-[#C4706E] shadow-sm"
                    : "bg-[#F5F0E8] border border-black/5 text-[#49443D]/60"
                }`}
              >
                <span className="text-xl flex-shrink-0">{item.icon}</span>
                <span className="truncate">{item.name}</span>
                {isSelected && (
                  <svg className="w-4 h-4 ml-auto flex-shrink-0 text-[#C4706E]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>

        {/* Gym photos section */}
        <div className="border-t border-black/5 pt-5 mb-6">
          <p className="text-[#C4706E] text-xs font-bold uppercase tracking-[0.15em] mb-1">Gym Photos</p>
          <p className="text-[#49443D]/40 text-sm mb-4">
            Upload photos of your gym so Jamie can see exactly what&apos;s available.
          </p>

          {/* Photo grid */}
          {photos.length > 0 && (
            <div className="grid grid-cols-2 gap-2.5 mb-4">
              {photos.map((url, i) => (
                <div key={i} className="relative rounded-xl overflow-hidden bg-[#F5F0E8] aspect-[4/3]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`Gym photo ${i + 1}`} className="w-full h-full object-cover" />
                  <button
                    onClick={() => removePhoto(url)}
                    className="absolute top-2 right-2 w-7 h-7 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload button */}
          <label className={`flex items-center justify-center gap-2 w-full py-3.5 border-2 border-dashed border-black/10 rounded-xl text-[#49443D]/40 hover:text-[#C4706E] hover:border-[#C4706E]/30 hover:bg-[#C4706E]/5 font-semibold text-sm cursor-pointer transition-all ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
            </svg>
            {uploading ? "Uploading..." : "Add Gym Photo"}
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>

        <button
          onClick={() => onSave(local, photos)}
          className="w-full gradient-pink text-white py-3.5 rounded-xl font-bold shadow-lg shadow-[#C4706E]/25 hover:opacity-90 transition-all"
        >
          Save ({local.length} equipment{photos.length > 0 ? ` + ${photos.length} photo${photos.length !== 1 ? "s" : ""}` : ""})
        </button>
      </div>
    </div>
  );
}
