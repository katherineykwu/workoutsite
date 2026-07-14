import { EquipmentSelector } from "workout-app";

export const SomeSelected = () => (
  <EquipmentSelector selected={["dumbbells", "kettlebell", "yoga-mat"]} onChange={() => {}} />
);

export const NoneSelected = () => (
  <EquipmentSelector selected={[]} onChange={() => {}} />
);
