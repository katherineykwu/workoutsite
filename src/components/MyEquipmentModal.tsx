// Modal for you to select what equipment you have access to
"use client";

import { useState } from "react";
import { EQUIPMENT_OPTIONS } from "@/lib/types";

interface MyEquipmentModalProps {
  selected: string[];
  onSave: (equipment: string[]) => void;
  onClose: () => void;
}

export default function MyEquipmentModal({ selected, onSave, onClose }: MyEquipmentModalProps) {
  const [local, setLocal] = useState<string[]>(selected);

  function toggle(id: string) {
    setLocal((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[85vh] overflow-y-auto p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-extrabold text-[#1A0A1F]">My Equipment</h2>
          <button onClick={onClose} className="p-2 text-[#1A0A1F]/30 hover:text-[#1A0A1F]/60 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className="text-[#1A0A1F]/40 text-sm mb-5">
          Select what you have access to so Jamie knows what to include in your workouts.
        </p>

        <div className="grid grid-cols-2 gap-2.5 mb-6">
          {EQUIPMENT_OPTIONS.map((item) => {
            const isSelected = local.includes(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => toggle(item.id)}
                className={`flex items-center gap-2.5 px-3.5 py-3.5 rounded-xl text-left transition-all text-sm font-medium ${
                  isSelected
                    ? "bg-[#FF1A66]/10 text-[#FF1A66] ring-2 ring-[#FF1A66] shadow-sm"
                    : "bg-[#F5F3F4] border border-black/5 text-[#1A0A1F]/60"
                }`}
              >
                <span className="text-xl flex-shrink-0">{item.icon}</span>
                <span className="truncate">{item.name}</span>
                {isSelected && (
                  <svg className="w-4 h-4 ml-auto flex-shrink-0 text-[#FF1A66]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => onSave(local)}
          className="w-full gradient-pink text-white py-3.5 rounded-xl font-bold shadow-lg shadow-[#FF1A66]/25 hover:opacity-90 transition-all"
        >
          Save ({local.length} selected)
        </button>
      </div>
    </div>
  );
}
