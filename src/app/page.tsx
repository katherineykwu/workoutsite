// Your Workout Page — with workout logging
"use client";

import { useState, useEffect, useCallback } from "react";
import { getPublishedRoutine } from "@/lib/routines";
import { getAllLogs, saveWorkoutLog, getPersonalBests } from "@/lib/workoutLogs";
import type { Routine, DayOfWeek, SetLog, ExerciseLog, WorkoutLog, PersonalBest } from "@/lib/types";
import { DAYS_OF_WEEK } from "@/lib/types";
import ExerciseCard from "@/components/ExerciseCard";
import EquipmentDisplay from "@/components/EquipmentDisplay";
import WorkoutToast from "@/components/WorkoutToast";
import Link from "next/link";

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

function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

export default function WorkoutPage() {
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(getTodayName());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Logging state
  const [loggingMode, setLoggingMode] = useState(false);
  const [logData, setLogData] = useState<Record<string, SetLog[]>>({});
  const [lastSession, setLastSession] = useState<Record<string, SetLog[]>>({});
  const [personalBests, setPersonalBests] = useState<Record<string, PersonalBest>>({});
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [newPBs, setNewPBs] = useState<PersonalBest[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const [r, pbs] = await Promise.all([getPublishedRoutine(), getPersonalBests()]);
        setRoutine(r);
        setPersonalBests(pbs);
      } catch { setError("Couldn't load your workout."); }
      setLoading(false);
    }
    load();
  }, []);

  // Load last session data when day changes
  const loadLastSession = useCallback(async (exercises: { id: string; name: string }[]) => {
    try {
      const logs = await getAllLogs();
      const lastMap: Record<string, SetLog[]> = {};
      for (const ex of exercises) {
        // Find the most recent log containing this exercise
        for (const log of logs) {
          const match = log.exercises.find(
            (e) => e.exerciseName.toLowerCase().trim() === ex.name.toLowerCase().trim()
          );
          if (match) {
            lastMap[ex.id] = match.sets;
            break;
          }
        }
      }
      setLastSession(lastMap);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (routine) {
      const exercises = routine.days[selectedDay]?.exercises || [];
      if (exercises.length > 0) {
        loadLastSession(exercises.map((e) => ({ id: e.id, name: e.name })));
      }
    }
  }, [routine, selectedDay, loadLastSession]);

  function handleSetChange(exerciseId: string, setNumber: number, weight: number, reps: number) {
    setLogData((prev) => {
      const sets = [...(prev[exerciseId] || [])];
      const idx = sets.findIndex((s) => s.setNumber === setNumber);
      const entry = { setNumber, weight, reps };
      if (idx >= 0) sets[idx] = entry; else sets.push(entry);
      return { ...prev, [exerciseId]: sets };
    });
  }

  async function handleFinishWorkout() {
    if (!routine) return;
    setSaving(true);

    const exercises = routine.days[selectedDay]?.exercises || [];
    const exerciseLogs: ExerciseLog[] = exercises
      .filter((ex) => logData[ex.id]?.some((s) => s.weight > 0 || s.reps > 0))
      .map((ex) => ({
        exerciseId: ex.id,
        exerciseName: ex.name,
        sets: logData[ex.id] || [],
      }));

    const log: WorkoutLog = {
      id: `wlog-${Date.now()}`,
      date: todayISO(),
      dayOfWeek: selectedDay,
      routineId: routine.id,
      exercises: exerciseLogs,
      completedAt: Date.now(),
    };

    const result = await saveWorkoutLog(log);
    setSaving(false);
    setLoggingMode(false);
    setLogData({});
    setNewPBs(result.newPersonalBests || []);
    setShowToast(true);

    // Refresh PBs
    const pbs = await getPersonalBests();
    setPersonalBests(pbs);
  }

  const loggedCount = Object.values(logData).filter((sets) => sets.some((s) => s.weight > 0 || s.reps > 0)).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-10 h-10 border-[3px] border-[#FF1A66] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#1A0A1F]/40 text-sm font-medium">Loading your workout...</p>
        </div>
      </div>
    );
  }

  if (error || !routine) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-6">
        <div className="text-center max-w-xs">
          <span className="text-5xl block mb-4">💪</span>
          <h1 className="text-2xl font-extrabold text-[#1A0A1F] mb-2">{error ? "Oops!" : "No Workout Yet"}</h1>
          <p className="text-[#1A0A1F]/40">{error || "Your trainer hasn't published a routine yet."}</p>
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
      {/* Toast */}
      {showToast && <WorkoutToast newPBs={newPBs} onDismiss={() => setShowToast(false)} />}

      {/* Header */}
      <header className="bg-white border-b border-black/5 pb-6">
        <div className="max-w-2xl mx-auto px-5 pt-10 pb-2 flex items-start justify-between">
          <div>
            <p className="text-[#FF1A66] text-xs font-bold uppercase tracking-[0.2em] mb-2">
              {formatWeekRange(routine.weekStart)}
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#1A0A1F]">My Workout</h1>
            <p className="text-[#1A0A1F]/30 text-sm mt-1">{totalExercises} exercises this week</p>
          </div>
          <Link
            href="/progress"
            className="mt-2 flex items-center gap-1.5 bg-[#F5F3F4] hover:bg-[#EAE6E8] px-3.5 py-2 rounded-xl text-[#1A0A1F]/50 hover:text-[#1A0A1F] text-xs font-semibold transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
            Progress
          </Link>
        </div>

        {/* Day selector */}
        <div className="max-w-2xl mx-auto px-5 mt-5">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {DAYS_OF_WEEK.map((day) => {
              const count = routine.days[day]?.exercises?.length || 0;
              const isSelected = selectedDay === day;
              const isToday = day === today;
              return (
                <button key={day} onClick={() => { setSelectedDay(day); if (loggingMode) { setLoggingMode(false); setLogData({}); } }}
                  className={`relative flex flex-col items-center min-w-[50px] px-3 py-3 rounded-2xl transition-all flex-shrink-0 ${
                    isSelected ? "bg-[#FF1A66] text-white shadow-lg shadow-[#FF1A66]/30" : "bg-[#F5F3F4] text-[#1A0A1F]/40 hover:bg-[#EAE6E8]"
                  }`}>
                  <span className={`text-[10px] uppercase tracking-wider mb-0.5 ${isSelected ? "text-white/80" : "text-[#1A0A1F]/25"}`}>{day.slice(0, 3)}</span>
                  <span className="text-lg font-bold">{count || "–"}</span>
                  {isToday && !isSelected && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#FF1A66] rounded-full border-2 border-white" />}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-5 py-6">
        <EquipmentDisplay equipmentIds={routine.equipment || []} />

        {/* Day heading + Start Workout button */}
        <div className="flex items-center gap-3 mb-5">
          <h2 className="text-xl font-extrabold text-[#1A0A1F]">{selectedDay}</h2>
          {selectedDay === today && (
            <span className="text-[10px] font-bold uppercase tracking-widest bg-[#FF1A66] text-white px-2.5 py-1 rounded-full">Today</span>
          )}
          {exercises.length > 0 && !loggingMode && (
            <button
              onClick={() => setLoggingMode(true)}
              className="ml-auto gradient-pink text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-[#FF1A66]/20 hover:opacity-90 transition-all"
            >
              Start Workout
            </button>
          )}
          {loggingMode && (
            <button
              onClick={() => { setLoggingMode(false); setLogData({}); }}
              className="ml-auto bg-[#1A0A1F]/10 text-[#1A0A1F]/50 px-4 py-2 rounded-xl text-xs font-semibold hover:bg-[#1A0A1F]/15 transition-colors"
            >
              Cancel
            </button>
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
          <div className="space-y-4 pb-24">
            {exercises.map((exercise, index) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                index={index}
                loggingMode={loggingMode}
                currentSets={logData[exercise.id]}
                lastSets={lastSession[exercise.id]}
                personalBest={personalBests[exercise.name.toLowerCase().trim()]}
                onSetChange={handleSetChange}
              />
            ))}
          </div>
        )}
      </div>

      {/* Sticky bottom bar when logging */}
      {loggingMode && exercises.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-black/10 px-5 py-4 z-20">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <span className="text-sm text-[#1A0A1F]/40 font-medium">
              {loggedCount}/{exercises.length} exercises logged
            </span>
            <button
              onClick={handleFinishWorkout}
              disabled={loggedCount === 0 || saving}
              className="gradient-pink text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-[#FF1A66]/25 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {saving ? "Saving..." : "Finish Workout"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
