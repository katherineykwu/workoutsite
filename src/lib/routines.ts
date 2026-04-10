// Client-side functions that talk to the local API routes
// No database needed — everything is stored in a JSON file on your computer
import type { Routine } from "./types";

// Get the published routine (what you see on the home page)
// Prefers the current week's routine, falls back to the most recent published one
export async function getPublishedRoutine(): Promise<Routine | null> {
  const res = await fetch("/api/routines?published=true", { cache: "no-store" });
  if (!res.ok) return null;
  const routines: Routine[] = await res.json();
  if (routines.length === 0) return null;

  // Try to find a routine for the current week first
  const currentMonday = getCurrentWeekMonday();
  const thisWeek = routines.find((r) => r.weekStart === currentMonday);
  if (thisWeek) return thisWeek;

  // Fall back to the most recent published routine
  return routines[0];
}

// Get all routines (trainer sees these)
export async function getAllRoutines(): Promise<Routine[]> {
  const res = await fetch("/api/routines", { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

// Get a specific routine by ID
export async function getRoutine(id: string): Promise<Routine | null> {
  const res = await fetch(`/api/routines?id=${encodeURIComponent(id)}`, { cache: "no-store" });
  if (!res.ok) return null;
  const data = await res.json();
  // If we got an array, find the one with matching ID
  if (Array.isArray(data)) {
    return data.find((r: Routine) => r.id === id) || null;
  }
  return data;
}

// Save a routine (create or update)
export async function saveRoutine(routine: Routine): Promise<void> {
  await fetch("/api/routines", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(routine),
  });
}

// Get the Monday of the current week
export function getCurrentWeekMonday(): string {
  const now = new Date();
  const day = now.getDay(); // 0=Sun, 1=Mon, ...
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  return monday.toISOString().split("T")[0];
}

// Create a new blank routine for a given week
export function createBlankRoutine(weekStart: string): Routine {
  return {
    id: `routine-${weekStart}`,
    weekStart,
    published: false,
    createdAt: Date.now(),
    days: {
      Monday: { exercises: [] },
      Tuesday: { exercises: [] },
      Wednesday: { exercises: [] },
      Thursday: { exercises: [] },
      Friday: { exercises: [] },
      Saturday: { exercises: [] },
      Sunday: { exercises: [] },
    },
    equipment: [],
  };
}
