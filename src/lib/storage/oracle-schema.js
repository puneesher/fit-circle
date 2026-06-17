async function parseJsonValue(value) {
  if (value == null) return null;
  if (typeof value === "string") return JSON.parse(value);
  if (typeof value === "object" && typeof value.getData === "function") {
    const data = await value.getData();
    return typeof data === "string" ? JSON.parse(data) : data;
  }
  return value;
}

function getCount(result) {
  const row = result.rows[0];
  if (!row) return 0;
  if (Array.isArray(row)) return Number(row[0]) || 0;
  return Number(row.C ?? row.c ?? Object.values(row)[0]) || 0;
}

function getColumn(row, name) {
  if (!row) return undefined;
  if (Array.isArray(row)) return row[0];
  return row[name] ?? row[name.toLowerCase()] ?? row[name.toUpperCase()];
}

async function tableExists(connection, tableName) {
  const result = await connection.execute(
    `SELECT COUNT(*) AS C
     FROM user_tables
     WHERE table_name = :table_name`,
    { table_name: tableName.toUpperCase() },
  );

  return getCount(result) > 0;
}

async function readLegacyCollection(connection, collectionName) {
  const exists = await tableExists(connection, "fc_collections");
  if (!exists) return null;

  const result = await connection.execute(
    `SELECT JSON_SERIALIZE(items RETURNING CLOB) AS items
     FROM fc_collections
     WHERE name = :name`,
    { name: collectionName },
  );

  if (result.rows.length === 0) return null;

  const items = await parseJsonValue(getColumn(result.rows[0], "ITEMS"));
  return Array.isArray(items) ? items : null;
}

async function countRows(connection, tableName) {
  const result = await connection.execute(
    `SELECT COUNT(*) AS C FROM ${tableName}`,
  );
  return getCount(result);
}

async function insertExerciseRows(connection, items) {
  for (const item of items) {
    await connection.execute(
      `INSERT INTO fc_exercises (id, data) VALUES (:id, :data)`,
      { id: item._id, data: JSON.stringify(item) },
      { autoCommit: false },
    );
  }
}

async function insertRoutineRows(connection, items) {
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

async function insertHistoryRows(connection, items) {
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

const MIGRATIONS = {
  exercises: { table: "fc_exercises", insert: insertExerciseRows },
  routines: { table: "fc_routines", insert: insertRoutineRows },
  history: { table: "fc_history", insert: insertHistoryRows },
};

export async function ensureOracleTables(connection) {
  await connection.execute(`
    BEGIN
      EXECUTE IMMEDIATE '
        CREATE TABLE fc_exercises (
          id VARCHAR2(128) PRIMARY KEY,
          data JSON NOT NULL
        )';
    EXCEPTION
      WHEN OTHERS THEN
        IF SQLCODE != -955 THEN RAISE; END IF;
    END;
  `);

  await connection.execute(`
    BEGIN
      EXECUTE IMMEDIATE '
        CREATE TABLE fc_routines (
          id VARCHAR2(128) PRIMARY KEY,
          sort_order NUMBER NOT NULL,
          data JSON NOT NULL
        )';
    EXCEPTION
      WHEN OTHERS THEN
        IF SQLCODE != -955 THEN RAISE; END IF;
    END;
  `);

  await connection.execute(`
    BEGIN
      EXECUTE IMMEDIATE '
        CREATE TABLE fc_history (
          id VARCHAR2(256) PRIMARY KEY,
          started_at TIMESTAMP WITH TIME ZONE NOT NULL,
          data JSON NOT NULL
        )';
    EXCEPTION
      WHEN OTHERS THEN
        IF SQLCODE != -955 THEN RAISE; END IF;
    END;
  `);

  // Keep legacy table for backup; create if missing for older deployments.
  await connection.execute(`
    BEGIN
      EXECUTE IMMEDIATE '
        CREATE TABLE fc_collections (
          name VARCHAR2(64) PRIMARY KEY,
          items JSON NOT NULL
        )';
    EXCEPTION
      WHEN OTHERS THEN
        IF SQLCODE != -955 THEN RAISE; END IF;
    END;
  `);
}

export async function migrateLegacyCollection(connection, collectionName, { force = false } = {}) {
  const config = MIGRATIONS[collectionName];
  if (!config) return { migrated: 0, reason: "unknown collection" };

  const rowCount = await countRows(connection, config.table);
  if (rowCount > 0 && !force) {
    return {
      migrated: 0,
      reason: `${config.table} already has ${rowCount} rows`,
    };
  }

  const legacyItems = await readLegacyCollection(connection, collectionName);
  if (!legacyItems || legacyItems.length === 0) {
    return {
      migrated: 0,
      reason: "no legacy data in fc_collections",
    };
  }

  if (force && rowCount > 0) {
    await connection.execute(`DELETE FROM ${config.table}`, [], { autoCommit: false });
  }

  await config.insert(connection, legacyItems);
  await connection.commit();

  return { migrated: legacyItems.length, reason: force ? "force migrated" : "migrated" };
}

export async function migrateAllLegacyCollections(connection, options = {}) {
  await ensureOracleTables(connection);

  const migrated = {};

  for (const collectionName of Object.keys(MIGRATIONS)) {
    migrated[collectionName] = await migrateLegacyCollection(
      connection,
      collectionName,
      options,
    );
  }

  return migrated;
}

export async function inspectOracleStorage(connection) {
  await ensureOracleTables(connection);

  const legacyExists = await tableExists(connection, "fc_collections");
  let legacyRows = [];

  if (legacyExists) {
    const result = await connection.execute(
      `SELECT name FROM fc_collections ORDER BY name`,
    );
    legacyRows = result.rows.map((row) => getColumn(row, "NAME"));
  }

  const tables = {};

  for (const [collection, config] of Object.entries(MIGRATIONS)) {
    tables[collection] = {
      table: config.table,
      rows: await countRows(connection, config.table),
      legacyInFcCollections: legacyRows.includes(collection),
    };
  }

  return {
    legacyTableExists: legacyExists,
    legacyCollectionNames: legacyRows,
    tables,
  };
}

export async function readJsonRows(connection, table, orderBy) {
  const result = await connection.execute(
    `SELECT JSON_SERIALIZE(data RETURNING CLOB) AS data
     FROM ${table}
     ORDER BY ${orderBy}`,
  );

  return Promise.all(
    result.rows.map((row) => parseJsonValue(getColumn(row, "DATA"))),
  );
}

export { parseJsonValue };
