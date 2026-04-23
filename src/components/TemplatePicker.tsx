// Modal picker used by the trainer's Exercises tab "Apply template" button.
// Search + list of templates + Apply button (replaces the target day's exercises).
"use client";

import { useState } from "react";
import type { WorkoutTemplate } from "@/lib/types";
import { matchesQuery } from "@/lib/filterBySearch";

interface TemplatePickerProps {
  templates: WorkoutTemplate[];
  targetDay: string;
  hasExistingExercises: boolean;
  onApply: (template: WorkoutTemplate) => void;
  onClose: () => void;
}

export default function TemplatePicker({
  templates, targetDay, hasExistingExercises, onApply, onClose,
}: TemplatePickerProps) {
  const [query, setQuery] = useState("");
  const filtered = templates.filter((t) => matchesQuery(t.name, query));

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-black/5">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h2 className="text-lg font-bold font-display text-[#1A0A1F]">Apply Template</h2>
              <p className="text-sm text-[#1A0A1F]/50 mt-0.5">
                to {targetDay}
                {hasExistingExercises && (
                  <span className="text-[#E8730C] ml-1.5">· existing exercises will be replaced</span>
                )}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-[#1A0A1F]/30 hover:text-[#1A0A1F]/60 transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Search */}
          {templates.length > 0 && (
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search templates..."
              autoComplete="off"
              inputMode="search"
              className="w-full px-4 py-2.5 bg-[#F7F6F0] border border-black/5 rounded-xl text-[#1A0A1F] placeholder-[#1A0A1F]/30 focus:outline-none focus:ring-2 focus:ring-[#4A5D23] focus:border-transparent"
              style={{ fontSize: 16 }}
            />
          )}
        </div>

        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {templates.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-[#1A0A1F]/40 text-sm">
                No templates yet. Save a day&apos;s exercises as a template to get started.
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-[#1A0A1F]/40 italic text-center py-6">
              No templates match &ldquo;{query}&rdquo;
            </p>
          ) : (
            <div className="space-y-2">
              {filtered.map((t) => (
                <button
                  key={t.id}
                  onClick={() => onApply(t)}
                  className="w-full text-left bg-[#F7F6F0] hover:bg-[#4A5D23]/10 hover:border-[#4A5D23]/30 border border-transparent rounded-xl px-4 py-3 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#1A0A1F] truncate">{t.name}</p>
                      <p className="text-xs text-[#1A0A1F]/40 mt-0.5">
                        {t.exercises.length} exercise{t.exercises.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-[#4A5D23] shrink-0 ml-3">Apply →</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
