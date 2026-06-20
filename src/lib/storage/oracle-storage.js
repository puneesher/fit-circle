import { bookRowId } from "../books.js";
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
  books: {
    table: "fc_books",
    orderBy: "sort_order",
    writeRows: writeBookRows,
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

async function writeBookRows(connection, items) {
  await connection.execute(`DELETE FROM fc_books`, [], { autoCommit: false });

  for (let index = 0; index < items.length; index += 1) {
    const item = items[index];
    await connection.execute(
      `INSERT INTO fc_books (id, sort_order, data) VALUES (:id, :sort_order, :data)`,
      {
        id: bookRowId(item, index),
        sort_order: index,
        data: JSON.stringify(item),
      },
      { autoCommit: false },
    );
  }
}

async function loadCollection(connection, collectionName, config) {
  await ensureOracleTables(connection);

  const rows = await readRows(connection, config);
  if (rows.length > 0) return rows;

  await migrateLegacyCollection(connection, collectionName);

  const migrated = await readRows(connection, config);
  if (migrated.length > 0) return migrated;

  const seed = await readJsonSeed(collectionName);
  if (seed.length === 0) return [];

  await config.writeRows(connection, seed);
  await connection.commit();
  return seed;
}

export function createOracleStorage(collectionName) {
  const config = TABLE_CONFIG[collectionName];

  if (!config) {
    throw new Error(`Unknown Oracle collection: ${collectionName}`);
  }

  return {
    async readAll() {
      return withOracleConnection(async (connection) =>
        loadCollection(connection, collectionName, config),
      );
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
