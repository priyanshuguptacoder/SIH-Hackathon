

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const mongoose = require('mongoose');
const RegulationChunk = require('../models/RegulationChunk');

async function embedText(text) {
    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${process.env.GEMINI_API_KEY}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'models/gemini-embedding-001',
                content: { parts: [{ text }] },
                taskType: 'RETRIEVAL_QUERY',
                outputDimensionality: 3072
            })
        }
    );
    const data = await response.json();
    if (!data.embedding) throw new Error('Embedding failed: ' + JSON.stringify(data));
    return data.embedding.values;
}

async function run() {
    const query = process.argv[2] || 'what are the wastewater rules for textile factories';

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB Atlas');
        console.log(`\nQuery: "${query}"\n`);

        const queryEmbedding = await embedText(query);

        const results = await RegulationChunk.aggregate([
            {
                $vectorSearch: {
                    index: 'autoembed_index', // must match the index name in Atlas
                    path: 'embedding',
                    queryVector: queryEmbedding,
                    numCandidates: 50,
                    limit: 3
                }
            },
            {
                $project: {
                    text: 1,
                    state: 1,
                    sector: 1,
                    section: 1,
                    documentTitle: 1,
                    score: { $meta: 'vectorSearchScore' }
                }
            }
        ]);

        console.log(`Found ${results.length} matching chunks:\n`);
        results.forEach((r, i) => {
            console.log(`${i + 1}. [score: ${r.score.toFixed(4)}] ${r.documentTitle} — ${r.section}`);
            console.log(`   ${r.text.slice(0, 120)}...\n`);
        });
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await mongoose.connection.close();
    }
}

run();