# PhoneAgent - AI Telephone Assistant

A sophisticated telephone agent powered by X.AI, Twilio, and ElevenLabs that provides intelligent voice conversations.

## Features

- **AI-Powered Conversations**: Uses X.AI's Grok model for natural language understanding
- **Voice Integration**: Twilio handles phone calls and voice processing
- **Text-to-Speech**: ElevenLabs provides high-quality voice synthesis
- **Real-time Processing**: Instant responses during phone conversations
- **Scalable Deployment**: Hosted on Render with automatic deployments

## Prerequisites

Before you begin, ensure you have:

1. **Twilio Account**: [Sign up at twilio.com](https://www.twilio.com/)
2. **X.AI API Key**: [Get your API key from x.ai](https://x.ai/)
3. **ElevenLabs Account**: [Sign up at elevenlabs.io](https://elevenlabs.io/)
4. **GitHub Account**: For version control and deployment
5. **Render Account**: [Sign up at render.com](https://render.com/)

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/SaeedGhods/phoneagent.git
cd phoneagent
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Copy the example environment file and fill in your credentials:

```bash
cp env.example .env
```

Edit `.env` with your actual API keys and configuration:

```env
# Twilio Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# X.AI Configuration
XAI_API_KEY=your_xai_api_key

# ElevenLabs Configuration
ELEVENLABS_API_KEY=your_elevenlabs_api_key
ELEVENLABS_VOICE_ID=your_custom_voice_id

# Server Configuration
PORT=3000
```

### 4. Run Locally

```bash
npm start
```

The server will start on `http://localhost:3000`.

### 5. Deploy to Render

1. Push your code to GitHub
2. Connect your GitHub repository to Render
3. Set environment variables in Render dashboard
4. Deploy!

## Configuration

### Twilio Setup

1. **Buy a Phone Number**: In your Twilio dashboard, purchase a phone number
2. **Configure Webhook**: Set the voice webhook URL to `https://your-render-app.onrender.com/voice`
3. **Update Environment**: Add your Twilio credentials to `.env`

### X.AI Setup

1. **Get API Key**: Visit [x.ai](https://x.ai/) and generate an API key
2. **Add to Environment**: Set `XAI_API_KEY` in your environment variables

### ElevenLabs Setup

1. **Sign Up**: Create an account at [elevenlabs.io](https://elevenlabs.io/)
2. **Generate API Key**: Get your API key from the dashboard
3. **Choose/Create Voice**: Select a voice or create a custom one
4. **Get Voice ID**: Copy the voice ID from your voice settings
5. **Add to Environment**:
   ```env
   ELEVENLABS_API_KEY=your_elevenlabs_api_key
   ELEVENLABS_VOICE_ID=your_custom_voice_id
   ```

   **Finding Your Voice ID:**
   - Go to your ElevenLabs dashboard
   - Select your voice
   - The Voice ID is in the URL or voice settings (e.g., `vNMrLUsuine0PKbqufIe`)
   - If not set, the system will use Rachel as default

### Render Deployment

1. **Connect Repository**: Link your GitHub repository to Render
2. **Environment Variables**: Add all environment variables from `.env`
3. **Build Settings**:
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
4. **Deploy**: Trigger deployment from the Render dashboard

## API Endpoints

- `GET /` - Health check endpoint
- `POST /voice` - Twilio voice webhook for incoming calls
- `POST /process-voice` - Processes recorded voice messages
- `POST /transcription` - Handles transcription callbacks from Twilio

## How It Works

1. **Incoming Call**: Twilio receives a call and sends a webhook to `/voice`
2. **Voice Recording**: The system prompts the caller and records their response
3. **Transcription**: Twilio transcribes the audio to text
4. **AI Processing**: The transcription is sent to X.AI for intelligent processing
5. **TTS Response**: ElevenLabs converts the AI response back to speech
6. **Call Response**: The synthesized voice responds to the caller

## Development

### Running Tests

```bash
npm test
```

### Testing Individual Services

Test the AI service:
```bash
curl -X POST http://localhost:3000/test-ai \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, how are you?"}'
```

Test the TTS service:
```bash
curl -X POST http://localhost:3000/test-tts \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello, this is a test"}' \
  --output test.mp3
```

### Project Structure

```
phoneagent/
├── index.js          # Main application server
├── test.js           # Test suite
├── package.json      # Dependencies and scripts
├── env.example       # Environment variables template
├── render.yaml       # Render deployment configuration
├── .gitignore        # Git ignore rules
├── README.md         # This documentation
├── .github/
│   └── workflows/
│       └── deploy.yml # GitHub Actions CI/CD
└── lib/
    ├── ai.js         # X.AI integration service
    ├── tts.js        # ElevenLabs TTS service
    └── conversation.js # Conversation state management
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

ISC License - see package.json for details

## Monitoring & Troubleshooting

### Health Check

Check if the service is running:
```bash
curl https://your-app.onrender.com/health
```

### Conversation Monitoring

View conversation details:
```bash
curl https://your-app.onrender.com/conversations/CALL_SID_HERE
```

### Common Issues

1. **Twilio Webhook Errors**: Ensure your webhook URL is correctly set in Twilio dashboard
2. **X.AI API Errors**: Check your API key and account limits
3. **ElevenLabs TTS Errors**: Verify your API key and account status
4. **Port Issues**: Render assigns ports dynamically; don't hardcode port 3000

### Logs

- **Render Logs**: Check the Render dashboard for application logs
- **Twilio Logs**: Monitor call logs in your Twilio dashboard
- **Local Development**: Run `npm start` and check console output

## Architecture

PhoneAgent follows a modular architecture:

- **Express Server**: Handles HTTP requests and Twilio webhooks
- **AI Service**: Manages X.AI API interactions and conversation intelligence
- **TTS Service**: Handles ElevenLabs text-to-speech conversion
- **Conversation Manager**: Maintains conversation state and history

## Security Considerations

- Never commit API keys to version control
- Use HTTPS for all webhook endpoints
- Validate incoming webhook requests (Twilio signature validation)
- Implement rate limiting for API endpoints
- Regularly rotate API keys

## Future Enhancements

- Add sentiment analysis for better responses
- Implement call recording and transcription storage
- Add support for multiple languages
- Create a dashboard for conversation analytics
- Implement voice activity detection
- Add support for call transfers and conferencing

## Support

For issues and questions:
- Create an issue on GitHub
- Check the documentation
- Review Twilio, X.AI, and ElevenLabs documentation
