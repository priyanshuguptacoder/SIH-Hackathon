require('dotenv').config();
const mongoose = require('mongoose');
async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    const approvals = await db.collection('approvals').countDocuments();
    const rules = await db.collection('regulatoryrules').countDocuments();
    const schemes = await db.collection('schemes').countDocuments();
    const aiChunks = await db.collection('regulationchunks').countDocuments();
    console.log(`Approvals: ${approvals}`);
    console.log(`Rules: ${rules}`);
    console.log(`Schemes: ${schemes}`);
    console.log(`AI Chunks: ${aiChunks}`);
  } finally {
    mongoose.disconnect();
  }
}
check();
