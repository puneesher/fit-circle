import oracledb from "oracledb";
import { loadEnv } from "./load-env.mjs";
import { readJsonSeed } from "../src/lib/storage/seed-from-json.js";
import {
  ensureOracleTables,
  migrateAllLegacyCollections,
} from "../src/lib/storage/oracle-schema.js";

loadEnv();

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

const allCollections = ["exercises", "routines", "history"];

const only = new Set();
if (process.argv.includes("--exercises-only")) only.add("exercises");
if (process.argv.includes("--routines-only")) only.add("routines");
if (process.argv.includes("--history-only")) only.add("history");

const collections =
  only.size > 0 ? allCollections.filter((name) => only.has(name)) : allCollections;

if (only.size > 0) {
  console.log(`Seeding: ${collections.join(", ")}`);
}

const user = process.env.ORACLE_USER;
const password = process.env.ORACLE_PASSWORD;
const connectString = process.env.ORACLE_CONNECT_STRING;

if (!user || !password || !connectString) {
  console.error(
    "Set ORACLE_USER, ORACLE_PASSWORD, and ORACLE_CONNECT_STRING before running seed:oracle",
  );
  process.exit(1);
}

async function writeExerciseRows(connection, items) {
  await connection.execute(`DELETE FROM fc_exercises`, [], { autoCommit: false });

  for (const item of items) {
    await connection.execute(
      `INSERT INTO fc_exercises (id, data) VALUES (:id, :data)`,
      { id: item._id, data: JSON.stringify(item) },
      { autoCommit: false },
    );
  }
}

async function writeRoutineRows(connection, items) {
  await connection.execute(`DELETE FROM fc_routines`, [], { autoCommit: false });

  for (let index = 0; index < items.length; index += 1) {
    const item = items[index];
    await connection.execute(
      `INSERT INTO fc_routines (id, sort_order, data) VALUES (:id, :sort_order, :data)`,
      {
        id: item._id,
        sort_order: index,
        data: JSON.stringify(item),
      },
      { autoCommit: false },
    );
  }
}

async function writeHistoryRows(connection, items) {
  await connection.execute(`DELETE FROM fc_history`, [], { autoCommit: false });

  for (const item of items) {
    await connection.execute(
      `INSERT INTO fc_history (id, started_at, data) VALUES (:id, :started_at, :data)`,
      {
        id: item._id,
        started_at: new Date(item.startedAt),
        data: JSON.stringify(item),
      },
      { autoCommit: false },
    );
  }
}

const writers = {
  exercises: writeExerciseRows,
  routines: writeRoutineRows,
  history: writeHistoryRows,
};

let connection;

try {
  connection = await oracledb.getConnection({ user, password, connectString });

  await ensureOracleTables(connection);

  if (only.size === 0) {
    const migrated = await migrateAllLegacyCollections(connection);
    console.log("Legacy migration:", migrated);
  }

  for (const name of collections) {
    const items = await readJsonSeed(name);
    await writers[name](connection, items);
    await connection.commit();
    console.log(`Seeded ${name}: ${items.length} rows`);
  }
} finally {
  if (connection) {
    await connection.close();
  }
}
