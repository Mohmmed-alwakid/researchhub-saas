import React, { useState, useEffect } from 'react';
import { 
  Brain,
  TrendingUp,
  Lightbulb,
  Target,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Zap,
  BarChart3,
  Users
} from 'lucide-react';
import { useParams } from 'react-router-dom';
import { aiInsightsEngine, AIInsight, QualityScore, TrendInsight, Recommendation } from '../../../services/ai/aiInsightsEngine';

import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';

interface AIInsightsDashboardProps {
  studyId?: string;
  studyData?: Record<string, unknown>;
}

export const AIInsightsDashboard: React.FC<AIInsightsDashboardProps> = ({ 
  studyId
}) => {
  const { id } = useParams<{ id: string }>();
  const currentStudyId = studyId || id;

  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [trends, setTrends] = useState<TrendInsight[]>([]);
  const [overallQuality, setOverallQuality] = useState<QualityScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    if (currentStudyId) {
      loadAIInsights();
    }
  }, [currentStudyId]);

  const loadAIInsights = async () => {
    try {
      setLoading(true);
      setError(null);

      // Simulate loading study data and generating insights
      const mockResponses = [
        {
          participantId: 'p1',
          blockId: 'welcome',
          blockType: 'welcome',
          answer: 'Great experience overall',
          timestamp: new Date().toISOString(),
          timeSpent: 30
        },
        {
          participantId: 'p2', 
          blockId: 'question1',
          blockType: 'open_question',
          answer: 'The navigation could be improved',
          timestamp: new Date().toISOString(),
          timeSpent: 45
        }
      ];

      const mockStudyData = {
        completionRate: 78,
        averageDuration: 12.5,
        participantCount: 145,
        dropoffPoints: [
          { blockIndex: 3, dropoffRate: 15 },
          { blockIndex: 7, dropoffRate: 8 }
        ],
        responsePatterns: []
      };

      const mockMetrics = {
        totalParticipants: 145,
        completionRate: 78,
        averageSessionDuration: 12.5,
        dropoffRate: 22,
        satisfactionScore: 4.2,
        deviceBreakdown: { desktop: 65, mobile: 35 },
        responseQuality: 8.1
      };

      // Generate AI insights
      const [
        aiInsights,
        aiRecommendations, 
        aiTrends,
        qualityScore
      ] = await Promise.all([
        aiInsightsEngine.analyzeResponses(mockResponses),
        aiInsightsEngine.generateRecommendations(mockMetrics),
        aiInsightsEngine.detectTrends(mockStudyData),
        aiInsightsEngine.scoreResponseQuality(mockResponses)
      ]);

      setInsights(aiInsights);
      setRecommendations(aiRecommendations);
      setTrends(aiTrends);
      setOverallQuality(qualityScore);
      setLastUpdated(new Date());

    } catch (err) {
      console.error('Failed to load AI insights:', err);
      setError('Failed to generate AI insights. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const refreshInsights = () => {
    loadAIInsights();
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'pattern': return <BarChart3 className="w-5 h-5" />;
      case 'sentiment': return <Users className="w-5 h-5" />;
      case 'pain_point': return <AlertCircle className="w-5 h-5" />;
      case 'opportunity': return <Target className="w-5 h-5" />;
      default: return <Lightbulb className="w-5 h-5" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'positive': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'negative': return <TrendingUp className="w-4 h-4 text-red-600 rotate-180" />;
      default: return <TrendingUp className="w-4 h-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center space-x-3">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-lg">Generating AI Insights...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-8">
        <div className="text-center space-y-4">
          <AlertCircle className="w-12 h-12 mx-auto text-red-500" />
          <h3 className="text-lg font-semibold text-red-700">Error Loading Insights</h3>
          <p className="text-gray-600">{error}</p>
          <Button onClick={refreshInsights} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Brain className="w-8 h-8 text-purple-600" />
          <div>
            <h2 className="text-2xl font-bold">AI Insights</h2>
            <p className="text-gray-600">
              Last updated {lastUpdated.toLocaleTimeString()}
            </p>
          </div>
        </div>
        <Button onClick={refreshInsights} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Overall Quality Score */}
      {overallQuality && (
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold">Overall Response Quality</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="text-3xl font-bold text-blue-600">
                {overallQuality.score}/10
              </div>
              <div className="flex-1">
                <p className="text-gray-700 mb-2">{overallQuality.reasoning}</p>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Completeness:</span>
                    <span className="ml-1 font-semibold">{overallQuality.criteria.completeness}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Depth:</span>
                    <span className="ml-1 font-semibold">{overallQuality.criteria.depth}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Clarity:</span>
                    <span className="ml-1 font-semibold">{overallQuality.criteria.clarity}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Actionability:</span>
                    <span className="ml-1 font-semibold">{overallQuality.criteria.actionability}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Engagement:</span>
                    <span className="ml-1 font-semibold">{overallQuality.criteria.engagement}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Insights */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Lightbulb className="w-5 h-5 text-yellow-600" />
            <h3 className="text-lg font-semibold">Key Insights</h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <div 
                key={index}
                className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex-shrink-0 p-2 bg-white rounded-lg">
                  {getInsightIcon(insight.category)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-semibold">{insight.title}</h4>
                    <Badge className={getImpactColor('medium')}>
                      medium impact
                    </Badge>
                    {insight.actionable && (
                      <Badge variant="secondary">
                        <Zap className="w-3 h-3 mr-1" />
                        Actionable
                      </Badge>
                    )}
                  </div>
                  <p className="text-gray-700 mb-2">{insight.description}</p>
                  <div className="text-sm text-gray-500">
                    Confidence: {(insight.confidence * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Trends */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Trend Analysis</h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {trends.map((trend, index) => (
              <div 
                key={index}
                className="flex items-start space-x-3 p-4 border rounded-lg"
              >
                <div className="flex-shrink-0 p-2">
                  {getTrendIcon(trend.trend)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-semibold">{trend.title}</h4>
                    <Badge variant="secondary" className="text-xs">
                      {trend.timeframe}
                    </Badge>
                  </div>
                  <p className="text-gray-700 mb-1">{trend.description}</p>
                  <div className="text-sm text-gray-500">
                    Significance: {(trend.significance * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold">AI Recommendations</h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <div 
                key={index}
                className={`p-4 border-2 rounded-lg ${getPriorityColor(rec.priority)}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{rec.title}</h4>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="text-xs">
                      medium effort
                    </Badge>
                    <Badge className={getPriorityColor(rec.priority)}>
                      {rec.priority} priority
                    </Badge>
                  </div>
                </div>
                <p className="text-gray-700 mb-3">{rec.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-green-700">
                    Expected Impact: {rec.expectedImpact}
                  </span>
                  <span className="text-gray-500">
                    Confidence: {(rec.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIInsightsDashboard;
