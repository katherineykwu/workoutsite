import { EquipmentDisplay } from "workout-app";

export const ThisWeek = () => (
  <EquipmentDisplay equipmentIds={["dumbbells", "kettlebell", "bench", "resistance-band"]} />
);

export const FullGym = () => (
  <EquipmentDisplay
    equipmentIds={["dumbbells", "barbell", "weight-plates", "kettlebell", "bench", "cable-machine", "pull-up-bar", "yoga-mat"]}
  />
);
