require('dotenv').config();
const mongoose = require('mongoose');

async function check() {
  const uri = process.env.MONGODB_URI;
  if (!uri) { return; }
  try {
    await mongoose.connect(uri);
    const db = mongoose.connection.db;
    const collection = db.collection('regulationchunks');
    const dummyEmbedding = new Array(3072).fill(0.1);
    
    const results = await collection.aggregate([
      {
        $vectorSearch: {
          index: 'autoembed_index',
          path: 'embedding',
          queryVector: dummyEmbedding,
          numCandidates: 10,
          limit: 1,
          filter: { sector: 'Textile Processing' }
        }
      }
    ]).toArray();
    console.log("Sector Vector search succeeded. Found:", results.length);
  } catch (err) {
    console.error("Sector Vector search failed:", err.message);
  } finally {
    mongoose.disconnect();
  }
}
check();
