// Runs a .sql file (DDL or seed) against Postgres in one transaction: either
// the whole file applies, or nothing does.
// Usage: node scripts/runSql.js sql/ddl.sql
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const { poolConfig } = require('./dbConfig');

async function run() {
  const file = process.argv[2];
  if (!file) {
    console.error('Usage: node scripts/runSql.js <path-to-sql-file>');
    process.exit(1);
  }

  const sql = fs.readFileSync(path.resolve(file), 'utf8');
  const client = new Client(poolConfig());
  await client.connect();
  try {
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    console.log(`Finished running ${file}`);
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    await client.end();
  }
}

run().catch((err) => {
  console.error(`Failed: ${err.message}`);
  process.exit(1);
});
