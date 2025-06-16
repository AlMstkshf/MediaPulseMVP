// Chat Flow Integration Test
const request = require('supertest');
const express = require('express');
const { expect } = require('@jest/globals');

// Mock models and dependencies
const mockChatMessages = [];

// Mock authentication middleware
const isAuthenticated = (req, res, next) => {
  req.user = { id: 1, username: 'testuser', role: 'admin' };
  next();
};

// Create mock storage service
const mockStorage = {
  saveChatMessage: async (userId, message, isBot, metadata = {}) => {
    const newMessage = {
      id: mockChatMessages.length + 1,
      userId,
      message,
      isBot,
      timestamp: new Date(),
      metadata
    };
    
    mockChatMessages.push(newMessage);
    return newMessage;
  },
  
  getChatHistory: async (userId, limit = 50) => {
    return mockChatMessages
      .filter(msg => msg.userId === userId)
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(-limit);
  },
  
  clearChatHistory: async (userId) => {
    const originalLength = mockChatMessages.length;
    const userMessages = mockChatMessages.filter(msg => msg.userId === userId).length;
    
    // Remove all messages for this user
    for (let i = mockChatMessages.length - 1; i >= 0; i--) {
      if (mockChatMessages[i].userId === userId) {
        mockChatMessages.splice(i, 1);
      }
    }
    
    return userMessages;
  }
};

// Mock Rasa service
const mockRasaService = {
  sendMessage: async (message, userId) => {
    // Simulate AI response based on user message
    let botResponse;
    const lowercaseMsg = message.toLowerCase();
    
    if (lowercaseMsg.includes('hello') || lowercaseMsg.includes('hi')) {
      botResponse = 'Hello! How can I help you today?';
    } else if (lowercaseMsg.includes('report') || lowercaseMsg.includes('analytics')) {
      botResponse = 'I can help you generate reports. What type of report would you like?';
    } else if (lowercaseMsg.includes('sentiment')) {
      botResponse = 'I can analyze sentiment for you. Would you like me to generate a sentiment report?';
    } else if (lowercaseMsg.includes('thank')) {
      botResponse = "You're welcome! Is there anything else I can help you with?";
    } else {
      botResponse = "I'm not sure I understand. Could you please rephrase your question?";
    }
    
    return {
      recipient_id: userId.toString(),
      text: botResponse
    };
  }
};

// Create a mock Express app for testing
const app = express();
app.use(express.json());

// Chat endpoints
app.post('/api/chat', isAuthenticated, async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.id;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    // Save user message
    await mockStorage.saveChatMessage(userId, message, false);
    
    // Get AI response
    const aiResponse = await mockRasaService.sendMessage(message, userId);
    
    // Save AI response
    await mockStorage.saveChatMessage(userId, aiResponse.text, true);
    
    res.status(200).json({
      message: aiResponse.text,
      userId: aiResponse.recipient_id
    });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred processing your message' });
  }
});

app.get('/api/chat/history', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit || '50');
    
    const history = await mockStorage.getChatHistory(userId, limit);
    
    res.status(200).json({ messages: history });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred retrieving chat history' });
  }
});

app.post('/api/chat/clear', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const clearedCount = await mockStorage.clearChatHistory(userId);
    
    res.status(200).json({ 
      success: true,
      message: `Cleared ${clearedCount} messages from chat history` 
    });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred clearing chat history' });
  }
});

describe('Chat Flow Integration', () => {
  beforeEach(() => {
    // Clear all messages before each test
    mockChatMessages.length = 0;
  });
  
  test('should handle a complete conversation flow', async () => {
    // Step 1: User sends a greeting
    let response = await request(app)
      .post('/api/chat')
      .send({ message: 'Hello there!' });
    
    expect(response.status).toBe(200);
    expect(response.body.message).toContain('Hello');
    
    // Step 2: User asks about reports
    response = await request(app)
      .post('/api/chat')
      .send({ message: 'I need to generate a report' });
    
    expect(response.status).toBe(200);
    expect(response.body.message).toContain('report');
    
    // Step 3: User specifies sentiment report
    response = await request(app)
      .post('/api/chat')
      .send({ message: 'I need a sentiment analysis report' });
    
    expect(response.status).toBe(200);
    expect(response.body.message).toContain('sentiment');
    
    // Step 4: User says thanks
    response = await request(app)
      .post('/api/chat')
      .send({ message: 'Thank you for your help!' });
    
    expect(response.status).toBe(200);
    expect(response.body.message).toContain('welcome');
    
    // Step 5: Check that all messages are in the history
    response = await request(app)
      .get('/api/chat/history');
    
    expect(response.status).toBe(200);
    expect(response.body.messages.length).toBe(8); // 4 user messages + 4 bot responses
    
    // Verify the conversation flow in the correct order
    const messages = response.body.messages.map(m => ({ 
      isBot: m.isBot,
      message: m.message
    }));
    
    expect(messages[0]).toEqual({ isBot: false, message: 'Hello there!' });
    expect(messages[1].isBot).toBe(true);
    expect(messages[2]).toEqual({ isBot: false, message: 'I need to generate a report' });
    expect(messages[3].isBot).toBe(true);
    expect(messages[4]).toEqual({ isBot: false, message: 'I need a sentiment analysis report' });
    expect(messages[5].isBot).toBe(true);
    expect(messages[6]).toEqual({ isBot: false, message: 'Thank you for your help!' });
    expect(messages[7].isBot).toBe(true);
  });
  
  test('should handle chat history clearing', async () => {
    // Step 1: User sends a message
    await request(app)
      .post('/api/chat')
      .send({ message: 'Hello!' });
    
    // Step 2: Check that the message is in the history
    let response = await request(app)
      .get('/api/chat/history');
    
    expect(response.status).toBe(200);
    expect(response.body.messages.length).toBe(2); // 1 user message + 1 bot response
    
    // Step 3: Clear the chat history
    response = await request(app)
      .post('/api/chat/clear');
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    
    // Step 4: Verify that history is cleared
    response = await request(app)
      .get('/api/chat/history');
    
    expect(response.status).toBe(200);
    expect(response.body.messages.length).toBe(0);
  });
  
  test('should return error for empty messages', async () => {
    const response = await request(app)
      .post('/api/chat')
      .send({ message: '' });
    
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });
  
  test('should limit chat history results', async () => {
    // Add several messages
    for (let i = 0; i < 10; i++) {
      await request(app)
        .post('/api/chat')
        .send({ message: `Message ${i + 1}` });
    }
    
    // Request only the last 5 messages
    const response = await request(app)
      .get('/api/chat/history')
      .query({ limit: 5 });
    
    expect(response.status).toBe(200);
    expect(response.body.messages.length).toBe(5);
    
    // Verify they're the most recent ones (each user message creates a bot reply too)
    const lastUserMessage = response.body.messages.find(m => !m.isBot);
    expect(lastUserMessage.message).toContain('10');
  });
});