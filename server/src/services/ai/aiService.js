// AI Service Boundary for Person 3/5 (AI/RAG Developer)
// The actual RAG implementation will be injected here.

// ----------------------------------------------------------------------
// AI SAFETY / TRUST REQUIREMENT:
// "No verified source -> no unsupported regulatory answer."
// Do not allow generic model knowledge to answer regulatory questions.
// If the vector search returns poor matches, trigger the fallback.
// ----------------------------------------------------------------------

const chatWithAI = async (message, industryId, userId) => {
  // TODO: Person 3/5 will implement:
  // 1. Embed user message.
  // 2. Vector search against Regulatory knowledge base (MongoDB Atlas).
  // 3. If similarity score is low, return fallback response.
  // 4. Otherwise, inject chunks into provider-agnostic LLM prompt.
  
  // Example Fallback:
  // if (!verifiedSourcesFound) {
  //   return {
  //     response: "No sufficiently verified source was found in the regulatory knowledge base. Please verify with the relevant authority.",
  //     citations: []
  //   }
  // }

  // Mock response for prototype UI testing
  return {
    response: "This is a placeholder response. The AI/RAG engine will be implemented here by the AI developer.",
    citations: [],
    toolsUsed: []
  };
};

module.exports = {
  chatWithAI
};
