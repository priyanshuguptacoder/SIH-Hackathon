const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const mongoose = require('mongoose');
const RegulationChunk = require('../models/RegulationChunk');
const { embedQuery } = require('../services/ai/aiService');

async function run() {
    const query = process.argv[2] || 'what are the wastewater rules for textile factories';

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB Atlas');
        console.log(`\nQuery: "${query}"\n`);

        const queryEmbedding = await embedQuery(query);

        const results = await RegulationChunk.aggregate([
            {
                $vectorSearch: {
                    index: 'autoembed_index', // must match the index name in Atlas
                    path: 'embedding',
                    queryVector: queryEmbedding,
                    numCandidates: 50,
                    limit: 5
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