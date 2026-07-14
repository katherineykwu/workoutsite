import { ExerciseForm } from "workout-app";

const noop = () => {};

export const NewExercise = () => (
  <ExerciseForm routineId="routine-1" onSave={noop} onCancel={noop} />
);

export const EditingExisting = () => (
  <ExerciseForm
    routineId="routine-1"
    exercise={{
      id: "ex-1",
      name: "Goblet Squat",
      sets: 3,
      reps: "8-10",
      restSeconds: 90,
      targetWeight: 35,
      notes: "Keep chest tall, pause at the bottom",
      videoType: "youtube",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    }}
    onSave={noop}
    onCancel={noop}
  />
);

export const WithSuperset = () => (
  <ExerciseForm
    routineId="routine-1"
    exercise={{
      id: "ex-2",
      name: "Dead Bug",
      sets: 3,
      reps: "10 each side",
      restSeconds: 30,
      targetWeight: 0,
      notes: "",
      videoType: "none",
      videoUrl: "",
      supersetGroup: "A",
      supersetLabel: "Pelvic Floor and Core Rehab",
    }}
    onSave={noop}
    onCancel={noop}
  />
);
