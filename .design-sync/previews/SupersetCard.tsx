import { SupersetCard } from "workout-app";

const ex = (id: string, name: string, sets: number, reps: string, targetWeight = 0) => ({
  id, name, sets, reps, restSeconds: 60, targetWeight, notes: "", videoType: "none" as const, videoUrl: "",
  supersetGroup: "A", supersetLabel: "Pelvic Floor and Core Rehab",
});

const exercises = [
  ex("ss-1", "Dead Bug", 3, "10 each side"),
  ex("ss-2", "Glute Bridge", 3, "12", 25),
  ex("ss-3", "Bird Dog", 3, "8 each side"),
];

export const ViewMode = () => (
  <SupersetCard
    label="Pelvic Floor and Core Rehab"
    exercises={exercises}
    rounds={3}
    restBetweenRounds={60}
    globalStartIndex={0}
    logData={{}}
    lastSession={{}}
    personalBests={{}}
    noteData={{}}
  />
);

export const LoggingMode = () => (
  <SupersetCard
    label="Lower Body Circuit"
    exercises={exercises.slice(0, 2)}
    rounds={3}
    restBetweenRounds={45}
    globalStartIndex={3}
    loggingMode
    logData={{ "ss-1": [{ setNumber: 1, weight: 0, reps: 10 }] }}
    lastSession={{ "ss-2": [{ setNumber: 1, weight: 25, reps: 12 }] }}
    personalBests={{}}
    noteData={{}}
    onSetChange={() => {}}
    onNoteChange={() => {}}
  />
);
