// Groups consecutive exercises with matching supersetGroup values
import type { Exercise } from "./types";

export interface ExerciseGroup {
  supersetGroup: string | null;
  label: string;
  exercises: Exercise[];
  rounds: number;            // for supersets: times the group repeats; solo: the exercise's sets
  restBetweenRounds: number; // seconds of rest after each full round (0 = unspecified)
}

export function groupExercises(exercises: Exercise[]): ExerciseGroup[] {
  const groups: ExerciseGroup[] = [];
  for (const ex of exercises) {
    const group = ex.supersetGroup || null;
    const last = groups[groups.length - 1];
    // If this exercise has a group and matches the previous group, add to it
    if (group && last?.supersetGroup === group) {
      last.exercises.push(ex);
      // Use the label from whichever exercise has one
      if (ex.supersetLabel && !last.label) {
        last.label = ex.supersetLabel;
      }
      last.rounds = Math.max(last.rounds, ex.sets || 1);
      if (!last.restBetweenRounds && ex.supersetRestSeconds) {
        last.restBetweenRounds = ex.supersetRestSeconds;
      }
    } else {
      groups.push({
        supersetGroup: group,
        label: ex.supersetLabel || "",
        exercises: [ex],
        rounds: ex.sets || 1,
        restBetweenRounds: ex.supersetRestSeconds || 0,
      });
    }
  }
  return groups;
}

// Enforces the superset invariant on a flat exercise list: every member of a
// consecutive superset group carries the same `sets` (= the group's rounds)
// and the same `supersetRestSeconds`. Also defaults `unit` to "reps".
// Legacy data (mismatched sets, missing unit) self-heals when passed through.
export function normalizeExercises(exercises: Exercise[]): Exercise[] {
  return groupExercises(exercises).flatMap((group) => {
    const isSuperset = group.supersetGroup && group.exercises.length > 1;
    return group.exercises.map((ex) => ({
      ...ex,
      unit: ex.unit || "reps",
      ...(isSuperset
        ? { sets: group.rounds, supersetRestSeconds: group.restBetweenRounds }
        : {}),
    }));
  });
}
