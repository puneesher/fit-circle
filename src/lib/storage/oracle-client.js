import oracledb from "oracledb";

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
oracledb.fetchAsString = [oracledb.CLOB];

const globalForOracle = globalThis;

function getConfig() {
  const user = process.env.ORACLE_USER;
  const password = process.env.ORACLE_PASSWORD;
  const connectString = process.env.ORACLE_CONNECT_STRING;

  if (!user || !password || !connectString) {
    throw new Error(
      "Missing Oracle env vars: ORACLE_USER, ORACLE_PASSWORD, ORACLE_CONNECT_STRING",
    );
  }

  return { user, password, connectString };
}

export async function getOraclePool() {
  if (!globalForOracle._oraclePool) {
    const config = getConfig();
    globalForOracle._oraclePool = await oracledb.createPool({
      ...config,
      poolMin: 0,
      poolMax: 4,
      poolIncrement: 1,
    });
  }

  return globalForOracle._oraclePool;
}

export async function withOracleConnection(fn) {
  const pool = await getOraclePool();
  const connection = await pool.getConnection();

  try {
    return await fn(connection);
  } finally {
    await connection.close();
  }
}

export async function ensureOracleSchema(connection) {
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
}
