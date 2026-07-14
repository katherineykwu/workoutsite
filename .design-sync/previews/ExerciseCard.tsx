import { ExerciseCard } from "workout-app";

const exercise = {
  id: "ex-1",
  name: "Goblet Squat",
  sets: 3,
  reps: "8-10",
  restSeconds: 90,
  targetWeight: 35,
  notes: "Keep your chest tall and sit back into your heels. Pause for one second at the bottom.",
  videoType: "none" as const,
  videoUrl: "",
};

const personalBest = {
  exerciseName: "goblet squat",
  displayName: "Goblet Squat",
  weight: 40,
  reps: 8,
  date: "2026-06-24",
  workoutLogId: "log-1",
};

export const ViewMode = () => (
  <ExerciseCard exercise={exercise} index={0} personalBest={personalBest} />
);

export const LoggingMode = () => (
  <ExerciseCard
    exercise={exercise}
    index={1}
    loggingMode
    currentSets={[{ setNumber: 1, weight: 35, reps: 10 }]}
    lastSets={[
      { setNumber: 1, weight: 35, reps: 8 },
      { setNumber: 2, weight: 35, reps: 8 },
      { setNumber: 3, weight: 30, reps: 10 },
    ]}
    personalBest={personalBest}
    clientNote=""
    onSetChange={() => {}}
    onNoteChange={() => {}}
  />
);

export const NewPersonalRecord = () => (
  <ExerciseCard
    exercise={{ ...exercise, name: "Romanian Deadlift", targetWeight: 95 }}
    index={2}
    loggingMode
    currentSets={[{ setNumber: 1, weight: 105, reps: 6 }]}
    personalBest={{ ...personalBest, displayName: "Romanian Deadlift", weight: 100, reps: 6 }}
    onSetChange={() => {}}
  />
);

export const Compact = () => (
  <ExerciseCard exercise={{ ...exercise, notes: "" }} index={0} compact />
);
