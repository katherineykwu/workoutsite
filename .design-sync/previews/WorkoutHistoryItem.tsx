import { WorkoutHistoryItem } from "workout-app";

const log = {
  id: "log-1",
  date: "2026-07-10",
  dayOfWeek: "Friday" as const,
  routineId: "routine-2026-07-06",
  completedAt: 1783555200000,
  exercises: [
    {
      exerciseId: "ex-1",
      exerciseName: "Goblet Squat",
      sets: [
        { setNumber: 1, weight: 35, reps: 10 },
        { setNumber: 2, weight: 35, reps: 9 },
        { setNumber: 3, weight: 30, reps: 10 },
      ],
      clientNote: "Felt strong today, could go heavier next week",
    },
    {
      exerciseId: "ex-2",
      exerciseName: "Romanian Deadlift",
      sets: [
        { setNumber: 1, weight: 95, reps: 8 },
        { setNumber: 2, weight: 95, reps: 8 },
      ],
      clientNote: "",
    },
  ],
};

export const Collapsed = () => <WorkoutHistoryItem log={log} />;

export const Expanded = () => <WorkoutHistoryItem log={log} defaultExpanded />;

export const TrainerTheme = () => <WorkoutHistoryItem log={log} theme="trainer" defaultExpanded />;

export const SearchHighlight = () => (
  <WorkoutHistoryItem log={log} defaultExpanded highlightExercise="deadlift" />
);
