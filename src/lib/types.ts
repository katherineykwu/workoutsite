// Shared types used across the app

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string; // e.g. "8-10" or "12"
  restSeconds: number;
  notes: string;
  videoType: "youtube" | "upload" | "none";
  videoUrl: string; // YouTube URL or Firebase Storage URL
}

export interface DayRoutine {
  exercises: Exercise[];
}

export interface Routine {
  id: string;
  weekStart: string; // ISO date string for the Monday of that week, e.g. "2026-03-30"
  published: boolean;
  createdAt: number; // timestamp
  days: Record<string, DayRoutine>; // keys: "Monday", "Tuesday", etc.
}

export const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export type DayOfWeek = (typeof DAYS_OF_WEEK)[number];
