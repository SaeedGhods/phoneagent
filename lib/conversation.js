const aiService = require('./ai');
const ttsService = require('./tts');

class ConversationManager {
  constructor() {
    this.conversations = new Map(); // callSid -> conversation data
  }

  createConversation(callSid) {
    const conversation = {
      callSid,
      messages: [],
      startTime: new Date(),
      lastActivity: new Date(),
      status: 'active'
    };

    this.conversations.set(callSid, conversation);
    return conversation;
  }

  getConversation(callSid) {
    return this.conversations.get(callSid);
  }

  updateConversation(callSid, message, response) {
    const conversation = this.conversations.get(callSid);
    if (conversation) {
      conversation.messages.push({
        userMessage: message,
        aiResponse: response,
        timestamp: new Date()
      });
      conversation.lastActivity = new Date();
    }
  }

  endConversation(callSid) {
    const conversation = this.conversations.get(callSid);
    if (conversation) {
      conversation.status = 'ended';
      conversation.endTime = new Date();
    }
  }

  async processMessage(callSid, message) {
    try {
      // Get or create conversation
      let conversation = this.getConversation(callSid);
      if (!conversation) {
        conversation = this.createConversation(callSid);
      }

      // Get conversation history for context
      const context = conversation.messages.slice(-4).map(msg => ({
        role: 'user',
        content: msg.userMessage
      })).concat(
        conversation.messages.slice(-4).map(msg => ({
          role: 'assistant',
          content: msg.aiResponse
        }))
      );

      // Process with AI
      const aiResponse = await aiService.processMessage(message, context);

      // Store in conversation
      this.updateConversation(callSid, message, aiResponse);

      // Generate TTS
      const ttsResult = await ttsService.generateSpeech(aiResponse);

      return {
        text: aiResponse,
        tts: ttsResult,
        conversationId: callSid
      };

    } catch (error) {
      console.error('Conversation processing error:', error);

      const fallbackResponse = 'I apologize, but I\'m experiencing technical difficulties. Please try again later.';

      return {
        text: fallbackResponse,
        tts: { error: true, fallbackText: fallbackResponse },
        conversationId: callSid,
        error: true
      };
    }
  }

  getConversationSummary(callSid) {
    const conversation = this.getConversation(callSid);
    if (!conversation) return null;

    return {
      callSid,
      messageCount: conversation.messages.length,
      duration: conversation.endTime ?
        conversation.endTime - conversation.startTime :
        Date.now() - conversation.startTime,
      status: conversation.status,
      lastMessage: conversation.messages[conversation.messages.length - 1]
    };
  }

  cleanupOldConversations(maxAgeHours = 24) {
    const cutoffTime = new Date(Date.now() - (maxAgeHours * 60 * 60 * 1000));

    for (const [callSid, conversation] of this.conversations) {
      if (conversation.lastActivity < cutoffTime) {
        this.conversations.delete(callSid);
      }
    }
  }
}

module.exports = new ConversationManager();
