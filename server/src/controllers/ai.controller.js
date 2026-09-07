const aiService = require("../services/ai/ai.service");

const chat = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    const response = await aiService.chat({
      message: message.trim(),
      user: req.user,
    });

    return res.status(200).json({
      success: true,
      message: response,
    });
  } catch (error) {
    console.error("AI chat error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to process AI request",
    });
  }
};

module.exports = {
  chat,
};