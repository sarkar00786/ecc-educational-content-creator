// User Interaction Recording - Chat functionality disabled
// Original implementation moved to Magic-Chat/extracted/userInteractionRecorder.js

export class UserInteractionRecorder {
  constructor(userId) {
    this.userId = userId;
    console.log('UserInteractionRecorder: Chat functionality disabled');
  }

  // Stub methods to prevent errors
  recordInteraction() {
    console.log('Chat functionality disabled - interaction not recorded');
    return `stub_${Date.now()}`;
  }

  getBehaviorPatterns() {
    return {
      timeOfDayPreference: { morning: 0, afternoon: 0, evening: 0, night: 0 },
      sessionDuration: [],
      topicProgression: [],
      questionTypes: { conceptual: 0, practical: 0, clarification: 0, exploration: 0 },
      responsePreferences: { detailed: 0, concise: 0, examples: 0, stepByStep: 0 },
      emotionalPatterns: {
        frustrationTriggers: [],
        motivationSources: [],
        confusionPoints: [],
        successIndicators: []
      }
    };
  }

  getUserEvents() {
    return {
      personalEvents: [],
      academicEvents: [],
      achievementEvents: [],
      challengeEvents: []
    };
  }

  getContextualMemory() {
    return {
      recentTopics: [],
      ongoingProjects: [],
      recurringChallenges: [],
      preferredExamples: [],
      mentionedNames: new Set(),
      locations: new Set(),
      interests: new Set()
    };
  }

  getPersonalizedInsights() {
    return {
      suggestions: [],
      patterns: [],
      recommendations: []
    };
  }
}

// Export singleton instance
export const userInteractionRecorder = new UserInteractionRecorder('stub-user');
export default UserInteractionRecorder;
