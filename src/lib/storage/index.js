import { createJsonFileStorage } from "./json-file-storage";
import { createOracleStorage } from "./oracle-storage";

function usesOracle() {
  return Boolean(
    process.env.ORACLE_USER &&
      process.env.ORACLE_PASSWORD &&
      process.env.ORACLE_CONNECT_STRING,
  );
}

function createStorage(collection) {
  if (usesOracle()) {
    return createOracleStorage(collection);
  }

  return createJsonFileStorage(collection);
}

/** Uses Oracle Autonomous DB when Oracle env vars are set, otherwise local JSON files. */
export function getExerciseStorage() {
  return createStorage("exercises");
}

export function getRoutineStorage() {
  return createStorage("routines");
}

export function getHistoryStorage() {
  return createStorage("history");
}

export function getBookStorage() {
  return createStorage("books");
}

export function getUserStorage() {
  return createStorage("users");
}
