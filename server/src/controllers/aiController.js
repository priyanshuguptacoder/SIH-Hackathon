const { chatWithAI } = require('../services/ai/aiService');

// @route   POST /ai/chat
// @desc    Interact with AI Assistant
// @access  Protected
const chat = async (req, res) => {
  try {
    const { message, industryId } = req.body;
    
    if (!message) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Message is required' } });
    }

    const aiResponse = await chatWithAI(message, industryId, req.user.id);

    return res.json({
      success: true,
      data: aiResponse,
    });
  } catch (error) {
    console.error('AI Chat Error:', error);
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Server error processing AI request' } });
  }
};

module.exports = {
  chat
};
