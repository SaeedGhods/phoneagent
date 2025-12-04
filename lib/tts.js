const axios = require('axios');

class TTSService {
  constructor() {
    this.apiKey = process.env.ELEVENLABS_API_KEY;
    this.baseUrl = 'https://api.elevenlabs.io/v1';
    // Use custom voice ID from environment, fallback to Rachel
    this.voiceId = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM';
    console.log(`ElevenLabs TTS initialized with voice ID: ${this.voiceId}`);
  }

  async generateSpeech(text, voiceSettings = {}) {
    try {
      const defaultSettings = {
        stability: 0.5,
        similarity_boost: 0.5,
        style: 0.0,
        use_speaker_boost: true
      };

      const settings = { ...defaultSettings, ...voiceSettings };

      const response = await axios.post(
        `${this.baseUrl}/text-to-speech/${this.voiceId}`,
        {
          text: text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: settings
        },
        {
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': this.apiKey
          },
          responseType: 'arraybuffer',
          timeout: 30000 // 30 second timeout
        }
      );

      return {
        audioBuffer: response.data,
        contentType: response.headers['content-type'],
        length: response.data.length
      };
    } catch (error) {
      console.error('ElevenLabs TTS Error:', error.response?.data || error.message);

      // Return a fallback text response if TTS fails
      return {
        error: true,
        fallbackText: text,
        message: 'TTS service unavailable'
      };
    }
  }

  async getVoices() {
    try {
      const response = await axios.get(`${this.baseUrl}/voices`, {
        headers: {
          'xi-api-key': this.apiKey
        }
      });

      return response.data.voices;
    } catch (error) {
      console.error('Error fetching voices:', error);
      return [];
    }
  }

  setVoice(voiceId) {
    this.voiceId = voiceId;
  }
}

module.exports = new TTSService();
