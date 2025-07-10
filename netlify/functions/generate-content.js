// netlify/functions/generate-content.js
exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };
  
  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }
  
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }
  
  try {
    // Check API key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'API key not configured' })
      };
    }
    
    // Parse request
    const { contents } = JSON.parse(event.body || '{}');
    if (!contents || !contents.length || !contents[contents.length - 1]?.parts?.[0]?.text) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid request format' })
      };
    }
    
    const message = contents[contents.length - 1].parts[0].text;
    
    // Call Gemini API directly using fetch
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: message }]
        }]
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      
      // If Gemini is overloaded (503), provide a fallback response
      if (response.status === 503 && errorText.includes('overloaded')) {
        const fallbackContent = `I apologize, but the AI service is currently experiencing high demand. Here's a basic educational outline for your topic:

**Topic: ${message.substring(0, 100)}...**

1. **Introduction**
   - Brief overview of the subject
   - Why this topic is important for ${message.includes('Grade') ? 'students at this level' : 'learners'}

2. **Key Concepts**
   - Main ideas and principles
   - Important terminology
   - Real-world examples

3. **Learning Activities**
   - Discussion questions
   - Simple exercises or experiments
   - Ways to explore the topic further

4. **Summary**
   - Review of main points
   - Connection to broader concepts
   - Next steps for learning

*Note: This is a temporary response while our AI service is busy. Please try again in a few minutes for a more detailed, customized educational content.*`;
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ 
            generatedContent: fallbackContent,
            isFallback: true
          })
        };
      }
      
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ 
          error: 'AI service temporarily unavailable',
          retryable: true
        })
      };
    }
    
    const result = await response.json();
    const generatedText = result.candidates?.[0]?.content?.parts?.[0]?.text || 'No content generated';
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ generatedContent: generatedText })
    };
    
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Service temporarily unavailable',
        retryable: true
      })
    };
  }
};
