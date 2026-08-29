/**
 * validateEnv.js
 * Called at startup. Fails loudly if required environment variables are missing.
 * This prevents the server from running with a missing JWT_SECRET or MONGODB_URI
 * which would be a critical security/availability failure.
 */

const REQUIRED_ENV = ['MONGODB_URI', 'JWT_SECRET'];

const validateEnv = () => {
  const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.error(`\n❌ FATAL: Missing required environment variables:\n   ${missing.join('\n   ')}`);
    console.error('\n   Copy server/.env.example to server/.env and fill in the values.\n');
    process.exit(1);
  }
};

module.exports = validateEnv;
