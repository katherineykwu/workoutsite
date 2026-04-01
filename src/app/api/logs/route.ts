// API route: GET and POST /api/logs — workout logging with automatic PR tracking
import { NextRequest, NextResponse } from "next/server";
import { getData, setData } from "@/lib/store";
import type { WorkoutLog, PersonalBest } from "@/lib/types";

const LOGS_KEY = "workout-logs";
const PBS_KEY = "personal-bests";

async function readLogs(): Promise<WorkoutLog[]> {
  const data = await getData(LOGS_KEY);
  return data ? JSON.parse(data) : [];
}

async function readPBs(): Promise<Record<string, PersonalBest>> {
  const data = await getData(PBS_KEY);
  return data ? JSON.parse(data) : {};
}

// GET /api/logs — all logs, or filtered by exercise name
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const exerciseName = searchParams.get("exerciseName");

  let logs = await readLogs();
  logs.sort((a, b) => b.completedAt - a.completedAt);

  if (exerciseName) {
    const needle = exerciseName.toLowerCase().trim();
    logs = logs.filter((log) =>
      log.exercises.some((ex) => ex.exerciseName.toLowerCase().trim() === needle)
    );
  }

  return NextResponse.json(logs);
}

// POST /api/logs — save a workout log and update personal bests
export async function POST(request: NextRequest) {
  const log: WorkoutLog = await request.json();

  // Save the log
  const logs = await readLogs();
  logs.push(log);
  await setData(LOGS_KEY, JSON.stringify(logs));

  // Update personal bests
  const pbs = await readPBs();
  const newPBs: PersonalBest[] = [];

  for (const exerciseLog of log.exercises) {
    const key = exerciseLog.exerciseName.toLowerCase().trim();

    // Find the heaviest set in this exercise
    let maxWeight = 0;
    let repsAtMax = 0;
    for (const set of exerciseLog.sets) {
      if (set.weight > maxWeight) {
        maxWeight = set.weight;
        repsAtMax = set.reps;
      }
    }

    if (maxWeight <= 0) continue;

    const currentPB = pbs[key];
    if (!currentPB || maxWeight > currentPB.weight) {
      const newPB: PersonalBest = {
        exerciseName: key,
        displayName: exerciseLog.exerciseName,
        weight: maxWeight,
        reps: repsAtMax,
        date: log.date,
        workoutLogId: log.id,
      };
      pbs[key] = newPB;
      newPBs.push(newPB);
    }
  }

  await setData(PBS_KEY, JSON.stringify(pbs));

  return NextResponse.json({ success: true, newPersonalBests: newPBs });
}
