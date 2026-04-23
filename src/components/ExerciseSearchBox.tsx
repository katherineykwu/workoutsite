// Controlled search input — shared between progress page and trainer activity tab.
// Pass accentColor so each view can use its own theme (#C4706E for Kiki, #E8730C for trainer).
"use client";

import { useRef } from "react";

interface ExerciseSearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  accentColor: string;
}

export default function ExerciseSearchBox({
  value, onChange, placeholder = "Search exercises...", accentColor,
}: ExerciseSearchBoxProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className="relative mb-6">
      {/* Magnifier icon */}
      <svg
        className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#49443D]/30 pointer-events-none"
        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>

      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") { onChange(""); }
        }}
        placeholder={placeholder}
        autoComplete="off"
        inputMode="search"
        // Input must be >= 16px to avoid iOS auto-zoom on focus; 44px height for comfy tap target.
        className="w-full pl-12 pr-11 py-3 bg-white border border-black/5 rounded-2xl text-[#49443D] placeholder-[#49443D]/30 focus:outline-none focus:ring-2 focus:border-transparent transition-all shadow-sm"
        style={{ fontSize: 16, minHeight: 44, ["--tw-ring-color" as string]: accentColor }}
      />

      {/* Clear button (only visible when there's text) */}
      {value && (
        <button
          type="button"
          onClick={() => {
            onChange("");
            inputRef.current?.focus();
          }}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full text-[#49443D]/40 hover:text-[#49443D] hover:bg-[#F5F0E8] transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
