// Displays a single personal record
"use client";

import type { PersonalBest } from "@/lib/types";

export default function PersonalBestCard({ pb }: { pb: PersonalBest }) {
  return (
    <div className="bg-white rounded-2xl border border-black/5 p-4 shadow-sm border-l-4 border-l-[#C4706E]">
      <p className="text-sm font-bold text-[#49443D] truncate">{pb.displayName}</p>
      <p className="text-2xl font-extrabold text-[#C4706E] mt-1">{pb.weight} <span className="text-sm font-semibold text-[#49443D]/30">lbs</span></p>
      <p className="text-xs text-[#49443D]/40 mt-0.5">{pb.reps} reps · {pb.date}</p>
    </div>
  );
}
