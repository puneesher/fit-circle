import fs from "fs/promises";
import oracledb from "oracledb";
import path from "path";
import { fileURLToPath } from "url";
import { loadEnv } from "./load-env.mjs";
import { ensureOracleTables } from "../src/lib/storage/oracle-schema.js";

loadEnv();

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const historyPath = path.join(root, "data", "history.json");

const user = process.env.ORACLE_USER;
const password = process.env.ORACLE_PASSWORD;
const connectString = process.env.ORACLE_CONNECT_STRING;

if (!user || !password || !connectString) {
  console.error(
    "Set ORACLE_USER, ORACLE_PASSWORD, and ORACLE_CONNECT_STRING before running restore:history",
  );
  process.exit(1);
}

async function readLegacyHistory(connection) {
  const result = await connection.execute(
    `SELECT JSON_SERIALIZE(items RETURNING CLOB) AS items
     FROM fc_collections
     WHERE name = 'history'`,
  );

  if (result.rows.length === 0) {
    return null;
  }

  let items = result.rows[0].ITEMS ?? result.rows[0].items;
  if (items && typeof items.getData === "function") {
    items = await items.getData();
  }

  const parsed = typeof items === "string" ? JSON.parse(items) : items;
  return Array.isArray(parsed) ? parsed : null;
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

  await connection.commit();
}

let connection;

try {
  connection = await oracledb.getConnection({ user, password, connectString });
  await ensureOracleTables(connection);

  const legacy = await readLegacyHistory(connection);
  if (!legacy || legacy.length === 0) {
    console.error("No history found in fc_collections.");
    process.exit(1);
  }

  legacy.sort(
    (a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime(),
  );

  await writeHistoryRows(connection, legacy);
  await fs.writeFile(historyPath, `${JSON.stringify(legacy, null, 2)}\n`, "utf-8");

  console.log(`Restored ${legacy.length} sessions from fc_collections -> fc_history`);
  for (const item of legacy) {
    console.log(`  - ${item.date} | ${item.status} | ${item.routineName ?? item.routineId}`);
  }
  console.log(`\nUpdated ${historyPath}`);
} finally {
  if (connection) {
    await connection.close();
  }
}
