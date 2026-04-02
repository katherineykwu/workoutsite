// Exercise form — dark theme for trainer dashboard
"use client";

import { useState } from "react";
import type { Exercise } from "@/lib/types";

interface ExerciseFormProps {
  exercise?: Exercise;
  routineId: string;
  onSave: (exercise: Exercise) => void;
  onCancel: () => void;
}

export default function ExerciseForm({ exercise, routineId, onSave, onCancel }: ExerciseFormProps) {
  const [name, setName] = useState(exercise?.name || "");
  const [sets, setSets] = useState(exercise?.sets || 3);
  const [reps, setReps] = useState(exercise?.reps || "10");
  const [restSeconds, setRestSeconds] = useState(exercise?.restSeconds || 60);
  const [targetWeight, setTargetWeight] = useState(exercise?.targetWeight || 0);
  const [notes, setNotes] = useState(exercise?.notes || "");
  const [videoType, setVideoType] = useState<"youtube" | "upload" | "none">(exercise?.videoType || "none");
  const [videoUrl, setVideoUrl] = useState(exercise?.videoUrl || "");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");

  const exerciseId = exercise?.id || `ex-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadProgress(`Uploading ${file.name}...`);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) { setVideoUrl(data.url); setUploadProgress("Upload complete!"); }
      else setUploadProgress("Upload failed.");
    } catch { setUploadProgress("Upload failed."); }
    setUploading(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave({ id: exerciseId, name, sets, reps, restSeconds, targetWeight, notes, videoType, videoUrl });
  }

  const inputClass = "w-full px-4 py-3 bg-[#F5F3F4] border border-black/5 rounded-xl text-[#1A0A1F] placeholder-[#1A0A1F]/30 focus:outline-none focus:ring-2 focus:ring-[#FF1A66] focus:border-transparent transition-all";

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-black/5 shadow-sm p-6 space-y-5">
      <h3 className="font-bold text-[#1A0A1F] text-lg">
        {exercise ? "Edit Exercise" : "New Exercise"}
      </h3>

      <div>
        <label className="block text-sm font-semibold text-[#1A0A1F]/50 mb-1.5">Exercise Name</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Barbell Squat" required className={inputClass} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div>
          <label className="block text-sm font-semibold text-[#1A0A1F]/50 mb-1.5">Sets</label>
          <input type="number" value={sets} onChange={(e) => setSets(Number(e.target.value))} min={1} className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#1A0A1F]/50 mb-1.5">Reps</label>
          <input type="text" value={reps} onChange={(e) => setReps(e.target.value)} placeholder="8-10" className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#1A0A1F]/50 mb-1.5">Weight (lbs)</label>
          <input type="number" value={targetWeight || ""} onChange={(e) => setTargetWeight(Number(e.target.value))} min={0} placeholder="0" className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#1A0A1F]/50 mb-1.5">Rest (sec)</label>
          <input type="number" value={restSeconds} onChange={(e) => setRestSeconds(Number(e.target.value))} min={0} step={15} className={inputClass} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#1A0A1F]/50 mb-1.5">Notes</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Go below parallel, keep chest up" rows={2} className={inputClass + " resize-none"} />
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#1A0A1F]/50 mb-2">Demo Video</label>
        <div className="flex gap-2">
          {(["none", "youtube", "upload"] as const).map((type) => (
            <button key={type} type="button"
              onClick={() => { setVideoType(type); if (type !== videoType) setVideoUrl(""); }}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                videoType === type
                  ? "bg-[#FF1A66] text-white shadow-md shadow-[#FF1A66]/20"
                  : "bg-[#F5F3F4] border border-black/5 text-[#1A0A1F]/40 hover:bg-[#EAE6E8]"
              }`}>
              {type === "none" ? "No Video" : type === "youtube" ? "YouTube" : "Upload"}
            </button>
          ))}
        </div>
      </div>

      {videoType === "youtube" && (
        <input type="url" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..." className={inputClass} />
      )}

      {videoType === "upload" && (
        <div>
          <input type="file" accept="video/*" onChange={handleFileUpload} disabled={uploading}
            className="w-full text-sm text-[#1A0A1F]/40 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-[#FF1A66] file:text-white hover:file:opacity-80 file:transition-opacity file:cursor-pointer" />
          {uploadProgress && <p className={`text-sm mt-2 ${videoUrl ? "text-[#FF1A66]" : "text-[#1A0A1F]/30"}`}>{uploadProgress}</p>}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={!name || uploading}
          className="gradient-pink text-white px-6 py-3 rounded-xl font-bold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-[#FF1A66]/20">
          {exercise ? "Save Changes" : "Add Exercise"}
        </button>
        <button type="button" onClick={onCancel}
          className="bg-white/10 border border-white/10 text-[#1A0A1F]/50 px-6 py-3 rounded-xl font-semibold hover:bg-white/15 transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
}
