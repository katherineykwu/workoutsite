// Your Workout Page — with workout logging
"use client";

import { useState, useEffect, useCallback } from "react";
import { getPublishedRoutine, getAllRoutines, getCurrentWeekMonday } from "@/lib/routines";
import { getAllLogs, saveWorkoutLog, getPersonalBests } from "@/lib/workoutLogs";
import type { Routine, DayOfWeek, SetLog, ExerciseLog, WorkoutLog, PersonalBest } from "@/lib/types";
import { DAYS_OF_WEEK } from "@/lib/types";
import ExerciseCard from "@/components/ExerciseCard";
import EquipmentDisplay from "@/components/EquipmentDisplay";
import MyEquipmentModal from "@/components/MyEquipmentModal";
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
  const [allRoutines, setAllRoutines] = useState<Routine[]>([]);
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(getTodayName());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCurrentWeek, setIsCurrentWeek] = useState(true);

  // Logging state
  const [loggingMode, setLoggingMode] = useState(false);
  const [logData, setLogData] = useState<Record<string, SetLog[]>>({});
  const [lastSession, setLastSession] = useState<Record<string, SetLog[]>>({});
  const [personalBests, setPersonalBests] = useState<Record<string, PersonalBest>>({});
  const [noteData, setNoteData] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [newPBs, setNewPBs] = useState<PersonalBest[]>([]);
  const [myEquipment, setMyEquipment] = useState<string[]>([]);
  const [gymPhotos, setGymPhotos] = useState<string[]>([]);
  const [showEquipmentModal, setShowEquipmentModal] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [r, allR, pbs, eqRes] = await Promise.all([
          getPublishedRoutine(),
          getAllRoutines(),
          getPersonalBests(),
          fetch("/api/my-equipment", { cache: "no-store" }),
        ]);
        setRoutine(r);
        // Keep all published routines for week navigation
        setAllRoutines(allR.filter((rt: Routine) => rt.published));
        if (r) setIsCurrentWeek(r.weekStart === getCurrentWeekMonday());
        setPersonalBests(pbs);
        if (eqRes.ok) {
          const eqData = await eqRes.json();
          setMyEquipment(eqData.equipment || []);
          setGymPhotos(eqData.gymPhotos || []);
        }
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

  function navigateWeek(direction: "prev" | "next") {
    if (!routine || allRoutines.length === 0) return;
    const currentIdx = allRoutines.findIndex((r) => r.id === routine.id);
    // allRoutines is sorted newest first, so "prev" = next index, "next" = prev index
    const newIdx = direction === "prev" ? currentIdx + 1 : currentIdx - 1;
    if (newIdx < 0 || newIdx >= allRoutines.length) return;
    const newRoutine = allRoutines[newIdx];
    setRoutine(newRoutine);
    setIsCurrentWeek(newRoutine.weekStart === getCurrentWeekMonday());
    setSelectedDay(getTodayName());
    setLoggingMode(false);
    setLogData({});
    setNoteData({});
  }

  const canGoPrev = routine && allRoutines.findIndex((r) => r.id === routine.id) < allRoutines.length - 1;
  const canGoNext = routine && allRoutines.findIndex((r) => r.id === routine.id) > 0;

  async function handleSaveEquipment(equipment: string[], photos: string[]) {
    setMyEquipment(equipment);
    setGymPhotos(photos);
    setShowEquipmentModal(false);
    await fetch("/api/my-equipment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ equipment, gymPhotos: photos }),
    });
  }

  function handleNoteChange(exerciseId: string, note: string) {
    setNoteData((prev) => ({ ...prev, [exerciseId]: note }));
  }

  async function handleFinishWorkout() {
    if (!routine) return;
    setSaving(true);

    const exercises = routine.days[selectedDay]?.exercises || [];
    const exerciseLogs: ExerciseLog[] = exercises
      .filter((ex) => logData[ex.id]?.some((s) => s.weight > 0 || s.reps > 0) || noteData[ex.id])
      .map((ex) => ({
        exerciseId: ex.id,
        exerciseName: ex.name,
        sets: logData[ex.id] || [],
        clientNote: noteData[ex.id] || "",
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
    setNoteData({});
    setNewPBs(result.newPersonalBests || []);
    setShowToast(true);

    // Refresh PBs
    const pbs = await getPersonalBests();
    setPersonalBests(pbs);
  }

  const loggedCount = Object.values(logData).filter((sets) => sets.some((s) => s.weight > 0 || s.reps > 0)).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF6F1]">
        <div className="text-center">
          <div className="w-10 h-10 border-[3px] border-[#C4706E] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#49443D]/40 text-sm font-medium">Loading your workout...</p>
        </div>
      </div>
    );
  }

  if (error || !routine) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF6F1] px-6">
        <div className="text-center max-w-xs">
          <span className="text-5xl block mb-4">🐱</span>
          <h1 className="text-2xl font-extrabold text-[#49443D] mb-2">{error ? "Oops!" : "No Workout Yet"}</h1>
          <p className="text-[#49443D]/40">{error || "Jamie hasn't published a routine yet. Check back soon!"}</p>
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
    <div className="min-h-screen bg-[#FAF6F1]">
      {/* Toast */}
      {showToast && <WorkoutToast newPBs={newPBs} onDismiss={() => setShowToast(false)} />}
      {showEquipmentModal && (
        <MyEquipmentModal
          selected={myEquipment}
          gymPhotos={gymPhotos}
          onSave={handleSaveEquipment}
          onClose={() => setShowEquipmentModal(false)}
        />
      )}

      {/* Header */}
      <header className="bg-[#FFFDF9] border-b border-[#49443D]/5 pb-6">
        <div className="max-w-2xl mx-auto px-5 pt-10 pb-2 flex items-start justify-between">
          <div>
            {/* Week navigator */}
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={() => navigateWeek("prev")}
                disabled={!canGoPrev}
                className="p-1 text-[#49443D]/20 hover:text-[#49443D]/60 disabled:opacity-0 transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
              <p className="text-[#C4706E] text-xs font-bold uppercase tracking-[0.2em]">
                {formatWeekRange(routine.weekStart)}
              </p>
              <button
                onClick={() => navigateWeek("next")}
                disabled={!canGoNext}
                className="p-1 text-[#49443D]/20 hover:text-[#49443D]/60 disabled:opacity-0 transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#49443D]">My Workout <span className="text-2xl">🐱</span></h1>
            <p className="text-[#49443D]/30 text-sm mt-1">
              {totalExercises} exercise{totalExercises !== 1 ? "s" : ""} this week
              {!isCurrentWeek && <span className="text-[#C4706E] ml-1.5">(past week)</span>}
            </p>
          </div>
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => setShowEquipmentModal(true)}
              className="flex items-center gap-1.5 bg-[#F5F0E8] hover:bg-[#EDE6DA] px-3.5 py-2 rounded-xl text-[#49443D]/50 hover:text-[#49443D] text-xs font-semibold transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              My Gear
            </button>
            <Link
              href="/progress"
              className="flex items-center gap-1.5 bg-[#F5F0E8] hover:bg-[#EDE6DA] px-3.5 py-2 rounded-xl text-[#49443D]/50 hover:text-[#49443D] text-xs font-semibold transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
              Progress
            </Link>
          </div>
        </div>

        {/* Day selector */}
        <div className="max-w-2xl mx-auto px-5 mt-5">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {DAYS_OF_WEEK.map((day) => {
              const count = routine.days[day]?.exercises?.length || 0;
              const isSelected = selectedDay === day;
              const isToday = day === today;
              return (
                <button key={day} onClick={() => { setSelectedDay(day); if (loggingMode) { setLoggingMode(false); setLogData({}); setNoteData({}); } }}
                  className={`relative flex flex-col items-center min-w-[50px] px-3 py-3 rounded-2xl transition-all flex-shrink-0 ${
                    isSelected ? "bg-[#C4706E] text-white shadow-lg shadow-[#C4706E]/30" : "bg-[#F5F0E8] text-[#49443D]/40 hover:bg-[#EDE6DA]"
                  }`}>
                  <span className={`text-[10px] uppercase tracking-wider mb-0.5 ${isSelected ? "text-white/80" : "text-[#49443D]/25"}`}>{day.slice(0, 3)}</span>
                  <span className="text-lg font-bold">{count || "–"}</span>
                  {isToday && !isSelected && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#C4706E] rounded-full border-2 border-white" />}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-5 py-6">
        <EquipmentDisplay equipmentIds={myEquipment} />

        {/* Day heading + Start Workout button */}
        <div className="flex items-center gap-3 mb-5">
          <h2 className="text-xl font-extrabold text-[#49443D]">{selectedDay}</h2>
          {selectedDay === today && (
            <span className="text-[10px] font-bold uppercase tracking-widest bg-[#C4706E] text-white px-2.5 py-1 rounded-full">Today</span>
          )}
          {exercises.length > 0 && !loggingMode && isCurrentWeek && (
            <button
              onClick={() => setLoggingMode(true)}
              className="ml-auto gradient-pink text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-[#C4706E]/20 hover:opacity-90 transition-all"
            >
              Start Workout
            </button>
          )}
          {loggingMode && (
            <button
              onClick={() => { setLoggingMode(false); setLogData({}); setNoteData({}); }}
              className="ml-auto bg-[#49443D]/10 text-[#49443D]/50 px-4 py-2 rounded-xl text-xs font-semibold hover:bg-[#49443D]/15 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>

        {/* Exercises */}
        {exercises.length === 0 ? (
          <div className="text-center py-20 bg-[#FFFDF9] rounded-3xl border border-[#49443D]/5">
            <span className="text-4xl mb-4 block">😸</span>
            <p className="text-[#49443D] text-lg font-bold">Rest Day</p>
            <p className="text-[#49443D]/40 text-sm mt-1">Even Jiji takes a nap sometimes. You&apos;ve earned it.</p>
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
                clientNote={noteData[exercise.id]}
                onSetChange={handleSetChange}
                onNoteChange={handleNoteChange}
              />
            ))}
          </div>
        )}
      </div>

      {/* Sticky bottom bar when logging */}
      {loggingMode && exercises.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-black/10 px-5 py-4 z-20">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <span className="text-sm text-[#49443D]/40 font-medium">
              {loggedCount}/{exercises.length} exercises logged
            </span>
            <button
              onClick={handleFinishWorkout}
              disabled={loggedCount === 0 || saving}
              className="gradient-pink text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-[#C4706E]/25 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {saving ? "Saving..." : "Finish Workout"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
