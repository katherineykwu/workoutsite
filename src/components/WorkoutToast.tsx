// Success toast shown after completing a workout
"use client";

import { useEffect } from "react";
import type { PersonalBest } from "@/lib/types";

interface WorkoutToastProps {
  newPBs: PersonalBest[];
  onDismiss: () => void;
}

export default function WorkoutToast({ newPBs, onDismiss }: WorkoutToastProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onDismiss}>
      <div className="bg-white rounded-3xl p-8 max-w-sm mx-6 text-center shadow-2xl animate-[scaleIn_0.3s_ease-out]" onClick={(e) => e.stopPropagation()}>
        <span className="text-5xl block mb-3">🎉</span>
        <h2 className="text-2xl font-extrabold text-[#1A0A1F] mb-1">Workout Complete!</h2>
        <p className="text-[#1A0A1F]/40 text-sm mb-4">Great work. Keep it up!</p>

        {newPBs.length > 0 && (
          <div className="bg-[#FF1A66]/5 rounded-2xl p-4 mt-2">
            <p className="text-[#FF1A66] text-xs font-bold uppercase tracking-widest mb-3">
              New Personal Records
            </p>
            <div className="space-y-2">
              {newPBs.map((pb) => (
                <div key={pb.exerciseName} className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#1A0A1F]">{pb.displayName}</span>
                  <span className="text-sm font-bold text-[#FF1A66]">{pb.weight} lbs x {pb.reps}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={onDismiss}
          className="mt-5 gradient-pink text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg shadow-[#FF1A66]/25"
        >
          Done
        </button>
      </div>
    </div>
  );
}
