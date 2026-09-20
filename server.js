require('dotenv').config();
const app = require('./app');
const { initPool, closePool } = require('./config/db');

const PORT = process.env.PORT || 3000;

async function start() {
  await initPool();
  const server = app.listen(PORT, () => {
    console.log(`PRO API listening on http://localhost:${PORT}`);
  });

  const shutdown = async () => {
    console.log('Shutting down...');
    server.close();
    await closePool();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
