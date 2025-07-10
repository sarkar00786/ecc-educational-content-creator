// netlify/functions/test-api.js
const { GoogleGenerativeAI } = require('@google/generative-ai');

exports.handler = async (event, context) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };
  
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }
  
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  
  console.log('API Key length:', GEMINI_API_KEY ? GEMINI_API_KEY.length : 'undefined');
  console.log('API Key first 10 chars:', GEMINI_API_KEY ? GEMINI_API_KEY.substring(0, 10) : 'undefined');
  
  if (!GEMINI_API_KEY) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'GEMINI_API_KEY not found' })
    };
  }
  
  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Simple test message
    const result = await model.generateContent("Say hello in one word.");
    const response = await result.response;
    const text = response.text();
    
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ 
        success: true, 
        response: text,
        apiKeyLength: GEMINI_API_KEY.length
      })
    };
    
  } catch (error) {
    console.error('Test API Error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ 
        error: 'API test failed',
        details: error.message,
        apiKeyLength: GEMINI_API_KEY.length
      })
    };
  }
};
