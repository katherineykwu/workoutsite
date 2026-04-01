// Shows the equipment needed for the workout week (displayed on your page)
"use client";

import { EQUIPMENT_OPTIONS } from "@/lib/types";

interface EquipmentDisplayProps {
  equipmentIds: string[];
}

export default function EquipmentDisplay({ equipmentIds }: EquipmentDisplayProps) {
  if (!equipmentIds || equipmentIds.length === 0) return null;

  const items = equipmentIds
    .map((id) => EQUIPMENT_OPTIONS.find((e) => e.id === id))
    .filter(Boolean);

  if (items.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
          <svg className="w-4 h-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.384 3.18.67-5.73a6.06 6.06 0 01-1.7-1.93A6 6 0 013 7.5C3 4.462 5.462 2 8.5 2c1.47 0 2.81.577 3.8 1.52A6.473 6.473 0 0116 2c3.038 0 5.5 2.462 5.5 5.5a6 6 0 01-2.006 4.49 6.06 6.06 0 01-1.7 1.93l.67 5.73-5.384-3.18a1.008 1.008 0 00-1.16 0z" />
          </svg>
        </div>
        <h3 className="font-bold text-slate-900">Equipment Needed</h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {items.map((item) => (
          <div
            key={item!.id}
            className="flex items-center gap-3 bg-white rounded-xl border border-slate-100 px-4 py-3.5 shadow-sm"
          >
            <span className="text-2xl">{item!.icon}</span>
            <span className="text-sm font-semibold text-slate-700">{item!.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
