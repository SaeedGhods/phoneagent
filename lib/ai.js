const axios = require('axios');

class AIService {
  constructor() {
    this.apiKey = process.env.XAI_API_KEY;
    this.baseUrl = 'https://api.x.ai/v1';
  }

  async processMessage(message, context = []) {
    try {
      const messages = [
        {
          role: 'system',
          content: `You are PhoneAgent, a helpful telephone assistant. You provide:
          - Clear, concise responses suitable for voice conversations
          - Professional and friendly tone
          - Keep responses under 100 words when possible
          - Ask clarifying questions when needed
          - Be empathetic and understanding`
        },
        ...context,
        {
          role: 'user',
          content: message
        }
      ];

      const response = await axios.post(`${this.baseUrl}/chat/completions`, {
        model: 'grok-3',
        messages: messages,
        max_tokens: 200,
        temperature: 0.7
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data.choices[0].message.content.trim();
    } catch (error) {
      console.error('X.AI API Error:', error.response?.data || error.message);

      // Fallback responses based on error type
      if (error.response?.status === 401) {
        return 'I apologize, but there seems to be an authentication issue. Please contact support.';
      } else if (error.response?.status === 429) {
        return 'I\'m currently experiencing high demand. Please try again in a moment.';
      } else {
        return 'I apologize, but I\'m having trouble processing your request right now. Could you please try again?';
      }
    }
  }

  async analyzeSentiment(message) {
    try {
      const response = await axios.post(`${this.baseUrl}/chat/completions`, {
        model: 'grok-3',
        messages: [
          {
            role: 'system',
            content: 'Analyze the sentiment of the following message and respond with only: positive, negative, or neutral.'
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 10,
        temperature: 0.3
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      const sentiment = response.data.choices[0].message.content.toLowerCase().trim();
      return sentiment.includes('positive') ? 'positive' :
             sentiment.includes('negative') ? 'negative' : 'neutral';
    } catch (error) {
      console.error('Sentiment analysis error:', error);
      return 'neutral'; // Default fallback
    }
  }
}

module.exports = new AIService();
