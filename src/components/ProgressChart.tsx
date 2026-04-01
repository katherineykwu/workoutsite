// Line chart showing weight progress over time for a selected exercise
"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { WorkoutLog } from "@/lib/types";

interface ProgressChartProps {
  logs: WorkoutLog[];
  exerciseName: string;
}

interface ChartDataPoint {
  date: string;
  weight: number;
  reps: number;
  label: string;
}

export default function ProgressChart({ logs, exerciseName }: ProgressChartProps) {
  const needle = exerciseName.toLowerCase().trim();

  // Extract data points: for each log, find the exercise and get the max weight
  const dataPoints: ChartDataPoint[] = [];
  for (const log of [...logs].reverse()) {
    const exerciseLog = log.exercises.find(
      (e) => e.exerciseName.toLowerCase().trim() === needle
    );
    if (!exerciseLog) continue;

    let maxWeight = 0;
    let repsAtMax = 0;
    for (const set of exerciseLog.sets) {
      if (set.weight > maxWeight) {
        maxWeight = set.weight;
        repsAtMax = set.reps;
      }
    }
    if (maxWeight > 0) {
      const d = new Date(log.date + "T00:00:00");
      dataPoints.push({
        date: log.date,
        weight: maxWeight,
        reps: repsAtMax,
        label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      });
    }
  }

  if (dataPoints.length === 0) {
    return (
      <div className="text-center py-12 text-[#1A0A1F]/30 text-sm">
        No data yet for this exercise
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={dataPoints} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#EAE6E8" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "#1A0A1F80" }}
            axisLine={{ stroke: "#EAE6E8" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#1A0A1F80" }}
            axisLine={false}
            tickLine={false}
            unit=" lbs"
          />
          <Tooltip
            contentStyle={{
              background: "#1A0A1F",
              border: "none",
              borderRadius: "12px",
              padding: "10px 14px",
              fontSize: "13px",
            }}
            labelStyle={{ color: "#ffffff80", fontSize: "11px" }}
            itemStyle={{ color: "#FF1A66", fontWeight: 700 }}
            formatter={(value) => [`${value} lbs`, "Max Weight"]}
          />
          <Line
            type="monotone"
            dataKey="weight"
            stroke="#FF1A66"
            strokeWidth={2.5}
            dot={{ fill: "#FF1A66", r: 4, strokeWidth: 0 }}
            activeDot={{ fill: "#FF1A66", r: 6, strokeWidth: 2, stroke: "#fff" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
