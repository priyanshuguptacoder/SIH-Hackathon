
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

const RegulationChunk = require('../../models/RegulationChunk');

// ----------------------------------------------------------------------
// AI SAFETY / TRUST REQUIREMENT:
// "No verified source -> no unsupported regulatory answer."
// Do not allow generic model knowledge to answer regulatory questions.
// If the vector search returns poor matches, trigger the fallback.
// ----------------------------------------------------------------------

const SIMILARITY_THRESHOLD = 0.7; // tune this after testing with real questions

// Step 1: embed the user's message
async function embedQuery(text) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'models/text-embedding-004',
        content: { parts: [{ text }] }
      })
    }
  );
  const data = await response.json();
  if (!data.embedding) throw new Error('Embedding failed: ' + JSON.stringify(data));
  return data.embedding.values;
}

// Step 2: vector search against the knowledge base
async function searchChunks(embedding, filters = {}) {
  const filterStage = {};
  if (filters.state) filterStage.state = filters.state;
  if (filters.sector) filterStage.sector = filters.sector;

  return RegulationChunk.aggregate([
    {
      $vectorSearch: {
        index: 'vector_index',
        path: 'embedding',
        queryVector: embedding,
        numCandidates: 50,
        limit: 3,
        ...(Object.keys(filterStage).length ? { filter: filterStage } : {})
      }
    },
    {
      $project: {
        text: 1,
        state: 1,
        sector: 1,
        section: 1,
        page: 1,
        documentTitle: 1,
        score: { $meta: 'vectorSearchScore' }
      }
    }
  ]);
}

// Step 4: generate a grounded answer using only the retrieved chunks
async function generateAnswer(message, chunks) {
  const context = chunks
    .map((c, i) => `[${i + 1}] (${c.documentTitle}, ${c.section}): ${c.text}`)
    .join('\n\n');

  const prompt = `You are a regulatory compliance assistant. Answer the user's question using ONLY the text provided below. Do not use any outside knowledge. If the provided text does not fully answer the question, say so explicitly. Cite which numbered source you used.

REGULATORY TEXT:
${context}

QUESTION: ${message}`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    }
  );

  const data = await response.json();
  const answerText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!answerText) {
    throw new Error('Generation failed: ' + JSON.stringify(data));
  }
  return answerText;
}

const chatWithAI = async (message, industryId, userId) => {
  // 1. Embed the user's message
  const queryEmbedding = await embedQuery(message);

  // 2. Vector search against the regulatory knowledge base
  // TODO: once industryId links to a real Industry profile, pull state/sector
  // from it here and pass as filters, e.g. { state: profile.state, sector: profile.sector }
  const matches = await searchChunks(queryEmbedding);

  // 3. Fallback if nothing sufficiently relevant was found
  const topScore = matches[0]?.score ?? 0;
  if (matches.length === 0 || topScore < SIMILARITY_THRESHOLD) {
    return {
      response:
        "No sufficiently verified source was found in the regulatory knowledge base. Please verify with the relevant authority.",
      citations: [],
      toolsUsed: ['vectorSearch']
    };
  }

  // 4. Generate a grounded response using only the retrieved chunks
  const answer = await generateAnswer(message, matches);

  return {
    response: answer,
    citations: matches.map((c) => ({
      documentTitle: c.documentTitle,
      section: c.section,
      page: c.page,
      score: c.score
    })),
    toolsUsed: ['vectorSearch', 'generation']
  };
};

module.exports = {
  chatWithAI,
  embedQuery,
  searchChunks,
  generateAnswer
};