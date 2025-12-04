require('dotenv').config();
const express = require('express');
const twilio = require('twilio');

const aiService = require('./lib/ai');
const ttsService = require('./lib/tts');
const conversationManager = require('./lib/conversation');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Initialize Twilio client
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ message: 'PhoneAgent is running!', status: 'healthy' });
});

// Twilio webhook for incoming calls
app.post('/voice', async (req, res) => {
  try {
    const callSid = req.body.CallSid;
    const from = req.body.From;

    console.log(`Incoming call from ${from}, Call SID: ${callSid}`);

    const twiml = new twilio.twiml.VoiceResponse();

    // Create conversation
    conversationManager.createConversation(callSid);

    // Greet the caller and start gathering input
    twiml.say({
      voice: 'alice',
      language: 'en-US'
    }, 'Hello! Welcome to PhoneAgent. How can I help you today?');

    // Gather speech input
    twiml.gather({
      input: 'speech',
      timeout: 5,
      action: '/process-speech',
      method: 'POST',
      speechTimeout: 'auto',
      speechModel: 'phone_call'
    });

    // If no input, try again
    twiml.say('I didn\'t hear anything. Let me try connecting you to an agent.');
    twiml.hangup();

    res.type('text/xml');
    res.send(twiml.toString());

  } catch (error) {
    console.error('Voice webhook error:', error);
    const twiml = new twilio.twiml.VoiceResponse();
    twiml.say('Sorry, we\'re experiencing technical difficulties. Please try again later.');
    twiml.hangup();
    res.type('text/xml');
    res.send(twiml.toString());
  }
});

// Process speech input
app.post('/process-speech', async (req, res) => {
  try {
    const speechResult = req.body.SpeechResult;
    const confidence = req.body.Confidence;
    const callSid = req.body.CallSid;

    console.log(`Speech result for call ${callSid}: "${speechResult}" (confidence: ${confidence})`);

    if (!speechResult || confidence < 0.5) {
      // Low confidence or no speech detected
      const twiml = new twilio.twiml.VoiceResponse();
      twiml.say('I\'m sorry, I didn\'t catch that. Could you please repeat what you said?');

      twiml.gather({
        input: 'speech',
        timeout: 5,
        action: '/process-speech',
        method: 'POST',
        speechTimeout: 'auto',
        speechModel: 'phone_call'
      });

      twiml.say('Goodbye.');
      twiml.hangup();

      res.type('text/xml');
      res.send(twiml.toString());
      return;
    }

    // Process the speech with AI
    const result = await conversationManager.processMessage(callSid, speechResult);

    const twiml = new twilio.twiml.VoiceResponse();

    // Generate TTS audio with custom voice
    try {
      const ttsResult = await ttsService.generateSpeech(result.text);
      if (!ttsResult.error && ttsResult.audioBuffer) {
        // Convert audio buffer to base64 data URL
        const audioBase64 = ttsResult.audioBuffer.toString('base64');
        const audioDataUrl = `data:audio/mpeg;base64,${audioBase64}`;

        // Play the custom voice audio
        twiml.play(audioDataUrl);
        console.log(`Playing custom voice audio for call ${callSid}`);
      } else {
        // Fallback to Twilio TTS if custom voice fails
        console.log(`Custom voice failed, using Twilio TTS for call ${callSid}`);
        twiml.say({
          voice: 'alice',
          language: 'en-US'
        }, result.text);
      }
    } catch (ttsError) {
      console.error('TTS error during call:', ttsError);
      // Fallback to Twilio TTS
      twiml.say({
        voice: 'alice',
        language: 'en-US'
      }, result.text);
    }

    // Continue the conversation
    twiml.gather({
      input: 'speech',
      timeout: 5,
      action: '/process-speech',
      method: 'POST',
      speechTimeout: 'auto',
      speechModel: 'phone_call'
    });

    // If no more input, end call
    twiml.say('Thank you for calling PhoneAgent. Goodbye!');
    twiml.hangup();

    res.type('text/xml');
    res.send(twiml.toString());

  } catch (error) {
    console.error('Speech processing error:', error);
    const twiml = new twilio.twiml.VoiceResponse();
    twiml.say('I apologize, but I\'m having technical difficulties. Please try calling back later.');
    twiml.hangup();
    res.type('text/xml');
    res.send(twiml.toString());
  }
});

// Legacy endpoint for recorded voice (fallback)
app.post('/process-voice', async (req, res) => {
  try {
    const recordingUrl = req.body.RecordingUrl;
    const callSid = req.body.CallSid;

    console.log(`Processing recorded voice for call ${callSid}`);

    const twiml = new twilio.twiml.VoiceResponse();
    twiml.say('Voice recording received. We\'ll process it and get back to you.');
    twiml.hangup();

    res.type('text/xml');
    res.send(twiml.toString());
  } catch (error) {
    console.error('Error processing voice:', error);
    res.status(500).send('Internal server error');
  }
});

// Handle transcription callback (legacy)
app.post('/transcription', async (req, res) => {
  try {
    const transcriptionText = req.body.TranscriptionText;
    const callSid = req.body.CallSid;

    console.log(`Received transcription for call ${callSid}: ${transcriptionText}`);

    if (transcriptionText) {
      const result = await conversationManager.processMessage(callSid, transcriptionText);
      console.log(`AI Response: ${result.text}`);
    }

    res.sendStatus(200);
  } catch (error) {
    console.error('Error handling transcription:', error);
    res.status(500).send('Internal server error');
  }
});

// Additional utility endpoints
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    conversations: conversationManager.conversations.size
  });
});

app.get('/conversations/:callSid', (req, res) => {
  const summary = conversationManager.getConversationSummary(req.params.callSid);
  if (summary) {
    res.json(summary);
  } else {
    res.status(404).json({ error: 'Conversation not found' });
  }
});

app.post('/test-ai', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const response = await aiService.processMessage(message);
    res.json({ input: message, response });
  } catch (error) {
    console.error('AI test error:', error);
    res.status(500).json({ error: 'AI service error' });
  }
});

app.post('/test-tts', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const result = await ttsService.generateSpeech(text);
    if (result.error) {
      res.status(500).json({ error: 'TTS service error', fallback: result.fallbackText });
    } else {
      res.set('Content-Type', result.contentType);
      res.send(result.audioBuffer);
    }
  } catch (error) {
    console.error('TTS test error:', error);
    res.status(500).json({ error: 'TTS service error' });
  }
});

app.get('/test-voice', async (req, res) => {
  try {
    const validation = await ttsService.validateVoice();
    res.json({
      currentVoiceId: ttsService.voiceId,
      validation: validation
    });
  } catch (error) {
    console.error('Voice validation error:', error);
    res.status(500).json({ error: 'Voice validation failed' });
  }
});

// Cleanup old conversations every hour
setInterval(() => {
  conversationManager.cleanupOldConversations();
}, 60 * 60 * 1000);

// Start server
app.listen(port, () => {
  console.log(`PhoneAgent server running on port ${port}`);
  console.log(`Twilio webhook URL: http://localhost:${port}/voice`);
});
