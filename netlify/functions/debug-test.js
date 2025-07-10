// netlify/functions/debug-test.js
exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };
  
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }
  
  try {
    console.log('Debug function started');
    
    // Test 1: Basic function execution
    const step1 = 'Function executing';
    
    // Test 2: Environment variable
    const apiKey = process.env.GEMINI_API_KEY;
    const step2 = apiKey ? `API key available (${apiKey.length} chars)` : 'API key missing';
    
    // Test 3: Simple fetch test
    let step3 = 'Fetch test not attempted';
    try {
      const testResponse = await fetch('https://httpbin.org/get');
      step3 = testResponse.ok ? 'Fetch works' : 'Fetch failed';
    } catch (fetchError) {
      step3 = `Fetch error: ${fetchError.message}`;
    }
    
    // Test 4: Gemini API test (minimal)
    let step4 = 'Gemini test not attempted';
    if (apiKey) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        const geminiResponse = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'Say "test" in one word.' }] }]
          })
        });
        
        if (geminiResponse.ok) {
          const result = await geminiResponse.json();
          const text = result.candidates?.[0]?.content?.parts?.[0]?.text || 'No response';
          step4 = `Gemini works: ${text}`;
        } else {
          const errorText = await geminiResponse.text();
          step4 = `Gemini error ${geminiResponse.status}: ${errorText.substring(0, 100)}`;
        }
      } catch (geminiError) {
        step4 = `Gemini exception: ${geminiError.message}`;
      }
    }
    
    console.log('Debug results:', { step1, step2, step3, step4 });
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        tests: { step1, step2, step3, step4 },
        timestamp: new Date().toISOString()
      })
    };
    
  } catch (error) {
    console.error('Debug function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Debug function failed',
        message: error.message,
        stack: error.stack
      })
    };
  }
};
