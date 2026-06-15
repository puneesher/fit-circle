import {
  ensureOracleSchema,
  withOracleConnection,
} from "./oracle-client";
import { readJsonSeed } from "./seed-from-json";

async function readCollection(connection, collectionName) {
  const result = await connection.execute(
    `SELECT items FROM fc_collections WHERE name = :name`,
    { name: collectionName },
  );

  if (result.rows.length === 0) {
    return null;
  }

  const items = result.rows[0].ITEMS;

  if (typeof items === "string") {
    return JSON.parse(items);
  }

  return items;
}

async function writeCollection(connection, collectionName, items) {
  await connection.execute(
    `MERGE INTO fc_collections target
     USING (SELECT :name AS name, :items AS items FROM dual) source
     ON (target.name = source.name)
     WHEN MATCHED THEN
       UPDATE SET target.items = source.items
     WHEN NOT MATCHED THEN
       INSERT (name, items) VALUES (source.name, source.items)`,
    {
      name: collectionName,
      items: JSON.stringify(items),
    },
    { autoCommit: true },
  );
}

export function createOracleStorage(collectionName) {
  return {
    async readAll() {
      return withOracleConnection(async (connection) => {
        await ensureOracleSchema(connection);

        let items = await readCollection(connection, collectionName);

        if (items == null) {
          items = await readJsonSeed(collectionName);
          await writeCollection(connection, collectionName, items);
        }

        return items;
      });
    },

    async writeAll(items) {
      return withOracleConnection(async (connection) => {
        await ensureOracleSchema(connection);
        await writeCollection(connection, collectionName, items);
        return items;
      });
    },
  };
}
