import { WorkoutToast } from "workout-app";

const pb = (displayName: string, weight: number, reps: number) => ({
  exerciseName: displayName.toLowerCase(), displayName, weight, reps,
  date: "2026-07-14", workoutLogId: "log-1",
});

export const WithNewPRs = () => (
  <WorkoutToast
    newPBs={[pb("Goblet Squat", 40, 8), pb("Romanian Deadlift", 105, 6)]}
    onDismiss={() => {}}
  />
);
