// Exercise card — supports both view mode and logging mode
"use client";

import type { Exercise, SetLog, PersonalBest } from "@/lib/types";
import VideoPlayer from "./VideoPlayer";
import SetLogger from "./SetLogger";

interface ExerciseCardProps {
  exercise: Exercise;
  index: number;
  loggingMode?: boolean;
  currentSets?: SetLog[];
  lastSets?: SetLog[];
  personalBest?: PersonalBest;
  onSetChange?: (exerciseId: string, setNumber: number, weight: number, reps: number) => void;
}

export default function ExerciseCard({
  exercise, index, loggingMode, currentSets, lastSets, personalBest, onSetChange,
}: ExerciseCardProps) {
  // Check if any current set exceeds the PR
  const currentMax = currentSets?.reduce((max, s) => Math.max(max, s.weight), 0) || 0;
  const isNewPR = loggingMode && personalBest && currentMax > personalBest.weight;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden hover:shadow-md transition-shadow">
      {!loggingMode && <VideoPlayer videoType={exercise.videoType} videoUrl={exercise.videoUrl} />}

      <div className="p-5">
        <div className="flex items-start gap-3.5">
          <span className="flex-shrink-0 w-9 h-9 rounded-xl bg-[#FF1A66] text-white flex items-center justify-center text-sm font-bold shadow-sm shadow-[#FF1A66]/20">
            {index + 1}
          </span>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-[#1A0A1F] text-[17px] leading-snug">{exercise.name}</h3>
              {isNewPR && (
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#FF1A66] text-white px-2 py-0.5 rounded-full animate-pulse">
                  New PR!
                </span>
              )}
            </div>

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
              {exercise.targetWeight > 0 && (
                <div className="flex items-center gap-1.5 bg-[#FF1A66]/8 text-[#FF1A66] px-3 py-1.5 rounded-lg">
                  <span className="text-sm font-bold">{exercise.targetWeight}</span>
                  <span className="text-xs text-[#FF1A66]/60">lbs</span>
                </div>
              )}
              {exercise.restSeconds > 0 && (
                <div className="flex items-center gap-1.5 bg-[#F5F3F4] text-[#1A0A1F]/70 px-3 py-1.5 rounded-lg">
                  <span className="text-sm font-bold">{exercise.restSeconds}s</span>
                  <span className="text-xs text-[#1A0A1F]/40">rest</span>
                </div>
              )}
              {personalBest && (
                <div className="flex items-center gap-1.5 bg-[#FF1A66]/5 text-[#FF1A66] px-3 py-1.5 rounded-lg ml-auto">
                  <span className="text-xs font-bold">PR: {personalBest.weight} lbs</span>
                </div>
              )}
            </div>

            {/* Notes */}
            {exercise.notes && !loggingMode && (
              <p className="mt-3 text-[#1A0A1F]/40 text-sm leading-relaxed">{exercise.notes}</p>
            )}

            {/* Last session hint */}
            {loggingMode && lastSets && lastSets.length > 0 && (
              <p className="mt-2 text-[#1A0A1F]/30 text-xs">
                Last: {lastSets.map((s) => `${s.weight}x${s.reps}`).join(", ")}
              </p>
            )}

            {/* Logging inputs */}
            {loggingMode && onSetChange && (
              <div className="mt-4 space-y-2">
                {Array.from({ length: exercise.sets }, (_, i) => {
                  const setNum = i + 1;
                  const current = currentSets?.find((s) => s.setNumber === setNum);
                  const last = lastSets?.find((s) => s.setNumber === setNum);
                  return (
                    <SetLogger
                      key={setNum}
                      setNumber={setNum}
                      weight={current?.weight || 0}
                      reps={current?.reps || 0}
                      placeholderWeight={last?.weight}
                      placeholderReps={last?.reps}
                      onChange={(w, r) => onSetChange(exercise.id, setNum, w, r)}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
