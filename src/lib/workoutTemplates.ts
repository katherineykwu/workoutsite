// Client-side helpers for workout templates
import type { WorkoutTemplate, Exercise } from "./types";

export async function getAllTemplates(): Promise<WorkoutTemplate[]> {
  const res = await fetch("/api/templates", { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

export async function saveTemplate(template: WorkoutTemplate): Promise<void> {
  await fetch("/api/templates", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(template),
  });
}

export async function deleteTemplate(id: string): Promise<void> {
  await fetch(`/api/templates?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
    cache: "no-store",
  });
}

// Build a brand-new template from a day's exercises. Regenerates IDs on the
// template so later copies back to a day don't share IDs with the original.
export function templateFromExercises(name: string, exercises: Exercise[], equipment?: string[]): WorkoutTemplate {
  const now = Date.now();
  return {
    id: `tpl-${now}-${Math.random().toString(36).slice(2, 7)}`,
    name: name.trim(),
    exercises: exercises.map((ex) => ({ ...ex, id: newExerciseId() })),
    equipment,
    createdAt: now,
    updatedAt: now,
  };
}

// Duplicate an existing template (used for progression — "Upper A (copy)")
export function duplicateTemplate(template: WorkoutTemplate): WorkoutTemplate {
  const now = Date.now();
  return {
    id: `tpl-${now}-${Math.random().toString(36).slice(2, 7)}`,
    name: `${template.name} (copy)`,
    exercises: template.exercises.map((ex) => ({ ...ex, id: newExerciseId() })),
    equipment: template.equipment,
    createdAt: now,
    updatedAt: now,
  };
}

// Return a fresh copy of the template's exercises (new IDs) ready to drop on a day.
export function exercisesFromTemplate(template: WorkoutTemplate): Exercise[] {
  return template.exercises.map((ex) => ({ ...ex, id: newExerciseId() }));
}

function newExerciseId(): string {
  return `ex-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
