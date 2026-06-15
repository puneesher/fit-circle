import oracledb from "oracledb";
import { loadEnv } from "./load-env.mjs";
import { readJsonSeed } from "../src/lib/storage/seed-from-json.js";

loadEnv();

const collections = ["exercises", "routines", "history"];

const user = process.env.ORACLE_USER;
const password = process.env.ORACLE_PASSWORD;
const connectString = process.env.ORACLE_CONNECT_STRING;

if (!user || !password || !connectString) {
  console.error(
    "Set ORACLE_USER, ORACLE_PASSWORD, and ORACLE_CONNECT_STRING before running seed:oracle",
  );
  process.exit(1);
}

let connection;

try {
  connection = await oracledb.getConnection({ user, password, connectString });

  await connection.execute(`
    BEGIN
      EXECUTE IMMEDIATE '
        CREATE TABLE fc_collections (
          name VARCHAR2(64) PRIMARY KEY,
          items JSON NOT NULL
        )';
    EXCEPTION
      WHEN OTHERS THEN
        IF SQLCODE != -955 THEN
          RAISE;
        END IF;
    END;
  `);

  for (const name of collections) {
    const items = await readJsonSeed(name);

    await connection.execute(
      `MERGE INTO fc_collections target
       USING (SELECT :name AS name, :items AS items FROM dual) source
       ON (target.name = source.name)
       WHEN MATCHED THEN
         UPDATE SET target.items = source.items
       WHEN NOT MATCHED THEN
         INSERT (name, items) VALUES (source.name, source.items)`,
      {
        name,
        items: JSON.stringify(items),
      },
      { autoCommit: true },
    );

    console.log(`Seeded ${name}: ${items.length} items`);
  }
} finally {
  if (connection) {
    await connection.close();
  }
}
