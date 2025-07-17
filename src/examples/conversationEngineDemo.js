// Enhanced Conversation Engine Demo
// Demonstrates the complete integration of all enhanced features

import { 
  processConversation, 
  processFeedback, 
  getConversationAnalytics,
  getAdvancedMetrics,
  resetConversationState,
  MESSAGE_INTENTS,
  USER_STATES
} from '../utils/conversationEngine.js';

// Demo conversation scenarios
const demoScenarios = {
  // Scenario 1: Frustrated student seeking help
  frustrated_student: {
    userId: 'student_123',
    messages: [
      "Salam, yaar main bahut confused hun math mein 😔",
      "Algebra samajh nahi aa raha bilkul bhi, help karo please",
      "Maine try kiya hai but mushkil lagta hai",
      "Kya simple explanation de sakte hain?"
    ]
  },
  
  // Scenario 2: Engaged learner exploring topics
  engaged_learner: {
    userId: 'learner_456',
    messages: [
      "Hi! I'm interested in learning about machine learning",
      "What are the basic concepts I should know?",
      "That's fascinating! How does supervised learning work?",
      "Can you give me a practical example?",
      "I want to try implementing this myself!"
    ]
  },
  
  // Scenario 3: Mixed language casual conversation
  mixed_language: {
    userId: 'casual_789',
    messages: [
      "Assalam o alaikum! Kya haal hai?",
      "Yaar programming seekhna hai, kahan se start karun?",
      "JavaScript acha hai ya Python better lagta?",
      "Zabardast! Practical projects bhi batao na",
      "Thanks yaar, maza aa gaya explanation mein!"
    ]
  },
  
  // Scenario 4: Academic formal inquiry
  formal_inquiry: {
    userId: 'academic_101',
    messages: [
      "Good morning. I would like to understand quantum computing principles.",
      "Could you provide a comprehensive overview of quantum algorithms?",
      "I'm particularly interested in Shor's algorithm implementation.",
      "Thank you for the detailed explanation.",
      "This has been very informative."
    ]
  }
};

// Demo function to run a complete conversation scenario
export const runConversationDemo = async (scenarioName) => {
  console.log(`\n=== Running Conversation Demo: ${scenarioName} ===\n`);
  
  const scenario = demoScenarios[scenarioName];
  if (!scenario) {
    console.error('Scenario not found!');
    return;
  }
  
  // Reset conversation state for this demo
  resetConversationState(scenario.userId);
  
  const conversationHistory = [];
  const processingResults = [];
  
  // Process each message in the scenario
  for (let i = 0; i < scenario.messages.length; i++) {
    const message = scenario.messages[i];
    console.log(`\n--- Message ${i + 1}: "${message}" ---`);
    
    // Process the conversation
    const result = await processConversation(message, conversationHistory, scenario.userId);
    processingResults.push(result);
    
    // Display analysis results
    displayAnalysisResults(result, i + 1);
    
    // Add to conversation history
    conversationHistory.push({
      role: 'user',
      text: message,
      timestamp: new Date().toISOString(),
      analysisMetadata: result.messageAnalysis
    });
    
    // Simulate AI response (for demo purposes)
    const aiResponse = generateDemoAIResponse(result);
    conversationHistory.push({
      role: 'assistant',
      text: aiResponse,
      timestamp: new Date().toISOString(),
      responseStrategy: result.responseStrategy
    });
    
    console.log(`AI Response: "${aiResponse}"`);
    
    // Simulate user feedback (randomly positive/negative for demo)
    const feedback = Math.random() > 0.2 ? 'positive' : 'negative';
    const feedbackResult = processFeedback(feedback, {
      message: message,
      messageAnalysis: result.messageAnalysis,
      personaResult: result.personaResult,
      convictionResult: result.convictionResult,
      userId: scenario.userId,
      responseType: result.responseStrategy.primary
    });
    
    console.log(`User Feedback: ${feedback}`);
    if (feedbackResult.improvements.length > 0) {
      console.log('Improvement Suggestions:', feedbackResult.improvements);
    }
  }
  
  // Display final analytics
  displayFinalAnalytics(conversationHistory);
  
  return {
    conversationHistory,
    processingResults,
    analytics: getConversationAnalytics()
  };
};

// Display detailed analysis results
const displayAnalysisResults = (result, messageNumber) => {
  console.log(`\n📊 Analysis Results for Message ${messageNumber}:`);
  
  // Intent and State Analysis
  console.log(`🎯 Intent: ${result.messageAnalysis.intent.intent} (${(result.messageAnalysis.intent.confidence * 100).toFixed(1)}%)`);
  console.log(`😊 User State: ${result.messageAnalysis.userState.state} (${(result.messageAnalysis.userState.confidence * 100).toFixed(1)}%)`);
  console.log(`💭 Sentiment: ${result.messageAnalysis.sentiment.sentiment} (${(result.messageAnalysis.sentiment.confidence * 100).toFixed(1)}%)`);
  
  // Cultural Context
  if (result.messageAnalysis.culturalContext.isUrduEnglishMix) {
    console.log(`🌍 Cultural Context: Mixed Urdu-English (${result.messageAnalysis.culturalContext.formalityLevel})`);
    console.log(`   Urdu Markers:`, result.messageAnalysis.culturalContext.urduMarkers.map(m => m.category));
  }
  
  // Persona Selection
  console.log(`🎭 Selected Persona: ${result.personaResult.id} (${(result.personaResult.confidence * 100).toFixed(1)}%)`);
  if (result.personaResult.isBlended) {
    console.log(`   Blended Persona: ${result.personaResult.persona.name}`);
  }
  
  // Conviction Analysis
  if (result.convictionResult.shouldTrigger) {
    console.log(`⚡ Conviction Triggered: ${result.convictionResult.scenario} (${result.convictionResult.intensity})`);
    console.log(`   Phrase: "${result.convictionResult.phrase}"`);
  }
  
  // Conversation Flow
  console.log(`🔄 Conversation Flow: ${result.messageAnalysis.conversationFlow.flow} (${(result.messageAnalysis.conversationFlow.confidence * 100).toFixed(1)}%)`);
  
  // Recommendations
  if (result.recommendations.length > 0) {
    console.log(`💡 Recommendations:`);
    result.recommendations.forEach(rec => {
      console.log(`   - ${rec.type}: ${rec.message} (${rec.priority})`);
    });
  }
  
  // Engagement Score
  console.log(`📈 Engagement Score: ${(result.conversationState.sessionMetrics.engagementScore * 100).toFixed(1)}%`);
};

// Generate demo AI response based on processing results
const generateDemoAIResponse = (result) => {
  const { responseStrategy, messageAnalysis, personaResult, convictionResult } = result;
  
  let response = '';
  
  // Handle conviction responses
  if (convictionResult.shouldTrigger) {
    response += `${convictionResult.phrase} `;
  }
  
  // Base response based on intent
  switch (messageAnalysis.intent.intent) {
    case MESSAGE_INTENTS.FRUSTRATED_SEEKING_HELP:
      response += "I understand you're feeling frustrated. Let me help you step by step.";
      break;
    case MESSAGE_INTENTS.LEARNING_FOCUSED:
      response += "That's a great question! Let me explain this concept clearly.";
      break;
    case MESSAGE_INTENTS.GREETING_CASUAL:
      response += "Hello! I'm here to help you with whatever you need.";
      break;
    case MESSAGE_INTENTS.EXPLORATORY_PLAYFUL:
      response += "I love your curiosity! Let's explore this together.";
      break;
    case MESSAGE_INTENTS.ACHIEVEMENT_ANNOUNCEMENT:
      response += "Congratulations! That's a fantastic achievement.";
      break;
    default:
      response += "I'm here to help you with whatever you need.";
  }
  
  // Add persona-specific modifications
  if (personaResult.id === 'friendly') {
    response += " 😊";
  } else if (personaResult.id === 'formal') {
    response = response.replace(/I'm/g, "I am").replace(/Let's/g, "Let us");
  }
  
  // Add cultural adaptations
  if (messageAnalysis.culturalContext.isUrduEnglishMix) {
    if (messageAnalysis.culturalContext.formalityLevel === 'casual') {
      response += " Yaar, don't worry!";
    }
  }
  
  return response;
};

// Display final analytics and insights
const displayFinalAnalytics = (conversationHistory) => {
  console.log(`\n📊 === Final Conversation Analytics ===`);
  
  const analytics = getConversationAnalytics();
  const advancedMetrics = getAdvancedMetrics(conversationHistory);
  
  console.log(`\n📈 Session Summary:`);
  console.log(`   Total Messages: ${analytics.sessionSummary.totalMessages}`);
  console.log(`   Average Engagement: ${(analytics.sessionSummary.avgEngagement * 100).toFixed(1)}%`);
  console.log(`   Conviction Triggers: ${analytics.sessionSummary.convictionTriggers}`);
  console.log(`   Persona Switches: ${analytics.sessionSummary.personaSwitches}`);
  
  console.log(`\n🎯 Learning Progression:`);
  console.log(`   Level: ${advancedMetrics.learningProgression.level}`);
  console.log(`   Score: ${advancedMetrics.learningProgression.score.toFixed(2)}`);
  console.log(`   Progressing: ${advancedMetrics.learningProgression.isProgressing ? 'Yes' : 'No'}`);
  
  console.log(`\n📊 Engagement Analysis:`);
  console.log(`   Trend: ${advancedMetrics.engagementAnalysis.trend}`);
  console.log(`   Average: ${(advancedMetrics.engagementAnalysis.average * 100).toFixed(1)}%`);
  console.log(`   Current: ${(advancedMetrics.engagementAnalysis.current * 100).toFixed(1)}%`);
  
  console.log(`\n🌍 Cultural Adaptation:`);
  console.log(`   Dominant Style: ${advancedMetrics.culturalAdaptation.dominantStyle}`);
  console.log(`   Adaptation Needed: ${advancedMetrics.culturalAdaptation.adaptationNeeded ? 'Yes' : 'No'}`);
  
  console.log(`\n📚 Topic Progression:`);
  console.log(`   Focus: ${advancedMetrics.topicProgression.focus}`);
  console.log(`   Topic Switches: ${advancedMetrics.topicProgression.topicSwitches}`);
  console.log(`   Subjects: ${advancedMetrics.topicProgression.subjects.join(', ') || 'None detected'}`);
  
  console.log(`\n🎭 Performance Metrics:`);
  console.log(`   Engagement Trend: ${analytics.performanceMetrics.engagementTrend}`);
  console.log(`   Adaptation Level: ${analytics.performanceMetrics.adaptationLevel}`);
  console.log(`   Cultural Alignment: ${analytics.performanceMetrics.culturalAlignment}`);
};

// Run all demo scenarios
export const runAllDemos = async () => {
  console.log('🚀 Starting Enhanced Conversation Engine Demo Suite\n');
  
  const results = {};
  
  for (const scenarioName of Object.keys(demoScenarios)) {
    try {
      results[scenarioName] = await runConversationDemo(scenarioName);
      console.log(`\n✅ Completed demo: ${scenarioName}`);
    } catch (error) {
      console.error(`❌ Error in demo ${scenarioName}:`, error);
    }
  }
  
  console.log('\n🎉 All demos completed!');
  console.log('\n📊 Overall Performance Summary:');
  
  // Aggregate statistics across all demos
  const overallStats = {
    totalConversations: Object.keys(results).length,
    totalMessages: 0,
    avgEngagement: 0,
    totalConvictionTriggers: 0,
    totalPersonaSwitches: 0
  };
  
  Object.values(results).forEach(result => {
    if (result.analytics) {
      overallStats.totalMessages += result.analytics.sessionSummary.totalMessages;
      overallStats.avgEngagement += result.analytics.sessionSummary.avgEngagement;
      overallStats.totalConvictionTriggers += result.analytics.sessionSummary.convictionTriggers;
      overallStats.totalPersonaSwitches += result.analytics.sessionSummary.personaSwitches;
    }
  });
  
  overallStats.avgEngagement /= overallStats.totalConversations;
  
  console.log(`   Conversations: ${overallStats.totalConversations}`);
  console.log(`   Total Messages: ${overallStats.totalMessages}`);
  console.log(`   Average Engagement: ${(overallStats.avgEngagement * 100).toFixed(1)}%`);
  console.log(`   Conviction Triggers: ${overallStats.totalConvictionTriggers}`);
  console.log(`   Persona Switches: ${overallStats.totalPersonaSwitches}`);
  
  return results;
};

// Interactive demo runner
export const runInteractiveDemo = async (scenarioName = 'frustrated_student') => {
  console.log(`\n🎮 Interactive Demo Mode: ${scenarioName}`);
  console.log('This will step through each message with detailed analysis...\n');
  
  const result = await runConversationDemo(scenarioName);
  
  console.log('\n📋 Complete Analysis Summary:');
  console.log('=============================');
  
  result.processingResults.forEach((processing, index) => {
    console.log(`\nMessage ${index + 1} Analysis:`);
    console.log(`- Intent: ${processing.messageAnalysis.intent.intent}`);
    console.log(`- User State: ${processing.messageAnalysis.userState.state}`);
    console.log(`- Persona: ${processing.personaResult.id}`);
    console.log(`- Conviction: ${processing.convictionResult.shouldTrigger ? 'Triggered' : 'Not triggered'}`);
    console.log(`- Engagement: ${(processing.conversationState.sessionMetrics.engagementScore * 100).toFixed(1)}%`);
  });
  
  return result;
};

// Export demo utilities
export {
  demoScenarios,
  displayAnalysisResults,
  generateDemoAIResponse,
  displayFinalAnalytics
};

// If running directly, run all demos
if (typeof window === 'undefined' && import.meta.url === `file://${process.argv[1]}`) {
  runAllDemos().catch(console.error);
}
