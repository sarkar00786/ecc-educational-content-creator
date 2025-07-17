import { 
  GraduationCap, 
  HelpCircle, 
  Zap, 
  BookOpen, 
  Heart, 
  Briefcase, 
  User 
} from 'lucide-react';

// Simple intent classification function (mock implementation)
export const classifyMessageIntent = (message) => {
  const lowerMessage = message.toLowerCase();
  
  // Basic intent classification logic
  if (lowerMessage.includes('help') || lowerMessage.includes('?')) {
    return { intent: 'help_seeking', confidence: 0.8 };
  }
  if (lowerMessage.includes('confused') || lowerMessage.includes('dont understand')) {
    return { intent: 'confused', confidence: 0.7 };
  }
  if (lowerMessage.includes('frustrated') || lowerMessage.includes('difficult')) {
    return { intent: 'frustrated', confidence: 0.7 };
  }
  if (lowerMessage.includes('explore') || lowerMessage.includes('try')) {
    return { intent: 'exploratory', confidence: 0.6 };
  }
  
  return { intent: 'general', confidence: 0.5 };
};

export const aiPersonasConfig = [
  {
    id: 'Educator',
    name: 'Educator',
    description: 'Comprehensive explanations with examples',
    icon: GraduationCap,
    colors: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700',
    hoverColors: 'hover:bg-blue-200 dark:hover:bg-blue-800/40',
    iconColor: 'text-blue-600 dark:text-blue-400',
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
    id: 'Socratic',
    name: 'Socratic',
    description: 'Guides you to answers through questions',
    icon: HelpCircle,
    colors: 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700',
    hoverColors: 'hover:bg-purple-200 dark:hover:bg-purple-800/40',
    iconColor: 'text-purple-600 dark:text-purple-400',
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
    id: 'Concise',
    name: 'Concise',
    description: 'Brief, direct responses',
    icon: Zap,
    colors: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700',
    hoverColors: 'hover:bg-yellow-200 dark:hover:bg-yellow-800/40',
    iconColor: 'text-yellow-600 dark:text-yellow-400',
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
    id: 'Detailed',
    name: 'Detailed',
    description: 'In-depth, thorough explanations',
    icon: BookOpen,
    colors: 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700',
    hoverColors: 'hover:bg-indigo-200 dark:hover:bg-indigo-800/40',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
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
    id: 'Friendly',
    name: 'Friendly',
    description: 'Warm, encouraging tone',
    icon: Heart,
    colors: 'bg-pink-100 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-700',
    hoverColors: 'hover:bg-pink-200 dark:hover:bg-pink-800/40',
    iconColor: 'text-pink-600 dark:text-pink-400',
    prompt: `
      FRIENDLY PERSONA ENHANCEMENT:
      - Conversational, warm tone
      - Use culturally relevant greetings like 'Assalamu Alaikum', 'JazzakAllah', and time-based greetings.
      - Offer interactive, question-driven suggestions during farewells.
      - Personal anecdotes and connections
      - Encouraging language throughout
      - Relatable examples and scenarios
      - Celebration of learning milestones
    `
  },
  {
    id: 'Formal',
    name: 'Formal',
    description: 'Professional, academic style',
    icon: Briefcase,
    colors: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600',
    hoverColors: 'hover:bg-gray-200 dark:hover:bg-gray-600',
    iconColor: 'text-gray-600 dark:text-gray-400',
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

export const getPersonaStyle = (personaId) => {
  const persona = aiPersonasConfig.find(p => p.id === personaId);
  if (!persona) {
    return {
      icon: User,
      colors: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600',
      hoverColors: 'hover:bg-gray-200 dark:hover:bg-gray-600',
      iconColor: 'text-gray-600 dark:text-gray-400'
    };
  }
  return persona;
};

export const getPersonaPrompt = (personaId) => {
  const persona = aiPersonasConfig.find(p => p.id === personaId);
  return persona ? persona.prompt : '';
};
