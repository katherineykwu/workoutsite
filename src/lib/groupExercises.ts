// Groups consecutive exercises with matching supersetGroup values
import type { Exercise } from "./types";

export interface ExerciseGroup {
  supersetGroup: string | null;
  label: string;
  exercises: Exercise[];
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
    } else {
      groups.push({
        supersetGroup: group,
        label: ex.supersetLabel || "",
        exercises: [ex],
      });
    }
  }
  return groups;
}
