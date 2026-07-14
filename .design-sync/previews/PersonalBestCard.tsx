import { PersonalBestCard } from "workout-app";

const pb = (displayName: string, weight: number, reps: number, date: string) => ({
  exerciseName: displayName.toLowerCase(),
  displayName,
  weight,
  reps,
  date,
  workoutLogId: "log-1",
});

export const HeavyLift = () => <PersonalBestCard pb={pb("Barbell Back Squat", 185, 5, "2026-06-30")} />;

export const DumbbellPress = () => <PersonalBestCard pb={pb("Dumbbell Bench Press", 45, 8, "2026-07-08")} />;

export const LongName = () => (
  <div style={{ maxWidth: 220 }}>
    <PersonalBestCard pb={pb("Single-Leg Romanian Deadlift (Kettlebell)", 35, 10, "2026-07-02")} />
  </div>
);
