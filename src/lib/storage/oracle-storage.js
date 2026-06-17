import {
  ensureOracleTables,
  migrateLegacyCollection,
  readJsonRows,
} from "./oracle-schema";
import { withOracleConnection } from "./oracle-client";
import { readJsonSeed } from "./seed-from-json";

const TABLE_CONFIG = {
  exercises: {
    table: "fc_exercises",
    orderBy: "id",
    writeRows: writeExerciseRows,
  },
  routines: {
    table: "fc_routines",
    orderBy: "sort_order",
    writeRows: writeRoutineRows,
  },
  history: {
    table: "fc_history",
    orderBy: "started_at",
    writeRows: writeHistoryRows,
  },
};

async function readRows(connection, config) {
  return readJsonRows(connection, config.table, config.orderBy);
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

async function ensureCollectionReady(connection, collectionName) {
  const config = TABLE_CONFIG[collectionName];

  await ensureOracleTables(connection);
  await migrateLegacyCollection(connection, collectionName);

  const result = await connection.execute(
    `SELECT COUNT(*) AS C FROM ${config.table}`,
  );

  if (result.rows[0].C > 0) return;

  const seed = await readJsonSeed(collectionName);
  if (seed.length === 0) return;

  await config.writeRows(connection, seed);
  await connection.commit();
}

export function createOracleStorage(collectionName) {
  const config = TABLE_CONFIG[collectionName];

  if (!config) {
    throw new Error(`Unknown Oracle collection: ${collectionName}`);
  }

  return {
    async readAll() {
      return withOracleConnection(async (connection) => {
        await ensureCollectionReady(connection, collectionName);
        return readRows(connection, config);
      });
    },

    async writeAll(items) {
      return withOracleConnection(async (connection) => {
        await ensureOracleTables(connection);
        await config.writeRows(connection, items);
        await connection.commit();
        return items;
      });
    },
  };
}
