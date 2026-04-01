// Exercise card — Sweat-inspired clean white card with pink accents
"use client";

import type { Exercise } from "@/lib/types";
import VideoPlayer from "./VideoPlayer";

export default function ExerciseCard({
  exercise,
  index,
}: {
  exercise: Exercise;
  index: number;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden hover:shadow-md transition-shadow">
      <VideoPlayer videoType={exercise.videoType} videoUrl={exercise.videoUrl} />

      <div className="p-5">
        <div className="flex items-start gap-3.5">
          {/* Exercise number */}
          <span className="flex-shrink-0 w-9 h-9 rounded-xl bg-[#FF1A66] text-white flex items-center justify-center text-sm font-bold shadow-sm shadow-[#FF1A66]/20">
            {index + 1}
          </span>

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-[#1A0A1F] text-[17px] leading-snug">
              {exercise.name}
            </h3>

            {/* Stats */}
            <div className="flex flex-wrap gap-2 mt-3">
              <div className="flex items-center gap-1.5 bg-[#F5F3F4] text-[#1A0A1F]/70 px-3 py-1.5 rounded-lg">
                <span className="text-sm font-bold">{exercise.sets}</span>
                <span className="text-xs text-[#1A0A1F]/40">sets</span>
              </div>
              <div className="flex items-center gap-1.5 bg-[#F5F3F4] text-[#1A0A1F]/70 px-3 py-1.5 rounded-lg">
                <span className="text-sm font-bold">{exercise.reps}</span>
                <span className="text-xs text-[#1A0A1F]/40">reps</span>
              </div>
              {exercise.restSeconds > 0 && (
                <div className="flex items-center gap-1.5 bg-[#F5F3F4] text-[#1A0A1F]/70 px-3 py-1.5 rounded-lg">
                  <span className="text-sm font-bold">{exercise.restSeconds}s</span>
                  <span className="text-xs text-[#1A0A1F]/40">rest</span>
                </div>
              )}
            </div>

            {/* Notes */}
            {exercise.notes && (
              <p className="mt-3 text-[#1A0A1F]/40 text-sm leading-relaxed">
                {exercise.notes}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
