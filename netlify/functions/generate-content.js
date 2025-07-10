// netlify/functions/generate-content.js
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Access the API key from Netlify Environment Variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

exports.handler = async (event, context) => {
  console.log('Function started - Method:', event.httpMethod);
  
  // Set timeout to prevent 502 errors
  context.callbackWaitsForEmptyEventLoop = false;
  
  // Add CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };
  
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }
  
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  // Basic validation for the API key
  if (!GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY is not set in Netlify Environment Variables.");
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Server configuration error: API key missing.' }),
    };
  }
  
  // Initialize the Google Generative AI client here to avoid initialization errors
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

  try {
    const body = JSON.parse(event.body || '{}');
    const chatHistory = body.contents || body.chatHistory || [];

    console.log('Request body parsed, chatHistory length:', chatHistory.length);
    
    // Validate chatHistory
    if (!Array.isArray(chatHistory) || chatHistory.length === 0 || !chatHistory[chatHistory.length - 1]?.parts?.[0]?.text) {
      console.error('Invalid chat history:', chatHistory);
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Invalid or empty chat history provided.' }),
      };
    }

    console.log('Getting model...');
    // Get the model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    console.log('Generating content with retry logic...');
    
    // Use generateContent instead of chat for simpler approach
    const lastUserMessage = chatHistory[chatHistory.length - 1].parts[0].text;
    console.log('Sending message to Gemini API with message length:', lastUserMessage.length);
    
    // Simplified approach - single attempt with better error handling
    console.log('Making single API call...');
    
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout after 25 seconds')), 25000);
    });
    
    const result = await Promise.race([
      model.generateContent(lastUserMessage),
      timeoutPromise
    ]);
    
    const response = await result.response;
    const text = response.text();
    
    console.log('Success - Generated content length:', text.length);

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ generatedContent: text }),
    };

  } catch (error) {
    console.error('Error in Netlify Function:', error);
    
    // Simple error response to prevent function crashes
    let userMessage = 'AI service temporarily unavailable';
    let statusCode = 503;
    
    if (error.message.includes('timeout')) {
      userMessage = 'Request timed out. Please try again.';
      statusCode = 408;
    } else if (error.message.includes('API key') || error.message.includes('authentication')) {
      userMessage = 'API configuration error. Please contact support.';
      statusCode = 500;
    }
    
    return {
      statusCode: statusCode,
      headers: corsHeaders,
      body: JSON.stringify({ 
        error: userMessage,
        retryable: true
      }),
    };
  }
};
