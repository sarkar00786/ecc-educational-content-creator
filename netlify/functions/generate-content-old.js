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
    
    // Extract message and clean up format for Gemini API
    const lastMessage = contents[contents.length - 1];
    const message = lastMessage.parts[0].text;
    
    // Create properly formatted contents for Gemini API (remove role field)
    const cleanedContents = contents.map(item => ({
      parts: item.parts
    }));
    
    console.log('Original contents:', JSON.stringify(contents, null, 2));
    console.log('Cleaned contents:', JSON.stringify(cleanedContents, null, 2));
    console.log('Message length:', message.length);
    
    // Call Gemini API directly using fetch with timeout
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000); // 25 second timeout
    
    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: cleanedContents
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      
      // If Gemini is overloaded (503) or rate limited (429), provide a fallback response
      if (response.status === 503 || response.status === 429) {
        // Extract key details for better fallback
        const isStoryRequest = message.toLowerCase().includes('story');
        const audienceLevel = message.match(/\"([^\"]*?)\" level/) || message.match(/Grade\s*(\d+)/i);
        const ageGroup = message.match(/aged\s*\"([^\"]*?)\"/) || message.match(/(\d+)\s*years?/i);
        
        let fallbackContent;
        if (isStoryRequest) {
          fallbackContent = `🌟 **Educational Story Framework**

📚 **The Tale of Courage and Kindness**

Once upon a time, there was a wise king who learned important lessons from an unexpected friendship with a loyal dog and a humble beggar. Here's how you can develop this story:

**Key Characters:**
• **The King** - Represents leadership and responsibility
• **The Dog** - Shows loyalty, friendship, and unconditional love
• **The Beggar** - Teaches humility, compassion, and seeing beyond appearances

**Important Life Lessons:**
1. **True Worth** - People's value isn't measured by wealth or status
2. **Kindness Matters** - Small acts of kindness can change everything
3. **Friendship** - Real friends stick by you through good and bad times
4. **Learning from Everyone** - Wisdom can come from unexpected places

**Questions to Think About:**
• What makes someone truly rich?
• How can we show kindness to others every day?
• What can we learn from animals about loyalty?
• Why is it important to help those in need?

**Activities:**
• Draw your favorite character from the story
• Write about a time when you showed kindness
• Think of ways to help others in your community

*💡 This is a basic outline. The AI service is currently busy, but try again soon for a complete, customized story!*`;
        } else {
          fallbackContent = `📚 **Educational Content Outline**

**Topic Overview:** ${message.substring(0, 100)}...

**Learning Structure:**

1. **Getting Started**
   • What we're going to learn
   • Why this topic matters for ${audienceLevel ? audienceLevel[1] : 'students'}
   • Fun facts to spark curiosity

2. **Main Ideas**
   • Core concepts explained simply
   • Important words to remember
   • Real-world examples you can relate to

3. **Hands-On Learning**
   • Discussion questions
   • Fun activities to try
   • Ways to explore more

4. **Putting It Together**
   • Quick review of what we learned
   • How this connects to other subjects
   • Next steps in your learning journey

**💡 Helpful Tips:**
• Take notes while reading
• Ask questions if something isn't clear
• Practice what you learn
• Share your knowledge with others

*🔄 The AI service is temporarily busy. Please try again in a few minutes for detailed, personalized educational content tailored specifically for your needs!*`;
        }
        
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
    
    // Handle specific error types
    if (error.name === 'AbortError') {
      return {
        statusCode: 408,
        headers,
        body: JSON.stringify({ 
          error: 'Request timeout - AI service took too long to respond',
          retryable: true
        })
      };
    }
    
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
