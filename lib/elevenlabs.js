const { ElevenLabsAPI } = require('@elevenlabs/elevenlabs-js');

// Initialize ElevenLabs client
let elevenlabs;
try {
  elevenlabs = new ElevenLabsAPI({
    apiKey: process.env.ELEVENLABS_API_KEY
  });
} catch (error) {
  console.warn('ElevenLabs API key not configured:', error.message);
}

// Text-to-Speech using ElevenLabs
const textToSpeech = async (text, voiceId = '21m00Tcm4TlvDq8ikWAM') => {
  try {
    if (!elevenlabs) {
      throw new Error('ElevenLabs client not initialized');
    }

    const response = await elevenlabs.generate({
      voice: voiceId,
      text: text,
      model_id: 'eleven_monolingual_v1',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.5
      }
    });

    // Return audio stream/buffer
    return response;

  } catch (error) {
    console.error('Error generating speech with ElevenLabs:', error);
    throw error;
  }
};

// Speech-to-Text using ElevenLabs (alternative to Twilio's built-in STT)
const speechToText = async (audioBuffer) => {
  try {
    if (!elevenlabs) {
      throw new Error('ElevenLabs client not initialized');
    }

    // Note: ElevenLabs STT API might have different endpoints
    // This is a placeholder for their speech-to-text functionality
    const response = await elevenlabs.speechToText.convert({
      file: audioBuffer,
      model_id: 'eleven_multilingual_stt_v2'
    });

    return response.text;

  } catch (error) {
    console.error('Error converting speech to text with ElevenLabs:', error);
    throw error;
  }
};

// Get available voices
const getVoices = async () => {
  try {
    if (!elevenlabs) {
      throw new Error('ElevenLabs client not initialized');
    }

    const voices = await elevenlabs.voices.getAll();
    return voices.voices || [];

  } catch (error) {
    console.error('Error fetching voices from ElevenLabs:', error);
    return [];
  }
};

// Generate speech and return as base64 for Twilio
const generateSpeechForTwilio = async (text, voiceId) => {
  try {
    const audioStream = await textToSpeech(text, voiceId);

    // Convert to base64 for Twilio
    const chunks = [];
    for await (const chunk of audioStream) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);
    return buffer.toString('base64');

  } catch (error) {
    console.error('Error generating speech for Twilio:', error);
    throw error;
  }
};

module.exports = {
  textToSpeech,
  speechToText,
  getVoices,
  generateSpeechForTwilio
};
