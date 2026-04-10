// Wraps multiple exercises in a superset group — Kiki theme for your view
"use client";

import type { Exercise, SetLog, PersonalBest } from "@/lib/types";
import ExerciseCard from "./ExerciseCard";

interface SupersetCardProps {
  label: string;
  exercises: Exercise[];
  globalStartIndex: number;
  loggingMode?: boolean;
  logData: Record<string, SetLog[]>;
  lastSession: Record<string, SetLog[]>;
  personalBests: Record<string, PersonalBest>;
  noteData: Record<string, string>;
  onSetChange?: (exerciseId: string, setNumber: number, weight: number, reps: number) => void;
  onNoteChange?: (exerciseId: string, note: string) => void;
}

export default function SupersetCard({
  label, exercises, globalStartIndex,
  loggingMode, logData, lastSession, personalBests, noteData,
  onSetChange, onNoteChange,
}: SupersetCardProps) {
  // Round count from the first exercise's sets field
  const rounds = exercises[0]?.sets || 1;

  return (
    <div className="rounded-3xl border border-[#C4706E]/15 bg-[#FFFDF9] overflow-hidden shadow-playful">
      {/* Superset header */}
      <div className="px-5 pt-4 pb-3 flex items-center justify-between">
        <div>
          {label && (
            <h3 className="font-bold text-[#49443D] text-[15px] mb-1.5 font-display">{label}</h3>
          )}
          <span className="inline-block text-[10px] font-bold uppercase tracking-widest bg-[#C4706E]/15 text-[#C4706E] px-3 py-1 rounded-full font-display">
            Superset
          </span>
        </div>
        <span className="text-lg font-bold text-[#C4706E] font-display">
          x{rounds}
        </span>
      </div>

      {/* Exercises in the superset */}
      <div className="border-l-4 border-[#C4706E]/30 ml-4 mr-2 mb-3 space-y-2">
        {exercises.map((exercise, i) => (
          <div key={exercise.id} className="pl-3">
            <ExerciseCard
              exercise={exercise}
              index={globalStartIndex + i}
              loggingMode={loggingMode}
              currentSets={logData[exercise.id]}
              lastSets={lastSession[exercise.id]}
              personalBest={personalBests[exercise.name.toLowerCase().trim()]}
              clientNote={noteData[exercise.id]}
              onSetChange={onSetChange}
              onNoteChange={onNoteChange}
              compact
            />
          </div>
        ))}
      </div>
    </div>
  );
}
