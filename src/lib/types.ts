// Shared types used across the app

// What the `reps` value counts — most exercises are rep-based, but some are
// measured in distance or time (e.g. Farmer Carry in yards)
export const UNIT_OPTIONS = ["reps", "seconds", "yards", "meters", "steps"] as const;
export type ExerciseUnit = (typeof UNIT_OPTIONS)[number];

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string; // e.g. "8-10" or "12"
  unit?: ExerciseUnit; // what `reps` counts; absent means "reps"
  restSeconds: number;
  targetWeight: number; // suggested weight in lbs (0 = not specified)
  notes: string;
  videoType: "youtube" | "upload" | "none";
  videoUrl: string;
  supersetGroup?: string;  // e.g. "A", "B" — exercises sharing this value are grouped
  supersetLabel?: string;  // section heading, e.g. "Pelvic Floor and Core Rehab"
  // Rest after completing one full round of the superset. Group-level
  // semantically — normalizeExercises() keeps it (and `sets` = rounds)
  // identical across all members of a group.
  supersetRestSeconds?: number;
}

export interface DayRoutine {
  exercises: Exercise[];
}

// Equipment that might be needed for the workout
export interface EquipmentItem {
  id: string;
  name: string;
  icon: string; // emoji icon for display
}

// All available equipment the trainer can choose from
export const EQUIPMENT_OPTIONS: EquipmentItem[] = [
  { id: "dumbbells", name: "Dumbbells", icon: "🏋️" },
  { id: "barbell", name: "Olympic Barbell", icon: "🔩" },
  { id: "weight-plates", name: "Weight Plates", icon: "⚫" },
  { id: "kettlebell", name: "Kettlebell", icon: "🔔" },
  { id: "bench", name: "Bench", icon: "🪑" },
  { id: "step", name: "Step / Box", icon: "📦" },
  { id: "resistance-band", name: "Resistance Band", icon: "🔗" },
  { id: "pull-up-bar", name: "Pull-Up Bar", icon: "🧲" },
  { id: "cable-machine", name: "Cable Machine", icon: "🔧" },
  { id: "foam-roller", name: "Foam Roller", icon: "🧴" },
  { id: "yoga-mat", name: "Yoga Mat", icon: "🧘" },
  { id: "medicine-ball", name: "Medicine Ball", icon: "🏀" },
  { id: "trx", name: "TRX / Suspension", icon: "⛓️" },
  { id: "ez-bar", name: "EZ Curl Bar", icon: "〰️" },
  { id: "smith-machine", name: "Smith Machine", icon: "🏗️" },
  { id: "leg-press", name: "Leg Press", icon: "🦵" },
];

// A named, reusable workout that the trainer can drop onto any day/week.
// Applying a template creates a fresh copy of its exercises on the target day
// (exercise IDs are regenerated) — future edits to the template do not
// retroactively change days it was previously applied to.
export interface WorkoutTemplate {
  id: string;
  name: string;
  exercises: Exercise[];
  equipment?: string[];
  createdAt: number;
  updatedAt: number;
}

export interface Routine {
  id: string;
  weekStart: string; // ISO date string for the Monday of that week
  published: boolean;
  createdAt: number; // timestamp
  days: Record<string, DayRoutine>; // keys: "Monday", "Tuesday", etc.
  equipment: string[]; // array of equipment IDs needed this week
  repeatWeeks?: number; // how many weeks this routine runs (1 = just this week, 4 = repeat for 4 weeks)
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

// ---- Workout Logging & Analytics ----

// A single set that was actually performed
export interface SetLog {
  setNumber: number;
  weight: number; // lbs
  reps: number;   // actual reps completed
}

// One exercise within a completed workout
export interface ExerciseLog {
  exerciseId: string;
  exerciseName: string; // saved at log time so history stays accurate even if trainer renames
  unit?: ExerciseUnit;  // saved at log time so history stays accurate even if trainer changes it
  sets: SetLog[];
  clientNote: string;   // your notes for your trainer (e.g. "felt easy", "shoulder pain")
}

// A completed workout session
export interface WorkoutLog {
  id: string;
  date: string;        // ISO date e.g. "2026-04-01"
  dayOfWeek: DayOfWeek;
  routineId: string;
  exercises: ExerciseLog[];
  completedAt: number; // timestamp
}

// Personal best record for an exercise
export interface PersonalBest {
  exerciseName: string; // normalized lowercase for matching
  displayName: string;  // original casing for display
  weight: number;
  reps: number;         // reps at that weight
  date: string;
  workoutLogId: string;
}
