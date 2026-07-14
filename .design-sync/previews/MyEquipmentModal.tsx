import { MyEquipmentModal } from "workout-app";

export const SomeSelected = () => (
  <MyEquipmentModal
    selected={["dumbbells", "kettlebell", "bench", "yoga-mat"]}
    gymPhotos={[]}
    onSave={() => {}}
    onClose={() => {}}
  />
);
