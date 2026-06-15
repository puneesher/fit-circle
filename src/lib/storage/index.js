import { createJsonFileStorage } from "./json-file-storage";

/** Swap this factory when moving to a DB or blob store. */
export function getExerciseStorage() {
  return createJsonFileStorage("exercises");
}

export function getRoutineStorage() {
  return createJsonFileStorage("routines");
}
