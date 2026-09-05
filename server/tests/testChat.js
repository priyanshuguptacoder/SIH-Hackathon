
require('dotenv').config();
const mongoose = require('mongoose');
const { chatWithAI } = require('../src/services/ai/aiService');

async function run() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB Atlas');

    const result = await chatWithAI(
        'what are the wastewater rules for textile factories',
        null,
        null
    );

    console.log('\nResponse:', result.response);
    console.log('\nCitations:', JSON.stringify(result.citations, null, 2));
    console.log('\nTools used:', result.toolsUsed);

    await mongoose.connection.close();
}

run();