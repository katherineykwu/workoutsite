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
  clientNote?: string;
  lastSets?: SetLog[];
  personalBest?: PersonalBest;
  onSetChange?: (exerciseId: string, setNumber: number, weight: number, reps: number) => void;
  onNoteChange?: (exerciseId: string, note: string) => void;
  compact?: boolean; // renders without outer card styling (used inside SupersetCard)
}

export default function ExerciseCard({
  exercise, index, loggingMode, currentSets, clientNote, lastSets, personalBest, onSetChange, onNoteChange, compact,
}: ExerciseCardProps) {
  const currentMax = currentSets?.reduce((max, s) => Math.max(max, s.weight), 0) || 0;
  const isNewPR = loggingMode && personalBest && currentMax > personalBest.weight;

  return (
    <div className={compact ? "" : "bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden hover:shadow-md transition-shadow"}>
      {!loggingMode && !compact && <VideoPlayer videoType={exercise.videoType} videoUrl={exercise.videoUrl} />}

      <div className={compact ? "py-2" : "p-5"}>
        <div className="flex items-start gap-3.5">
          <span className="flex-shrink-0 w-9 h-9 rounded-xl bg-[#C4706E] text-white flex items-center justify-center text-sm font-bold shadow-sm shadow-[#C4706E]/20">
            {index + 1}
          </span>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-[#49443D] text-[17px] leading-snug">{exercise.name}</h3>
              {isNewPR && (
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#C4706E] text-white px-2 py-0.5 rounded-full animate-pulse">
                  New PR!
                </span>
              )}
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-2 mt-3">
              <div className="flex items-center gap-1.5 bg-[#F5F0E8] text-[#49443D]/70 px-3 py-1.5 rounded-lg">
                <span className="text-sm font-bold">{exercise.sets}</span>
                <span className="text-xs text-[#49443D]/40">sets</span>
              </div>
              <div className="flex items-center gap-1.5 bg-[#F5F0E8] text-[#49443D]/70 px-3 py-1.5 rounded-lg">
                <span className="text-sm font-bold">{exercise.reps}</span>
                <span className="text-xs text-[#49443D]/40">reps</span>
              </div>
              {exercise.targetWeight > 0 && (
                <div className="flex items-center gap-1.5 bg-[#C4706E]/8 text-[#C4706E] px-3 py-1.5 rounded-lg">
                  <span className="text-sm font-bold">{exercise.targetWeight}</span>
                  <span className="text-xs text-[#C4706E]/60">lbs</span>
                </div>
              )}
              {personalBest && (
                <div className="flex items-center gap-1.5 bg-[#C4706E]/5 text-[#C4706E] px-3 py-1.5 rounded-lg ml-auto">
                  <span className="text-xs font-bold">PR: {personalBest.weight} lbs</span>
                </div>
              )}
            </div>

            {/* Trainer notes */}
            {exercise.notes && !loggingMode && (
              <p className="mt-3 text-[#49443D]/40 text-sm leading-relaxed">{exercise.notes}</p>
            )}

            {/* Last session hint */}
            {loggingMode && lastSets && lastSets.length > 0 && (
              <p className="mt-2 text-[#49443D]/30 text-xs">
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

            {/* Client note input (during logging) */}
            {loggingMode && onNoteChange && (
              <textarea
                value={clientNote || ""}
                onChange={(e) => onNoteChange(exercise.id, e.target.value)}
                placeholder="Notes for Jamie (e.g. felt easy, shoulder was tight...)"
                rows={2}
                className="mt-3 w-full px-3 py-2.5 bg-[#F5F0E8] border border-black/5 rounded-xl text-[#49443D] text-sm placeholder-[#49443D]/25 focus:outline-none focus:ring-2 focus:ring-[#C4706E] focus:border-transparent resize-none"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
