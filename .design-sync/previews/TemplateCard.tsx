import { TemplateCard } from "workout-app";

const ex = (id: string, name: string) => ({
  id, name, sets: 3, reps: "10", restSeconds: 60, targetWeight: 0, notes: "",
  videoType: "none" as const, videoUrl: "",
});

const noop = () => {};

export const FullTemplate = () => (
  <TemplateCard
    template={{
      id: "tpl-1",
      name: "Lower Body Strength",
      exercises: [ex("1", "Goblet Squat"), ex("2", "Romanian Deadlift"), ex("3", "Walking Lunges"), ex("4", "Calf Raises"), ex("5", "Glute Bridge")],
      createdAt: 1780000000000,
      updatedAt: 1783555200000,
    }}
    onEdit={noop} onDuplicate={noop} onRename={noop} onDelete={noop}
  />
);

export const ShortTemplate = () => (
  <TemplateCard
    template={{
      id: "tpl-2",
      name: "Quick Core Blast",
      exercises: [ex("1", "Dead Bug"), ex("2", "Plank")],
      createdAt: 1780000000000,
      updatedAt: 1782345600000,
    }}
    onEdit={noop} onDuplicate={noop} onRename={noop} onDelete={noop}
  />
);
