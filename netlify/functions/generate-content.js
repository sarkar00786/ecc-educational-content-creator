// netlify/functions/generate-content.js
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Access the API key from Netlify Environment Variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyAxxAWhx_HPhRclzaQ7RBD2hqFPxBJJe_o";

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Initial greeting control
const hasInitialGreetingOccurred = new Set();

// Enhanced Context optimization utilities with advanced features
class ContextOptimizer {
  constructor() {
    this.maxTokens = 8000;
    this.contextWindow = 0.7; // 70% of max tokens for context
    this.relevanceThreshold = 0.3;
    this.compressionRatio = 0.5; // Target compression ratio
    this.cache = new Map(); // Simple cache for frequent patterns
    this.maxCacheSize = 100;
  }

  // Clear cache when it gets too large
  clearCache() {
    if (this.cache.size > this.maxCacheSize) {
      const keysToDelete = Array.from(this.cache.keys()).slice(0, this.maxCacheSize / 2);
      keysToDelete.forEach(key => this.cache.delete(key));
    }
  }

  // Enhanced token estimation with better accuracy
  estimateTokens(text) {
    if (!text) return 0;
    // More accurate token estimation considering punctuation, special characters
    const words = text.trim().split(/\s+/);
    const specialChars = (text.match(/[^\w\s]/g) || []).length;
    const codeBlocks = (text.match(/```[\s\S]*?```/g) || []).length;
    return Math.ceil(words.length * 1.3 + specialChars * 0.1 + codeBlocks * 10);
  }

  // Advanced relevance scoring with semantic similarity
  calculateRelevance(message, query) {
    if (!query || !message.text) return 0.5;
    
    const cacheKey = `${message.text.slice(0, 100)}-${query.slice(0, 50)}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    const queryWords = query.toLowerCase().split(/\s+/);
    const messageWords = message.text.toLowerCase().split(/\s+/);
    
    // Exact word matches
    let exactMatches = 0;
    // Partial matches (substring matching)
    let partialMatches = 0;
    // Semantic weight (question words, key terms)
    let semanticWeight = 0;
    
    const questionWords = ['what', 'how', 'why', 'when', 'where', 'who', 'which'];
    const keyTerms = ['explain', 'describe', 'analyze', 'compare', 'contrast', 'define'];
    
    queryWords.forEach(word => {
      // Check for exact matches
      if (messageWords.includes(word)) {
        exactMatches++;
      } else {
        // Check for partial matches
        const partialMatch = messageWords.find(mWord => 
          mWord.includes(word) || word.includes(mWord)
        );
        if (partialMatch) {
          partialMatches++;
        }
      }
      
      // Boost for question words and key terms
      if (questionWords.includes(word)) semanticWeight += 0.1;
      if (keyTerms.includes(word)) semanticWeight += 0.15;
    });
    
    const baseScore = (exactMatches * 1.0 + partialMatches * 0.5) / queryWords.length;
    
    // Enhanced boosts
    const messageAge = Date.now() - new Date(message.timestamp).getTime();
    const recentBoost = messageAge < 300000 ? 0.2 : messageAge < 900000 ? 0.1 : 0; // 5min/15min thresholds
    
let userBoost = message.role === 'user' ? 0.15 : 0;
    const lengthBoost = message.text.length > 100 ? 0.1 : 0; // Longer messages might have more context
    
    const finalScore = Math.min(1, baseScore + semanticWeight + recentBoost + userBoost + lengthBoost);
    
    // Cache the result
    this.cache.set(cacheKey, finalScore);
    this.clearCache();
    
    return finalScore;
  }


  // Semantic chunking for better context
  createSemanticChunks(messages, chunkSize = 3) {
    const chunks = [];
    
    for (let i = 0; i < messages.length; i += chunkSize) {
      const chunk = messages.slice(i, i + chunkSize);
      chunks.push({
        messages: chunk,
        startIndex: i,
        tokens: chunk.reduce((sum, msg) => sum + this.estimateTokens(msg.text), 0),
        timestamp: chunk[chunk.length - 1].timestamp
      });
    }
    
    return chunks;
  }

  // Advanced context optimization with semantic chunking and batch processing
  optimizeContext(messages, linkedContexts = [], currentQuery = '') {
    if (!messages || messages.length === 0) {
      return { messages: [], linkedContexts: [], optimized: false };
    }

    // Dynamic recent message count based on context complexity
    const recentCount = Math.min(7, Math.max(3, Math.floor(messages.length * 0.2)));
    const recentMessages = messages.slice(-recentCount);
    const olderMessages = messages.slice(0, -recentCount);
    
    if (olderMessages.length === 0) {
      return {
        messages: recentMessages,
        linkedContexts: this.optimizeLinkedContexts(linkedContexts),
        optimized: false
      };
    }

    // Calculate token budget
    const maxContextTokens = Math.floor(this.maxTokens * this.contextWindow);
    const recentTokens = recentMessages.reduce((sum, msg) => 
      sum + this.estimateTokens(msg.text), 0);
    const availableTokens = maxContextTokens - recentTokens;
    
    if (availableTokens <= 0) {
      return {
        messages: recentMessages,
        linkedContexts: [],
        optimized: true
      };
    }

    // Create semantic chunks and score them with enhanced algorithms
    const chunks = this.createSemanticChunks(olderMessages);
    const scoredChunks = chunks.map(chunk => {
      const avgRelevance = chunk.messages.reduce((sum, msg) => 
        sum + this.calculateRelevance(msg, currentQuery), 0) / chunk.messages.length;
      
      // Additional scoring factors
      const diversityScore = this.calculateDiversity(chunk.messages);
      const contextualScore = this.calculateContextualImportance(chunk.messages, currentQuery);
      
      return {
        ...chunk,
        relevance: avgRelevance,
        diversity: diversityScore,
        contextual: contextualScore,
        composite: avgRelevance * 0.6 + diversityScore * 0.2 + contextualScore * 0.2
      };
    });

    // Enhanced sorting by composite score
    scoredChunks.sort((a, b) => {
      const scoreDiff = b.composite - a.composite;
      if (Math.abs(scoreDiff) < 0.1) {
        return new Date(b.timestamp) - new Date(a.timestamp);
      }
      return scoreDiff;
    });

    // Select chunks within token budget
    const selectedMessages = [...messages.slice(0, 2)]; // Keep first 2 for context
    let usedTokens = selectedMessages.reduce((sum, msg) => 
      sum + this.estimateTokens(msg.text), 0);

    for (const chunk of scoredChunks) {
      if (usedTokens + chunk.tokens <= availableTokens && 
          chunk.relevance > this.relevanceThreshold) {
        selectedMessages.push(...chunk.messages);
        usedTokens += chunk.tokens;
      }
    }

    // Add recent messages
    selectedMessages.push(...recentMessages);

    // Remove duplicates while preserving order
    const uniqueMessages = [];
    const seen = new Set();
    
    for (const msg of selectedMessages) {
      const key = `${msg.timestamp}-${msg.text.slice(0, 50)}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueMessages.push(msg);
      }
    }

    return {
      messages: uniqueMessages,
      linkedContexts: this.optimizeLinkedContexts(linkedContexts),
      optimized: true,
      originalCount: messages.length,
      optimizedCount: uniqueMessages.length,
      tokensUsed: usedTokens,
      tokensAvailable: maxContextTokens
    };
  }

  // Optimize linked contexts
  optimizeLinkedContexts(linkedContexts) {
    return linkedContexts.slice(0, 2).map(ctx => ({
      ...ctx,
      messages: ctx.messages.slice(-3) // Only last 3 messages from each linked chat
    }));
  }

  // Calculate message diversity for better context selection
  calculateDiversity(messages) {
    if (!messages || messages.length <= 1) return 0;
    
    const uniqueWords = new Set();
    const totalWords = messages.reduce((count, msg) => {
      const words = msg.text.toLowerCase().split(/\s+/);
      words.forEach(word => uniqueWords.add(word));
      return count + words.length;
    }, 0);
    
    return uniqueWords.size / totalWords; // Lexical diversity ratio
  }

  // Calculate contextual importance based on conversation flow
  calculateContextualImportance(messages, currentQuery) {
    if (!messages || messages.length === 0) return 0;
    
    let importance = 0;
    
    // Check for follow-up questions or references
    const hasFollowUp = messages.some(msg => 
      msg.text.includes('follow up') || msg.text.includes('continue') || msg.text.includes('also')
    );
    
    // Check for error corrections or clarifications
    const hasCorrection = messages.some(msg => 
      msg.text.includes('correct') || msg.text.includes('clarify') || msg.text.includes('actually')
    );
    
    // Check for definitional or explanatory content
    const hasDefinition = messages.some(msg => 
      msg.text.includes('define') || msg.text.includes('explain') || msg.text.includes('mean')
    );
    
    // Check for query-specific relevance
    const hasQueryKeywords = currentQuery && messages.some(msg => 
      currentQuery.toLowerCase().split(' ').some(keyword => 
        msg.text.toLowerCase().includes(keyword)
      )
    );
    
    if (hasFollowUp) importance += 0.3;
    if (hasCorrection) importance += 0.4;
    if (hasDefinition) importance += 0.2;
    if (hasQueryKeywords) importance += 0.1;
    
    return Math.min(1, importance);
  }

  // Enhanced summary generation with better context awareness
  async generateSummary(messages) {
    if (!messages || messages.length === 0) return '';
    
    // Group messages by role for better summary structure
    const userMessages = messages.filter(msg => msg.role === 'user').map(msg => msg.text);
    const aiMessages = messages.filter(msg => msg.role !== 'user').map(msg => msg.text);
    
    const conversationText = messages.map(msg => 
      `${msg.role === 'user' ? 'User' : 'AI'}: ${msg.text}`
    ).join('\n');
    
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent([
        `Create a structured summary of this conversation segment:

Key Topics Discussed:
- [List main topics]

User Questions/Requests:
- [Summarize user inquiries]

AI Responses/Explanations:
- [Summarize key AI responses]

Conversation Context:
${conversationText}

Provide a concise 2-3 sentence summary focusing on the main learning objectives and key insights.`
      ]);
      
      return result.response.text;
    } catch (error) {
      console.error('Summary generation failed:', error);
      const mainTopics = userMessages.length > 0 ? userMessages[0].slice(0, 50) : 'general discussion';
      const aiResponses = aiMessages.length > 0 ? aiMessages.map(msg => msg.slice(0, 30)).join(', ') : 'AI guidance';
      return `[Summary of ${messages.length} messages: Discussion about ${mainTopics}... with responses including ${aiResponses}]`;
    }
  }

  // Batch write optimization for Firestore operations
  prepareBatchWrite(chatData, messages) {
    const batchOperations = [];
    
    // Prepare main chat update
    const mainUpdate = {
      ...chatData,
      messages: messages.map(msg => ({
        role: msg.role,
        text: msg.text,
        files: msg.files || [],
        timestamp: msg.timestamp
      })),
      lastUpdated: new Date(), // Will be converted to serverTimestamp in client
      messageCount: messages.length,
      lastMessagePreview: messages[messages.length - 1]?.text?.slice(0, 100) || ''
    };
    
    batchOperations.push({
      type: 'update',
      data: mainUpdate
    });
    
    // Prepare analytics update if needed
    if (messages.length > 0) {
      const analyticsUpdate = {
        totalMessages: messages.length,
        lastActivity: new Date(),
        averageMessageLength: messages.reduce((sum, msg) => sum + msg.text.length, 0) / messages.length
      };
      
      batchOperations.push({
        type: 'analytics',
        data: analyticsUpdate
      });
    }
    
    return batchOperations;
  }
}

// Import AI personas and subject prompts configurations
const aiPersonasConfig = [
  {
    id: 'educator',
    name: 'Educator',
    prompt: `
      EDUCATOR PERSONA ENHANCEMENT:
      - Comprehensive explanations with scaffolded learning
      - Multiple examples and analogies
      - Clear learning objectives and outcomes
      - Structured progression from basic to advanced
      - Encouraging and supportive language
    `
  },
  {
    id: 'socratic',
    name: 'Socratic',
    prompt: `
      SOCRATIC PERSONA ENHANCEMENT:
      - Question-driven content discovery
      - Guided inquiry approach
      - Critical thinking provocations
      - Self-reflection opportunities
      - Open-ended exploration prompts
    `
  },
  {
    id: 'detailed',
    name: 'Detailed',
    prompt: `
      DETAILED PERSONA ENHANCEMENT:
      - Exhaustive concept coverage
      - In-depth background information
      - Multiple perspectives on topics
      - Comprehensive resource suggestions
      - Thorough explanation of nuances
    `
  },
  {
    id: 'concise',
    name: 'Concise',
    prompt: `
      CONCISE PERSONA ENHANCEMENT:
      - Bullet-pointed key concepts
      - Essential information only
      - Quick reference format
      - Streamlined examples
      - Direct, no-fluff language
    `
  },
  {
    id: 'friendly',
    name: 'Friendly',
    prompt: `
      FRIENDLY PERSONA ENHANCEMENT:
      - Conversational, warm tone
      - Personal anecdotes and connections
      - Encouraging language throughout
      - Relatable examples and scenarios
      - Celebration of learning milestones
    `
  },
  {
    id: 'formal',
    name: 'Formal',
    prompt: `
      FORMAL PERSONA ENHANCEMENT:
      - Academic language and structure
      - Scholarly references and citations
      - Professional presentation format
      - Rigorous analytical approach
      - Objective, evidence-based tone
    `
  }
];

const subjectPromptsConfig = {
  'General': {
    fullPromptTemplate: `
      ROLE: You are a universal learning facilitator with expertise across all academic disciplines.
      MISSION: Create adaptable educational content that serves as a foundation for cross-curricular learning.
      ENGAGEMENT STRATEGIES: Use real-world scenarios, encourage critical thinking, provide diverse learning pathways.
      Generate educational content for: [bookContent] for [audienceClass] students, aged [audienceAge], from [audienceRegion].
    `
  },
  'Mathematics': {
    fullPromptTemplate: `
      ROLE: You are a mathematics learning specialist with deep understanding of mathematical cognition.
      MATHEMATICAL COGNITION FRAMEWORK: Number sense, spatial-visual processing, algebraic thinking, logical reasoning.
      NEUROLOGICAL OPTIMIZATION: Pattern recognition, visual processing, procedural memory, conceptual understanding.
      ENGAGEMENT TRIGGERS: Mathematical puzzles, real-world applications, historical discoveries, multiple solution pathways.
      Generate educational content for: [bookContent] for [audienceClass] students, aged [audienceAge], from [audienceRegion].
    `
  },
  'Science': {
    fullPromptTemplate: `
      ROLE: You are a science education expert specializing in inquiry-based learning and scientific reasoning.
      SCIENTIFIC INQUIRY FRAMEWORK: Observation, hypothesis formation, experimental design, data analysis, evidence-based conclusions.
      NEUROLOGICAL OPTIMIZATION: Curiosity activation, hands-on learning, causal reasoning, systems thinking.
      ENGAGEMENT TRIGGERS: Surprising phenomena, current discoveries, STEM careers, safety-conscious experimentation.
      Generate educational content for: [bookContent] for [audienceClass] students, aged [audienceAge], from [audienceRegion].
    `
  },
  'Physics': {
    fullPromptTemplate: `
      ROLE: You are a physics education specialist with expertise in conceptual physics and mathematical modeling.
      PHYSICS COGNITION FRAMEWORK: Conceptual understanding, mathematical modeling, system analysis, proportional reasoning.
      NEUROLOGICAL OPTIMIZATION: Visualization skills, analogical reasoning, proportional thinking, causal reasoning.
      ENGAGEMENT TRIGGERS: Everyday phenomena, interactive simulations, technology applications, historical discoveries.
      Generate educational content for: [bookContent] for [audienceClass] students, aged [audienceAge], from [audienceRegion].
    `
  },
  'Chemistry': {
    fullPromptTemplate: `
      ROLE: You are a chemistry education expert with deep understanding of chemical thinking and molecular visualization.
      CHEMICAL COGNITION FRAMEWORK: Molecular visualization, chemical reasoning, stoichiometric thinking, equilibrium concepts.
      NEUROLOGICAL OPTIMIZATION: Spatial reasoning, symbolic thinking, quantitative analysis, pattern recognition.
      ENGAGEMENT TRIGGERS: Visible reactions, molecular models, everyday materials, environmental applications.
      Generate educational content for: [bookContent] for [audienceClass] students, aged [audienceAge], from [audienceRegion].
    `
  },
  'History': {
    fullPromptTemplate: `
      ROLE: You are a history education specialist with expertise in historical thinking and chronological reasoning.
      HISTORICAL THINKING FRAMEWORK: Chronological reasoning, contextual analysis, multiple perspectives, cause and effect.
      NEUROLOGICAL OPTIMIZATION: Narrative processing, empathy development, pattern recognition, critical analysis.
      ENGAGEMENT TRIGGERS: Compelling narratives, primary sources, contemporary connections, diverse perspectives.
      Generate educational content for: [bookContent] for [audienceClass] students, aged [audienceAge], from [audienceRegion].
    `
  },
  'Literature': {
    fullPromptTemplate: `
      ROLE: You are a literature education expert with deep understanding of literary analysis and reading comprehension.
      LITERARY COGNITION FRAMEWORK: Close reading, contextual understanding, symbolic thinking, character analysis.
      NEUROLOGICAL OPTIMIZATION: Empathy development, symbolic processing, narrative comprehension, cultural awareness.
      ENGAGEMENT TRIGGERS: Compelling characters, multimedia adaptations, contemporary themes, diverse voices.
      Generate educational content for: [bookContent] for [audienceClass] students, aged [audienceAge], from [audienceRegion].
    `
  },
  'Accounting & Finance': {
    fullPromptTemplate: `
      ROLE: You are an accounting and finance education specialist with expertise in financial literacy and business cognition.
      FINANCIAL COGNITION FRAMEWORK: Quantitative analysis, systems thinking, decision making, ethical reasoning.
      NEUROLOGICAL OPTIMIZATION: Numerical reasoning, pattern recognition, risk assessment, logical analysis.
      ENGAGEMENT TRIGGERS: Real-world scenarios, business news, personal finance, career applications.
      Generate educational content for: [bookContent] for [audienceClass] students, aged [audienceAge], from [audienceRegion].
    `
  }
};

// ECC App Context for AI responses
const ECC_APP_CONTEXT = {
  appName: "ECC - Educational Content Creator",
  appDescription: "An AI-powered educational content generation platform that enables educators and content creators to generate customized educational materials using advanced AI capabilities.",
  
  coreFeatures: {
    contentGeneration: {
      name: "AI-Powered Content Generation",
      description: "Create educational content using advanced language models with multi-step LLM orchestration",
      capabilities: [
        "Generate content for any educational level",
        "Support for multiple subjects (Mathematics, Science, Physics, Chemistry, History, Literature, Accounting & Finance)",
        "Multiple AI personas (Educator, Socratic, Detailed, Concise, Friendly, Formal)",
        "Audience-specific content (by class, age, region)",
        "Customizable word count and instructions",
        "Cognitive architecture analysis for optimized learning",
        "Revolutionary quiz generation with detailed explanations"
      ],
      howToUse: "Fill out the content generation form with your book content, audience details, and preferences. The AI will create neurologically-optimized educational content."
    },
    
    contentHistory: {
      name: "Content History Management",
      description: "Access and manage all your previously generated content",
      capabilities: [
        "View all generated content with search functionality",
        "Edit and update existing content",
        "Copy content to clipboard",
        "Delete unwanted content",
        "Link content to chat discussions",
        "Full-screen content viewing"
      ],
      howToUse: "Navigate to the History tab to view all your generated content. Click on any content to view, edit, or manage it."
    },
    
    magicDiscussion: {
      name: "Magic Discussion (AI Chat)",
      description: "Intelligent chat system with Pakistani Urdu-English mixed conversational style",
      capabilities: [
        "Natural conversation with AI",
        "Link any generated content for discussion",
        "Subject-specific expertise",
        "Multiple AI personas for different interaction styles",
        "Cultural adaptation for Pakistani users",
        "Context-aware responses based on conversation history",
        "Voice control integration",
        "Enhanced message classification and user state tracking"
      ],
      howToUse: "Click the Chat tab to start a conversation. You can link any content from your history to discuss it with the AI."
    },
    
    voiceControl: {
      name: "Voice Control Navigation",
      description: "Hands-free navigation using voice commands",
      capabilities: [
        "Navigate between pages using voice",
        "Scroll content with voice commands",
        "Control chat and content generation",
        "Support for natural language commands"
      ],
      howToUse: "Click the microphone icon in the header and speak commands like 'Content Generation', 'History', or 'Scroll Down'."
    }
  },
  
  supportedSubjects: [
    "Mathematics",
    "Science",
    "Physics",
    "Chemistry",
    "History",
    "Literature",
    "Accounting & Finance",
    "General Education"
  ],
  
  aiPersonas: [
    { id: 'educator', name: 'Educator', description: 'Comprehensive explanations with scaffolded learning' },
    { id: 'socratic', name: 'Socratic', description: 'Question-driven content discovery' },
    { id: 'detailed', name: 'Detailed', description: 'Exhaustive concept coverage' },
    { id: 'concise', name: 'Concise', description: 'Essential information only' },
    { id: 'friendly', name: 'Friendly', description: 'Conversational, warm tone' },
    { id: 'formal', name: 'Formal', description: 'Academic language and structure' }
  ],
  
  commonUserQuestions: {
    "How do I generate content?": "Go to the Content Generation tab, fill in your book content, select your audience class, age, and region, then click Generate Content. The AI will create customized educational material for you.",
    "What subjects are supported?": "ECC supports Mathematics, Science, Physics, Chemistry, History, Literature, Accounting & Finance, and General Education with specialized AI personas for each.",
    "How does the chat feature work?": "The Magic Discussion feature allows you to chat with AI about any topic. You can link your generated content to discuss it further, and the AI adapts to Pakistani conversational style.",
    "Can I edit my generated content?": "Yes! Go to the History tab, click on any content, and use the Edit button to modify it. Your changes are saved automatically.",
    "What are AI personas?": "AI personas are different interaction styles like Educator (comprehensive), Socratic (question-driven), Friendly (conversational), Formal (academic), etc. Choose based on your preference.",
    "How do I use voice control?": "Click the microphone icon in the header and speak commands like 'Content Generation', 'History', 'Scroll Down', or 'Chat'. It works in most modern browsers."
  }
};

function classifyUserMessage(message, chatHistory = []) {
  let analyzeMessage;
  try {
    const path = require('path');
    const messageClassifierPath = path.join(__dirname, '../../src/utils/messageClassifier');
    analyzeMessage = require(messageClassifierPath).analyzeMessage;
  } catch (error) {
    console.error('Failed to load messageClassifier:', error);
    console.error('Current directory:', __dirname);
    console.error('Process working directory:', process.cwd());
    return { intent: 'GENERAL_INQUIRY', confidence: 0.5, indicators: [], score: 0.5, fullAnalysis: { intent: { intent: 'GENERAL_INQUIRY', confidence: 0.5 } } };
  }
  
  try {
    const analysisResult = analyzeMessage(message, chatHistory);
    return { intent: analysisResult.intent.intent, confidence: analysisResult.intent.confidence, indicators: analysisResult.intent.indicators || [], score: analysisResult.intent.score || 0, fullAnalysis: analysisResult }; 
  } catch (error) {
    console.error('Error during message analysis:', error);
    return { intent: 'GENERAL_INQUIRY', confidence: 0.5, indicators: [], score: 0.5, fullAnalysis: { intent: { intent: 'GENERAL_INQUIRY', confidence: 0.5 } } };
  }
}

// Helper function to format conviction response for API
function formatConvictionForAPI(convictionResponse) {
  if (!convictionResponse || !convictionResponse.shouldIntervene) {
    return 'No conviction layer intervention needed';
  }
  
  return `
    CONVICTION SCENARIO: ${convictionResponse.scenario}
    INTERVENTION TYPE: ${convictionResponse.interventionType}
    CONFIDENCE LEVEL: ${convictionResponse.confidenceLevel}
    REASONING: ${convictionResponse.reasoning}
    SUGGESTED APPROACH: ${convictionResponse.suggestedApproach}
    PHRASES TO USE: ${convictionResponse.phrases?.join(', ') || 'Standard supportive language'}
  `;
}

// Helper function to send messages to LLM with retry logic
async function sendMessageToLLM(prompt, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const chat = model.startChat({
        generationConfig: {
          maxOutputTokens: 2000,
        },
      });

      const result = await chat.sendMessage(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error);
      
      // Check if it's a rate limit or overload error
      if (error.message.includes('503') || error.message.includes('overloaded') || error.message.includes('rate limit') || error.message.includes('RESOURCE_EXHAUSTED')) {
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
          console.log(`Retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        // If all retries failed, throw a specific 503 error
        throw new Error('Service temporarily unavailable. The AI service is currently overloaded. Please try again in a few moments.');
      }
      
      // If it's a different error, throw with original message
      throw new Error(`Failed to generate content: ${error.message}`);
    }
  }
}

// Legacy chat request handler for backward compatibility
async function handleLegacyChatRequest(body) {
  const chatHistory = body.contents || body.chatHistory || [];
  const currentSubject = body.currentSubject || 'General';
  const aiPersona = body.aiPersona || 'Educator';
  const linkedChatContexts = body.linkedChatContexts || [];

  // Validate chatHistory
  if (!Array.isArray(chatHistory) || chatHistory.length === 0 || !chatHistory[chatHistory.length - 1]?.parts?.[0]?.text) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid or empty chat history provided.' }),
    };
  }

  // Import and use enhanced message classification
  const lastUserMessage = chatHistory[chatHistory.length - 1].parts[0].text;
  const messageClassification = classifyUserMessage(lastUserMessage, chatHistory);
  
  console.log('Message classification:', messageClassification);
  
  // Enhanced message analysis with cultural and emotional context
  let analyzeMessageWithEntities;
  let fullMessageAnalysis;
  try {
    const path = require('path');
    const messageClassifierPath = path.join(__dirname, '../../src/utils/messageClassifier');
    analyzeMessageWithEntities = require(messageClassifierPath).analyzeMessageWithEntities;
    fullMessageAnalysis = analyzeMessageWithEntities(lastUserMessage, chatHistory);
  } catch (error) {
    console.error('Failed to load messageClassifier for entities:', error);
    console.error('Current directory:', __dirname);
    console.error('Process working directory:', process.cwd());
    // Fallback analysis
    fullMessageAnalysis = {
      intent: { intent: 'GENERAL_INQUIRY', confidence: 0.5 },
      userState: { state: 'NEUTRAL', confidence: 0.5 },
      culturalContext: { isUrduEnglishMix: false, formalityLevel: 'NEUTRAL' },
      moodPatterns: { intensity: 0.5, moodScore: 0.5 },
      stateTransition: { transition: 'STABLE' },
      conversationFlow: { flow: 'STANDARD' }
    };
  }
  
  console.log('Full message analysis:', fullMessageAnalysis);

  // Apply context optimization for better performance
  const optimizer = new ContextOptimizer();
  
  // Convert chat history to optimizer format
  const messages = chatHistory.map(msg => ({
    role: msg.role,
    text: msg.parts[0].text,
    timestamp: new Date() // Use current time as fallback
  }));

  // Optimize context
  const optimizedContext = optimizer.optimizeContext(messages, linkedChatContexts, lastUserMessage);
  
  // Convert back to Gemini format
  const optimizedChatHistory = optimizedContext.messages.map(msg => ({
    role: msg.role,
    parts: [{ text: msg.text }]
  }));

  // Ensure the first message is from the user (Google Gemini API requirement)
  if (optimizedChatHistory.length > 0 && optimizedChatHistory[0].role !== 'user') {
    // Find the first user message
    const firstUserIndex = optimizedChatHistory.findIndex(msg => msg.role === 'user');
    if (firstUserIndex > 0) {
      // Remove all messages before the first user message
      optimizedChatHistory.splice(0, firstUserIndex);
    } else {
      // If no user message found, create a minimal history with just the current message
      const lastMessage = chatHistory[chatHistory.length - 1];
      optimizedChatHistory.length = 0;
      optimizedChatHistory.push({
        role: lastMessage.role,
        parts: [{ text: lastMessage.parts[0].text }]
      });
    }
  }

  console.log(`Context optimized: ${optimizedContext.optimized ? 'Yes' : 'No'}, Messages: ${messages.length} → ${optimizedChatHistory.length}`);

  // Get the model
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  // Start a chat session with optimized history
  const chat = model.startChat({
    history: optimizedChatHistory.slice(0, -1), // Remove the last message from history since we'll send it separately
    generationConfig: {
      maxOutputTokens: 2000,
    },
  });

  // Define persona behaviors
  const personaBehaviors = {
    'Educator': 'Provide comprehensive explanations with examples, breaking down complex topics into digestible parts.',
    'Socratic': 'Guide the user to answers through thoughtful questions, encouraging critical thinking and self-discovery.',
    'Concise': 'Give brief, direct responses that get straight to the point while maintaining accuracy.',
    'Detailed': 'Provide in-depth, thorough explanations with comprehensive coverage of the topic.',
    'Friendly': 'Use a warm, encouraging tone that makes learning enjoyable and supportive.',
    'Formal': 'Maintain a professional, academic style appropriate for scholarly discourse.'
  };
  
  // Determine response approach based on message classification
  let responseInstruction = '';
  
  if (messageClassification.intent === 'GREETING_CASUAL' || messageClassification.intent === 'TESTING_SYSTEM') {
    // For greetings and simple testing, respond naturally regardless of subject
    responseInstruction = `
      The user is greeting you or testing the system with a simple conversational message.
      Respond warmly and naturally in a conversational manner, acknowledging their greeting.
      Use Pakistani Urdu-English mixed conversational style if appropriate (e.g., "Hello! Kya haal hai? How are you?").
      Keep it brief and friendly, and then ask how you can help them today.
      Do not force the conversation toward the selected subject unless they specifically ask about it.
    `;
  } else if (messageClassification.intent === 'VAGUE_UNCLEAR') {
    // For unclear messages, ask for clarification
    responseInstruction = `
      The user's message is unclear. Politely ask for clarification about what they need help with.
      Use a friendly, supportive tone and suggest specific ways they can get help.
      Use Pakistani Urdu-English mixed style if appropriate (e.g., "Samajh nahi aya, could you be more specific?").
    `;
  } else if (messageClassification.intent === 'CONTINUATION_AGREEMENT') {
    // For continuation/agreement messages, continue with subject-focused response
    responseInstruction = `
      The user is agreeing or showing continuation interest. Continue the conversation naturally with the selected subject.
      You are an AI assistant with a ${aiPersona} persona. ${personaBehaviors[aiPersona] || personaBehaviors['Educator']}
      You are specializing in ${currentSubject}.
      Build upon previous context and provide relevant information based on the conversation flow.
    `;
  } else {
    // For learning-focused messages, use the subject and persona
    responseInstruction = `You are an AI assistant with a ${aiPersona} persona. ${personaBehaviors[aiPersona] || personaBehaviors['Educator']}`;
    
    // Add subject specialization only for learning-focused queries
    if (currentSubject !== 'General') {
      responseInstruction += ` You are specializing in ${currentSubject}.`;
    }
  }
  
  let baseInstruction = responseInstruction;
  
  // Add linked chat contexts if available
  let contextInstruction = '';
  if (linkedChatContexts.length > 0) {
    contextInstruction = '\n\nFor additional context, you have access to these previous conversations:\n';
    linkedChatContexts.forEach((context, index) => {
      contextInstruction += `\n--- Previous Conversation ${index + 1} (Subject: ${context.subject}) ---\n`;
      context.messages.forEach(msg => {
        contextInstruction += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.parts[0].text}\n`;
      });
      contextInstruction += '--- End of Previous Conversation ---\n';
    });
    contextInstruction += `\nUse this context as background knowledge. Prioritize the current subject (${currentSubject}) while drawing relevant insights from the linked conversations when appropriate. If a question bridges multiple subjects, ask for clarification.`;
  }
  
  // Enhanced conviction layer processing
  let convictionResponse = null;
  try {
    // Import the conviction layer utilities
    const path = require('path');
    const convictionLayerPath = path.join(__dirname, '../../src/utils/convictionLayer');
    const { processConviction } = require(convictionLayerPath);
    
    // Process conviction layer to check if AI should intervene
    convictionResponse = processConviction(
      lastUserMessage,
      chatHistory,
      currentSubject,
      fullMessageAnalysis.userState.state
    );
    
    console.log('Conviction layer response:', convictionResponse);
  } catch (convictionError) {
    console.error('Error in conviction layer:', convictionError);
    console.error('Current directory:', __dirname);
    console.error('Process working directory:', process.cwd());
    // Continue without conviction layer if it fails
  }
  
  // Enhanced cultural prompting system with micro-pattern detection
  const culturalPromptingSystem = `
    CULTURAL AND LINGUISTIC INTELLIGENCE SYSTEM:
    
    PRIMARY LANGUAGE MODE: Pakistani Urdu-English Mixed Conversational Style
    
    CORE LINGUISTIC INSTRUCTIONS:
    1. AUTHENTIC PAKISTANI SPEECH PATTERNS:
       - Use natural, fluid mix of contemporary Pakistani Urdu and English
       - Use conversational markers only at the start or topic change
       - Strictly limit usage of 'yaar', 'theek hai', 'acha', 'bilkul' (only when contextually natural)
       - Prefer English when mixing languages for clarity
       - Use Pakistani pronunciations and spellings when relevant
    
    2. ENHANCED CULTURAL ADAPTATION MARKERS:
       - User Intent: ${fullMessageAnalysis.intent.intent} (Confidence: ${fullMessageAnalysis.intent.confidence})
       - User Emotional State: ${fullMessageAnalysis.userState.state} (Confidence: ${fullMessageAnalysis.userState.confidence})
       - Cultural Context: ${fullMessageAnalysis.culturalContext.isUrduEnglishMix ? 'Urdu-English Mix Detected' : 'Standard English'}
       - Formality Level: ${fullMessageAnalysis.culturalContext.formalityLevel}
       - Message Analysis Score: ${fullMessageAnalysis.intent.score || 'N/A'}
       - Context Continuity: ${fullMessageAnalysis.culturalContext.contextualCues?.conversationContinuity?.level || 'N/A'}
       - Learning Phase: ${fullMessageAnalysis.culturalContext.contextualCues?.learningIndicators?.learningPhase || 'N/A'}
       - Mood Patterns: ${fullMessageAnalysis.moodPatterns ? `Intensity: ${fullMessageAnalysis.moodPatterns.intensity}, Score: ${fullMessageAnalysis.moodPatterns.moodScore}` : 'N/A'}
       - State Transition: ${fullMessageAnalysis.stateTransition?.transition || 'N/A'}
       - Conversation Flow: ${fullMessageAnalysis.conversationFlow?.flow || 'N/A'}
    
    3. DYNAMIC RESPONSE ADAPTATION GUIDELINES (USE SPARINGLY):
       - If user is FRUSTRATED: Use extra supportive language - "I can see you're facing some challenges"
       - If user is CONFUSED: Use clarifying language - "Let me break this down step by step"
       - If user is EXCITED/ENGAGED: Match their energy - "Great! Your enthusiasm is wonderful"
       - If user is CONFIDENT: Use collaborative tone - "Absolutely right! You're on the right track"
       - If user is PROUD: Celebrate with them - "Fantastic! You've done excellent work"
       - If user is ANXIOUS: Provide reassurance - "Don't worry, we'll work through this together"
       - If user is GRATEFUL: Acknowledge warmly - "You're very welcome! Happy to help"
       - If user is DISAPPOINTED: Show empathy - "I understand this is frustrating, but we'll figure it out"
       - If user is NOSTALGIC: Connect emotionally - "Those memories are valuable, let's build on them"
    
    4. STRICT LANGUAGE GUIDELINES:
       - ABSOLUTELY DO NOT use Hindi words
       - For concepts that might have Hindi equivalents, use English words or pure Urdu
       - Common acceptable Urdu words (use sparingly): yaar, theek, acha, bilkul, samajh, mushkil, etc.
       - When in doubt, use English rather than risk Hindi
       - AVOID excessive colloquial expressions - use maximum 1-2 per response
       - Prioritize clarity and professionalism over casual language
    
    5. SINDHI FLAVOR (Conditional for Playful Personas):
       - Only for highly informal/playful personas when user shows playful mood
       - Use sparingly and appropriately: 'Sain', 'Waah', 'Chaa', 'Mitha'
       - Ensure contextual appropriateness and cultural sensitivity
    
    6. MICRO-PATTERN BASED ADAPTATIONS:
       ${fullMessageAnalysis.moodPatterns?.patterns?.length > 0 ? 
         `- Detected patterns: ${fullMessageAnalysis.moodPatterns.patterns.map(p => p.type).join(', ')}
         - Adapt response intensity and style accordingly` : 
         '- No specific micro-patterns detected, use standard adaptive approach'}
    
    7. CONTEXTUAL FLOW CONSIDERATIONS:
       ${fullMessageAnalysis.conversationFlow?.flow === 'deep_learning' ? 
         '- User is in deep learning mode - provide comprehensive, detailed explanations' : 
         fullMessageAnalysis.conversationFlow?.flow === 'building_engagement' ? 
         '- User engagement is building - maintain momentum with interactive elements' : 
         fullMessageAnalysis.conversationFlow?.flow === 'exploratory_browsing' ? 
         '- User is exploring - provide varied, interesting information' : 
         '- Standard conversational flow - maintain natural dialogue'}
    
    CONVICTION LAYER INTEGRATION:
    ${fullMessageAnalysis.intent.intent === 'FRUSTRATED_SEEKING_HELP' ? 
      'ACTIVATE SUPPORTIVE GUIDANCE MODE - User needs gentle encouragement and step-by-step help' : 
      fullMessageAnalysis.intent.intent === 'VAGUE_UNCLEAR' ? 
      'ACTIVATE CLARIFICATION MODE - User needs friendly guidance to express their needs better' : 
      'STANDARD SUPPORTIVE MODE - Maintain warm, helpful tone'}
    
    ${convictionResponse ? `
    CONVICTION LAYER ACTIVATED:
    ${formatConvictionForAPI(convictionResponse)}
    ` : ''}
    
    PERSONA INTEGRATION:
    ${aiPersona ? `Current Active Persona: ${aiPersona} - Integrate persona characteristics naturally with cultural adaptation` : 'No specific persona - use balanced, supportive approach'}
  `;
  
  // Add markdown formatting instruction
  const formatInstruction = '\n\nFormat your response using Markdown for better readability. Use code blocks for code examples, bullet points for lists, and appropriate headings when needed. IMPORTANT: When creating lists, always use proper Markdown syntax with dashes (-) or asterisks (*) followed by a space, and ensure each list item is on a new line.';
  
  // Adjust message formatting based on classification
  let messagePrefix = '';
  if (messageClassification.intent === 'GREETING_CASUAL' || messageClassification.intent === 'TESTING_SYSTEM') {
    messagePrefix = 'User greeting/casual message: ';
  } else {
    messagePrefix = 'Current question: ';
  }
  
  // Add initial greeting logic for the first message of a new chat session
  let finalUserMessage = lastUserMessage;
  if (chatHistory.length <= 2 && messageClassification.intent === 'GREETING_CASUAL') {
    // This is likely the first message of a new chat session
    finalUserMessage = `Assalamu Alaikum! ${lastUserMessage}`;
  }
  
  const modifiedMessage = `${baseInstruction}${contextInstruction}${culturalPromptingSystem}${formatInstruction}\n\n${messagePrefix}${finalUserMessage}`;
  
  console.log('Generated prompt:', modifiedMessage); // For debugging

  // Send the modified message with retry logic
  let text;
  try {
    const result = await chat.sendMessage(modifiedMessage);
    const response = await result.response;
    text = response.text();
  } catch (error) {
    console.error('Error in legacy chat request:', error);
    // Check if it's a rate limit or overload error
    if (error.message.includes('503') || error.message.includes('overloaded') || error.message.includes('rate limit')) {
      return {
        statusCode: 503,
        body: JSON.stringify({ 
          error: 'Service temporarily unavailable. The AI service is currently overloaded. Please try again in a few moments.',
          retryAfter: 30 // Suggest retry after 30 seconds
        })
      };
    }
    throw error;
  }

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ generatedContent: text }),
  };
}

// Step 1: Cognitive Architecture & Learning Objectives
async function handleCognitiveArchitecture({
  bookContent,
  audienceClass,
  audienceAge,
  audienceRegion
}) {
  try {
    const cognitiveArchitecturePrompt = `
    ROLE: You are a cognitive learning architect with expertise in educational psychology, neuroscience, and pedagogical design. Your specialization lies in analyzing educational content and creating comprehensive cognitive maps that optimize learning outcomes.

    TASK: Analyze the provided educational content and create a detailed cognitive architecture that will serve as the foundation for subsequent neurologically-optimized content creation.

    COGNITIVE ANALYSIS FRAMEWORK:
    1. **Prior Knowledge Assessment**: Identify what learners likely already know at this level
    2. **Conceptual Hierarchy**: Map the logical sequence of concept dependencies
    3. **Cognitive Load Analysis**: Assess the mental processing demands of each concept
    4. **Learning Pathway Design**: Create optimal sequencing for knowledge acquisition
    5. **Misconception Identification**: Anticipate common misunderstandings and errors

    LEARNING OBJECTIVES FORMAT:
    Create SMART learning objectives that are:
    - Specific: Clearly defined cognitive outcomes
    - Measurable: Observable behavioral indicators
    - Achievable: Appropriate for the target audience level
    - Relevant: Connected to real-world applications
    - Time-bound: Suitable for the given educational context

    REGIONAL ADAPTATION:
    Incorporate cultural, linguistic, and educational system considerations for ${audienceRegion}:
    - Cultural Context: Local customs, values, and societal norms
    - Educational Standards: Regional curriculum requirements and expectations
    - Language Considerations: Vocabulary, idioms, and communication styles
    - Real-world Relevance: Local examples, case studies, and applications

    CONTENT TO ANALYZE:
    Book Content: ${bookContent}
    Target Audience: ${audienceClass} students, aged ${audienceAge}, from ${audienceRegion}

    OUTPUT STRUCTURE: Provide a comprehensive cognitive architecture analysis in the following JSON format:
    {
      "priorKnowledgeMap": "Detailed assessment of what learners likely already know",
      "learningObjectives": [
        "List of 3-5 specific learning objectives",
        "Each objective should be measurable and achievable"
      ],
      "commonMisconceptions": [
        "List of 3-5 likely misconceptions or errors",
        "Include explanations of why these occur"
      ],
      "cognitiveLoadBreakdown": {
        "intrinsicLoad": "Core concept complexity assessment",
        "extrinsicLoad": "Instructional design considerations",
        "germaneLoad": "Schema construction and knowledge integration"
      },
      "culturalAdaptationPoints": [
        "List of specific cultural considerations",
        "Local examples and context adaptations"
      ]
    }
  `;

    const result = await sendMessageToLLM(cognitiveArchitecturePrompt);
    return result;
  } catch (error) {
    console.error('Error in handleCognitiveArchitecture:', error);
    // Return a fallback cognitive architecture
    return JSON.stringify({
      priorKnowledgeMap: "Basic foundational knowledge expected for this grade level",
      learningObjectives: [
        "Understand the main concepts presented in the content",
        "Apply knowledge to practical situations",
        "Analyze and evaluate information critically"
      ],
      commonMisconceptions: [
        "Students may confuse similar concepts",
        "Prior knowledge may interfere with new learning"
      ],
      cognitiveLoadBreakdown: {
        intrinsicLoad: "Moderate complexity requiring focused attention",
        extrinsicLoad: "Clear presentation with minimal distractions",
        germaneLoad: "Structured to build upon existing knowledge"
      },
      culturalAdaptationPoints: [
        "Incorporate local examples and cultural references",
        "Adapt language to regional communication styles"
      ]
    });
  }
}

// Step 2: Neurologically-Optimized Content Creation
async function handleContentCreation({
  bookContent,
  audienceClass,
  audienceAge,
  audienceRegion,
  selectedSubject,
  selectedPersona,
  outputWordCount,
  customInstructions,
  cognitiveArchitecture
}) {
  try {
    // Get subject-specific prompt
    const selectedSubjectConfig = subjectPromptsConfig[selectedSubject] || subjectPromptsConfig['General'];
    const subjectPromptTemplate = selectedSubjectConfig.fullPromptTemplate;

    // Get persona enhancement
    const personaConfig = aiPersonasConfig.find(p => p.id === selectedPersona);
    const personaEnhancement = personaConfig ? personaConfig.prompt : '';

    // Fill template with actual values
    let finalPrompt = subjectPromptTemplate
      .replace(/\[bookContent\]/g, bookContent || '')
      .replace(/\[audienceClass\]/g, audienceClass || '')
      .replace(/\[audienceAge\]/g, audienceAge || '')
      .replace(/\[audienceRegion\]/g, audienceRegion || '');

    const contentCreationPrompt = `
    ROLE: You are a master educator and content designer with deep expertise in cognitive neuroscience, learning psychology, and pedagogical excellence. You specialize in creating educational content that leverages how the brain naturally learns and processes information.

    MISSION: Transform the cognitive architecture from Step 1 into highly engaging, neurologically-optimized educational content that maximizes learning effectiveness and retention.

    NEUROLOGICAL ENGAGEMENT TRIGGERS:
    1. **Attention Capture**: Use curiosity gaps, surprising facts, and compelling questions
    2. **Memory Consolidation**: Employ spaced repetition, elaborative interrogation, and dual coding
    3. **Emotional Engagement**: Create personal relevance, social connection, and achievement satisfaction
    4. **Cognitive Scaffolding**: Build from simple to complex, concrete to abstract
    5. **Multimodal Processing**: Integrate visual, auditory, and kinesthetic learning elements

    CONTENT STRUCTURE REQUIREMENTS:
    - **Hook**: Compelling opening that captures attention and establishes relevance
    - **Learning Path**: Logical progression that builds understanding systematically
    - **Concrete Examples**: Real-world applications and relatable scenarios
    - **Interactive Elements**: Questions, activities, and reflection opportunities
    - **Reinforcement**: Summary, practice, and connection to larger concepts
    - **Assessment Integration**: Embedded checks for understanding

    ENGAGEMENT OPTIMIZATION:
    - Use active voice and conversational tone
    - Include rhetorical questions and thought experiments
    - Provide multiple representation formats (verbal, visual, mathematical)
    - Create cognitive tension through challenging but achievable tasks
    - Establish personal and cultural relevance
    - Incorporate social learning elements where appropriate

    INPUTS FROM STEP 1:
    ${cognitiveArchitecture}

    SUBJECT-SPECIFIC ENHANCEMENT:
    ${finalPrompt}

    PERSONA ENHANCEMENT:
    ${personaEnhancement}

    CONTENT PARAMETERS:
    - Book Content: ${bookContent}
    - Subject: ${selectedSubject}
    - Audience: ${audienceClass} students, aged ${audienceAge}, from ${audienceRegion}
    - Word Count: ${outputWordCount || 'not specified'}
    - Custom Instructions: ${customInstructions || 'none'}

    OUTPUT: Generate comprehensive, neurologically-optimized educational content that embodies all the above principles and integrates the cognitive architecture from Step 1.
  `;

    const result = await sendMessageToLLM(contentCreationPrompt);
    return result;
  } catch (error) {
    console.error('Error in handleContentCreation:', error);
    throw new Error(`Failed to generate content: ${error.message}`);
  }
}

// Revolutionary Quiz Generation
async function handleQuizGeneration({
  bookContent,
  audienceClass,
  audienceAge,
  audienceRegion,
  selectedSubject,
  cognitiveArchitecture
}) {
  try {
    const quizGenerationPrompt = `
    ROLE: You are an assessment design expert with specialization in formative evaluation, cognitive psychology, and educational measurement. Your expertise lies in creating assessments that both measure learning and enhance it.

    MISSION: Generate a comprehensive quiz that evaluates understanding while reinforcing key concepts through carefully designed questions that promote deeper learning.

    QUIZ ARCHITECTURE:
    1. **Diagnostic Questions**: Assess prior knowledge and identify misconceptions
    2. **Formative Assessments**: Check understanding during learning progression
    3. **Application Scenarios**: Test ability to apply concepts in new contexts
    4. **Synthesis Challenges**: Evaluate ability to connect and integrate concepts
    5. **Reflection Prompts**: Encourage metacognitive awareness and self-assessment

    BLOOM'S TAXONOMY DISTRIBUTION:
    - Remember (20%): Factual recall and recognition
    - Understand (25%): Comprehension and explanation
    - Apply (25%): Using knowledge in new situations
    - Analyze (15%): Breaking down complex information
    - Evaluate (10%): Making judgments and assessments
    - Create (5%): Generating new ideas and solutions

    QUESTION TYPES:
    1. **Multiple Choice**: Include plausible distractors based on common misconceptions
    2. **True/False with Justification**: Require explanation of reasoning
    3. **Short Answer**: Test specific knowledge and understanding
    4. **Application Problems**: Real-world scenarios requiring concept application
    5. **Comparative Analysis**: Compare and contrast related concepts

    INPUTS FROM STEP 1:
    ${cognitiveArchitecture}

    CONTENT PARAMETERS:
    - Book Content: ${bookContent}
    - Subject: ${selectedSubject}
    - Audience: ${audienceClass} students, aged ${audienceAge}, from ${audienceRegion}

    FORMAT REQUIREMENTS:
    Structure the quiz using the following format:

    ---QUIZ_START---
    Q1: [Question text]
    A) [Option A]
    B) [Option B]
    C) [Option C]
    D) [Option D]
    Correct: [Letter]
    Explanation: [Detailed explanation of why this is correct and why others are wrong]

    Q2: [Question text]
    A) [Option A]
    B) [Option B]
    C) [Option C]
    D) [Option D]
    Correct: [Letter]
    Explanation: [Detailed explanation of why this is correct and why others are wrong]

    [Continue for 7-10 questions total]
    ---QUIZ_END---
  `;

    const result = await sendMessageToLLM(quizGenerationPrompt);
    return result;
  } catch (error) {
    console.error('Error in handleQuizGeneration:', error);
    throw new Error(`Failed to generate quiz: ${error.message}`);
  }
}

// Main handler function
// eslint-disable-next-line no-unused-vars
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
    console.log('Request body:', JSON.stringify(body, null, 2));
    
    // Check if this is a legacy chat request (backward compatibility)
    if (body.contents || body.chatHistory) {
      return await handleLegacyChatRequest(body);
    }
    
    const {
      bookContent,
      audienceClass,
      audienceAge,
      audienceRegion,
      outputWordCount,
      customInstructions,
      selectedSubject,
      selectedPersona,
      requestType
    } = body;

    // Validate required fields for new multi-step approach
    if (!bookContent || !audienceClass || !audienceAge || !audienceRegion) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields: bookContent, audienceClass, audienceAge, audienceRegion' }),
      };
    }

    if (requestType === 'generateContent') {
      console.log('Processing generateContent request');
      
      // Step 1: Cognitive Architecture
      const cognitiveArchitectureResult = await handleCognitiveArchitecture({
        bookContent,
        audienceClass,
        audienceAge,
        audienceRegion
      });

      // Parse the cognitive architecture result with robust error handling
      let cognitiveArchitecture;
      try {
        // Try to parse as JSON first
        cognitiveArchitecture = JSON.parse(cognitiveArchitectureResult);
        console.log('Successfully parsed cognitive architecture as JSON');
      } catch (parseError) {
        console.error("JSON parsing error for cognitive architecture:", parseError);
        console.log('Raw cognitive architecture result:', cognitiveArchitectureResult);
        
        // Try to extract JSON from markdown code blocks or other formatting
        const jsonMatch = cognitiveArchitectureResult.match(/```json\s*([\s\S]*?)\s*```/) || 
                         cognitiveArchitectureResult.match(/```\s*([\s\S]*?)\s*```/) ||
                         cognitiveArchitectureResult.match(/{[\s\S]*}/);
        
        if (jsonMatch) {
          try {
            cognitiveArchitecture = JSON.parse(jsonMatch[1] || jsonMatch[0]);
            console.log('Successfully extracted and parsed JSON from formatted text');
          } catch (secondParseError) {
            console.error('Failed to parse extracted JSON:', secondParseError);
            cognitiveArchitecture = cognitiveArchitectureResult;
          }
        } else {
          cognitiveArchitecture = cognitiveArchitectureResult;
        }
      }

      // Step 2: Content Creation
      const generatedContent = await handleContentCreation({
        bookContent,
        audienceClass,
        audienceAge,
        audienceRegion,
        selectedSubject,
        selectedPersona,
        outputWordCount,
        customInstructions,
        cognitiveArchitecture: typeof cognitiveArchitecture === 'string' ? 
                              cognitiveArchitecture : 
                              JSON.stringify(cognitiveArchitecture)
      });

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ generatedContent })
      };

    } else if (requestType === 'generateQuiz') {
      console.log('Processing generateQuiz request');
      
      // Step 1: Cognitive Architecture for Quiz
      const cognitiveArchitectureResult = await handleCognitiveArchitecture({
        bookContent,
        audienceClass,
        audienceAge,
        audienceRegion
      });

      // Parse the cognitive architecture result with robust error handling
      let cognitiveArchitecture;
      try {
        cognitiveArchitecture = JSON.parse(cognitiveArchitectureResult);
        console.log('Successfully parsed cognitive architecture as JSON');
      } catch (parseError) {
        console.error("JSON parsing error for cognitive architecture:", parseError);
        console.log('Raw cognitive architecture result:', cognitiveArchitectureResult);
        
        // Try to extract JSON from markdown code blocks or other formatting
        const jsonMatch = cognitiveArchitectureResult.match(/```json\s*([\s\S]*?)\s*```/) || 
                         cognitiveArchitectureResult.match(/```\s*([\s\S]*?)\s*```/) ||
                         cognitiveArchitectureResult.match(/{[\s\S]*}/);
        
        if (jsonMatch) {
          try {
            cognitiveArchitecture = JSON.parse(jsonMatch[1] || jsonMatch[0]);
            console.log('Successfully extracted and parsed JSON from formatted text');
          } catch (secondParseError) {
            console.error('Failed to parse extracted JSON:', secondParseError);
            cognitiveArchitecture = cognitiveArchitectureResult;
          }
        } else {
          cognitiveArchitecture = cognitiveArchitectureResult;
        }
      }

      // Generate Quiz
      const quizContent = await handleQuizGeneration({
        bookContent,
        audienceClass,
        audienceAge,
        audienceRegion,
        selectedSubject,
        cognitiveArchitecture: typeof cognitiveArchitecture === 'string' ? 
                              cognitiveArchitecture : 
                              JSON.stringify(cognitiveArchitecture)
      });

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ generatedContent: quizContent })
      };

    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid requestType. Must be "generateContent" or "generateQuiz".' })
      };
    }

  } catch (error) {
    console.error('Error in Netlify Function:', error);
    console.error('Error stack:', error.stack);
    
    // More specific error handling
    let errorMessage = 'Failed to process request';
    let statusCode = 500;
    
    if (error.message.includes('Failed to generate content')) {
      errorMessage = 'Content generation failed';
    } else if (error.message.includes('Failed to generate quiz')) {
      errorMessage = 'Quiz generation failed';
    } else if (error.message.includes('API key')) {
      errorMessage = 'API configuration error';
      statusCode = 503;
    }
    
    return {
      statusCode: statusCode,
      body: JSON.stringify({ 
        error: errorMessage, 
        details: error.message,
        timestamp: new Date().toISOString()
      }),
    };
  }
};
