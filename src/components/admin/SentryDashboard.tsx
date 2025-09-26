import React, { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, Activity, Users, Zap, TrendingUp, Shield, RefreshCw } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { sentryMonitoring, type SentryDashboardData } from '../../services/sentryMonitoring';


/**
 * Advanced Sentry Dashboard Component for ResearchHub
 * Real-time monitoring and error management interface
 */

export const SentryDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<SentryDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchSentryMetrics = useCallback(async () => {
    try {
      setLoading(true);
      setRefreshing(true);
      
      const data = await sentryMonitoring.getDashboardData(selectedTimeRange);
      setMetrics(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch Sentry metrics:', error);
      sentryMonitoring.reportIssue('Failed to fetch dashboard metrics', 'error', { 
        timeRange: selectedTimeRange,
        error: String(error)
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedTimeRange]);

  useEffect(() => {
    fetchSentryMetrics();
    const interval = setInterval(fetchSentryMetrics, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [fetchSentryMetrics]);

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'ignored': return 'bg-gray-100 text-gray-800';
      default: return 'bg-red-100 text-red-800';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  const openSentryDashboard = () => {
    sentryMonitoring.openSentryDashboard();
  };

  const openSentryIssue = (issueId: string) => {
    sentryMonitoring.openIssueInSentry(issueId);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading Sentry metrics...</span>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Unable to load Sentry metrics</p>
          <Button onClick={fetchSentryMetrics} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Error Monitoring</h2>
          <p className="text-gray-600">Real-time error tracking and performance monitoring</p>
        </div>
        <div className="flex space-x-3">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          <Button onClick={openSentryDashboard} variant="outline">
            Open Sentry Dashboard
          </Button>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Errors</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.totalErrors}</p>
                <p className="text-xs text-red-600">{metrics.criticalErrors} critical</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-yellow-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Error Rate</p>
                <p className="text-2xl font-bold text-gray-900">{(metrics.errorRate * 100).toFixed(1)}%</p>
                <p className="text-xs text-gray-500">of total requests</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Zap className="h-8 w-8 text-green-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Avg Response</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.performance.avgResponseTime}ms</p>
                <p className="text-xs text-green-600">Score: {metrics.performance.performanceScore}/100</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Affected Users</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.userImpact.affectedUsers}</p>
                <p className="text-xs text-blue-600">{metrics.userImpact.impactPercentage.toFixed(1)}% of total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Issues */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Recent Issues
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.recentIssues.map((issue) => (
              <div
                key={issue.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => openSentryIssue(issue.id)}
              >
                <div className="flex items-center space-x-3">
                  {getLevelIcon(issue.level)}
                  <div>
                    <h4 className="font-medium text-gray-900">{issue.title}</h4>
                    <p className="text-sm text-gray-500">
                      {issue.count} occurrences • Last seen {issue.lastSeen}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge className={getStatusBadgeColor(issue.status)}>
                    {issue.status}
                  </Badge>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Slowest Endpoint</span>
                <span className="font-medium">{metrics.performance.slowestEndpoint}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Average Response Time</span>
                <span className="font-medium">{metrics.performance.avgResponseTime}ms</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Performance Score</span>
                <div className="flex items-center">
                  <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${metrics.performance.performanceScore}%` }}
                    ></div>
                  </div>
                  <span className="font-medium">{metrics.performance.performanceScore}/100</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button
                onClick={() => window.open('https://afkar.sentry.io/projects/researchhub-saas/issues/', '_blank')}
                className="w-full justify-start"
                variant="outline"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                View All Issues
              </Button>
              <Button
                onClick={() => window.open('https://afkar.sentry.io/projects/researchhub-saas/performance/', '_blank')}
                className="w-full justify-start"
                variant="outline"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Performance Monitoring
              </Button>
              <Button
                onClick={() => window.open('https://afkar.sentry.io/projects/researchhub-saas/releases/', '_blank')}
                className="w-full justify-start"
                variant="outline"
              >
                <Activity className="h-4 w-4 mr-2" />
                Release Tracking
              </Button>
              <Button
                onClick={fetchSentryMetrics}
                className="w-full justify-start"
                variant="outline"
              >
                <Shield className="h-4 w-4 mr-2" />
                Refresh Metrics
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SentryDashboard;
