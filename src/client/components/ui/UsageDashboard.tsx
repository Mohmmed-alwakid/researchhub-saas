import React, { useState, useEffect } from 'react';
import { BarChart3, Users, Clock, Download, TrendingUp, AlertTriangle } from 'lucide-react';
import { subscriptionService, UsageStats } from '../../services/subscription.service';

export const UsageDashboard: React.FC = () => {
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUsageStats();
  }, []);

  const loadUsageStats = async () => {
    try {
      setLoading(true);
      const stats = await subscriptionService.getUsageStats();
      setUsageStats(stats);
      setError(null);
    } catch (err) {
      setError('Failed to load usage statistics');
      console.error('Usage stats error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatLimitText = (limit: number): string => {
    return limit === -1 ? 'Unlimited' : limit.toString();
  };

  const getProgressBarColor = (percentage: number): string => {
    if (percentage > 90) return 'bg-red-500';
    if (percentage > 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getProgressBgColor = (percentage: number): string => {
    if (percentage > 90) return 'bg-red-100';
    if (percentage > 80) return 'bg-yellow-100';
    return 'bg-green-100';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !usageStats) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center py-8">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to Load Usage Data</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadUsageStats}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { subscription, usage, usagePercentages, warningsActive } = usageStats;

  const usageItems = [
    {
      icon: <BarChart3 className="w-5 h-5" />,
      label: 'Studies Created',
      current: usage.studiesCreated,
      limit: subscription.features.maxStudies,
      percentage: usagePercentages.studies,
      color: 'blue'
    },
    {
      icon: <Users className="w-5 h-5" />,
      label: 'Participants Recruited',
      current: usage.participantsRecruited,
      limit: subscription.features.maxParticipantsPerStudy,
      percentage: 0, // This is per-study, not total
      color: 'green'
    },
    {
      icon: <Clock className="w-5 h-5" />,
      label: 'Recording Minutes Used',
      current: usage.recordingMinutesUsed,
      limit: subscription.features.recordingMinutes,
      percentage: usagePercentages.recording,
      color: 'purple'
    },
    {
      icon: <Download className="w-5 h-5" />,
      label: 'Data Exports',
      current: usage.dataExports,
      limit: -1, // No limit tracking for exports yet
      percentage: 0,
      color: 'orange'
    }
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Usage Dashboard</h2>
              <p className="text-sm text-gray-600">
                Current plan: <span className="font-medium text-blue-600 capitalize">{subscription.plan}</span>
              </p>
            </div>
          </div>
          
          {(warningsActive.studiesNearLimit || warningsActive.recordingNearLimit) && (
            <div className="flex items-center gap-2 text-orange-600">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">Near limits</span>
            </div>
          )}
        </div>
      </div>

      {/* Usage Items */}
      <div className="p-6 space-y-4">
        {usageItems.map((item, index) => (
          <div key={index} className="border border-gray-100 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-${item.color}-100 text-${item.color}-600`}>
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{item.label}</h3>
                  <p className="text-sm text-gray-600">
                    {item.current} / {formatLimitText(item.limit)}
                  </p>
                </div>
              </div>
              
              {item.percentage > 0 && (
                <div className="text-right">
                  <span className={`text-sm font-medium ${
                    item.percentage > 90 ? 'text-red-600' :
                    item.percentage > 80 ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    {item.percentage}%
                  </span>
                </div>
              )}
            </div>

            {/* Progress Bar (only show if there's a limit and percentage) */}
            {item.limit !== -1 && item.percentage > 0 && (
              <div className={`w-full rounded-full h-2 ${getProgressBgColor(item.percentage)}`}>
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor(item.percentage)}`}
                  style={{ width: `${Math.min(item.percentage, 100)}%` }}
                />
              </div>
            )}

            {/* Unlimited indicator */}
            {item.limit === -1 && (
              <div className="flex items-center gap-2 text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">Unlimited</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Feature Status */}
      <div className="p-6 border-t border-gray-200">
        <h3 className="font-medium text-gray-900 mb-3">Plan Features</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { name: 'Advanced Analytics', enabled: subscription.features.advancedAnalytics },
            { name: 'Data Export', enabled: subscription.features.exportData },
            { name: 'Team Collaboration', enabled: subscription.features.teamCollaboration },
            { name: 'Priority Support', enabled: subscription.features.prioritySupport },
            { name: 'Custom Branding', enabled: subscription.features.customBranding }
          ].map((feature) => (
            <div key={feature.name} className="flex items-center gap-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${
                feature.enabled ? 'bg-green-500' : 'bg-gray-300'
              }`} />
              <span className={feature.enabled ? 'text-gray-900' : 'text-gray-400'}>
                {feature.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-lg">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Last updated: {new Date(usage.lastResetDate).toLocaleDateString()}
          </div>
          <button
            onClick={loadUsageStats}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
};

export default UsageDashboard;
