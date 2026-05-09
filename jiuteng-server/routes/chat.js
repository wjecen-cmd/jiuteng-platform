?? `routes/chat.js` ????:

const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// ?? AI ??
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

// ?????
let conversations = new Map();

// POST /send: ???? AI
router.post('/send', async (req, res) => {
  try {
    const { message, conversationId } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // ?? conversation ID
    const id = conversationId || Date.now().toString();
    let conversation = conversations.get(id) || [];

    // ????
    conversation.push({ role: 'user', content: message });
    
    // ?? AI ???
    const chat = model.startChat({
      history: conversation.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
      })),
      generationConfig: {
        maxOutputTokens: 500,
      },
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const aiResponse = response.text();

    // ?????
    conversation.push({ role: 'model', content: aiResponse });
    conversations.set(id, conversation);

    res.json({
      success: true,
      response: aiResponse,
      conversationId: id,
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Error in chat send:', error);
    res.status(500).json({ 
      error: 'Failed to process message',
      details: error.message 
    });
  }
});

// GET /history/:conversationId: ??????
router.get('/history/:conversationId', (req, res) => {
  try {
    const { conversationId } = req.params;
    
    if (!conversationId) {
      return res.status(400).json({ error: 'Conversation ID is required' });
    }

    const conversation = conversations.get(conversationId);
    
    if (!conversation) {
      return res.status(404).json({ 
        error: 'Conversation not found',
        history: [] 
      });
    }

    res.json({
      success: true,
      conversationId: conversationId,
      history: conversation,
      messageCount: conversation.length
    });

  } catch (error) {
    console.error('Error fetching conversation history:', error);
    res.status(500).json({ 
      error: 'Failed to fetch conversation history',
      details: error.message 
    });
  }
});

// GET /conversations: ??????????
router.get('/conversations', (req, res) => {
  try {
    const allConversations = Array.from(conversations.keys()).map(id => ({
      conversationId: id,
      messageCount: conversations.get(id).length,
      lastUpdated: new Date()
    }));

    res.json({
      success: true,
      totalConversations: allConversations.length,
      conversations: allConversations
    });
  } catch (error) {
    console.error('Error fetching conversations list:', error);
    res.status(500).json({ 
      error: 'Failed to fetch conversations list',
      details: error.message 
    });
  }
});

// DELETE /clear/:conversationId: ????????
router.delete('/clear/:conversationId', (req, res) => {
  try {
    const { conversationId } = req.params;
    
    if (conversations.has(conversationId)) {
      conversations.delete(conversationId);
      res.json({
        success: true,
        message: 'Conversation cleared successfully',
        conversationId: conversationId
      });
    } else {
      res.status(404).json({
        error: 'Conversation not found'
      });
    }
  } catch (error) {
    console.error('Error clearing conversation:', error);
    res.status(500).json({ 
      error: 'Failed to clear conversation',
      details: error.message 
    });
  }
});

module.exports = router;
```

## ???

### 1. **POST /send** - ???? AI
- ?? `message` ??? `conversationId`
- ?? AI ?????
- ???????????
- ????? conversation ID

### 2. **GET /history/:conversationId** - ??????
- ?? conversation ID ?????
- ??????????

### 3. **AI ?????**
- ?? Google Gemini AI API
- ?? conversation history ??
- ?? maxOutputTokens ???

### 4. **??????**
- `conversations` Map ??????????
- ?? conversation ID ????
- ???: `/conversations` (???????) & `/clear/:conversationId` (????)

## ???

// .env ???
GEMINI_API_KEY=your_google_gemini_api_key_here
```

// app.js ???
const chatRoutes = require('./routes/chat');
app.use('/api/chat', chatRoutes);
```

????????????????? AI ??????????