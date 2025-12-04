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
      console.error('ElevenLabs TTS Error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        voiceId: this.voiceId
      });

      // If custom voice fails, try fallback to default voice
      if (this.voiceId !== '21m00Tcm4TlvDq8ikWAM') {
        console.log('Custom voice failed, trying default voice...');
        try {
          const fallbackResponse = await axios.post(
            `${this.baseUrl}/text-to-speech/21m00Tcm4TlvDq8ikWAM`,
            {
              text: text,
              model_id: 'eleven_monolingual_v1',
              voice_settings: {
                stability: 0.5,
                similarity_boost: 0.5,
                style: 0.0,
                use_speaker_boost: true
              }
            },
            {
              headers: {
                'Accept': 'audio/mpeg',
                'Content-Type': 'application/json',
                'xi-api-key': this.apiKey
              },
              responseType: 'arraybuffer',
              timeout: 30000
            }
          );

          console.log('Fallback to default voice successful');
          return {
            audioBuffer: fallbackResponse.data,
            contentType: fallbackResponse.headers['content-type'],
            length: fallbackResponse.data.length
          };
        } catch (fallbackError) {
          console.error('Fallback voice also failed:', fallbackError.message);
        }
      }

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

  async validateVoice(voiceId = null) {
    const testId = voiceId || this.voiceId;
    try {
      // Try to get voice info or make a small TTS request
      const response = await axios.get(`${this.baseUrl}/voices`, {
        headers: {
          'xi-api-key': this.apiKey
        }
      });

      const voices = response.data.voices || [];
      const voice = voices.find(v => v.voice_id === testId);

      if (voice) {
        console.log(`Voice ${testId} found: ${voice.name} (${voice.category})`);
        return { valid: true, voice: voice };
      } else {
        console.log(`Voice ${testId} not found in available voices`);
        return { valid: false, availableVoices: voices.map(v => ({ id: v.voice_id, name: v.name })) };
      }
    } catch (error) {
      console.error('Error validating voice:', error.message);
      return { valid: false, error: error.message };
    }
  }
}

module.exports = new TTSService();
