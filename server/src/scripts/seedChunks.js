require('dotenv').config();
const mongoose = require('mongoose');
const sampleChunks = require('./Samplechunks');
const RegulationChunk = require('../models/RegulationChunk');
const { embedText } = require('../services/ai/aiService');

async function run() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB Atlas');

        for (const chunk of sampleChunks) {
            console.log(`Embedding: "${chunk.text.slice(0, 50)}..."`);
            const embedding = await embedText(chunk.text);

            await RegulationChunk.create({
                ...chunk,
                embedding
            });

            console.log('  -> Inserted with', embedding.length, 'dimensions');
        }

        console.log(`\nDone. Inserted ${sampleChunks.length} chunks into regulationchunks.`);
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await mongoose.connection.close();
    }
}

run();