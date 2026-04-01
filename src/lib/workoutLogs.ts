// Client-side functions for workout logging and analytics
import type { WorkoutLog, PersonalBest } from "./types";

// Get all workout logs (newest first)
export async function getAllLogs(): Promise<WorkoutLog[]> {
  const res = await fetch("/api/logs", { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

// Get logs that include a specific exercise
export async function getLogsForExercise(exerciseName: string): Promise<WorkoutLog[]> {
  const res = await fetch(`/api/logs?exerciseName=${encodeURIComponent(exerciseName)}`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

// Save a completed workout — returns any new personal bests
export async function saveWorkoutLog(
  log: WorkoutLog
): Promise<{ success: boolean; newPersonalBests: PersonalBest[] }> {
  const res = await fetch("/api/logs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(log),
  });
  return res.json();
}

// Get all personal bests
export async function getPersonalBests(): Promise<Record<string, PersonalBest>> {
  const res = await fetch("/api/personal-bests", { cache: "no-store" });
  if (!res.ok) return {};
  return res.json();
}
