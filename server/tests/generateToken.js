/**
 * generateToken.js
 * Standalone script to mint a valid JWT for manual testing.
 *
 * Usage:
 *   node generateToken.js                          # defaults: userId=000000000000000000000001, role=Industry
 *   node generateToken.js 6650a1b2c3d4e5f607890123  # custom userId, default role
 *   node generateToken.js 6650a1b2c3d4e5f607890123 Admin  # custom userId and role
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const jwt = require('jsonwebtoken');

const userId = process.argv[2] || '000000000000000000000001';
const role   = process.argv[3] || 'Industry';

if (!process.env.JWT_SECRET) {
  console.error('❌ JWT_SECRET is not set in .env');
  process.exit(1);
}

const token = jwt.sign(
  { sub: userId, role },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

console.log('\n📦 Payload:', JSON.stringify(jwt.decode(token), null, 2));
console.log('\n🔑 Token:\n');
console.log(token);
console.log('\n📋 Example curl:\n');
console.log(`curl -H "Authorization: Bearer ${token}" http://localhost:5050/api/some-endpoint\n`);
