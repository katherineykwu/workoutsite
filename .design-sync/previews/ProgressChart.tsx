import { ProgressChart } from "workout-app";

const logAt = (date: string, weight: number, reps: number) => ({
  id: `log-${date}`,
  date,
  dayOfWeek: "Monday" as const,
  routineId: "r-1",
  completedAt: 0,
  exercises: [
    {
      exerciseId: "ex-1",
      exerciseName: "Goblet Squat",
      sets: [{ setNumber: 1, weight, reps }],
      clientNote: "",
    },
  ],
});

// Newest first — the component reverses internally
const logs = [
  logAt("2026-07-06", 40, 8),
  logAt("2026-06-29", 40, 6),
  logAt("2026-06-22", 35, 10),
  logAt("2026-06-15", 35, 8),
  logAt("2026-06-08", 30, 10),
  logAt("2026-06-01", 25, 12),
];

export const SixWeekTrend = () => (
  <div style={{ width: "100%", minWidth: 420 }}>
    {/* recharts' entrance animation freezes at 0% in static preview renders,
        leaving the line invisible — neutralize the dash reveal here only */}
    <style>{`.recharts-line-curve { stroke-dasharray: none !important; }`}</style>
    <ProgressChart logs={logs} exerciseName="Goblet Squat" />
  </div>
);

export const EmptyState = () => (
  <div style={{ width: "100%", minWidth: 420 }}>
    <ProgressChart logs={[]} exerciseName="Bench Press" />
  </div>
);
