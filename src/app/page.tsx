// Your Workout Page — Sweat-inspired design
"use client";

import { useState, useEffect } from "react";
import { getPublishedRoutine } from "@/lib/routines";
import type { Routine, DayOfWeek } from "@/lib/types";
import { DAYS_OF_WEEK } from "@/lib/types";
import ExerciseCard from "@/components/ExerciseCard";
import EquipmentDisplay from "@/components/EquipmentDisplay";

function getTodayName(): DayOfWeek {
  const days: DayOfWeek[] = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  return days[new Date().getDay()];
}

function formatWeekRange(weekStart: string): string {
  const start = new Date(weekStart + "T00:00:00");
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  return `${start.toLocaleDateString("en-US", opts)} – ${end.toLocaleDateString("en-US", opts)}`;
}

export default function WorkoutPage() {
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(getTodayName());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try { setRoutine(await getPublishedRoutine()); }
      catch { setError("Couldn't load your workout."); }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-hero">
        <div className="text-center">
          <div className="w-10 h-10 border-[3px] border-[#FF1A66] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/50 text-sm font-medium">Loading your workout...</p>
        </div>
      </div>
    );
  }

  if (error || !routine) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-hero px-6">
        <div className="text-center max-w-xs">
          <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white/10">
            <span className="text-4xl">💪</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mb-2">
            {error ? "Oops!" : "No Workout Yet"}
          </h1>
          <p className="text-white/40 leading-relaxed">
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
    <div className="min-h-screen bg-[#F5F3F4]">
      {/* Dark hero header */}
      <header className="gradient-hero text-white pb-6">
        <div className="max-w-2xl mx-auto px-5 pt-12 pb-2">
          <p className="text-[#FF1A66] text-xs font-bold uppercase tracking-[0.2em] mb-2">
            {formatWeekRange(routine.weekStart)}
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight">My Workout</h1>
          <p className="text-white/30 text-sm mt-1">{totalExercises} exercises this week</p>
        </div>

        {/* Day selector */}
        <div className="max-w-2xl mx-auto px-5 mt-5">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {DAYS_OF_WEEK.map((day) => {
              const count = routine.days[day]?.exercises?.length || 0;
              const isSelected = selectedDay === day;
              const isToday = day === today;
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`relative flex flex-col items-center min-w-[50px] px-3 py-3 rounded-2xl transition-all flex-shrink-0 ${
                    isSelected
                      ? "bg-[#FF1A66] text-white shadow-lg shadow-[#FF1A66]/30"
                      : "bg-white/8 text-white/50 hover:bg-white/12"
                  }`}
                >
                  <span className={`text-[10px] uppercase tracking-wider mb-0.5 ${isSelected ? "text-white/80" : "text-white/30"}`}>
                    {day.slice(0, 3)}
                  </span>
                  <span className="text-lg font-bold">{count || "–"}</span>
                  {isToday && !isSelected && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#FF1A66] rounded-full border-2 border-[#210826]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-5 py-7">
        {/* Equipment section */}
        <EquipmentDisplay equipmentIds={routine.equipment || []} />

        {/* Day heading */}
        <div className="flex items-center gap-3 mb-5">
          <h2 className="text-xl font-extrabold text-[#1A0A1F]">{selectedDay}</h2>
          {selectedDay === today && (
            <span className="text-[10px] font-bold uppercase tracking-widest bg-[#FF1A66] text-white px-2.5 py-1 rounded-full">
              Today
            </span>
          )}
          {exercises.length > 0 && (
            <span className="text-xs text-[#1A0A1F]/40 ml-auto font-semibold">
              {exercises.length} exercise{exercises.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Exercises */}
        {exercises.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-black/5">
            <span className="text-4xl mb-4 block">😴</span>
            <p className="text-[#1A0A1F] text-lg font-bold">Rest Day</p>
            <p className="text-[#1A0A1F]/40 text-sm mt-1">Recover and come back stronger.</p>
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
