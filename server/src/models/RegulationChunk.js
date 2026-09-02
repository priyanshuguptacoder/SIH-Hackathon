

const mongoose = require('mongoose');

const regulationChunkSchema = new mongoose.Schema(
  {
    text:          { type: String, required: true },   // the actual regulation text
    embedding:     { type: [Number], required: true }, // 3072-dim vector from Gemini
    state:         { type: String, required: true },
    sector:        { type: String, required: true },
    authority:     { type: String, required: true },
    section:       { type: String, required: true },
    page:          { type: Number },
    documentTitle: { type: String, required: true }
  },
  { timestamps: true }
);

// Third argument pins the actual collection name to "regulationchunks"
// (matches your team's no-underscore naming convention)
module.exports = mongoose.model('RegulationChunk', regulationChunkSchema, 'regulationchunks');