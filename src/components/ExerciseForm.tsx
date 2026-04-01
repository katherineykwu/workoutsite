// Form for the trainer to add or edit a single exercise
"use client";

import { useState } from "react";
import type { Exercise } from "@/lib/types";

interface ExerciseFormProps {
  exercise?: Exercise;
  routineId: string;
  onSave: (exercise: Exercise) => void;
  onCancel: () => void;
}

export default function ExerciseForm({
  exercise,
  routineId,
  onSave,
  onCancel,
}: ExerciseFormProps) {
  const [name, setName] = useState(exercise?.name || "");
  const [sets, setSets] = useState(exercise?.sets || 3);
  const [reps, setReps] = useState(exercise?.reps || "10");
  const [restSeconds, setRestSeconds] = useState(exercise?.restSeconds || 60);
  const [notes, setNotes] = useState(exercise?.notes || "");
  const [videoType, setVideoType] = useState<"youtube" | "upload" | "none">(
    exercise?.videoType || "none"
  );
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
      if (data.url) {
        setVideoUrl(data.url);
        setUploadProgress("Upload complete!");
      } else {
        setUploadProgress("Upload failed. Please try again.");
      }
    } catch (err) {
      setUploadProgress("Upload failed. Please try again.");
      console.error("Upload error:", err);
    }
    setUploading(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave({
      id: exerciseId,
      name,
      sets,
      reps,
      restSeconds,
      notes,
      videoType,
      videoUrl,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
      <h3 className="font-bold text-slate-900 text-lg">
        {exercise ? "Edit Exercise" : "New Exercise"}
      </h3>

      {/* Exercise name */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Exercise Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Barbell Squat"
          required
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
        />
      </div>

      {/* Sets, Reps, Rest */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Sets</label>
          <input
            type="number"
            value={sets}
            onChange={(e) => setSets(Number(e.target.value))}
            min={1}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Reps</label>
          <input
            type="text"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            placeholder="8-10"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Rest (sec)</label>
          <input
            type="number"
            value={restSeconds}
            onChange={(e) => setRestSeconds(Number(e.target.value))}
            min={0}
            step={15}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Go below parallel, keep chest up"
          rows={2}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
        />
      </div>

      {/* Video type selector */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Demo Video</label>
        <div className="flex gap-2">
          {(["none", "youtube", "upload"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => {
                setVideoType(type);
                if (type !== videoType) setVideoUrl("");
              }}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                videoType === type
                  ? "gradient-brand text-white shadow-md shadow-indigo-500/20"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {type === "none" ? "No Video" : type === "youtube" ? "YouTube" : "Upload"}
            </button>
          ))}
        </div>
      </div>

      {/* YouTube URL input */}
      {videoType === "youtube" && (
        <input
          type="url"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
        />
      )}

      {/* File upload */}
      {videoType === "upload" && (
        <div>
          <div className="relative">
            <input
              type="file"
              accept="video/*"
              onChange={handleFileUpload}
              disabled={uploading}
              className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 file:transition-colors file:cursor-pointer"
            />
          </div>
          {uploadProgress && (
            <p className={`text-sm mt-2 ${videoUrl ? "text-emerald-600" : "text-slate-400"}`}>
              {uploadProgress}
            </p>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={!name || uploading}
          className="gradient-brand text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-indigo-500/20"
        >
          {exercise ? "Save Changes" : "Add Exercise"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-slate-100 text-slate-600 px-6 py-3 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
