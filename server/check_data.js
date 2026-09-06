require('dotenv').config();
const mongoose = require('mongoose');

async function check() {
  const uri = process.env.MONGODB_URI;
  if (!uri) return;
  try {
    await mongoose.connect(uri);
    const db = mongoose.connection.db;
    
    const states = await db.collection('industries').aggregate([
      { $group: { _id: "$state", count: { $sum: 1 } } }
    ]).toArray();
    
    console.log("Industries by State:");
    states.forEach(s => console.log(`- ${s._id}: ${s.count}`));
    
  } catch (err) {
    console.error(err.message);
  } finally {
    mongoose.disconnect();
  }
}
check();
