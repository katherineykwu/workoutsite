// Displays a single personal record
"use client";

import type { PersonalBest } from "@/lib/types";

export default function PersonalBestCard({ pb }: { pb: PersonalBest }) {
  return (
    <div className="bg-white rounded-2xl border border-black/5 p-4 shadow-sm border-l-4 border-l-[#FF1A66]">
      <p className="text-sm font-bold text-[#1A0A1F] truncate">{pb.displayName}</p>
      <p className="text-2xl font-extrabold text-[#FF1A66] mt-1">{pb.weight} <span className="text-sm font-semibold text-[#1A0A1F]/30">lbs</span></p>
      <p className="text-xs text-[#1A0A1F]/40 mt-0.5">{pb.reps} reps · {pb.date}</p>
    </div>
  );
}
