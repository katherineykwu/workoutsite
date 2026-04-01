// Expandable workout history entry
"use client";

import { useState } from "react";
import type { WorkoutLog } from "@/lib/types";

export default function WorkoutHistoryItem({ log }: { log: WorkoutLog }) {
  const [expanded, setExpanded] = useState(false);
  const d = new Date(log.date + "T00:00:00");
  const dateStr = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

  return (
    <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-[#F5F3F4]/50 transition-colors"
      >
        <div>
          <p className="font-bold text-[#1A0A1F] text-sm">{dateStr}</p>
          <p className="text-xs text-[#1A0A1F]/40 mt-0.5">
            {log.exercises.length} exercise{log.exercises.length !== 1 ? "s" : ""} · {log.dayOfWeek}
          </p>
        </div>
        <svg
          className={`w-5 h-5 text-[#1A0A1F]/30 transition-transform ${expanded ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {expanded && (
        <div className="px-5 pb-4 space-y-3 border-t border-black/5 pt-3">
          {log.exercises.map((ex) => (
            <div key={ex.exerciseId}>
              <p className="text-sm font-semibold text-[#1A0A1F]">{ex.exerciseName}</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {ex.sets.map((set) => (
                  <span
                    key={set.setNumber}
                    className="text-xs bg-[#F5F3F4] text-[#1A0A1F]/60 px-2.5 py-1 rounded-lg font-medium"
                  >
                    {set.weight} lbs × {set.reps}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
