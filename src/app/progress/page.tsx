// Progress & Analytics Page
"use client";

import { useState, useEffect } from "react";
import { getAllLogs, getPersonalBests } from "@/lib/workoutLogs";
import type { WorkoutLog, PersonalBest } from "@/lib/types";
import PersonalBestCard from "@/components/PersonalBestCard";
import ProgressChart from "@/components/ProgressChart";
import WorkoutHistoryItem from "@/components/WorkoutHistoryItem";
import Link from "next/link";

export default function ProgressPage() {
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [pbs, setPbs] = useState<Record<string, PersonalBest>>({});
  const [loading, setLoading] = useState(true);
  const [selectedExercise, setSelectedExercise] = useState<string>("");

  useEffect(() => {
    async function load() {
      const [logsData, pbsData] = await Promise.all([getAllLogs(), getPersonalBests()]);
      setLogs(logsData);
      setPbs(pbsData);

      // Auto-select first exercise for chart
      const allNames = new Set<string>();
      for (const log of logsData) {
        for (const ex of log.exercises) {
          allNames.add(ex.exerciseName);
        }
      }
      if (allNames.size > 0) setSelectedExercise([...allNames][0]);

      setLoading(false);
    }
    load();
  }, []);

  // Get unique exercise names from all logs
  const exerciseNames = Array.from(
    new Set(logs.flatMap((l) => l.exercises.map((e) => e.exerciseName)))
  );

  const pbList = Object.values(pbs).sort((a, b) => b.weight - a.weight);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF6F1]">
        <div className="w-10 h-10 border-[3px] border-[#C4706E] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const hasData = logs.length > 0;

  return (
    <div className="min-h-screen bg-[#FAF6F1]">
      {/* Header */}
      <header className="bg-[#FFFDF9] border-b border-[#49443D]/5">
        <div className="max-w-2xl mx-auto px-5 pt-10 pb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[#49443D]/40 hover:text-[#49443D] text-xs font-semibold mb-4 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Back to Workout
          </Link>
          <p className="text-[#C4706E] text-xs font-bold uppercase tracking-[0.2em] mb-2">Analytics</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#49443D]">My Progress</h1>
          {hasData && (
            <p className="text-[#49443D]/30 text-sm mt-1">
              {logs.length} workout{logs.length !== 1 ? "s" : ""} logged · {pbList.length} PR{pbList.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-5 py-7">
        {!hasData ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-black/5">
            <span className="text-5xl mb-4 block">📊</span>
            <h2 className="text-xl font-extrabold text-[#49443D] mb-2">No Data Yet</h2>
            <p className="text-[#49443D]/40 text-sm max-w-xs mx-auto">
              Start logging your workouts to see progress charts, personal bests, and workout history here.
            </p>
            <Link
              href="/"
              className="inline-block mt-5 gradient-pink text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-[#C4706E]/25"
            >
              Go to Workout
            </Link>
          </div>
        ) : (
          <>
            {/* Section: Personal Bests */}
            {pbList.length > 0 && (
              <section className="mb-8">
                <p className="text-[#C4706E] text-xs font-bold uppercase tracking-[0.15em] mb-2">Personal Records</p>
                <h2 className="text-xl font-extrabold text-[#49443D] mb-4">Your Best Lifts</h2>
                <div className="grid grid-cols-2 gap-3">
                  {pbList.map((pb) => (
                    <PersonalBestCard key={pb.exerciseName} pb={pb} />
                  ))}
                </div>
              </section>
            )}

            {/* Section: Progress Chart */}
            {exerciseNames.length > 0 && (
              <section className="mb-8">
                <p className="text-[#C4706E] text-xs font-bold uppercase tracking-[0.15em] mb-2">Progress</p>
                <h2 className="text-xl font-extrabold text-[#49443D] mb-4">Weight Over Time</h2>

                {/* Exercise selector */}
                <div className="flex gap-1.5 overflow-x-auto scrollbar-hide mb-5 pb-1">
                  {exerciseNames.map((name) => (
                    <button
                      key={name}
                      onClick={() => setSelectedExercise(name)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                        selectedExercise === name
                          ? "bg-[#C4706E] text-white shadow-md shadow-[#C4706E]/20"
                          : "bg-white border border-black/5 text-[#49443D]/50 hover:bg-[#FAF6F1]"
                      }`}
                    >
                      {name}
                    </button>
                  ))}
                </div>

                {/* Chart */}
                <div className="bg-white rounded-2xl border border-black/5 p-4 shadow-sm">
                  <ProgressChart logs={logs} exerciseName={selectedExercise} />
                </div>
              </section>
            )}

            {/* Section: Workout History */}
            <section>
              <p className="text-[#C4706E] text-xs font-bold uppercase tracking-[0.15em] mb-2">History</p>
              <h2 className="text-xl font-extrabold text-[#49443D] mb-4">Past Workouts</h2>
              <div className="space-y-3 pb-8">
                {logs.map((log) => (
                  <WorkoutHistoryItem key={log.id} log={log} />
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
