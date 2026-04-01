// Your Workout Page — shows the current week's published routine
"use client";

import { useState, useEffect } from "react";
import { getPublishedRoutine } from "@/lib/routines";
import type { Routine, DayOfWeek } from "@/lib/types";
import { DAYS_OF_WEEK } from "@/lib/types";
import ExerciseCard from "@/components/ExerciseCard";

function getTodayName(): DayOfWeek {
  const days: DayOfWeek[] = [
    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
  ];
  return days[new Date().getDay()];
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400 font-medium">Loading your workout...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6">
        <p className="text-slate-500">{error}</p>
      </div>
    );
  }

  if (!routine) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6">
        <div className="text-center max-w-xs">
          <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">No Workout Yet</h1>
          <p className="text-slate-400 leading-relaxed">
            Your trainer hasn&apos;t published a routine yet. Check back soon!
          </p>
        </div>
      </div>
    );
  }

  const exercises = routine.days[selectedDay]?.exercises || [];
  const today = getTodayName();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero header with gradient */}
      <header className="gradient-brand text-white">
        <div className="max-w-2xl mx-auto px-5 pt-12 pb-6">
          <p className="text-indigo-200 text-sm font-medium uppercase tracking-wider mb-1">
            Week of {routine.weekStart}
          </p>
          <h1 className="text-3xl font-bold tracking-tight">My Workout</h1>
        </div>

        {/* Day tabs inside header */}
        <div className="max-w-2xl mx-auto px-5 pb-4">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {DAYS_OF_WEEK.map((day) => {
              const count = routine.days[day]?.exercises?.length || 0;
              const isSelected = selectedDay === day;
              const isToday = day === today;
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`relative px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                    isSelected
                      ? "bg-white text-indigo-700 shadow-lg shadow-indigo-900/20"
                      : "bg-white/15 text-white/80 hover:bg-white/25"
                  }`}
                >
                  {day.slice(0, 3)}
                  {count > 0 && (
                    <span className={`ml-1.5 text-xs ${isSelected ? "text-indigo-400" : "text-white/50"}`}>
                      {count}
                    </span>
                  )}
                  {isToday && !isSelected && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-orange-400 rounded-full border-2 border-indigo-500" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-5 py-6">
        {/* Day heading */}
        <div className="flex items-center gap-3 mb-5">
          <h2 className="text-xl font-bold text-slate-900">{selectedDay}</h2>
          {selectedDay === today && (
            <span className="text-xs font-bold uppercase tracking-wider bg-orange-100 text-orange-600 px-2.5 py-1 rounded-full">
              Today
            </span>
          )}
          {exercises.length > 0 && (
            <span className="text-sm text-slate-400 ml-auto">
              {exercises.length} exercise{exercises.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Exercises */}
        {exercises.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
              </svg>
            </div>
            <p className="text-slate-400 text-lg font-medium">Rest Day</p>
            <p className="text-slate-300 text-sm mt-1">You&apos;ve earned it. Recover and come back stronger.</p>
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
