// Oracle DB connection pool setup shared by the whole app.
require('dotenv').config();
const oracledb = require('oracledb');

// Return rows as plain JS objects (column name -> value) instead of arrays.
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
// Auto-commit each execute() call unless a transaction explicitly disables it.
oracledb.autoCommit = true;

let pool;

async function initPool() {
  if (pool) return pool;
  pool = await oracledb.createPool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectString: process.env.DB_CONNECT_STRING,
    poolMin: 2,
    poolMax: 10,
    poolIncrement: 1,
  });
  console.log('Oracle connection pool started');
  return pool;
}

async function closePool() {
  if (pool) {
    await pool.close(10);
    pool = undefined;
  }
}

// Acquire a connection, run the callback, always release the connection.
async function withConnection(fn) {
  const p = await initPool();
  const connection = await p.getConnection();
  try {
    return await fn(connection);
  } finally {
    try {
      await connection.close();
    } catch (err) {
      console.error('Error closing connection', err);
    }
  }
}

// Convenience helper for a single execute() without managing a connection.
async function execute(sql, binds = {}, opts = {}) {
  return withConnection((connection) => connection.execute(sql, binds, opts));
}

module.exports = { oracledb, initPool, closePool, withConnection, execute };
