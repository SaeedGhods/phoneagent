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

### Option 1: Using Render Dashboard (Recommended)

1. **Connect your GitHub repository:**
   - Go to [Render](https://render.com)
   - Click "New" → "Web Service"
   - Connect your GitHub account and select the `phoneagent` repository

2. **Configure the service:**
   - **Name:** phoneagent (or your preferred name)
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`

3. **Set environment variables:**
   In the Render dashboard, add these environment variables:
   ```
   TWILIO_ACCOUNT_SID=your_twilio_account_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   TWILIO_PHONE_NUMBER=your_twilio_phone_number
   XAI_API_KEY=your_xai_api_key
   ELEVENLABS_API_KEY=your_elevenlabs_api_key (optional)
   USE_ELEVENLABS_TTS=false (set to true to use ElevenLabs TTS)
   NODE_ENV=production
   ```

4. **Deploy:**
   - Click "Create Web Service"
   - Render will build and deploy your application

5. **Configure Twilio webhooks:**
   After deployment, note your service URL (e.g., `https://phoneagent.onrender.com`)
   In your Twilio Console → Phone Numbers → Your number:
   - **Voice URL:** `https://your-app-name.onrender.com/voice`
   - **Fallback URL:** `https://your-app-name.onrender.com/voice`

### Option 2: Using render.yaml (Blueprint)

If you prefer using Render's blueprint deployment:

1. Ensure `render.yaml` is in your repository root
2. Follow the same steps above, but Render will automatically configure based on the blueprint
3. Manually set the secret environment variables (API keys) in the dashboard

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
