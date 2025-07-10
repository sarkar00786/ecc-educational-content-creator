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
    
    // Function to attempt API call with retry logic
    const attemptGeneration = async (retries = 3) => {
      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          console.log(`Attempt ${attempt}/${retries}`);
          
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Request timeout')), 20000); // 20 second timeout per attempt
          });
          
          const result = await Promise.race([
            model.generateContent(lastUserMessage),
            timeoutPromise
          ]);
          
          const response = await result.response;
          const text = response.text();
          
          console.log(`Success on attempt ${attempt}`);
          return text;
          
        } catch (error) {
          console.log(`Attempt ${attempt} failed:`, error.message);
          
          // Check if it's a rate limit or overload error
          if (error.message.includes('overloaded') || error.message.includes('503') || error.message.includes('429')) {
            if (attempt < retries) {
              const delay = attempt * 2000; // Exponential backoff: 2s, 4s, 6s
              console.log(`Waiting ${delay}ms before retry...`);
              await new Promise(resolve => setTimeout(resolve, delay));
              continue;
            }
          }
          
          // If it's not a retry-able error or we've exhausted retries, throw the error
          throw error;
        }
      }
    };
    
    const text = await attemptGeneration(3);
    
    console.log('Success - Generated content length:', text.length);

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ generatedContent: text }),
    };

  } catch (error) {
    console.error('Error in Netlify Function:', error);
    console.error('Error stack:', error.stack);
    
    // Provide user-friendly error messages
    let userMessage = 'Failed to generate content';
    let statusCode = 500;
    
    if (error.message.includes('overloaded') || error.message.includes('503')) {
      userMessage = 'The AI service is currently overloaded. Please try again in a few moments.';
      statusCode = 503;
    } else if (error.message.includes('429') || error.message.includes('quota')) {
      userMessage = 'Rate limit exceeded. Please wait a moment before trying again.';
      statusCode = 429;
    } else if (error.message.includes('timeout')) {
      userMessage = 'Request timed out. Please try again with shorter content.';
      statusCode = 408;
    } else if (error.message.includes('API key')) {
      userMessage = 'Server configuration error. Please contact support.';
      statusCode = 500;
    }
    
    return {
      statusCode: statusCode,
      headers: corsHeaders,
      body: JSON.stringify({ 
        error: userMessage, 
        details: error.message,
        type: error.constructor.name,
        retryable: statusCode === 503 || statusCode === 429
      }),
    };
  }
};
