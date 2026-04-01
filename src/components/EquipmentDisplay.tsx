// Equipment display — Sweat-inspired clean grid with soft gray cards
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
    <div className="mb-8">
      <p className="text-[#FF1A66] text-xs font-bold uppercase tracking-[0.15em] mb-2">
        Equipment
      </p>
      <h3 className="text-xl font-extrabold text-[#1A0A1F] mb-5">
        What you&apos;ll need
      </h3>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {items.map((item) => (
          <div
            key={item!.id}
            className="flex flex-col items-center gap-2 bg-white rounded-2xl border border-black/5 px-3 py-5 shadow-sm"
          >
            <span className="text-3xl">{item!.icon}</span>
            <span className="text-xs font-semibold text-[#1A0A1F]/70 text-center leading-tight">
              {item!.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
