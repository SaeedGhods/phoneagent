# Phone Agent 🤖📞

An AI-powered telephone agent built with multiple services for intelligent voice conversations.

## Features

- **Twilio Integration**: Handles incoming and outgoing phone calls
- **x.ai AI**: Powers intelligent conversation capabilities
- **ElevenLabs**: High-quality text-to-speech and speech-to-text
- **Express Server**: RESTful API endpoints for webhooks
- **Cloud Deployment**: Ready for deployment on Render

## Prerequisites

- Node.js (v16 or higher)
- Accounts with the following services:
  - [Twilio](https://www.twilio.com/)
  - [x.ai](https://x.ai/)
  - [ElevenLabs](https://elevenlabs.io/)
  - [Render](https://render.com/) (for deployment)

## Setup

1. **Clone and install dependencies:**
   ```bash
   git clone https://github.com/yourusername/phoneagent.git
   cd phoneagent
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp env.example .env
   ```

   Fill in your API keys and configuration in `.env`:
   - `TWILIO_ACCOUNT_SID`: Your Twilio Account SID
   - `TWILIO_AUTH_TOKEN`: Your Twilio Auth Token
   - `TWILIO_PHONE_NUMBER`: Your Twilio phone number
   - `XAI_API_KEY`: Your x.ai API key
   - `ELEVENLABS_API_KEY`: Your ElevenLabs API key

3. **Run the application:**
   ```bash
   npm start
   ```

## API Endpoints

- `GET /` - Health check and status
- `GET /health` - Detailed health check
- `POST /voice` - Twilio webhook for incoming calls
- `POST /gather` - Twilio webhook for speech responses

## Deployment to Render

1. Push your code to GitHub
2. Connect your GitHub repo to Render
3. Set environment variables in Render dashboard
4. Configure webhook URLs in Twilio:
   - Voice URL: `https://your-app-name.onrender.com/voice`
   - Fallback URL: `https://your-app-name.onrender.com/voice`

## Architecture

```
Incoming Call
    ↓
Twilio Webhook (/voice)
    ↓
Speech Recognition (Twilio/ElevenLabs)
    ↓
AI Processing (x.ai)
    ↓
Text-to-Speech (ElevenLabs/Twilio)
    ↓
Voice Response
```

## Development

- `npm start` - Start the production server
- `npm test` - Run tests (when implemented)
- `npm run dev` - Development mode with auto-restart (when configured)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

ISC
