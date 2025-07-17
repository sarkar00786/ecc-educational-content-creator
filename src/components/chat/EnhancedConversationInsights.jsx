// Enhanced Conversation Insights Component
// Displays advanced analytics and metrics from the conversation engine

import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Brain, 
  Target, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  MessageSquare,
  Zap,
  Globe,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Clock,
  Star,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';
import { useConversationEngine, MessageAnalysisUtils } from '../../services/conversationEngineService';

const EnhancedConversationInsights = ({ user, currentChatId, isVisible = true }) => {
  const { isInitialized, analytics, insights, recommendations, service } = useConversationEngine(user?.uid);
  const [expandedSection, setExpandedSection] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  if (!isVisible || !isInitialized || !insights) {
    return null;
  }

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const getEngagementIcon = (level) => {
    switch (level) {
      case 'high': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'medium': return <Activity className="w-4 h-4 text-yellow-600" />;
      case 'low': return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getProgressionIcon = (level) => {
    switch (level) {
      case 'high': return <Star className="w-4 h-4 text-green-600" />;
      case 'medium': return <Target className="w-4 h-4 text-yellow-600" />;
      case 'low': return <AlertCircle className="w-4 h-4 text-red-600" />;
      default: return <Target className="w-4 h-4 text-gray-600" />;
    }
  };

  const RecommendationItem = ({ recommendation }) => (
    <div className={`p-3 rounded-lg border-l-4 ${
      recommendation.priority === 'high' ? 'border-red-500 bg-red-50' :
      recommendation.priority === 'medium' ? 'border-yellow-500 bg-yellow-50' :
      'border-blue-500 bg-blue-50'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-medium text-sm text-gray-800">{recommendation.title}</h4>
          <p className="text-xs text-gray-600 mt-1">{recommendation.message}</p>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
          recommendation.priority === 'high' ? 'bg-red-100 text-red-800' :
          recommendation.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
          'bg-blue-100 text-blue-800'
        }`}>
          {recommendation.priority}
        </div>
      </div>
    </div>
  );

  const MetricCard = ({ icon, label, value, color = 'text-gray-600', sublabel = null }) => (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {icon}
          <span className="text-sm font-medium text-gray-700">{label}</span>
        </div>
        <div className="text-right">
          <div className={`text-lg font-semibold ${color}`}>{value}</div>
          {sublabel && <div className="text-xs text-gray-500">{sublabel}</div>}
        </div>
      </div>
    </div>
  );

  const ExpandableSection = ({ title, icon, children, isExpanded, onToggle }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center space-x-2">
          {icon}
          <span className="font-medium text-gray-800">{title}</span>
        </div>
        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {isExpanded && <div className="p-4">{children}</div>}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Brain className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">Conversation Insights</h3>
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700"
        >
          <Info className="w-4 h-4" />
          <span>{showDetails ? 'Hide' : 'Show'} Details</span>
        </button>
      </div>

      {/* Quick Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={getEngagementIcon(insights.engagement.level)}
          label="Engagement"
          value={`${(insights.engagement.score * 100).toFixed(0)}%`}
          color={MessageAnalysisUtils.getEngagementColor(insights.engagement.score)}
          sublabel={insights.engagement.level}
        />
        <MetricCard
          icon={getProgressionIcon(insights.learning.progression)}
          label="Learning"
          value={insights.learning.progression}
          color={insights.learning.isProgressing ? 'text-green-600' : 'text-yellow-600'}
          sublabel={insights.learning.isProgressing ? 'Progressing' : 'Stable'}
        />
        <MetricCard
          icon={<MessageSquare className="w-4 h-4 text-blue-600" />}
          label="Messages"
          value={insights.conversation.messagesCount}
          sublabel={insights.conversation.flow}
        />
        <MetricCard
          icon={<Users className="w-4 h-4 text-purple-600" />}
          label="Persona"
          value={insights.persona.current || 'None'}
          color={`${MessageAnalysisUtils.getConfidenceColor(insights.persona.confidence)}`}
          sublabel={`${insights.persona.switches} switches`}
        />
      </div>

      {/* Detailed Sections */}
      {showDetails && (
        <div className="space-y-4">
          {/* Engagement Analysis */}
          <ExpandableSection
            title="Engagement Analysis"
            icon={<Activity className="w-4 h-4 text-green-600" />}
            isExpanded={expandedSection === 'engagement'}
            onToggle={() => toggleSection('engagement')}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Engagement Score</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        insights.engagement.level === 'high' ? 'bg-green-500' :
                        insights.engagement.level === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${insights.engagement.score * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">
                    {(insights.engagement.score * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">Trend</div>
                  <div className="font-semibold capitalize">{insights.engagement.trend}</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">Level</div>
                  <div className="font-semibold capitalize">{insights.engagement.level}</div>
                </div>
              </div>
            </div>
          </ExpandableSection>

          {/* Learning Progress */}
          <ExpandableSection
            title="Learning Progress"
            icon={<Brain className="w-4 h-4 text-blue-600" />}
            isExpanded={expandedSection === 'learning'}
            onToggle={() => toggleSection('learning')}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Progress Level</span>
                <div className="flex items-center space-x-2">
                  {getProgressionIcon(insights.learning.progression)}
                  <span className="font-semibold capitalize">{insights.learning.progression}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">Status</div>
                  <div className={`font-semibold ${
                    insights.learning.isProgressing ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {insights.learning.isProgressing ? 'Progressing' : 'Stable'}
                  </div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">Score</div>
                  <div className="font-semibold">{insights.learning.score.toFixed(1)}</div>
                </div>
              </div>
            </div>
          </ExpandableSection>

          {/* Conversation Flow */}
          <ExpandableSection
            title="Conversation Flow"
            icon={<MessageSquare className="w-4 h-4 text-purple-600" />}
            isExpanded={expandedSection === 'flow'}
            onToggle={() => toggleSection('flow')}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">Flow Type</div>
                  <div className="font-semibold capitalize">{insights.conversation.flow.replace('_', ' ')}</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">Messages</div>
                  <div className="font-semibold">{insights.conversation.messagesCount}</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">Convictions</div>
                  <div className="font-semibold flex items-center justify-center">
                    <Zap className="w-4 h-4 text-yellow-500 mr-1" />
                    {insights.conversation.convictionTriggers}
                  </div>
                </div>
              </div>
            </div>
          </ExpandableSection>

          {/* Cultural Context */}
          <ExpandableSection
            title="Cultural Context"
            icon={<Globe className="w-4 h-4 text-green-600" />}
            isExpanded={expandedSection === 'cultural'}
            onToggle={() => toggleSection('cultural')}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">Dominant Style</div>
                  <div className="font-semibold capitalize">{insights.cultural.style}</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">Adaptation</div>
                  <div className={`font-semibold ${
                    insights.cultural.adaptationNeeded ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {insights.cultural.adaptationNeeded ? 'Needed' : 'Aligned'}
                  </div>
                </div>
              </div>
            </div>
          </ExpandableSection>

          {/* Persona Analysis */}
          <ExpandableSection
            title="Persona Analysis"
            icon={<Users className="w-4 h-4 text-orange-600" />}
            isExpanded={expandedSection === 'persona'}
            onToggle={() => toggleSection('persona')}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">Current</div>
                  <div className="font-semibold capitalize">{insights.persona.current || 'None'}</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">Switches</div>
                  <div className="font-semibold">{insights.persona.switches}</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">Confidence</div>
                  <div className={`font-semibold ${MessageAnalysisUtils.getConfidenceColor(insights.persona.confidence)}`}>
                    {(insights.persona.confidence * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
            </div>
          </ExpandableSection>
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-2 mb-3">
            <AlertCircle className="w-4 h-4 text-blue-600" />
            <h4 className="font-medium text-gray-800">Recommendations</h4>
          </div>
          <div className="space-y-2">
            {recommendations.map((rec, index) => (
              <RecommendationItem key={index} recommendation={rec} />
            ))}
          </div>
        </div>
      )}

      {/* Raw Analytics (for debugging) */}
      {process.env.NODE_ENV === 'development' && showDetails && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-800 mb-2">Debug Info</h4>
          <pre className="text-xs text-gray-600 overflow-auto max-h-40">
            {JSON.stringify({ analytics, insights }, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default EnhancedConversationInsights;
