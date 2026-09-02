require('dotenv').config();
const mongoose = require('mongoose');
const sampleChunks = require('./Samplechunks');
const RegulationChunk = require('../models/RegulationChunk');


// --- Embedding call ---
async function embedText(text) {
    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${process.env.GEMINI_API_KEY}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'models/gemini-embedding-001',
                content: { parts: [{ text }] },
                taskType: 'RETRIEVAL_DOCUMENT',   // this text is being stored for retrieval
                outputDimensionality: 3072
            })
        }
    );

    const data = await response.json();

    if (!data.embedding) {
        throw new Error('Embedding failed: ' + JSON.stringify(data));
    }

    return data.embedding.values; // array of 3072 numbers
}

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