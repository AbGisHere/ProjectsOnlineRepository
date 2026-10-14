// Set a new password for any account (student, faculty or admin), in both the
// person table and Better Auth's auth_account, and sign out its sessions.
// Usage: npm run set-password -- <email>
// The password is typed at a hidden prompt, so it never lands in shell history.
require('dotenv').config();
const readline = require('readline');
const bcrypt = require('bcryptjs');
const { Client } = require('pg');
const { poolConfig } = require('./dbConfig');

const TABLES = { student: ['Student', 'Student_ID'], faculty: ['Faculty', 'Faculty_ID'], admin: ['Admin', 'Admin_ID'] };

function askHidden(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    rl._writeToOutput = (s) => {
      if (s.includes(question)) rl.output.write(s);
    };
    rl.question(question, (answer) => {
      rl.close();
      process.stdout.write('\n');
      resolve(answer);
    });
  });
}

async function run() {
  const email = (process.argv[2] || '').trim().toLowerCase();
  if (!email) {
    console.error('Usage: npm run set-password -- <email>');
    process.exit(1);
  }

  const password = await askHidden(`New password for ${email}: `);
  if (password.length < 8) {
    console.error('Use at least 8 characters.');
    process.exit(1);
  }
  if ((await askHidden('Type it again: ')) !== password) {
    console.error('The passwords did not match. Nothing was changed.');
    process.exit(1);
  }

  const conn = new Client(poolConfig());
  await conn.connect();
  try {
    const user = await conn.query('SELECT id, user_role, ref_id FROM auth_user WHERE LOWER(email) = $1', [email]);
    const row = user.rows[0];
    if (!row) {
      console.error(`No account uses ${email}. Run "npm run seed" first, or check the spelling.`);
      process.exitCode = 1;
      return;
    }
    const hash = await bcrypt.hash(password, Number(process.env.BCRYPT_SALT_ROUNDS) || 10);
    const [table, idCol] = TABLES[row.user_role];
    await conn.query('BEGIN');
    await conn.query(`UPDATE ${table} SET Password = $1 WHERE ${idCol} = $2`, [hash, row.ref_id]);
    await conn.query(
      "UPDATE auth_account SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2 AND provider_id = 'credential'",
      [hash, row.id]
    );
    // Sign the account out everywhere, so the old password's sessions end.
    await conn.query('DELETE FROM auth_session WHERE user_id = $1', [row.id]);
    await conn.query('COMMIT');
    console.log(`Password updated for ${email} (${row.user_role}). Existing sessions were signed out.`);
  } catch (err) {
    await conn.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    await conn.end();
  }
}

run().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
