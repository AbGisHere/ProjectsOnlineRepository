// Runs a .sql file (DDL or seed) against Oracle using sqlplus-style '/'
// statement separators, split and executed one at a time via node-oracledb.
// Usage: node scripts/runSql.js sql/ddl.sql
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const oracledb = require('oracledb');

async function run() {
  const file = process.argv[2];
  if (!file) {
    console.error('Usage: node scripts/runSql.js <path-to-sql-file>');
    process.exit(1);
  }

  const sql = fs.readFileSync(path.resolve(file), 'utf8');

  // Split on a line that is just '/' (PL/SQL block terminator) or ';' at
  // end of a statement, while ignoring blank/comment-only chunks.
  const statements = splitStatements(sql);

  const connection = await oracledb.getConnection({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectString: process.env.DB_CONNECT_STRING,
  });

  try {
    for (const stmt of statements) {
      const trimmed = stmt.trim();
      if (!trimmed) continue;
      try {
        await connection.execute(trimmed);
      } catch (err) {
        console.error(`Failed statement:\n${trimmed}\n`, err.message);
      }
    }
    await connection.commit();
    console.log(`Finished running ${file}`);
  } finally {
    await connection.close();
  }
}

function splitStatements(sql) {
  // Remove full-line comments starting with --
  const lines = sql.split('\n').filter((l) => !l.trim().startsWith('--'));
  const cleaned = lines.join('\n');

  // PL/SQL blocks are terminated by a lone '/' on its own line.
  // Plain DDL/DML statements are terminated by ';'.
  const chunks = cleaned.split(/\n\s*\/\s*\n/);
  const statements = [];
  for (const chunk of chunks) {
    if (/^\s*BEGIN/i.test(chunk.trim())) {
      statements.push(chunk.trim());
    } else {
      chunk
        .split(';')
        .map((s) => s.trim())
        .filter(Boolean)
        .forEach((s) => statements.push(s));
    }
  }
  return statements;
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
