// Set a new password for any account (student, faculty or admin), in both the
// person table and Better Auth's auth_account, and sign out its sessions.
// Usage: npm run set-password -- <email>
// The password is typed at a hidden prompt, so it never lands in shell history.
require('dotenv').config();
const readline = require('readline');
const bcrypt = require('bcryptjs');
const oracledb = require('oracledb');

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

  const conn = await oracledb.getConnection({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectString: process.env.DB_CONNECT_STRING,
  });
  try {
    const user = await conn.execute(
      'SELECT id, user_role, ref_id FROM auth_user WHERE LOWER(email) = :email',
      { email },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    const row = user.rows[0];
    if (!row) {
      console.error(`No account uses ${email}. Run "npm run seed" first, or check the spelling.`);
      process.exit(1);
    }
    const hash = await bcrypt.hash(password, Number(process.env.BCRYPT_SALT_ROUNDS) || 10);
    const [table, idCol] = TABLES[row.USER_ROLE];
    await conn.execute(`UPDATE ${table} SET Password = :hash WHERE ${idCol} = :id`, { hash, id: row.REF_ID });
    await conn.execute(
      "UPDATE auth_account SET password = :hash, updated_at = SYSTIMESTAMP WHERE user_id = :uid AND provider_id = 'credential'",
      { hash, uid: row.ID }
    );
    // Sign the account out everywhere, so the old password's sessions end.
    await conn.execute('DELETE FROM auth_session WHERE user_id = :uid', { uid: row.ID });
    await conn.commit();
    console.log(`Password updated for ${email} (${row.USER_ROLE}). Existing sessions were signed out.`);
  } finally {
    await conn.close();
  }
}

run().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
