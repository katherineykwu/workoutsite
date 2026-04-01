// Trainer Dashboard — password-protected page for managing workout routines
"use client";

import { useState, useEffect, useCallback } from "react";
import PasswordGate from "@/components/PasswordGate";
import ExerciseForm from "@/components/ExerciseForm";
import EquipmentSelector from "@/components/EquipmentSelector";
import VideoPlayer from "@/components/VideoPlayer";
import {
  getAllRoutines,
  saveRoutine,
  getRoutine,
  createBlankRoutine,
  getCurrentWeekMonday,
} from "@/lib/routines";
import type { Routine, Exercise, DayOfWeek } from "@/lib/types";
import { DAYS_OF_WEEK } from "@/lib/types";

type TrainerTab = "exercises" | "equipment";

export default function TrainerPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [activeRoutine, setActiveRoutine] = useState<Routine | null>(null);
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>("Monday");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | undefined>();
  const [trainerTab, setTrainerTab] = useState<TrainerTab>("exercises");

  useEffect(() => {
    if (sessionStorage.getItem("trainer-auth") === "true") {
      setAuthenticated(true);
    }
  }, []);

  const loadRoutines = useCallback(async () => {
    setLoading(true);
    try {
      const all = await getAllRoutines();
      setRoutines(all);
      const currentMonday = getCurrentWeekMonday();
      let current = all.find((r) => r.weekStart === currentMonday);
      if (!current) {
        current = createBlankRoutine(currentMonday);
        await saveRoutine(current);
        setRoutines([current, ...all]);
      }
      setActiveRoutine(current);
    } catch (err) {
      console.error("Failed to load routines:", err);
      setMessage("Failed to load routines.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (authenticated) loadRoutines();
  }, [authenticated, loadRoutines]);

  if (!authenticated) {
    return <PasswordGate onSuccess={() => setAuthenticated(true)} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const exercises = activeRoutine?.days[selectedDay]?.exercises || [];

  async function handleSaveExercise(exercise: Exercise) {
    if (!activeRoutine) return;
    const updated = { ...activeRoutine };
    const dayExercises = [...(updated.days[selectedDay]?.exercises || [])];
    const existingIndex = dayExercises.findIndex((e) => e.id === exercise.id);
    if (existingIndex >= 0) {
      dayExercises[existingIndex] = exercise;
    } else {
      dayExercises.push(exercise);
    }
    updated.days[selectedDay] = { exercises: dayExercises };
    setActiveRoutine(updated);
    setShowForm(false);
    setEditingExercise(undefined);
    setSaving(true);
    await saveRoutine(updated);
    setSaving(false);
    showMsg("Exercise saved!");
  }

  async function handleDeleteExercise(exerciseId: string) {
    if (!activeRoutine) return;
    const updated = { ...activeRoutine };
    const dayExercises = (updated.days[selectedDay]?.exercises || []).filter(
      (e) => e.id !== exerciseId
    );
    updated.days[selectedDay] = { exercises: dayExercises };
    setActiveRoutine(updated);
    setSaving(true);
    await saveRoutine(updated);
    setSaving(false);
    showMsg("Exercise removed.");
  }

  async function handleMoveExercise(exerciseId: string, direction: "up" | "down") {
    if (!activeRoutine) return;
    const updated = { ...activeRoutine };
    const dayExercises = [...(updated.days[selectedDay]?.exercises || [])];
    const index = dayExercises.findIndex((e) => e.id === exerciseId);
    if (index < 0) return;
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= dayExercises.length) return;
    [dayExercises[index], dayExercises[newIndex]] = [dayExercises[newIndex], dayExercises[index]];
    updated.days[selectedDay] = { exercises: dayExercises };
    setActiveRoutine(updated);
    await saveRoutine(updated);
  }

  async function handleTogglePublish() {
    if (!activeRoutine) return;
    const updated = { ...activeRoutine, published: !activeRoutine.published };
    setActiveRoutine(updated);
    setSaving(true);
    await saveRoutine(updated);
    setSaving(false);
    showMsg(updated.published ? "Published! Visible on home page." : "Unpublished.");
  }

  async function handleSelectRoutine(routineId: string) {
    setLoading(true);
    const routine = await getRoutine(routineId);
    if (routine) {
      setActiveRoutine(routine);
      setSelectedDay("Monday");
    }
    setLoading(false);
  }

  async function handleCreateNewWeek() {
    const dateStr = prompt("Enter the Monday date for the new week (YYYY-MM-DD):");
    if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return;
    const newRoutine = createBlankRoutine(dateStr);
    await saveRoutine(newRoutine);
    setActiveRoutine(newRoutine);
    setRoutines([newRoutine, ...routines]);
    showMsg(`Created routine for week of ${dateStr}`);
  }

  function showMsg(msg: string) {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  }

  async function handleEquipmentChange(equipment: string[]) {
    if (!activeRoutine) return;
    const updated = { ...activeRoutine, equipment };
    setActiveRoutine(updated);
    setSaving(true);
    await saveRoutine(updated);
    setSaving(false);
    showMsg("Equipment updated!");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="gradient-dark text-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-5 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold">Trainer Dashboard</h1>
            {activeRoutine && (
              <p className="text-slate-400 text-xs">Week of {activeRoutine.weekStart}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {saving && (
              <span className="text-xs text-slate-400 flex items-center gap-1.5">
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
                Saving...
              </span>
            )}
            {message && (
              <span className="text-xs text-emerald-400 font-medium bg-emerald-400/10 px-3 py-1.5 rounded-full">
                {message}
              </span>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-5 py-6">
        {/* Controls row */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <select
            value={activeRoutine?.id || ""}
            onChange={(e) => handleSelectRoutine(e.target.value)}
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            {routines.map((r) => (
              <option key={r.id} value={r.id}>
                Week of {r.weekStart} {r.published ? " (Live)" : ""}
              </option>
            ))}
          </select>

          <button
            onClick={handleCreateNewWeek}
            className="px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 text-sm font-semibold transition-colors"
          >
            + New Week
          </button>

          <button
            onClick={handleTogglePublish}
            className={`ml-auto px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeRoutine?.published
                ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                : "gradient-brand text-white shadow-md shadow-indigo-500/20 hover:opacity-90"
            }`}
          >
            {activeRoutine?.published ? "Unpublish" : "Publish Routine"}
          </button>
        </div>

        {/* Exercises / Equipment tab switcher */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-6 w-fit">
          <button
            onClick={() => setTrainerTab("exercises")}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              trainerTab === "exercises"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Exercises
          </button>
          <button
            onClick={() => setTrainerTab("equipment")}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              trainerTab === "equipment"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Equipment
          </button>
        </div>

        {/* Equipment tab content */}
        {trainerTab === "equipment" && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <EquipmentSelector
              selected={activeRoutine?.equipment || []}
              onChange={handleEquipmentChange}
            />
          </div>
        )}

        {/* Exercises tab content */}
        {trainerTab === "exercises" && (
        <>
        {/* Day tabs */}
        <div className="flex gap-1.5 mb-6 overflow-x-auto scrollbar-hide pb-1">
          {DAYS_OF_WEEK.map((day) => {
            const count = activeRoutine?.days[day]?.exercises?.length || 0;
            return (
              <button
                key={day}
                onClick={() => {
                  setSelectedDay(day);
                  setShowForm(false);
                  setEditingExercise(undefined);
                }}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                  selectedDay === day
                    ? "bg-slate-900 text-white shadow-md"
                    : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50"
                }`}
              >
                {day}
                {count > 0 && (
                  <span className={`ml-1.5 text-xs ${selectedDay === day ? "text-slate-400" : "text-slate-400"}`}>
                    ({count})
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Exercise list */}
        <div className="space-y-3">
          {exercises.length === 0 && !showForm && (
            <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-slate-200">
              <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </div>
              <p className="text-slate-400 mb-4">No exercises for {selectedDay} yet</p>
              <button
                onClick={() => {
                  setEditingExercise(undefined);
                  setShowForm(true);
                }}
                className="gradient-brand text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-all shadow-md shadow-indigo-500/20"
              >
                Add First Exercise
              </button>
            </div>
          )}

          {exercises.map((exercise, index) => (
            <div key={exercise.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900">{exercise.name}</h3>
                    <div className="flex gap-3 mt-1.5 text-sm text-slate-500">
                      <span className="font-medium">{exercise.sets} sets</span>
                      <span className="text-slate-300">|</span>
                      <span className="font-medium">{exercise.reps} reps</span>
                      {exercise.restSeconds > 0 && (
                        <>
                          <span className="text-slate-300">|</span>
                          <span className="font-medium">{exercise.restSeconds}s rest</span>
                        </>
                      )}
                    </div>
                    {exercise.notes && (
                      <p className="text-sm text-slate-400 mt-1.5 italic">{exercise.notes}</p>
                    )}
                    {exercise.videoType !== "none" && exercise.videoUrl && (
                      <div className="mt-3 max-w-xs rounded-xl overflow-hidden">
                        <VideoPlayer videoType={exercise.videoType} videoUrl={exercise.videoUrl} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleMoveExercise(exercise.id, "up")}
                    disabled={index === 0}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg disabled:opacity-30 transition-colors"
                    title="Move up"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleMoveExercise(exercise.id, "down")}
                    disabled={index === exercises.length - 1}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg disabled:opacity-30 transition-colors"
                    title="Move down"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>
                  <button
                    onClick={() => {
                      setEditingExercise(exercise);
                      setShowForm(true);
                    }}
                    className="p-2 text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteExercise(exercise.id)}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Add exercise button */}
          {exercises.length > 0 && !showForm && (
            <button
              onClick={() => {
                setEditingExercise(undefined);
                setShowForm(true);
              }}
              className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50/50 font-semibold transition-all"
            >
              + Add Exercise
            </button>
          )}

          {/* Exercise form */}
          {showForm && activeRoutine && (
            <ExerciseForm
              exercise={editingExercise}
              routineId={activeRoutine.id}
              onSave={handleSaveExercise}
              onCancel={() => {
                setShowForm(false);
                setEditingExercise(undefined);
              }}
            />
          )}
        </div>
        </>
        )}
      </div>
    </div>
  );
}
