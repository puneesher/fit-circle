import { bookRowId } from "../books.js";
import {
  ensureOracleTables,
  migrateLegacyCollection,
  parseJsonValue,
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
  users: {
    table: "fc_users",
    orderBy: "id",
    writeRows: writeUserRows,
  },
  "muscle-groups": {
    table: "fc_muscle_groups",
    orderBy: "id",
    writeRows: writeMuscleGroupRows,
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

async function writeUserRows(connection, items) {
  await connection.execute(`DELETE FROM fc_users`, [], { autoCommit: false });
  for (const item of items) {
    await connection.execute(
      `INSERT INTO fc_users (id, data) VALUES (:id, :data)`,
      { id: item._id, data: JSON.stringify(item) },
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

async function writeMuscleGroupRows(connection, items) {
  await connection.execute(`DELETE FROM fc_muscle_groups`, [], { autoCommit: false });
  for (const item of items) {
    await connection.execute(
      `INSERT INTO fc_muscle_groups (id, data) VALUES (:id, :data)`,
      { id: item._id, data: JSON.stringify(item) },
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

const USER_SCOPED_COLLECTIONS = new Set(["routines", "history"]);

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

    async readByUser(userId) {
      if (!USER_SCOPED_COLLECTIONS.has(collectionName)) {
        return this.readAll();
      }

      return withOracleConnection(async (connection) => {
        await ensureOracleTables(connection);

        const sql = `
          SELECT JSON_SERIALIZE(data RETURNING CLOB) AS data
          FROM ${config.table}
          WHERE JSON_VALUE(data, '$.userId') = :userId
             OR (JSON_VALUE(data, '$.userId') IS NULL AND :userId2 = 'im')
          ORDER BY ${config.orderBy}
        `;

        const result = await connection.execute(sql, { userId, userId2: userId });

        return Promise.all(
          result.rows.map((row) => {
            const cell = Array.isArray(row) ? row[0] : (row.DATA ?? row.data);
            return parseJsonValue(cell);
          }),
        );
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
