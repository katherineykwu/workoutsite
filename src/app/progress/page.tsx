// Progress & Analytics Page
"use client";

import { useState, useEffect, useMemo } from "react";
import { getAllLogs, getPersonalBests } from "@/lib/workoutLogs";
import type { WorkoutLog, PersonalBest } from "@/lib/types";
import PersonalBestCard from "@/components/PersonalBestCard";
import ProgressChart from "@/components/ProgressChart";
import WorkoutHistoryItem from "@/components/WorkoutHistoryItem";
import ExerciseSearchBox from "@/components/ExerciseSearchBox";
import { matchesQuery } from "@/lib/filterBySearch";
import Link from "next/link";

const PB_DEFAULT_LIMIT = 6;
const PILL_DEFAULT_LIMIT = 8;
const HISTORY_PAGE_SIZE = 10;

export default function ProgressPage() {
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [pbs, setPbs] = useState<Record<string, PersonalBest>>({});
  const [loading, setLoading] = useState(true);
  const [selectedExercise, setSelectedExercise] = useState<string>("");

  // Search + decrowding state
  const [query, setQuery] = useState("");
  const [pbsExpanded, setPbsExpanded] = useState(false);
  const [pillsExpanded, setPillsExpanded] = useState(false);
  const [historyLimit, setHistoryLimit] = useState(HISTORY_PAGE_SIZE);

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
  const exerciseNames = useMemo(
    () => Array.from(new Set(logs.flatMap((l) => l.exercises.map((e) => e.exerciseName)))),
    [logs]
  );

  const pbList = useMemo(
    () => Object.values(pbs).sort((a, b) => b.weight - a.weight),
    [pbs]
  );

  // --- Filter everything by the search query ---
  const filteredPbs = useMemo(
    () => pbList.filter((pb) => matchesQuery(pb.displayName, query)),
    [pbList, query]
  );

  const filteredPills = useMemo(
    () => exerciseNames.filter((name) => matchesQuery(name, query)),
    [exerciseNames, query]
  );

  const filteredLogs = useMemo(() => {
    if (!query) return logs;
    return logs.filter((log) =>
      log.exercises.some((ex) => matchesQuery(ex.exerciseName, query))
    );
  }, [logs, query]);

  // Auto-pick the first matching exercise when the query changes
  useEffect(() => {
    if (!query) return;
    if (filteredPills.length > 0 && !filteredPills.includes(selectedExercise)) {
      setSelectedExercise(filteredPills[0]);
    }
  }, [query, filteredPills, selectedExercise]);

  // What's actually rendered (after applying default caps when there's no query)
  const visiblePbs = query
    ? filteredPbs
    : (pbsExpanded ? pbList : pbList.slice(0, PB_DEFAULT_LIMIT));

  const visiblePills = query
    ? filteredPills
    : (pillsExpanded ? exerciseNames : exerciseNames.slice(0, PILL_DEFAULT_LIMIT));

  const hiddenPillCount = (query ? filteredPills.length : exerciseNames.length) - visiblePills.length;

  const visibleLogs = query ? filteredLogs : filteredLogs.slice(0, historyLimit);

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
          <h1 className="text-3xl font-bold font-display tracking-tight text-[#49443D]">My Progress</h1>
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
            <h2 className="text-xl font-bold font-display text-[#49443D] mb-2">No Data Yet</h2>
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
            {/* Search */}
            <ExerciseSearchBox value={query} onChange={setQuery} accentColor="#C4706E" />

            {/* Section: Personal Bests */}
            {pbList.length > 0 && (
              <section className="mb-8">
                <p className="text-[#C4706E] text-xs font-bold uppercase tracking-[0.15em] mb-2">Personal Records</p>
                <h2 className="text-xl font-bold font-display text-[#49443D] mb-4">Your Best Lifts</h2>
                {visiblePbs.length > 0 ? (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      {visiblePbs.map((pb) => (
                        <PersonalBestCard key={pb.exerciseName} pb={pb} />
                      ))}
                    </div>
                    {/* Show all / Show less toggle (only when no active search) */}
                    {!query && pbList.length > PB_DEFAULT_LIMIT && (
                      <button
                        onClick={() => setPbsExpanded(!pbsExpanded)}
                        className="mt-4 text-sm text-[#C4706E] font-semibold hover:underline"
                      >
                        {pbsExpanded ? "Show less" : `Show all (${pbList.length})`}
                      </button>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-[#49443D]/40 italic">No PRs match &ldquo;{query}&rdquo;</p>
                )}
              </section>
            )}

            {/* Section: Progress Chart */}
            {exerciseNames.length > 0 && (
              <section className="mb-8">
                <p className="text-[#C4706E] text-xs font-bold uppercase tracking-[0.15em] mb-2">Progress</p>
                <h2 className="text-xl font-bold font-display text-[#49443D] mb-4">Weight Over Time</h2>

                {visiblePills.length > 0 ? (
                  <>
                    {/* Exercise selector pills */}
                    <div className="flex gap-1.5 flex-wrap mb-5">
                      {visiblePills.map((name) => (
                        <button
                          key={name}
                          onClick={() => setSelectedExercise(name)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                            selectedExercise === name
                              ? "bg-[#C4706E] text-white shadow-md shadow-[#C4706E]/20"
                              : "bg-white border border-black/5 text-[#49443D]/50 hover:bg-[#FAF6F1]"
                          }`}
                        >
                          {name}
                        </button>
                      ))}
                      {/* +N more pill when collapsed and not searching */}
                      {!query && hiddenPillCount > 0 && (
                        <button
                          onClick={() => setPillsExpanded(true)}
                          className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#F5F0E8] text-[#49443D]/60 hover:bg-[#EDE6DA] border border-dashed border-[#49443D]/15"
                        >
                          +{hiddenPillCount} more
                        </button>
                      )}
                      {!query && pillsExpanded && exerciseNames.length > PILL_DEFAULT_LIMIT && (
                        <button
                          onClick={() => setPillsExpanded(false)}
                          className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[#49443D]/40 hover:text-[#49443D]"
                        >
                          Show less
                        </button>
                      )}
                    </div>

                    {/* Chart */}
                    <div className="bg-white rounded-2xl border border-black/5 p-4 shadow-sm">
                      <ProgressChart logs={logs} exerciseName={selectedExercise} />
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-[#49443D]/40 italic">No exercises match &ldquo;{query}&rdquo;</p>
                )}
              </section>
            )}

            {/* Section: Workout History */}
            <section>
              <p className="text-[#C4706E] text-xs font-bold uppercase tracking-[0.15em] mb-2">History</p>
              <h2 className="text-xl font-bold font-display text-[#49443D] mb-4">Past Workouts</h2>
              {visibleLogs.length > 0 ? (
                <>
                  <div className="space-y-3 pb-4">
                    {visibleLogs.map((log) => (
                      <WorkoutHistoryItem
                        key={log.id}
                        log={log}
                        highlightExercise={query || undefined}
                        defaultExpanded={!!query}
                      />
                    ))}
                  </div>
                  {/* Load more (only when no active search) */}
                  {!query && filteredLogs.length > historyLimit && (
                    <button
                      onClick={() => setHistoryLimit(historyLimit + HISTORY_PAGE_SIZE)}
                      className="w-full py-3 rounded-2xl bg-white border border-black/5 text-[#C4706E] font-semibold text-sm hover:bg-[#FFFDF9] transition-colors shadow-sm"
                    >
                      Load more
                    </button>
                  )}
                </>
              ) : (
                <p className="text-sm text-[#49443D]/40 italic">No workouts match &ldquo;{query}&rdquo;</p>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
