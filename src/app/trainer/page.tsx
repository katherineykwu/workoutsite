// Trainer Dashboard — Sweat-inspired dark theme
"use client";

import { useState, useEffect, useCallback } from "react";
import PasswordGate from "@/components/PasswordGate";
import ExerciseForm from "@/components/ExerciseForm";
import EquipmentSelector from "@/components/EquipmentSelector";
import VideoPlayer from "@/components/VideoPlayer";
import {
  getAllRoutines, saveRoutine, getRoutine, createBlankRoutine, getCurrentWeekMonday,
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
    if (sessionStorage.getItem("trainer-auth") === "true") setAuthenticated(true);
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
      console.error(err);
      setMessage("Failed to load routines.");
    }
    setLoading(false);
  }, []);

  useEffect(() => { if (authenticated) loadRoutines(); }, [authenticated, loadRoutines]);

  if (!authenticated) return <PasswordGate onSuccess={() => setAuthenticated(true)} />;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-hero">
        <div className="w-10 h-10 border-[3px] border-[#FF1A66] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const exercises = activeRoutine?.days[selectedDay]?.exercises || [];

  async function handleSaveExercise(exercise: Exercise) {
    if (!activeRoutine) return;
    const updated = { ...activeRoutine };
    const dayExercises = [...(updated.days[selectedDay]?.exercises || [])];
    const idx = dayExercises.findIndex((e) => e.id === exercise.id);
    if (idx >= 0) dayExercises[idx] = exercise; else dayExercises.push(exercise);
    updated.days[selectedDay] = { exercises: dayExercises };
    setActiveRoutine(updated); setShowForm(false); setEditingExercise(undefined);
    setSaving(true); await saveRoutine(updated); setSaving(false);
    showMsg("Exercise saved!");
  }

  async function handleDeleteExercise(id: string) {
    if (!activeRoutine) return;
    const updated = { ...activeRoutine };
    updated.days[selectedDay] = { exercises: (updated.days[selectedDay]?.exercises || []).filter((e) => e.id !== id) };
    setActiveRoutine(updated);
    setSaving(true); await saveRoutine(updated); setSaving(false);
    showMsg("Exercise removed.");
  }

  async function handleMoveExercise(id: string, dir: "up" | "down") {
    if (!activeRoutine) return;
    const updated = { ...activeRoutine };
    const arr = [...(updated.days[selectedDay]?.exercises || [])];
    const i = arr.findIndex((e) => e.id === id);
    const j = dir === "up" ? i - 1 : i + 1;
    if (i < 0 || j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    updated.days[selectedDay] = { exercises: arr };
    setActiveRoutine(updated); await saveRoutine(updated);
  }

  async function handleTogglePublish() {
    if (!activeRoutine) return;
    const updated = { ...activeRoutine, published: !activeRoutine.published };
    setActiveRoutine(updated);
    setSaving(true); await saveRoutine(updated); setSaving(false);
    showMsg(updated.published ? "Published!" : "Unpublished.");
  }

  async function handleSelectRoutine(routineId: string) {
    setLoading(true);
    const r = await getRoutine(routineId);
    if (r) { setActiveRoutine(r); setSelectedDay("Monday"); }
    setLoading(false);
  }

  async function handleCreateNewWeek() {
    const dateStr = prompt("Enter the Monday date (YYYY-MM-DD):");
    if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return;
    const r = createBlankRoutine(dateStr);
    await saveRoutine(r);
    setActiveRoutine(r); setRoutines([r, ...routines]);
    showMsg(`Created week of ${dateStr}`);
  }

  async function handleEquipmentChange(equipment: string[]) {
    if (!activeRoutine) return;
    const updated = { ...activeRoutine, equipment };
    setActiveRoutine(updated);
    setSaving(true); await saveRoutine(updated); setSaving(false);
    showMsg("Equipment updated!");
  }

  function showMsg(msg: string) { setMessage(msg); setTimeout(() => setMessage(""), 3000); }

  return (
    <div className="min-h-screen gradient-hero text-white">
      {/* Header */}
      <header className="border-b border-white/10 sticky top-0 z-10 bg-[#1A0A1F]/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-5 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold">Trainer Dashboard</h1>
            {activeRoutine && <p className="text-white/30 text-xs">Week of {activeRoutine.weekStart}</p>}
          </div>
          <div className="flex items-center gap-3">
            {saving && (
              <span className="text-xs text-white/40 flex items-center gap-1.5">
                <span className="w-2 h-2 bg-[#FF1A66] rounded-full animate-pulse" />Saving...
              </span>
            )}
            {message && (
              <span className="text-xs text-[#FF1A66] font-semibold bg-[#FF1A66]/10 px-3 py-1.5 rounded-full">
                {message}
              </span>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-5 py-6">
        {/* Controls */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <select
            value={activeRoutine?.id || ""}
            onChange={(e) => handleSelectRoutine(e.target.value)}
            className="px-4 py-2.5 bg-white/10 border border-white/10 rounded-xl text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FF1A66] [&>option]:text-black"
          >
            {routines.map((r) => (
              <option key={r.id} value={r.id}>Week of {r.weekStart}{r.published ? " (Live)" : ""}</option>
            ))}
          </select>
          <button onClick={handleCreateNewWeek} className="px-4 py-2.5 bg-white/10 border border-white/10 text-white/70 rounded-xl hover:bg-white/15 text-sm font-semibold transition-colors">
            + New Week
          </button>
          <button onClick={handleTogglePublish} className={`ml-auto px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeRoutine?.published
              ? "bg-white/10 text-[#FF1A66] border border-[#FF1A66]/30 hover:bg-[#FF1A66]/10"
              : "gradient-pink text-white shadow-lg shadow-[#FF1A66]/25 hover:opacity-90"
          }`}>
            {activeRoutine?.published ? "Unpublish" : "Publish Routine"}
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-1 bg-white/5 p-1 rounded-xl mb-6 w-fit border border-white/5">
          {(["exercises", "equipment"] as TrainerTab[]).map((tab) => (
            <button key={tab} onClick={() => setTrainerTab(tab)}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold capitalize transition-all ${
                trainerTab === tab ? "bg-[#FF1A66] text-white shadow-md" : "text-white/40 hover:text-white/60"
              }`}
            >{tab}</button>
          ))}
        </div>

        {/* Equipment tab */}
        {trainerTab === "equipment" && (
          <div className="bg-white/5 rounded-2xl border border-white/10 p-6">
            <EquipmentSelector selected={activeRoutine?.equipment || []} onChange={handleEquipmentChange} />
          </div>
        )}

        {/* Exercises tab */}
        {trainerTab === "exercises" && (
          <>
            {/* Day tabs */}
            <div className="flex gap-1.5 mb-6 overflow-x-auto scrollbar-hide pb-1">
              {DAYS_OF_WEEK.map((day) => {
                const count = activeRoutine?.days[day]?.exercises?.length || 0;
                return (
                  <button key={day} onClick={() => { setSelectedDay(day); setShowForm(false); setEditingExercise(undefined); }}
                    className={`px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                      selectedDay === day
                        ? "bg-[#FF1A66] text-white shadow-md shadow-[#FF1A66]/25"
                        : "bg-white/5 border border-white/10 text-white/40 hover:bg-white/10"
                    }`}>
                    {day}{count > 0 && <span className="ml-1.5 text-xs opacity-60">({count})</span>}
                  </button>
                );
              })}
            </div>

            {/* Exercise list */}
            <div className="space-y-3">
              {exercises.length === 0 && !showForm && (
                <div className="text-center py-16 bg-white/5 rounded-2xl border-2 border-dashed border-white/10">
                  <span className="text-4xl mb-4 block">🏋️</span>
                  <p className="text-white/30 mb-4">No exercises for {selectedDay} yet</p>
                  <button onClick={() => { setEditingExercise(undefined); setShowForm(true); }}
                    className="gradient-pink text-white px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-[#FF1A66]/25">
                    Add First Exercise
                  </button>
                </div>
              )}

              {exercises.map((exercise, index) => (
                <div key={exercise.id} className="bg-white/5 rounded-2xl border border-white/10 p-5 hover:bg-white/8 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#FF1A66] text-white flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-white">{exercise.name}</h3>
                        <div className="flex gap-3 mt-1.5 text-sm text-white/50">
                          <span className="font-medium">{exercise.sets} sets</span>
                          <span className="text-white/20">|</span>
                          <span className="font-medium">{exercise.reps} reps</span>
                          {exercise.restSeconds > 0 && (<><span className="text-white/20">|</span><span className="font-medium">{exercise.restSeconds}s rest</span></>)}
                        </div>
                        {exercise.notes && <p className="text-sm text-white/30 mt-1.5 italic">{exercise.notes}</p>}
                        {exercise.videoType !== "none" && exercise.videoUrl && (
                          <div className="mt-3 max-w-xs rounded-xl overflow-hidden">
                            <VideoPlayer videoType={exercise.videoType} videoUrl={exercise.videoUrl} />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleMoveExercise(exercise.id, "up")} disabled={index === 0}
                        className="p-2 text-white/30 hover:text-white hover:bg-white/10 rounded-lg disabled:opacity-20 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" /></svg>
                      </button>
                      <button onClick={() => handleMoveExercise(exercise.id, "down")} disabled={index === exercises.length - 1}
                        className="p-2 text-white/30 hover:text-white hover:bg-white/10 rounded-lg disabled:opacity-20 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                      </button>
                      <button onClick={() => { setEditingExercise(exercise); setShowForm(true); }}
                        className="p-2 text-[#FF1A66]/70 hover:text-[#FF1A66] hover:bg-[#FF1A66]/10 rounded-lg transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
                      </button>
                      <button onClick={() => handleDeleteExercise(exercise.id)}
                        className="p-2 text-red-400/50 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {exercises.length > 0 && !showForm && (
                <button onClick={() => { setEditingExercise(undefined); setShowForm(true); }}
                  className="w-full py-4 border-2 border-dashed border-white/10 rounded-2xl text-white/30 hover:text-[#FF1A66] hover:border-[#FF1A66]/30 hover:bg-[#FF1A66]/5 font-semibold transition-all">
                  + Add Exercise
                </button>
              )}

              {showForm && activeRoutine && (
                <ExerciseForm exercise={editingExercise} routineId={activeRoutine.id}
                  onSave={handleSaveExercise} onCancel={() => { setShowForm(false); setEditingExercise(undefined); }} />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
