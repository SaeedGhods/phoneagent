const axios = require('axios');

// Conversation context storage (in production, use a database)
const conversationContexts = new Map();

// Process speech input and generate AI response
const processSpeech = async (speechText) => {
  try {
    console.log('Processing speech:', speechText);

    // For now, return a simple response
    // This will be enhanced with x.ai integration
    const response = await generateAIResponse(speechText);

    return response;

  } catch (error) {
    console.error('Error processing speech:', error);
    return 'I\'m sorry, I\'m having trouble processing your request right now. Please try again.';
  }
};

// Generate AI response using x.ai API
const generateAIResponse = async (userInput) => {
  try {
    // x.ai API integration using their v1 API
    // Note: x.ai API structure may change, check their documentation for latest endpoints

    const response = await axios.post('https://api.x.ai/v1/chat/completions', {
      messages: [
        {
          role: 'system',
          content: 'You are Grok, a helpful and maximally truthful AI built by xAI. You are assisting a user over the phone, so keep your responses concise, natural, and conversational. Avoid using emojis or formatting that doesn\'t work well in voice conversations.'
        },
        {
          role: 'user',
          content: userInput
        }
      ],
      model: 'grok-beta',
      stream: false,
      temperature: 0.7,
      max_tokens: 150
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.XAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000 // 10 second timeout for voice conversations
    });

    if (response.data && response.data.choices && response.data.choices[0]) {
      return response.data.choices[0].message.content;
    } else {
      throw new Error('Unexpected API response structure');
    }

  } catch (error) {
    console.error('Error generating AI response:', error);

    // Fallback responses based on input
    if (userInput.toLowerCase().includes('hello') || userInput.toLowerCase().includes('hi')) {
      return 'Hello! How can I help you today?';
    } else if (userInput.toLowerCase().includes('bye') || userInput.toLowerCase().includes('goodbye')) {
      return 'Goodbye! Have a great day!';
    } else {
      return 'I understand you said: ' + userInput + '. How can I assist you further?';
    }
  }
};

// Store conversation context (for future enhancement)
const storeContext = (callSid, context) => {
  conversationContexts.set(callSid, context);
};

// Retrieve conversation context
const getContext = (callSid) => {
  return conversationContexts.get(callSid) || [];
};

module.exports = {
  processSpeech,
  generateAIResponse,
  storeContext,
  getContext
};
