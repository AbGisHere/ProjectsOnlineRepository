// Oracle connection options from the environment for the scripts (server/db.ts
// does the same). With DB_WALLET_PEM set, connects over mutual TLS using the
// Autonomous Database wallet's ewallet.pem (raw PEM or base64 of it), so no
// wallet files need to exist on disk (Vercel).
function dbConfig() {
  const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectString: process.env.DB_CONNECT_STRING,
  };
  const pem = (process.env.DB_WALLET_PEM || '').trim();
  if (pem) {
    config.walletContent = pem.startsWith('-----BEGIN') ? pem : Buffer.from(pem, 'base64').toString('utf8');
    config.walletPassword = process.env.DB_WALLET_PASSWORD;
  }
  return config;
}

module.exports = { dbConfig };
