// Trainer Dashboard — Sweat-inspired dark theme
"use client";

import { useState, useEffect, useCallback } from "react";
import PasswordGate from "@/components/PasswordGate";
import ExerciseForm from "@/components/ExerciseForm";
import EquipmentDisplay from "@/components/EquipmentDisplay";
import ProgressChart from "@/components/ProgressChart";
import VideoPlayer from "@/components/VideoPlayer";
import WorkoutHistoryItem from "@/components/WorkoutHistoryItem";
import ExerciseSearchBox from "@/components/ExerciseSearchBox";
import TemplateCard from "@/components/TemplateCard";
import TemplatePicker from "@/components/TemplatePicker";
import {
  getAllRoutines, saveRoutine, getRoutine, createBlankRoutine, getCurrentWeekMonday,
} from "@/lib/routines";
import { getAllLogs, getPersonalBests } from "@/lib/workoutLogs";
import {
  getAllTemplates, saveTemplate, deleteTemplate,
  templateFromExercises, duplicateTemplate, exercisesFromTemplate,
} from "@/lib/workoutTemplates";
import type { Routine, Exercise, DayOfWeek, WorkoutLog, PersonalBest, WorkoutTemplate } from "@/lib/types";
import { DAYS_OF_WEEK } from "@/lib/types";
import { groupExercises, normalizeExercises } from "@/lib/groupExercises";
import { matchesQuery } from "@/lib/filterBySearch";

const PB_DEFAULT_LIMIT = 6;
const PILL_DEFAULT_LIMIT = 8;
const HISTORY_PAGE_SIZE = 10;

type TrainerTab = "exercises" | "equipment" | "activity" | "templates";

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

  // Activity tab — search + decrowding state
  const [activityQuery, setActivityQuery] = useState("");
  const [activityPbsExpanded, setActivityPbsExpanded] = useState(false);
  const [activityPillsExpanded, setActivityPillsExpanded] = useState(false);
  const [activityHistoryLimit, setActivityHistoryLimit] = useState(HISTORY_PAGE_SIZE);

  // Templates
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  // When editing a template, this holds the in-progress template.
  // null = viewing the Templates list; non-null = editing template exercises.
  const [editingTemplate, setEditingTemplate] = useState<WorkoutTemplate | null>(null);
  const [templateSearchQuery, setTemplateSearchQuery] = useState("");

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
    if (!authenticated) return;
    if (trainerTab === "activity" && workoutLogs.length === 0) {
      loadClientActivity();
    }
    if (trainerTab === "equipment" && clientEquipment.length === 0) {
      fetchClientEquipment().then((d) => { setClientEquipment(d.equipment || []); setClientGymPhotos(d.gymPhotos || []); });
    }
    if (trainerTab === "templates" && templates.length === 0) {
      loadTemplates();
    }
  }, [authenticated, trainerTab]);

  // Also fetch templates on login so the "Apply template" picker on the
  // Exercises tab has something to show immediately.
  useEffect(() => {
    if (authenticated) loadTemplates();
  }, [authenticated]);

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
    updated.days[selectedDay] = { exercises: normalizeExercises(dayExercises) };
    setActiveRoutine(updated); setShowForm(false); setEditingExercise(undefined);
    setSaving(true); await saveRoutine(updated); setSaving(false);
    showMsg("Exercise saved!");
  }

  // Update a group-level superset field (rounds or rest) on every member
  async function handleUpdateSupersetGroup(memberIds: string[], patch: Partial<Pick<Exercise, "sets" | "supersetRestSeconds">>) {
    if (!activeRoutine) return;
    const updated = { ...activeRoutine };
    const dayExercises = (updated.days[selectedDay]?.exercises || []).map((e) =>
      memberIds.includes(e.id) ? { ...e, ...patch } : e
    );
    updated.days[selectedDay] = { exercises: normalizeExercises(dayExercises) };
    setActiveRoutine(updated);
    await saveRoutine(updated);
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

  // ---- Template handlers ----
  async function loadTemplates() {
    const list = await getAllTemplates();
    setTemplates(list);
  }

  async function handleSaveDayAsTemplate() {
    if (!activeRoutine) return;
    const dayExercises = activeRoutine.days[selectedDay]?.exercises || [];
    if (dayExercises.length === 0) {
      showMsg("Nothing to save — add some exercises first.");
      return;
    }
    const name = prompt(`Save ${selectedDay}'s exercises as a template. Name?`);
    if (!name || !name.trim()) return;
    const newTpl = templateFromExercises(name, dayExercises, activeRoutine.equipment);
    setSaving(true);
    await saveTemplate(newTpl);
    setTemplates((prev) => [newTpl, ...prev]);
    setSaving(false);
    showMsg(`Saved "${newTpl.name}" as a template`);
  }

  async function handleApplyTemplate(template: WorkoutTemplate) {
    if (!activeRoutine) return;
    const copied = normalizeExercises(exercisesFromTemplate(template));
    const updated = { ...activeRoutine };
    updated.days[selectedDay] = { exercises: copied };
    setActiveRoutine(updated);
    setShowTemplatePicker(false);
    setSaving(true);
    await saveRoutine(updated);
    setSaving(false);
    showMsg(`Applied "${template.name}" to ${selectedDay}`);
  }

  async function handleDuplicateTemplate(template: WorkoutTemplate) {
    const copy = duplicateTemplate(template);
    setSaving(true);
    await saveTemplate(copy);
    setTemplates((prev) => [copy, ...prev]);
    setSaving(false);
    showMsg(`Duplicated as "${copy.name}"`);
  }

  async function handleRenameTemplate(template: WorkoutTemplate) {
    const newName = prompt("Rename template:", template.name);
    if (!newName || !newName.trim() || newName.trim() === template.name) return;
    const updated = { ...template, name: newName.trim(), updatedAt: Date.now() };
    setSaving(true);
    await saveTemplate(updated);
    setTemplates((prev) => prev.map((t) => (t.id === template.id ? updated : t)));
    setSaving(false);
    showMsg("Renamed.");
  }

  async function handleDeleteTemplate(template: WorkoutTemplate) {
    if (!confirm(`Delete template "${template.name}"? This won't affect days it was already applied to.`)) return;
    setSaving(true);
    await deleteTemplate(template.id);
    setTemplates((prev) => prev.filter((t) => t.id !== template.id));
    setSaving(false);
    showMsg("Template deleted.");
  }

  async function handleCreateNewTemplate() {
    const name = prompt("New template name:");
    if (!name || !name.trim()) return;
    const now = Date.now();
    const newTpl: WorkoutTemplate = {
      id: `tpl-${now}-${Math.random().toString(36).slice(2, 7)}`,
      name: name.trim(),
      exercises: [],
      createdAt: now,
      updatedAt: now,
    };
    setSaving(true);
    await saveTemplate(newTpl);
    setTemplates((prev) => [newTpl, ...prev]);
    setSaving(false);
    setEditingTemplate(newTpl);
  }

  // When editing a template, exercise CRUD writes back to the template (not a routine)
  async function handleSaveTemplateExercise(exercise: Exercise) {
    if (!editingTemplate) return;
    const exercises = [...editingTemplate.exercises];
    const idx = exercises.findIndex((e) => e.id === exercise.id);
    if (idx >= 0) exercises[idx] = exercise; else exercises.push(exercise);
    const updated = { ...editingTemplate, exercises, updatedAt: Date.now() };
    setEditingTemplate(updated);
    setShowForm(false); setEditingExercise(undefined);
    setSaving(true);
    await saveTemplate(updated);
    setTemplates((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setSaving(false);
    showMsg("Exercise saved.");
  }

  async function handleDeleteTemplateExercise(exerciseId: string) {
    if (!editingTemplate) return;
    const updated = { ...editingTemplate, exercises: editingTemplate.exercises.filter((e) => e.id !== exerciseId), updatedAt: Date.now() };
    setEditingTemplate(updated);
    setSaving(true);
    await saveTemplate(updated);
    setTemplates((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setSaving(false);
  }

  async function handleMoveTemplateExercise(exerciseId: string, dir: "up" | "down") {
    if (!editingTemplate) return;
    const arr = [...editingTemplate.exercises];
    const i = arr.findIndex((e) => e.id === exerciseId);
    const j = dir === "up" ? i - 1 : i + 1;
    if (i < 0 || j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    const updated = { ...editingTemplate, exercises: arr, updatedAt: Date.now() };
    setEditingTemplate(updated);
    await saveTemplate(updated);
    setTemplates((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  }

  return (
    <div className="min-h-screen bg-[#F7F6F0]">
      {/* Header — army green with personal welcome */}
      <header className="border-b border-[#4A5D23]/10 sticky top-0 z-10 bg-white/95 backdrop-blur-xl texture-grain overflow-hidden safe-top">
        <div className="max-w-4xl mx-auto px-5 py-4 flex items-center justify-between relative">
          <div className="flex items-center gap-3">
            <span className="text-2xl hover-wiggle inline-block cursor-default">🦦</span>
            <div>
              <h1 className="text-lg font-bold text-[#4A5D23] font-display">Welcome, Jamie!</h1>
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
              <option key={r.id} value={r.id}>Week of {r.weekStart}{r.published ? " (Live)" : ""}</option>
            ))}
          </select>
          <button onClick={handleCreateNewWeek} className="px-4 py-2.5 bg-white border border-[#4A5D23]/15 text-[#4A5D23]/60 rounded-xl hover:bg-[#4A5D23]/5 text-sm font-semibold transition-colors">
            + New Week
          </button>
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
          {(["exercises", "templates", "equipment", "activity"] as TrainerTab[]).map((tab) => (
            <button key={tab} onClick={() => setTrainerTab(tab)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold capitalize transition-all font-display hover-pop ${
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
        {trainerTab === "activity" && (() => {
          const allPbList = Object.values(clientPBs).sort((a, b) => b.weight - a.weight);
          const allExerciseNames = Array.from(new Set(workoutLogs.flatMap((l) => l.exercises.map((e) => e.exerciseName))));

          // Apply search filter to all three sections
          const filteredPbs = allPbList.filter((pb) => matchesQuery(pb.displayName, activityQuery));
          const filteredPills = allExerciseNames.filter((name) => matchesQuery(name, activityQuery));
          const filteredLogs = activityQuery
            ? workoutLogs.filter((log) => log.exercises.some((ex) => matchesQuery(ex.exerciseName, activityQuery)))
            : workoutLogs;

          // Pick first matching exercise when search narrows pills
          const effectiveChart = activityQuery && filteredPills.length > 0 && !filteredPills.includes(chartExercise)
            ? filteredPills[0]
            : (chartExercise || allExerciseNames[0] || "");

          // Apply decrowding caps when no active search
          const visiblePbs = activityQuery ? filteredPbs : (activityPbsExpanded ? allPbList : allPbList.slice(0, PB_DEFAULT_LIMIT));
          const visiblePills = activityQuery ? filteredPills : (activityPillsExpanded ? allExerciseNames : allExerciseNames.slice(0, PILL_DEFAULT_LIMIT));
          const hiddenPillCount = (activityQuery ? filteredPills.length : allExerciseNames.length) - visiblePills.length;
          const visibleLogs = activityQuery ? filteredLogs : filteredLogs.slice(0, activityHistoryLimit);

          return (
            <div className="space-y-6">
              {/* Search + Refresh */}
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <ExerciseSearchBox value={activityQuery} onChange={setActivityQuery} accentColor="#E8730C" />
                </div>
                <button
                  onClick={loadClientActivity}
                  className="mt-1 text-xs text-[#1A0A1F]/40 hover:text-[#1A0A1F] font-medium transition-colors px-3 py-2.5 bg-white border border-black/5 rounded-xl shadow-sm"
                  aria-label="Refresh"
                >
                  Refresh
                </button>
              </div>

              {/* Personal Bests */}
              {allPbList.length > 0 && (
                <div>
                  <p className="text-[#E8730C] text-xs font-bold uppercase tracking-[0.15em] mb-2">Personal Records</p>
                  {visiblePbs.length > 0 ? (
                    <>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        {visiblePbs.map((pb) => (
                          <div key={pb.exerciseName} className="bg-white rounded-xl border border-black/5 shadow-sm p-3 border-l-4 border-l-[#4A5D23]">
                            <p className="text-xs font-bold text-[#1A0A1F] truncate">{pb.displayName}</p>
                            <p className="text-lg font-bold font-display text-[#E8730C]">{pb.weight} <span className="text-xs text-[#1A0A1F]/30">lbs</span></p>
                            <p className="text-[10px] text-[#1A0A1F]/30">{pb.reps} reps · {pb.date}</p>
                          </div>
                        ))}
                      </div>
                      {!activityQuery && allPbList.length > PB_DEFAULT_LIMIT && (
                        <button
                          onClick={() => setActivityPbsExpanded(!activityPbsExpanded)}
                          className="mt-3 text-sm text-[#E8730C] font-semibold hover:underline"
                        >
                          {activityPbsExpanded ? "Show less" : `Show all (${allPbList.length})`}
                        </button>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-[#1A0A1F]/40 italic">No PRs match &ldquo;{activityQuery}&rdquo;</p>
                  )}
                </div>
              )}

              {/* Progress chart */}
              {allExerciseNames.length > 0 && (
                <div>
                  <p className="text-[#E8730C] text-xs font-bold uppercase tracking-[0.15em] mb-2">Progress</p>
                  <p className="text-lg font-bold font-display text-[#1A0A1F] mb-4">Katherine&apos;s Strength Over Time</p>
                  {visiblePills.length > 0 ? (
                    <>
                      <div className="flex gap-1.5 flex-wrap mb-4">
                        {visiblePills.map((name) => (
                          <button key={name} onClick={() => setChartExercise(name)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                              effectiveChart === name
                                ? "bg-[#4A5D23] text-white shadow-md"
                                : "bg-white border border-black/5 text-[#1A0A1F]/50 hover:bg-[#F7F6F0]"
                            }`}>
                            {name}
                          </button>
                        ))}
                        {!activityQuery && hiddenPillCount > 0 && (
                          <button
                            onClick={() => setActivityPillsExpanded(true)}
                            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#F7F6F0] text-[#1A0A1F]/60 hover:bg-[#EDE6DA] border border-dashed border-[#1A0A1F]/15"
                          >
                            +{hiddenPillCount} more
                          </button>
                        )}
                        {!activityQuery && activityPillsExpanded && allExerciseNames.length > PILL_DEFAULT_LIMIT && (
                          <button
                            onClick={() => setActivityPillsExpanded(false)}
                            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[#1A0A1F]/40 hover:text-[#1A0A1F]"
                          >
                            Show less
                          </button>
                        )}
                      </div>
                      <div className="bg-white rounded-2xl border border-black/5 p-4 shadow-sm">
                        <ProgressChart logs={workoutLogs} exerciseName={effectiveChart} />
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-[#1A0A1F]/40 italic">No exercises match &ldquo;{activityQuery}&rdquo;</p>
                  )}
                </div>
              )}

              {/* Workout logs */}
              <div>
                <p className="text-[#E8730C] text-xs font-bold uppercase tracking-[0.15em] mb-3">Workout History</p>

                {workoutLogs.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-2xl border border-black/5">
                    <span className="text-3xl mb-3 block">🦦</span>
                    <p className="text-[#1A0A1F]/30 text-sm">Katherine hasn&apos;t logged any workouts yet</p>
                  </div>
                ) : visibleLogs.length > 0 ? (
                  <>
                    <div className="space-y-3">
                      {visibleLogs.map((log) => (
                        <WorkoutHistoryItem
                          key={log.id}
                          log={log}
                          theme="trainer"
                          highlightExercise={activityQuery || undefined}
                          defaultExpanded={!!activityQuery}
                        />
                      ))}
                    </div>
                    {!activityQuery && filteredLogs.length > activityHistoryLimit && (
                      <button
                        onClick={() => setActivityHistoryLimit(activityHistoryLimit + HISTORY_PAGE_SIZE)}
                        className="w-full mt-3 py-3 rounded-2xl bg-white border border-black/5 text-[#E8730C] font-semibold text-sm hover:bg-[#F7F6F0] transition-colors shadow-sm"
                      >
                        Load more
                      </button>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-[#1A0A1F]/40 italic">No workouts match &ldquo;{activityQuery}&rdquo;</p>
                )}
              </div>
            </div>
          );
        })()}

        {/* Templates tab — Jamie's library of reusable workouts */}
        {trainerTab === "templates" && (() => {
          // When editing a template, show the exercise list for it (mirrors the Exercises tab)
          if (editingTemplate) {
            const tplExercises = editingTemplate.exercises;
            return (
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <button
                    onClick={() => { setEditingTemplate(null); setShowForm(false); setEditingExercise(undefined); }}
                    className="text-xs font-semibold text-[#1A0A1F]/50 hover:text-[#1A0A1F] flex items-center gap-1"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                    Back to templates
                  </button>
                </div>
                <h2 className="text-xl font-bold font-display text-[#1A0A1F] mb-1">{editingTemplate.name}</h2>
                <p className="text-sm text-[#1A0A1F]/40 mb-5">
                  {tplExercises.length} exercise{tplExercises.length !== 1 ? "s" : ""}
                </p>

                <div className="space-y-3">
                  {tplExercises.length === 0 && !showForm && (
                    <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-black/10">
                      <p className="text-[#1A0A1F]/30 mb-4 text-sm">This template is empty.</p>
                      <button
                        onClick={() => { setEditingExercise(undefined); setShowForm(true); }}
                        className="bg-[#4A5D23] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#3D4E1C] transition-colors"
                      >
                        Add first exercise
                      </button>
                    </div>
                  )}

                  {tplExercises.map((exercise, index) => (
                    <div key={exercise.id} className="bg-white rounded-2xl border border-black/5 shadow-sm p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#4A5D23] text-white flex items-center justify-center text-sm font-bold">{index + 1}</span>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-[#1A0A1F]">{exercise.name}</h3>
                            <div className="flex gap-3 mt-1.5 text-sm text-[#1A0A1F]/50">
                              <span className="font-medium">{exercise.sets} sets</span>
                              <span className="text-[#1A0A1F]/20">|</span>
                              <span className="font-medium">{exercise.reps} {exercise.unit || "reps"}</span>
                              {exercise.targetWeight > 0 && (<><span className="text-[#1A0A1F]/20">|</span><span className="font-medium text-[#E8730C]">{exercise.targetWeight} lbs</span></>)}
                            </div>
                            {exercise.notes && <p className="text-sm text-[#1A0A1F]/30 mt-1.5 italic">{exercise.notes}</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleMoveTemplateExercise(exercise.id, "up")} disabled={index === 0}
                            className="p-2 text-[#1A0A1F]/20 hover:text-[#1A0A1F]/60 hover:bg-[#F7F6F0] rounded-lg disabled:opacity-20 transition-colors">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" /></svg>
                          </button>
                          <button onClick={() => handleMoveTemplateExercise(exercise.id, "down")} disabled={index === tplExercises.length - 1}
                            className="p-2 text-[#1A0A1F]/20 hover:text-[#1A0A1F]/60 hover:bg-[#F7F6F0] rounded-lg disabled:opacity-20 transition-colors">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                          </button>
                          <button onClick={() => { setEditingExercise(exercise); setShowForm(true); }}
                            className="p-2 text-[#E8730C]/50 hover:text-[#E8730C] hover:bg-[#4A5D23]/5 rounded-lg transition-colors">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" /></svg>
                          </button>
                          <button onClick={() => handleDeleteTemplateExercise(exercise.id)}
                            className="p-2 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {tplExercises.length > 0 && !showForm && (
                    <button onClick={() => { setEditingExercise(undefined); setShowForm(true); }}
                      className="w-full py-4 border-2 border-dashed border-black/10 rounded-2xl text-[#1A0A1F]/30 hover:text-[#E8730C] hover:border-[#E8730C]/30 hover:bg-[#4A5D23]/5 font-semibold transition-all">
                      + Add exercise
                    </button>
                  )}

                  {showForm && (
                    <ExerciseForm
                      exercise={editingExercise}
                      routineId={editingTemplate.id}
                      onSave={handleSaveTemplateExercise}
                      onCancel={() => { setShowForm(false); setEditingExercise(undefined); }}
                    />
                  )}
                </div>
              </div>
            );
          }

          // Template list view
          const filtered = templates.filter((t) => matchesQuery(t.name, templateSearchQuery));
          return (
            <div>
              <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
                <div>
                  <p className="text-[#E8730C] text-xs font-bold uppercase tracking-[0.15em]">Library</p>
                  <h2 className="text-xl font-bold font-display text-[#1A0A1F]">Saved Workouts</h2>
                </div>
                <button
                  onClick={handleCreateNewTemplate}
                  className="bg-[#4A5D23] text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-[#3D4E1C] transition-colors shadow-lg shadow-[#4A5D23]/25"
                >
                  + New template
                </button>
              </div>

              {templates.length > 0 && (
                <div className="mb-5">
                  <ExerciseSearchBox
                    value={templateSearchQuery}
                    onChange={setTemplateSearchQuery}
                    placeholder="Search templates..."
                    accentColor="#4A5D23"
                  />
                </div>
              )}

              {templates.length === 0 ? (
                <div className="text-center py-14 bg-white rounded-2xl border-2 border-dashed border-black/10">
                  <p className="text-4xl mb-3">📋</p>
                  <p className="text-[#1A0A1F]/60 font-semibold mb-1">No templates yet</p>
                  <p className="text-[#1A0A1F]/40 text-sm max-w-xs mx-auto">
                    Save a day&apos;s exercises as a template, or click &ldquo;+ New template&rdquo; above.
                  </p>
                </div>
              ) : filtered.length === 0 ? (
                <p className="text-sm text-[#1A0A1F]/40 italic">No templates match &ldquo;{templateSearchQuery}&rdquo;</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filtered.map((t) => (
                    <TemplateCard
                      key={t.id}
                      template={t}
                      onEdit={(tpl) => { setEditingTemplate(tpl); setShowForm(false); setEditingExercise(undefined); }}
                      onDuplicate={handleDuplicateTemplate}
                      onRename={handleRenameTemplate}
                      onDelete={handleDeleteTemplate}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })()}

        {/* Exercises tab */}
        {trainerTab === "exercises" && (
          <>
            {/* Day tabs */}
            <div className="flex gap-1.5 mb-3 overflow-x-auto scrollbar-hide pb-1">
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

            {/* Day-level template actions */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setShowTemplatePicker(true)}
                className="text-xs font-semibold text-[#4A5D23] bg-white border border-[#4A5D23]/20 hover:bg-[#4A5D23]/5 px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                Apply template
              </button>
              {exercises.length > 0 && (
                <button
                  onClick={handleSaveDayAsTemplate}
                  className="text-xs font-semibold text-[#E8730C] bg-white border border-[#E8730C]/20 hover:bg-[#E8730C]/5 px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h6l5 5v11a2 2 0 01-2 2H7a2 2 0 01-2-2V5z M9 13h6 M9 17h4" />
                  </svg>
                  Save {selectedDay} as template
                </button>
              )}
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
                    const memberIds = group.exercises.map((e) => e.id);
                    return (
                      <div key={`group-${gi}`} className="rounded-2xl border border-[#E8730C]/20 bg-white overflow-hidden">
                        <div className="px-5 pt-4 pb-2 flex items-center justify-between gap-3 flex-wrap">
                          <div>
                            {group.label && <p className="font-bold text-[#1A0A1F] text-sm mb-1">{group.label}</p>}
                            <span className="inline-block text-[10px] font-bold uppercase tracking-widest bg-[#E8730C]/10 text-[#E8730C] px-2.5 py-1 rounded-full">Superset</span>
                          </div>
                          {/* Group-level controls: rounds + rest between rounds */}
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                              <button onClick={() => handleUpdateSupersetGroup(memberIds, { sets: Math.max(1, group.rounds - 1) })}
                                disabled={group.rounds <= 1}
                                className="w-7 h-7 rounded-lg bg-[#F7F6F0] text-[#1A0A1F]/50 hover:text-[#1A0A1F] font-bold disabled:opacity-30 transition-colors"
                                aria-label="Fewer rounds">−</button>
                              <span className="text-sm font-extrabold text-[#E8730C] min-w-[70px] text-center">
                                {group.rounds} round{group.rounds !== 1 ? "s" : ""}
                              </span>
                              <button onClick={() => handleUpdateSupersetGroup(memberIds, { sets: group.rounds + 1 })}
                                className="w-7 h-7 rounded-lg bg-[#F7F6F0] text-[#1A0A1F]/50 hover:text-[#1A0A1F] font-bold transition-colors"
                                aria-label="More rounds">+</button>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <input type="number" inputMode="numeric" min={0}
                                key={`rest-${gi}-${group.restBetweenRounds}`}
                                defaultValue={group.restBetweenRounds || ""}
                                placeholder="0"
                                onBlur={(e) => {
                                  const secs = Math.max(0, Number(e.target.value) || 0);
                                  if (secs !== group.restBetweenRounds) handleUpdateSupersetGroup(memberIds, { supersetRestSeconds: secs });
                                }}
                                className="w-14 px-2 py-1.5 bg-[#F7F6F0] border border-black/5 rounded-lg text-[#1A0A1F] text-sm font-semibold text-center focus:outline-none focus:ring-2 focus:ring-[#4A5D23]" />
                              <span className="text-xs text-[#1A0A1F]/40 font-medium">s rest</span>
                            </div>
                          </div>
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
                                    <p className="text-xs text-[#1A0A1F]/40 mt-0.5">{exercise.reps} {exercise.unit || "reps"}{exercise.targetWeight > 0 ? ` · ${exercise.targetWeight} lbs` : ""}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-0.5">
                                  <button onClick={() => handleMoveExercise(exercise.id, "up")} disabled={ei === 0} className="p-1.5 text-[#1A0A1F]/20 hover:text-[#1A0A1F]/60 rounded disabled:opacity-20 transition-colors">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" /></svg>
                                  </button>
                                  <button onClick={() => handleMoveExercise(exercise.id, "down")} disabled={ei === group.exercises.length - 1} className="p-1.5 text-[#1A0A1F]/20 hover:text-[#1A0A1F]/60 rounded disabled:opacity-20 transition-colors">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                                  </button>
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
                              <span className="font-medium">{exercise.reps} {exercise.unit || "reps"}</span>
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

      {/* Apply-template modal */}
      {showTemplatePicker && activeRoutine && (
        <TemplatePicker
          templates={templates}
          targetDay={selectedDay}
          hasExistingExercises={(activeRoutine.days[selectedDay]?.exercises?.length || 0) > 0}
          onApply={handleApplyTemplate}
          onClose={() => setShowTemplatePicker(false)}
        />
      )}
    </div>
  );
}
