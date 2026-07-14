import { TemplatePicker } from "workout-app";

const ex = (id: string, name: string) => ({
  id, name, sets: 3, reps: "10", restSeconds: 60, targetWeight: 0, notes: "",
  videoType: "none" as const, videoUrl: "",
});

const templates = [
  { id: "tpl-1", name: "Lower Body Strength", exercises: [ex("1", "Goblet Squat"), ex("2", "Romanian Deadlift"), ex("3", "Lunges")], createdAt: 0, updatedAt: 0 },
  { id: "tpl-2", name: "Upper Body Push", exercises: [ex("4", "Bench Press"), ex("5", "Shoulder Press")], createdAt: 0, updatedAt: 0 },
  { id: "tpl-3", name: "Core & Mobility", exercises: [ex("6", "Dead Bug"), ex("7", "Bird Dog"), ex("8", "Plank")], createdAt: 0, updatedAt: 0 },
];

export const WithTemplates = () => (
  <TemplatePicker
    templates={templates}
    targetDay="Wednesday"
    hasExistingExercises
    onApply={() => {}}
    onClose={() => {}}
  />
);
