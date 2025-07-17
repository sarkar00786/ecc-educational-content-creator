// ECC App Context for AI Chat Feature
// This file contains comprehensive information about the ECC app for AI responses

export const ECC_APP_CONTEXT = {
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
    },
    
    userManagement: {
      name: "User Authentication & Profiles",
      description: "Secure user management with Firebase",
      capabilities: [
        "User registration and login",
        "Profile management",
        "Personalized content history",
        "Secure data storage with Firebase Firestore"
      ]
    },
    
    progressiveOnboarding: {
      name: "Progressive Onboarding",
      description: "Guided tour for new users",
      capabilities: [
        "Step-by-step feature introduction",
        "Context-aware help system",
        "Skip and resume functionality"
      ]
    }
  },
  
  technicalFeatures: {
    aiIntegration: {
      name: "Advanced AI Integration",
      description: "Powered by Google's Gemini AI with custom optimizations",
      features: [
        "Multi-step LLM orchestration",
        "Cognitive architecture analysis",
        "Neurologically-optimized content creation",
        "Context optimization for better performance",
        "Hybrid chat optimization with summarization"
      ]
    },
    
    accessibility: {
      name: "Accessibility Features",
      description: "WCAG 2.1 AA compliant with comprehensive accessibility support",
      features: [
        "Screen reader support",
        "Keyboard navigation",
        "Voice control integration",
        "High contrast support",
        "Focus management"
      ]
    },
    
    performance: {
      name: "Performance Optimization",
      description: "Optimized for speed and reliability",
      features: [
        "Context compression and caching",
        "Rate limiting and error handling",
        "Responsive design for all devices",
        "Progressive loading",
        "Efficient Firebase integration"
      ]
    }
  },
  
  targetAudience: {
    primary: "Educators and content creators",
    secondary: "Students and educational institutions",
    regions: "Primarily Pakistan with global accessibility"
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
  },
  
  troubleshooting: {
    "Content generation is slow": "This is normal as the AI performs multi-step analysis. The system optimizes content through cognitive architecture analysis for better learning outcomes.",
    "Voice control not working": "Ensure you're using a supported browser (Chrome, Edge, Safari) and have granted microphone permissions.",
    "Chat responses seem repetitive": "Try changing the AI persona or providing more specific questions. The AI adapts to your communication style over time.",
    "Can't find my content": "Check the History tab and use the search function. All your generated content is saved automatically."
  },
  
  visionAndGoals: {
    mission: "To democratize quality educational content creation using AI technology",
    vision: "Empowering educators worldwide with intelligent, culturally-aware content generation tools",
    goals: [
      "Make educational content creation accessible to all educators",
      "Provide culturally-sensitive AI responses for Pakistani users",
      "Offer comprehensive subject coverage with expert-level AI personas",
      "Enable seamless integration between content creation and discussion",
      "Maintain high accessibility standards for inclusive education"
    ]
  }
};

// Helper function to get context for AI responses
export const getECCContextForAI = (topic = 'general') => {
  const context = ECC_APP_CONTEXT;
  
  // Return relevant context based on topic
  switch (topic.toLowerCase()) {
    case 'features':
      return context.coreFeatures;
    case 'content':
    case 'generation':
      return context.coreFeatures.contentGeneration;
    case 'chat':
    case 'discussion':
      return context.coreFeatures.magicDiscussion;
    case 'voice':
      return context.coreFeatures.voiceControl;
    case 'history':
      return context.coreFeatures.contentHistory;
    case 'subjects':
      return context.supportedSubjects;
    case 'personas':
      return context.aiPersonas;
    case 'help':
    case 'faq':
      return context.commonUserQuestions;
    case 'troubleshooting':
      return context.troubleshooting;
    default:
      return context;
  }
};

// Export for use in AI chat responses
export default ECC_APP_CONTEXT;
