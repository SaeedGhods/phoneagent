// Simple test script for PhoneAgent
const assert = require('assert');

// Mock environment variables for testing
process.env.XAI_API_KEY = 'test-key';
process.env.ELEVENLABS_API_KEY = 'test-key';
process.env.TWILIO_ACCOUNT_SID = 'test-sid';
process.env.TWILIO_AUTH_TOKEN = 'test-token';
process.env.TWILIO_PHONE_NUMBER = '+1234567890';

console.log('🧪 Running PhoneAgent tests...\n');

// Test 1: Import services
try {
  const aiService = require('./lib/ai');
  const ttsService = require('./lib/tts');
  const conversationManager = require('./lib/conversation');

  console.log('✅ Services imported successfully');

  // Test 2: Conversation manager
  const testCallSid = 'test-call-123';
  conversationManager.createConversation(testCallSid);
  const conversation = conversationManager.getConversation(testCallSid);

  assert(conversation, 'Conversation should be created');
  assert(conversation.callSid === testCallSid, 'Call SID should match');
  assert(conversation.status === 'active', 'Conversation should be active');

  console.log('✅ Conversation manager works');

  // Test 3: Conversation storage
  conversationManager.updateConversation(testCallSid, 'Hello', 'Hi there!');
  const updatedConversation = conversationManager.getConversation(testCallSid);

  assert(updatedConversation.messages.length === 1, 'Should have one message');
  assert(updatedConversation.messages[0].userMessage === 'Hello', 'User message should match');
  assert(updatedConversation.messages[0].aiResponse === 'Hi there!', 'AI response should match');

  console.log('✅ Conversation storage works');

} catch (error) {
  console.error('❌ Test failed:', error.message);
  process.exit(1);
}

console.log('\n🎉 All tests passed! PhoneAgent is ready to deploy.');
console.log('\nNext steps:');
console.log('1. Set up your environment variables in .env');
console.log('2. Configure Twilio webhook URL');
console.log('3. Deploy to Render');
console.log('4. Test with a real phone call!');
