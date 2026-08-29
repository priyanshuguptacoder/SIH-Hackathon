require('dotenv').config();
const mongoose = require('mongoose');

// Define the schema
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    createdAt: { type: Date, default: Date.now }
});

// Create the model — this maps to the "users" collection automatically
const User = mongoose.model('User', userSchema);

async function run() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB Atlas');

        const testUser = new User({
            name: 'Test User',
            email: 'test@example.com'
        });

        await testUser.save();
        console.log('Test user saved:', testUser);

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await mongoose.connection.close();
    }
}

run();