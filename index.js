require('dotenv').config();
const express = require('express');
const twilio = require('twilio');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Import our custom modules
const twilioHandler = require('./lib/twilio');
const conversationEngine = require('./lib/conversation');

// Initialize Twilio client
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Phone Agent is running!', status: 'active' });
});

// Twilio webhook endpoints
app.post('/voice', twilioHandler.handleIncomingCall);
app.post('/gather', twilioHandler.handleGatherResponse);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`Phone Agent listening on port ${port}`);
});

module.exports = app;
