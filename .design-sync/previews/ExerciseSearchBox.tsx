import { ExerciseSearchBox } from "workout-app";

export const Empty = () => (
  <ExerciseSearchBox value="" onChange={() => {}} accentColor="#C4706E" />
);

export const WithQuery = () => (
  <ExerciseSearchBox value="squat" onChange={() => {}} accentColor="#C4706E" />
);

export const TrainerAccent = () => (
  <ExerciseSearchBox value="deadlift" onChange={() => {}} accentColor="#E8730C" placeholder="Search client activity..." />
);
