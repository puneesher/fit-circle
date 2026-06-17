import oracledb from "oracledb";
import { loadEnv } from "./load-env.mjs";
import {
  ensureOracleTables,
  inspectOracleStorage,
  migrateAllLegacyCollections,
} from "../src/lib/storage/oracle-schema.js";

loadEnv();

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

const force = process.argv.includes("--force");

const user = process.env.ORACLE_USER;
const password = process.env.ORACLE_PASSWORD;
const connectString = process.env.ORACLE_CONNECT_STRING;

if (!user || !password || !connectString) {
  console.error(
    "Set ORACLE_USER, ORACLE_PASSWORD, and ORACLE_CONNECT_STRING before running migrate:oracle",
  );
  process.exit(1);
}

let connection;

try {
  connection = await oracledb.getConnection({ user, password, connectString });

  console.log("Before migration:");
  console.log(JSON.stringify(await inspectOracleStorage(connection), null, 2));

  await ensureOracleTables(connection);

  const migrated = await migrateAllLegacyCollections(connection, { force });
  console.log(`\nMigration results${force ? " (force)" : ""}:`);
  console.log(JSON.stringify(migrated, null, 2));
  console.log("\nfc_collections was left unchanged as a backup.");

  console.log("\nAfter migration:");
  console.log(JSON.stringify(await inspectOracleStorage(connection), null, 2));
} finally {
  if (connection) {
    await connection.close();
  }
}
