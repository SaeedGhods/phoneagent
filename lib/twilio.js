const twilio = require('twilio');
const VoiceResponse = twilio.twiml.VoiceResponse;
const conversationEngine = require('./conversation');
const elevenlabs = require('./elevenlabs');

// Handle incoming calls
const handleIncomingCall = async (req, res) => {
  const twiml = new VoiceResponse();

  try {
    console.log('Incoming call from:', req.body.From);

    // Welcome message and initial instructions
    const welcomeMessage = 'Hello! Welcome to the AI Phone Agent. How can I help you today?';

    if (process.env.ELEVENLABS_API_KEY && process.env.USE_ELEVENLABS_TTS === 'true') {
      try {
        const audioBase64 = await elevenlabs.generateSpeechForTwilio(welcomeMessage);
        twiml.play(`data:audio/mpeg;base64,${audioBase64}`);
      } catch (error) {
        console.error('ElevenLabs TTS failed for welcome message, falling back to Twilio:', error);
        twiml.say({
          voice: 'alice',
          language: 'en-US'
        }, welcomeMessage);
      }
    } else {
      twiml.say({
        voice: 'alice',
        language: 'en-US'
      }, welcomeMessage);
    }

    // Gather speech input
    twiml.gather({
      input: 'speech',
      action: '/gather',
      method: 'POST',
      timeout: 5,
      speechTimeout: 'auto',
      language: 'en-US'
    });

    res.type('text/xml');
    res.send(twiml.toString());

  } catch (error) {
    console.error('Error handling incoming call:', error);
    twiml.say('Sorry, there was an error. Please try again later.');
    res.type('text/xml');
    res.send(twiml.toString());
  }
};

// Handle gather responses (speech input)
const handleGatherResponse = async (req, res) => {
  const twiml = new VoiceResponse();

  try {
    const speechResult = req.body.SpeechResult;
    const confidence = req.body.Confidence;

    console.log('Speech received:', speechResult, 'Confidence:', confidence);

    if (speechResult && confidence > 0.5) {
      // Process the speech through our conversation engine
      const response = await conversationEngine.processSpeech(speechResult);

      // Use ElevenLabs for TTS if configured, otherwise use Twilio's built-in TTS
      if (process.env.ELEVENLABS_API_KEY && process.env.USE_ELEVENLABS_TTS === 'true') {
        try {
          const audioBase64 = await elevenlabs.generateSpeechForTwilio(response);
          twiml.play(`data:audio/mpeg;base64,${audioBase64}`);
        } catch (error) {
          console.error('ElevenLabs TTS failed, falling back to Twilio:', error);
          twiml.say({
            voice: 'alice',
            language: 'en-US'
          }, response);
        }
      } else {
        // Use Twilio's built-in TTS
        twiml.say({
          voice: 'alice',
          language: 'en-US'
        }, response);
      }

      // Continue gathering for more input
      twiml.gather({
        input: 'speech',
        action: '/gather',
        method: 'POST',
        timeout: 5,
        speechTimeout: 'auto',
        language: 'en-US'
      });
    } else {
      // Low confidence or no speech detected
      twiml.say('I\'m sorry, I didn\'t catch that. Could you please repeat?');
      twiml.gather({
        input: 'speech',
        action: '/gather',
        method: 'POST',
        timeout: 5,
        speechTimeout: 'auto',
        language: 'en-US'
      });
    }

    res.type('text/xml');
    res.send(twiml.toString());

  } catch (error) {
    console.error('Error handling gather response:', error);
    twiml.say('Sorry, there was an error processing your request.');
    twiml.hangup();
    res.type('text/xml');
    res.send(twiml.toString());
  }
};

module.exports = {
  handleIncomingCall,
  handleGatherResponse
};
