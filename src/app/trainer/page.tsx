// Trainer Dashboard — Sweat-inspired dark theme
"use client";

import { useState, useEffect, useCallback } from "react";
import PasswordGate from "@/components/PasswordGate";
import ExerciseForm from "@/components/ExerciseForm";
import EquipmentDisplay from "@/components/EquipmentDisplay";
import ProgressChart from "@/components/ProgressChart";
import VideoPlayer from "@/components/VideoPlayer";
import {
  getAllRoutines, saveRoutine, getRoutine, createBlankRoutine, getCurrentWeekMonday,
} from "@/lib/routines";
import { getAllLogs, getPersonalBests } from "@/lib/workoutLogs";
import type { Routine, Exercise, DayOfWeek, WorkoutLog, PersonalBest } from "@/lib/types";
import { DAYS_OF_WEEK } from "@/lib/types";
import { groupExercises } from "@/lib/groupExercises";

type TrainerTab = "exercises" | "equipment" | "activity";

// Fetch client's equipment selection + gym photos
async function fetchClientEquipment(): Promise<{ equipment: string[]; gymPhotos: string[] }> {
  const res = await fetch("/api/my-equipment", { cache: "no-store" });
  if (!res.ok) return { equipment: [], gymPhotos: [] };
  return res.json();
}

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
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
  const [clientPBs, setClientPBs] = useState<Record<string, PersonalBest>>({});
  const [clientEquipment, setClientEquipment] = useState<string[]>([]);
  const [clientGymPhotos, setClientGymPhotos] = useState<string[]>([]);
  const [chartExercise, setChartExercise] = useState<string>("");

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

  useEffect(() => {
    if (authenticated && (trainerTab === "activity" || trainerTab === "equipment")) {
      if (trainerTab === "activity" && workoutLogs.length === 0) {
        loadClientActivity();
      }
      if (trainerTab === "equipment" && clientEquipment.length === 0) {
        fetchClientEquipment().then((d) => { setClientEquipment(d.equipment || []); setClientGymPhotos(d.gymPhotos || []); });
      }
    }
  }, [authenticated, trainerTab]);

  if (!authenticated) return <PasswordGate onSuccess={() => setAuthenticated(true)} />;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F6F0]">
        <div className="w-10 h-10 border-[3px] border-[#4A5D23] border-t-transparent rounded-full animate-spin" />
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



  async function loadClientActivity() {
    const [logs, pbs, eqData] = await Promise.all([getAllLogs(), getPersonalBests(), fetchClientEquipment()]);
    setWorkoutLogs(logs);
    setClientPBs(pbs);
    setClientEquipment(eqData.equipment || []);
    setClientGymPhotos(eqData.gymPhotos || []);
    // Auto-select first exercise for progress chart
    const names = new Set<string>();
    for (const log of logs) for (const ex of log.exercises) names.add(ex.exerciseName);
    if (names.size > 0 && !chartExercise) setChartExercise([...names][0]);
  }

  function showMsg(msg: string) { setMessage(msg); setTimeout(() => setMessage(""), 3000); }

  return (
    <div className="min-h-screen bg-[#F7F6F0]">
      {/* Header — army green with personal welcome */}
      <header className="border-b border-[#4A5D23]/10 sticky top-0 z-10 bg-white/95 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🦦</span>
            <div>
              <h1 className="text-lg font-bold text-[#4A5D23]">Welcome, Jamie!</h1>
              {activeRoutine && <p className="text-[#4A5D23]/40 text-xs">Week of {activeRoutine.weekStart}</p>}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {saving && (
              <span className="text-xs text-[#4A5D23]/40 flex items-center gap-1.5">
                <span className="w-2 h-2 bg-[#E8730C] rounded-full animate-pulse" />Saving...
              </span>
            )}
            {message && (
              <span className="text-xs text-[#E8730C] font-semibold bg-[#E8730C]/10 px-3 py-1.5 rounded-full">
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
            className="px-4 py-2.5 bg-white border border-[#4A5D23]/15 rounded-xl text-[#1A0A1F] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#4A5D23]"
          >
            {routines.map((r) => (
              <option key={r.id} value={r.id}>Week of {r.weekStart}{r.published ? " (Live)" : ""}{(r.repeatWeeks || 1) > 1 ? ` (${r.repeatWeeks}wk)` : ""}</option>
            ))}
          </select>
          <button onClick={handleCreateNewWeek} className="px-4 py-2.5 bg-white border border-[#4A5D23]/15 text-[#4A5D23]/60 rounded-xl hover:bg-[#4A5D23]/5 text-sm font-semibold transition-colors">
            + New Week
          </button>
          {/* Repeat weeks */}
          <div className="flex items-center gap-2 bg-white border border-[#4A5D23]/15 rounded-xl px-3 py-1.5">
            <span className="text-xs text-[#1A0A1F]/40 font-medium whitespace-nowrap">Repeat</span>
            <select
              value={activeRoutine?.repeatWeeks || 1}
              onChange={async (e) => {
                if (!activeRoutine) return;
                const updated = { ...activeRoutine, repeatWeeks: Number(e.target.value) };
                setActiveRoutine(updated);
                setSaving(true); await saveRoutine(updated); setSaving(false);
                showMsg(Number(e.target.value) > 1 ? `Repeats for ${e.target.value} weeks` : "Single week");
              }}
              className="text-sm font-bold text-[#4A5D23] bg-transparent focus:outline-none cursor-pointer"
            >
              {[1, 2, 3, 4, 5, 6, 8].map((n) => (
                <option key={n} value={n}>{n} {n === 1 ? "week" : "weeks"}</option>
              ))}
            </select>
          </div>
          <button onClick={handleTogglePublish} className={`ml-auto px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeRoutine?.published
              ? "bg-white text-[#E8730C] border border-[#E8730C]/30 hover:bg-[#E8730C]/5"
              : "bg-[#4A5D23] text-white shadow-lg shadow-[#4A5D23]/25 hover:bg-[#3D4E1C]"
          }`}>
            {activeRoutine?.published ? "Unpublish" : "Publish Routine"}
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-1 bg-[#4A5D23]/8 p-1 rounded-xl mb-6 w-fit">
          {(["exercises", "equipment", "activity"] as TrainerTab[]).map((tab) => (
            <button key={tab} onClick={() => setTrainerTab(tab)}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold capitalize transition-all ${
                trainerTab === tab ? "bg-[#4A5D23] text-white shadow-md" : "text-[#4A5D23]/40 hover:text-[#4A5D23]/60"
              }`}
            >{tab}</button>
          ))}
        </div>

        {/* Equipment tab — shows client's available equipment (read-only) */}
        {trainerTab === "equipment" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[#E8730C] text-xs font-bold uppercase tracking-[0.15em] mb-1">Client&apos;s Equipment</p>
                <p className="text-[#1A0A1F]/40 text-sm">What Katherine has access to right now</p>
              </div>
              <button onClick={() => fetchClientEquipment().then((d) => { setClientEquipment(d.equipment || []); setClientGymPhotos(d.gymPhotos || []); })}
                className="text-xs text-[#1A0A1F]/30 hover:text-[#1A0A1F]/60 font-medium transition-colors">
                Refresh
              </button>
            </div>
            {clientEquipment.length > 0 ? (
              <EquipmentDisplay equipmentIds={clientEquipment} />
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl border border-black/5">
                <span className="text-3xl mb-3 block">🏋️</span>
                <p className="text-[#1A0A1F]/30 text-sm">Katherine hasn&apos;t selected her equipment yet</p>
              </div>
            )}

            {/* Gym photos from client */}
            {clientGymPhotos.length > 0 && (
              <div className="mt-6">
                <p className="text-[#E8730C] text-xs font-bold uppercase tracking-[0.15em] mb-2">Gym Photos</p>
                <p className="text-[#1A0A1F]/40 text-sm mb-4">Photos from Katherine&apos;s gym</p>
                <div className="grid grid-cols-2 gap-3">
                  {clientGymPhotos.map((url, i) => (
                    <div key={i} className="rounded-2xl overflow-hidden bg-[#F7F6F0] aspect-[4/3] border border-black/5 shadow-sm">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`Client gym photo ${i + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Activity tab — client's logged workouts */}
        {trainerTab === "activity" && (
          <div className="space-y-6">
            {/* Personal Bests summary */}
            {Object.keys(clientPBs).length > 0 && (
              <div>
                <p className="text-[#E8730C] text-xs font-bold uppercase tracking-[0.15em] mb-2">Personal Records</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {Object.values(clientPBs).sort((a, b) => b.weight - a.weight).map((pb) => (
                    <div key={pb.exerciseName} className="bg-white rounded-xl border border-black/5 shadow-sm p-3 border-l-4 border-l-[#4A5D23]">
                      <p className="text-xs font-bold text-[#1A0A1F] truncate">{pb.displayName}</p>
                      <p className="text-lg font-extrabold text-[#E8730C]">{pb.weight} <span className="text-xs text-[#1A0A1F]/30">lbs</span></p>
                      <p className="text-[10px] text-[#1A0A1F]/30">{pb.reps} reps · {pb.date}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Progress chart */}
            {workoutLogs.length > 0 && (() => {
              const exerciseNames = Array.from(new Set(workoutLogs.flatMap((l) => l.exercises.map((e) => e.exerciseName))));
              return exerciseNames.length > 0 ? (
                <div>
                  <p className="text-[#E8730C] text-xs font-bold uppercase tracking-[0.15em] mb-2">Progress</p>
                  <p className="text-lg font-extrabold text-[#1A0A1F] mb-4">Katherine&apos;s Strength Over Time</p>
                  <div className="flex gap-1.5 overflow-x-auto scrollbar-hide mb-4 pb-1">
                    {exerciseNames.map((name) => (
                      <button key={name} onClick={() => setChartExercise(name)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                          chartExercise === name
                            ? "bg-[#4A5D23] text-white shadow-md"
                            : "bg-white border border-black/5 text-[#1A0A1F]/50 hover:bg-[#F7F6F0]"
                        }`}>
                        {name}
                      </button>
                    ))}
                  </div>
                  <div className="bg-white rounded-2xl border border-black/5 p-4 shadow-sm">
                    <ProgressChart logs={workoutLogs} exerciseName={chartExercise || exerciseNames[0]} />
                  </div>
                </div>
              ) : null;
            })()}

            {/* Workout logs */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-[#E8730C] text-xs font-bold uppercase tracking-[0.15em]">Workout History</p>
                <button onClick={loadClientActivity} className="text-xs text-[#1A0A1F]/30 hover:text-[#1A0A1F]/60 font-medium transition-colors">
                  Refresh
                </button>
              </div>

              {workoutLogs.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-black/5">
                  <span className="text-3xl mb-3 block">🦦</span>
                  <p className="text-[#1A0A1F]/30 text-sm">Katherine hasn&apos;t logged any workouts yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {workoutLogs.map((log) => {
                    const d = new Date(log.date + "T00:00:00");
                    const dateStr = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
                    return (
                      <div key={log.id} className="bg-white rounded-2xl border border-black/5 shadow-sm p-5">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="font-bold text-[#1A0A1F] text-sm">{dateStr}</p>
                            <p className="text-[10px] text-[#1A0A1F]/30">{log.dayOfWeek} · {log.exercises.length} exercise{log.exercises.length !== 1 ? "s" : ""}</p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          {log.exercises.map((ex) => (
                            <div key={ex.exerciseId} className="border-t border-black/5 pt-3 first:border-0 first:pt-0">
                              <p className="text-sm font-semibold text-[#1A0A1F]">{ex.exerciseName}</p>
                              <div className="flex flex-wrap gap-1.5 mt-1.5">
                                {ex.sets.map((set) => (
                                  <span key={set.setNumber} className="text-xs bg-[#F7F6F0] text-[#1A0A1F]/60 px-2.5 py-1 rounded-lg font-medium">
                                    {set.weight} lbs × {set.reps}
                                  </span>
                                ))}
                              </div>
                              {ex.clientNote && (
                                <div className="mt-2 flex items-start gap-2 bg-[#4A5D23]/5 rounded-lg px-3 py-2">
                                  <svg className="w-3.5 h-3.5 text-[#E8730C] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                                  </svg>
                                  <p className="text-xs text-[#E8730C] font-medium leading-relaxed">{ex.clientNote}</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
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
                        ? "bg-[#4A5D23] text-white shadow-md shadow-[#E8730C]/25"
                        : "bg-white border border-black/5 text-[#1A0A1F]/40 hover:bg-[#F7F6F0]"
                    }`}>
                    {day}{count > 0 && <span className="ml-1.5 text-xs opacity-60">({count})</span>}
                  </button>
                );
              })}
            </div>

            {/* Exercise list */}
            <div className="space-y-3">
              {exercises.length === 0 && !showForm && (
                <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-black/10">
                  <span className="text-4xl mb-4 block">🦦</span>
                  <p className="text-[#1A0A1F]/30 mb-4">No exercises for {selectedDay} yet — time to build!</p>
                  <button onClick={() => { setEditingExercise(undefined); setShowForm(true); }}
                    className="bg-[#4A5D23] text-white px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-[#E8730C]/25">
                    Add First Exercise
                  </button>
                </div>
              )}

              {(() => {
                const groups = groupExercises(exercises);
                let globalIdx = 0;
                return groups.map((group, gi) => {
                  const isSuperset = group.supersetGroup && group.exercises.length > 1;
                  const startIdx = globalIdx;
                  globalIdx += group.exercises.length;

                  if (isSuperset) {
                    return (
                      <div key={`group-${gi}`} className="rounded-2xl border border-[#E8730C]/20 bg-white overflow-hidden">
                        <div className="px-5 pt-4 pb-2 flex items-center justify-between">
                          <div>
                            {group.label && <p className="font-bold text-[#1A0A1F] text-sm mb-1">{group.label}</p>}
                            <span className="inline-block text-[10px] font-bold uppercase tracking-widest bg-[#E8730C]/10 text-[#E8730C] px-2.5 py-1 rounded-full">Superset</span>
                          </div>
                          <span className="text-lg font-extrabold text-[#E8730C]">x{group.exercises[0].sets}</span>
                        </div>
                        <div className="border-l-4 border-[#E8730C]/30 ml-4 mr-2 mb-3 space-y-2">
                          {group.exercises.map((exercise, ei) => {
                            const flatIdx = startIdx + ei;
                            return (
                              <div key={exercise.id} className="pl-3 py-2 flex items-start justify-between gap-3">
                                <div className="flex items-start gap-2.5 flex-1 min-w-0">
                                  <span className="flex-shrink-0 w-7 h-7 rounded-md bg-[#4A5D23] text-white flex items-center justify-center text-xs font-bold">{flatIdx + 1}</span>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-[#1A0A1F] text-sm">{exercise.name}</p>
                                    <p className="text-xs text-[#1A0A1F]/40 mt-0.5">{exercise.reps} reps{exercise.targetWeight > 0 ? ` · ${exercise.targetWeight} lbs` : ""}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-0.5">
                                  <button onClick={() => { setEditingExercise(exercise); setShowForm(true); }} className="p-1.5 text-[#E8730C]/50 hover:text-[#E8730C] rounded transition-colors">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
                                  </button>
                                  <button onClick={() => handleDeleteExercise(exercise.id)} className="p-1.5 text-red-300 hover:text-red-500 rounded transition-colors">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }

                  // Solo exercise — render as before
                  const exercise = group.exercises[0];
                  const flatIdx = startIdx;
                  return (
                    <div key={exercise.id} className="bg-white rounded-2xl border border-black/5 shadow-sm p-5 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#4A5D23] text-white flex items-center justify-center text-sm font-bold">{flatIdx + 1}</span>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-[#1A0A1F]">{exercise.name}</h3>
                            <div className="flex gap-3 mt-1.5 text-sm text-[#1A0A1F]/50">
                              <span className="font-medium">{exercise.sets} sets</span>
                              <span className="text-[#1A0A1F]/20">|</span>
                              <span className="font-medium">{exercise.reps} reps</span>
                              {exercise.targetWeight > 0 && (<><span className="text-[#1A0A1F]/20">|</span><span className="font-medium text-[#E8730C]">{exercise.targetWeight} lbs</span></>)}
                            </div>
                            {exercise.notes && <p className="text-sm text-[#1A0A1F]/30 mt-1.5 italic">{exercise.notes}</p>}
                            {exercise.videoType !== "none" && exercise.videoUrl && (
                              <div className="mt-3 max-w-xs rounded-xl overflow-hidden"><VideoPlayer videoType={exercise.videoType} videoUrl={exercise.videoUrl} /></div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleMoveExercise(exercise.id, "up")} disabled={flatIdx === 0} className="p-2 text-[#1A0A1F]/20 hover:text-[#1A0A1F]/60 hover:bg-[#F7F6F0] rounded-lg disabled:opacity-20 transition-colors">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" /></svg>
                          </button>
                          <button onClick={() => handleMoveExercise(exercise.id, "down")} disabled={flatIdx === exercises.length - 1} className="p-2 text-[#1A0A1F]/20 hover:text-[#1A0A1F]/60 hover:bg-[#F7F6F0] rounded-lg disabled:opacity-20 transition-colors">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                          </button>
                          <button onClick={() => { setEditingExercise(exercise); setShowForm(true); }} className="p-2 text-[#E8730C]/50 hover:text-[#E8730C] hover:bg-[#4A5D23]/5 rounded-lg transition-colors">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
                          </button>
                          <button onClick={() => handleDeleteExercise(exercise.id)} className="p-2 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}

              {exercises.length > 0 && !showForm && (
                <button onClick={() => { setEditingExercise(undefined); setShowForm(true); }}
                  className="w-full py-4 border-2 border-dashed border-black/10 rounded-2xl text-[#1A0A1F]/30 hover:text-[#E8730C] hover:border-[#E8730C]/30 hover:bg-[#4A5D23]/5 font-semibold transition-all">
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
