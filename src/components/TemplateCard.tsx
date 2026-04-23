// Card shown in the trainer's Templates tab — one per saved workout template.
// Actions: Edit, Duplicate, Rename, Delete.
"use client";

import type { WorkoutTemplate } from "@/lib/types";

interface TemplateCardProps {
  template: WorkoutTemplate;
  onEdit: (template: WorkoutTemplate) => void;
  onDuplicate: (template: WorkoutTemplate) => void;
  onRename: (template: WorkoutTemplate) => void;
  onDelete: (template: WorkoutTemplate) => void;
}

export default function TemplateCard({ template, onEdit, onDuplicate, onRename, onDelete }: TemplateCardProps) {
  const updatedDate = new Date(template.updatedAt).toLocaleDateString("en-US", {
    month: "short", day: "numeric",
  });
  const count = template.exercises.length;

  return (
    <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-4 flex flex-col gap-3">
      {/* Header: name + count */}
      <div>
        <h3 className="font-bold font-display text-[#1A0A1F] text-lg leading-tight truncate">{template.name}</h3>
        <p className="text-xs text-[#1A0A1F]/40 mt-0.5">
          {count} exercise{count !== 1 ? "s" : ""} · updated {updatedDate}
        </p>
      </div>

      {/* Quick preview: first 3 exercise names */}
      {count > 0 && (
        <div className="text-xs text-[#1A0A1F]/50 space-y-0.5">
          {template.exercises.slice(0, 3).map((ex) => (
            <p key={ex.id} className="truncate">• {ex.name}</p>
          ))}
          {count > 3 && <p className="text-[#1A0A1F]/30 italic">+{count - 3} more</p>}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1.5 flex-wrap mt-auto pt-2 border-t border-black/5">
        <button
          onClick={() => onEdit(template)}
          className="text-xs font-semibold text-[#4A5D23] hover:bg-[#4A5D23]/10 px-3 py-1.5 rounded-lg transition-colors"
        >
          Edit
        </button>
        <button
          onClick={() => onDuplicate(template)}
          className="text-xs font-semibold text-[#1A0A1F]/60 hover:bg-[#F7F6F0] px-3 py-1.5 rounded-lg transition-colors"
        >
          Duplicate
        </button>
        <button
          onClick={() => onRename(template)}
          className="text-xs font-semibold text-[#1A0A1F]/60 hover:bg-[#F7F6F0] px-3 py-1.5 rounded-lg transition-colors"
        >
          Rename
        </button>
        <button
          onClick={() => onDelete(template)}
          className="ml-auto text-xs font-semibold text-red-400 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
