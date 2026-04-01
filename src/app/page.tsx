// Your Workout Page — shows the current week's published routine
"use client";

import { useState, useEffect } from "react";
import { getPublishedRoutine } from "@/lib/routines";
import type { Routine, DayOfWeek } from "@/lib/types";
import { DAYS_OF_WEEK } from "@/lib/types";
import ExerciseCard from "@/components/ExerciseCard";
import EquipmentDisplay from "@/components/EquipmentDisplay";

function getTodayName(): DayOfWeek {
  const days: DayOfWeek[] = [
    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
  ];
  return days[new Date().getDay()];
}

function formatWeekRange(weekStart: string): string {
  const start = new Date(weekStart + "T00:00:00");
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  return `${start.toLocaleDateString("en-US", opts)} - ${end.toLocaleDateString("en-US", opts)}`;
}

export default function WorkoutPage() {
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(getTodayName());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const r = await getPublishedRoutine();
        setRoutine(r);
      } catch (err) {
        console.error("Failed to load routine:", err);
        setError("Couldn't load your workout. Check back soon!");
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fb]">
        <div className="text-center">
          <div className="w-12 h-12 border-[3px] border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400 font-medium text-sm">Loading your workout...</p>
        </div>
      </div>
    );
  }

  if (error || !routine) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9fb] px-6">
        <div className="text-center max-w-xs">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
            <svg className="w-10 h-10 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mb-2">
            {error ? "Oops!" : "No Workout Yet"}
          </h1>
          <p className="text-slate-400 leading-relaxed">
            {error || "Your trainer hasn't published a routine yet. Check back soon!"}
          </p>
        </div>
      </div>
    );
  }

  const exercises = routine.days[selectedDay]?.exercises || [];
  const today = getTodayName();
  const totalExercises = DAYS_OF_WEEK.reduce(
    (sum, day) => sum + (routine.days[day]?.exercises?.length || 0), 0
  );

  return (
    <div className="min-h-screen bg-[#f8f9fb]">
      {/* Hero header */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-700" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-60" />

        <div className="relative max-w-2xl mx-auto px-5 pt-10 pb-5">
          <p className="text-indigo-200 text-xs font-bold uppercase tracking-[0.2em] mb-1.5">
            {formatWeekRange(routine.weekStart)}
          </p>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            My Workout
          </h1>
          <p className="text-indigo-200/70 text-sm mt-1">
            {totalExercises} exercises this week
          </p>
        </div>

        {/* Day tabs inside header */}
        <div className="relative max-w-2xl mx-auto px-5 pb-5">
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
            {DAYS_OF_WEEK.map((day) => {
              const count = routine.days[day]?.exercises?.length || 0;
              const isSelected = selectedDay === day;
              const isToday = day === today;
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`relative flex flex-col items-center px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all flex-shrink-0 min-w-[52px] ${
                    isSelected
                      ? "bg-white text-indigo-700 shadow-lg shadow-black/10"
                      : "bg-white/10 text-white/70 hover:bg-white/20 backdrop-blur-sm"
                  }`}
                >
                  <span className="text-[10px] uppercase tracking-wider opacity-60 mb-0.5">
                    {day.slice(0, 3)}
                  </span>
                  <span className="text-base">{count || "-"}</span>
                  {isToday && (
                    <span className={`absolute -bottom-0.5 w-1.5 h-1.5 rounded-full ${isSelected ? "bg-indigo-500" : "bg-orange-400"}`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Content area */}
      <div className="max-w-2xl mx-auto px-5 py-6">
        {/* Equipment section */}
        <EquipmentDisplay equipmentIds={routine.equipment || []} />

        {/* Day heading */}
        <div className="flex items-center gap-3 mb-5">
          <h2 className="text-xl font-extrabold text-slate-900">{selectedDay}</h2>
          {selectedDay === today && (
            <span className="text-[10px] font-bold uppercase tracking-widest bg-gradient-to-r from-orange-500 to-amber-500 text-white px-2.5 py-1 rounded-full">
              Today
            </span>
          )}
          {exercises.length > 0 && (
            <span className="text-xs text-slate-400 ml-auto font-medium">
              {exercises.length} exercise{exercises.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Exercises */}
        {exercises.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">😴</span>
            </div>
            <p className="text-slate-900 text-lg font-bold">Rest Day</p>
            <p className="text-slate-400 text-sm mt-1">Recover and come back stronger.</p>
          </div>
        ) : (
          <div className="space-y-4 pb-10">
            {exercises.map((exercise, index) => (
              <ExerciseCard key={exercise.id} exercise={exercise} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
