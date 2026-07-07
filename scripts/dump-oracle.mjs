import oracledb from "oracledb";
import fs from "fs/promises";
import path from "path";
import { loadEnv } from "./load-env.mjs";

loadEnv();

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

const DATA_DIR = path.join(process.cwd(), "data");

const allCollections = ["exercises", "routines", "history", "books", "users"];

const only = new Set();
if (process.argv.includes("--exercises-only")) only.add("exercises");
if (process.argv.includes("--routines-only")) only.add("routines");
if (process.argv.includes("--history-only")) only.add("history");
if (process.argv.includes("--books-only")) only.add("books");
if (process.argv.includes("--users-only")) only.add("users");

const collections =
  only.size > 0 ? allCollections.filter((name) => only.has(name)) : allCollections;

if (only.size > 0) {
  console.log(`Dumping: ${collections.join(", ")}`);
}

const user = process.env.ORACLE_USER;
const password = process.env.ORACLE_PASSWORD;
const connectString = process.env.ORACLE_CONNECT_STRING;

if (!user || !password || !connectString) {
  console.error(
    "Set ORACLE_USER, ORACLE_PASSWORD, and ORACLE_CONNECT_STRING before running dump:oracle",
  );
  process.exit(1);
}

const queries = {
  exercises: `SELECT data FROM fc_exercises ORDER BY id`,
  routines:  `SELECT data FROM fc_routines  ORDER BY sort_order`,
  history:   `SELECT data FROM fc_history   ORDER BY started_at`,
  books:     `SELECT data FROM fc_books     ORDER BY sort_order`,
  users:     `SELECT data FROM fc_users     ORDER BY id`,
};

let connection;

try {
  connection = await oracledb.getConnection({ user, password, connectString });

  for (const name of collections) {
    const result = await connection.execute(queries[name]);
    const rows = result.rows.map((row) => {
      const raw = row.DATA;
      // oracledb may return a Lob or a plain string depending on column type
      return typeof raw === "string" ? JSON.parse(raw) : raw;
    });

    const filePath = path.join(DATA_DIR, `${name}.json`);
    await fs.writeFile(filePath, JSON.stringify(rows, null, 2) + "\n", "utf-8");
    console.log(`Dumped ${name}: ${rows.length} rows → data/${name}.json`);
  }
} finally {
  if (connection) {
    await connection.close();
  }
}
