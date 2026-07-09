const globalForOracle = globalThis;

function isBufferBoundsError(error) {
  return (
    error?.code === "ERR_BUFFER_OUT_OF_BOUNDS" ||
    String(error?.message ?? "").includes("outside buffer bounds")
  );
}

function resetOracleRuntime() {
  globalForOracle._oraclePool = null;
  globalForOracle._oracleTablesEnsured = false;
}

async function getOracleDb() {
  if (!globalForOracle._oracledb) {
    const oracledb = (await import("oracledb")).default;
    oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
    globalForOracle._oracledb = oracledb;
  }

  return globalForOracle._oracledb;
}

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
    const oracledb = await getOracleDb();
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

function withOracleLock(fn) {
  const previous = globalForOracle._oracleLock ?? Promise.resolve();
  const run = previous.catch(() => {}).then(fn);
  globalForOracle._oracleLock = run.catch(() => {});
  return run;
}

async function runWithConnection(fn, attempt = 0) {
  const pool = await getOraclePool();
  const connection = await pool.getConnection();

  try {
    return await fn(connection);
  } catch (error) {
    if (isBufferBoundsError(error) && attempt < 2) {
      resetOracleRuntime();
      return runWithConnection(fn, attempt + 1);
    }
    throw error;
  } finally {
    await connection.close();
  }
}

export async function withOracleConnection(fn) {
  return runWithConnection(fn);
}
