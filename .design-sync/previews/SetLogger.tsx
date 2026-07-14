import { SetLogger } from "workout-app";

export const Empty = () => (
  <SetLogger setNumber={1} weight={0} reps={0} onChange={() => {}} />
);

export const Filled = () => (
  <SetLogger setNumber={2} weight={95} reps={8} onChange={() => {}} />
);

export const WithLastSessionPlaceholders = () => (
  <SetLogger setNumber={3} weight={0} reps={0} placeholderWeight={90} placeholderReps={10} onChange={() => {}} />
);
