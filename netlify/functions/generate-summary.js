const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// eslint-disable-next-line no-unused-vars
exports.handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { text, targetReduction = 0.55, maxLength, detailLevel = 'concise', instructions } = JSON.parse(event.body);

    if (!text || text.trim().length === 0) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'Text is required' })
      };
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Create summarization prompt based on detail level
    const baseInstructions = instructions || 'Create a summary focusing on key points and main topics discussed.';
    const prompt = `
    Please create a ${detailLevel} summary of the following conversation. 
    
    Requirements:
    - Reduce the content by ${(targetReduction * 100).toFixed(0)}% while preserving key information
    - ${baseInstructions}
    - Keep important context, decisions, and conclusions
    - Maintain the flow of conversation
    - Focus on educational content, questions asked, and answers provided
    - Maximum length: ${maxLength || Math.floor(text.length * (1 - targetReduction))} characters
    ${detailLevel === 'detailed' ? '- Include specific examples and explanations that might be referenced later' : ''}
    
    Conversation to summarize:
    ${text}
    
    Summary:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text();

    // Validate summary length
    const actualReduction = (text.length - summary.length) / text.length;
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        summary: summary.trim(),
        originalLength: text.length,
        summaryLength: summary.length,
        actualReduction: actualReduction,
        targetReduction: targetReduction,
        success: true
      })
    };

  } catch (error) {
    console.error('Summary generation error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        error: 'Failed to generate summary',
        details: error.message 
      })
    };
  }
};
