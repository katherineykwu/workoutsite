// Trainer selects which equipment is needed for the week
"use client";

import { EQUIPMENT_OPTIONS } from "@/lib/types";

interface EquipmentSelectorProps {
  selected: string[];
  onChange: (equipment: string[]) => void;
}

export default function EquipmentSelector({ selected, onChange }: EquipmentSelectorProps) {
  function toggle(id: string) {
    if (selected.includes(id)) {
      onChange(selected.filter((e) => e !== id));
    } else {
      onChange([...selected, id]);
    }
  }

  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wider">
        Equipment Needed This Week
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {EQUIPMENT_OPTIONS.map((item) => {
          const isSelected = selected.includes(item.id);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => toggle(item.id)}
              className={`flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-left transition-all text-sm font-medium ${
                isSelected
                  ? "bg-indigo-50 text-indigo-700 ring-2 ring-indigo-500 shadow-sm"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span className="text-lg flex-shrink-0">{item.icon}</span>
              <span className="truncate">{item.name}</span>
              {isSelected && (
                <svg className="w-4 h-4 ml-auto flex-shrink-0 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
