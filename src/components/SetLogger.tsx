// Per-set input row for logging weight and reps
"use client";

interface SetLoggerProps {
  setNumber: number;
  weight: number;
  reps: number;
  placeholderWeight?: number;
  placeholderReps?: number;
  onChange: (weight: number, reps: number) => void;
}

export default function SetLogger({
  setNumber, weight, reps, placeholderWeight, placeholderReps, onChange,
}: SetLoggerProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-bold text-[#49443D]/30 w-12 shrink-0">Set {setNumber}</span>
      <div className="flex-1 flex gap-2">
        <div className="relative flex-1">
          <input
            type="number"
            value={weight || ""}
            onChange={(e) => onChange(Number(e.target.value), reps)}
            placeholder={placeholderWeight ? String(placeholderWeight) : "0"}
            min={0}
            className="w-full px-3 py-2.5 bg-[#F5F0E8] border border-black/5 rounded-xl text-[#49443D] text-sm font-semibold placeholder-[#49443D]/25 focus:outline-none focus:ring-2 focus:ring-[#C4706E] focus:border-transparent text-center"
          />
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-[#49443D]/30 font-medium">lbs</span>
        </div>
        <div className="relative flex-1">
          <input
            type="number"
            value={reps || ""}
            onChange={(e) => onChange(weight, Number(e.target.value))}
            placeholder={placeholderReps ? String(placeholderReps) : "0"}
            min={0}
            className="w-full px-3 py-2.5 bg-[#F5F0E8] border border-black/5 rounded-xl text-[#49443D] text-sm font-semibold placeholder-[#49443D]/25 focus:outline-none focus:ring-2 focus:ring-[#C4706E] focus:border-transparent text-center"
          />
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-[#49443D]/30 font-medium">reps</span>
        </div>
      </div>
    </div>
  );
}
