// netlify/functions/generate-content.js
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Access the API key from Netlify Environment Variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method Not Allowed' }),
    };
  }

  // Basic validation for the API key
  if (!GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY is not set in Netlify Environment Variables.");
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server configuration error: API key missing.' }),
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const chatHistory = body.contents || body.chatHistory || [];

    // Validate chatHistory
    if (!Array.isArray(chatHistory) || chatHistory.length === 0 || !chatHistory[chatHistory.length - 1]?.parts?.[0]?.text) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid or empty chat history provided.' }),
      };
    }

    // Get the model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Start a chat session
    const chat = model.startChat({
      history: chatHistory,
      generationConfig: {
        maxOutputTokens: 2000,
      },
    });

    // Send the last user message
    const lastUserMessage = chatHistory[chatHistory.length - 1].parts[0].text;
    const result = await chat.sendMessage(lastUserMessage);
    const response = await result.response;
    const text = response.text();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ generatedContent: text }),
    };

  } catch (error) {
    console.error('Error in Netlify Function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to generate content', details: error.message }),
    };
  }
};
