// Expandable workout history entry.
// Supports both themes (Kiki = your view, trainer = Jamie's view) and optional
// search highlighting that auto-expands matching logs.
"use client";

import { useState, useEffect } from "react";
import type { WorkoutLog } from "@/lib/types";
import { matchesQuery } from "@/lib/filterBySearch";

interface Theme {
  cardBg: string;
  border: string;
  hover: string;
  textPrimary: string;
  textMuted: string;
  chipBg: string;
  chipText: string;
  accent: string;
  accentBg: string;
}

const themes: Record<"kiki" | "trainer", Theme> = {
  kiki: {
    cardBg: "bg-white",
    border: "border-black/5",
    hover: "hover:bg-[#F5F0E8]/50",
    textPrimary: "text-[#49443D]",
    textMuted: "text-[#49443D]/40",
    chipBg: "bg-[#F5F0E8]",
    chipText: "text-[#49443D]/60",
    accent: "text-[#C4706E]",
    accentBg: "bg-[#C4706E]/10",
  },
  trainer: {
    cardBg: "bg-white",
    border: "border-black/5",
    hover: "hover:bg-[#F7F6F0]/50",
    textPrimary: "text-[#1A0A1F]",
    textMuted: "text-[#1A0A1F]/40",
    chipBg: "bg-[#F7F6F0]",
    chipText: "text-[#1A0A1F]/60",
    accent: "text-[#E8730C]",
    accentBg: "bg-[#E8730C]/10",
  },
};

interface WorkoutHistoryItemProps {
  log: WorkoutLog;
  theme?: "kiki" | "trainer";
  defaultExpanded?: boolean;
  highlightExercise?: string;
}

export default function WorkoutHistoryItem({
  log, theme = "kiki", defaultExpanded = false, highlightExercise,
}: WorkoutHistoryItemProps) {
  const t = themes[theme];
  const [expanded, setExpanded] = useState(defaultExpanded);
  // Sync expanded state when the defaultExpanded prop changes (e.g. when user
  // types in the search box, the matching logs should auto-expand).
  useEffect(() => {
    setExpanded(defaultExpanded);
  }, [defaultExpanded]);
  const d = new Date(log.date + "T00:00:00");
  const dateStr = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

  return (
    <div className={`${t.cardBg} rounded-2xl border ${t.border} shadow-sm overflow-hidden`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className={`w-full px-5 py-4 flex items-center justify-between text-left ${t.hover} transition-colors`}
      >
        <div>
          <p className={`font-bold ${t.textPrimary} text-sm`}>{dateStr}</p>
          <p className={`text-xs ${t.textMuted} mt-0.5`}>
            {log.exercises.length} exercise{log.exercises.length !== 1 ? "s" : ""} · {log.dayOfWeek}
          </p>
        </div>
        <svg
          className={`w-5 h-5 ${t.textMuted} transition-transform ${expanded ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {expanded && (
        <div className={`px-5 pb-4 space-y-3 border-t ${t.border} pt-3`}>
          {log.exercises.map((ex) => {
            const isMatch = highlightExercise && matchesQuery(ex.exerciseName, highlightExercise);
            return (
              <div
                key={ex.exerciseId}
                className={isMatch ? `${t.accentBg} rounded-lg -mx-2 px-2 py-1.5` : ""}
              >
                <p className={`text-sm font-semibold ${isMatch ? t.accent : t.textPrimary}`}>
                  {ex.exerciseName}
                </p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {ex.sets.map((set) => (
                    <span
                      key={set.setNumber}
                      className={`text-xs ${t.chipBg} ${t.chipText} px-2.5 py-1 rounded-lg font-medium`}
                    >
                      {set.weight} lbs × {set.reps}
                    </span>
                  ))}
                </div>
                {ex.clientNote && (
                  <p className={`text-xs ${t.textMuted} italic mt-1.5`}>{ex.clientNote}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
