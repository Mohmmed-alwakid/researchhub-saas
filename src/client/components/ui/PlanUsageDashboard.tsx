import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Users, 
  Clock, 
  Download, 
  AlertTriangle, 
  CreditCard,
  CheckCircle
} from 'lucide-react';


interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  maxStudies: number;
  maxParticipantsPerStudy: number;
  recordingMinutes: number;
  advancedAnalytics: boolean;
  exportData: boolean;
  teamCollaboration: boolean;
  prioritySupport: boolean;
  customBranding: boolean;
}

interface UsageMetrics {
  studiesCreated: number;
  participantsRecruited: number;
  recordingMinutesUsed: number;
  dataExports: number;
  lastResetDate: Date;
}

interface UsageStats {
  subscription: {
    plan: string;
    status: string;
    features: SubscriptionPlan;
  };
  usage: UsageMetrics;
  usagePercentages: {
    studies: number;
    recording: number;
  };
  warningsActive: {
    studiesNearLimit: boolean;
    recordingNearLimit: boolean;
  };
}

interface UsageDashboardProps {
  onUpgrade?: (planId: string) => void;
}

export const UsageDashboard: React.FC<UsageDashboardProps> = ({ onUpgrade }) => {
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsageStats();
  }, []);

  const fetchUsageStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      
      const response = await fetch('/api/research-consolidated?action=get-usage-stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setUsageStats(data.data);
        setError(null);
      } else {
        throw new Error(data.error || 'Failed to fetch usage stats');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const getProgressColor = (percentage: number): string => {
    if (percentage > 90) return 'bg-red-500';
    if (percentage > 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getProgressBarColor = (percentage: number): string => {
    if (percentage > 90) return 'bg-red-100';
    if (percentage > 80) return 'bg-yellow-100';
    return 'bg-green-100';
  };

  const formatLimit = (limit: number): string => {
    return limit === -1 ? 'Unlimited' : limit.toString();
  };

  const getPlanBadgeColor = (plan: string): string => {
    const colors = {
      free: 'bg-gray-100 text-gray-800',
      basic: 'bg-blue-100 text-blue-800',
      pro: 'bg-purple-100 text-purple-800',
      enterprise: 'bg-orange-100 text-orange-800'
    };
    return colors[plan as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getUpgradePlan = (currentPlan: string): string => {
    const upgrades = {
      free: 'basic',
      basic: 'pro',
      pro: 'enterprise',
      enterprise: 'enterprise'
    };
    return upgrades[currentPlan as keyof typeof upgrades] || 'basic';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to Load Usage Stats</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchUsageStats}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!usageStats) {
    return null;
  }

  const { subscription, usage, usagePercentages, warningsActive } = usageStats;
  const hasWarnings = warningsActive.studiesNearLimit || warningsActive.recordingNearLimit;

  return (
    <div className="space-y-6">
      {/* Plan Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Current Plan</h3>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPlanBadgeColor(subscription.plan)}`}>
                {subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)}
              </span>
              <span className="text-2xl font-bold text-gray-900">
                ${subscription.features.price}
                <span className="text-sm font-normal text-gray-500">/month</span>
              </span>
            </div>
          </div>
          {subscription.plan !== 'enterprise' && onUpgrade && (
            <button
              onClick={() => onUpgrade(getUpgradePlan(subscription.plan))}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <CreditCard className="w-4 h-4" />
              Upgrade Plan
            </button>
          )}
        </div>
      </div>

      {/* Warnings */}
      {hasWarnings && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-yellow-800 mb-1">Usage Warnings</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                {warningsActive.studiesNearLimit && (
                  <li>• You're approaching your study creation limit</li>
                )}
                {warningsActive.recordingNearLimit && (
                  <li>• You're approaching your recording time limit</li>
                )}
              </ul>
              {onUpgrade && (
                <button
                  onClick={() => onUpgrade(getUpgradePlan(subscription.plan))}
                  className="mt-2 text-sm text-yellow-800 underline hover:text-yellow-900"
                >
                  Upgrade to avoid limits
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Usage Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Studies Usage */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-900">Studies Created</h4>
              <p className="text-xs text-gray-500">
                {usage.studiesCreated} / {formatLimit(subscription.features.maxStudies)}
              </p>
            </div>
          </div>
          
          {subscription.features.maxStudies !== -1 && (
            <div className="space-y-2">
              <div className={`w-full h-2 rounded-full ${getProgressBarColor(usagePercentages.studies)}`}>
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(usagePercentages.studies)}`}
                  style={{ width: `${Math.min(usagePercentages.studies, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-600">{usagePercentages.studies}% used</p>
            </div>
          )}
          
          {subscription.features.maxStudies === -1 && (
            <div className="flex items-center gap-1 text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">Unlimited</span>
            </div>
          )}
        </div>

        {/* Participants */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-900">Total Participants</h4>
              <p className="text-xs text-gray-500">Across all studies</p>
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {usage.participantsRecruited}
          </div>
          <p className="text-xs text-gray-600 mt-1">
            Max {formatLimit(subscription.features.maxParticipantsPerStudy)} per study
          </p>
        </div>

        {/* Recording Time */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-900">Recording Time</h4>
              <p className="text-xs text-gray-500">
                {usage.recordingMinutesUsed} / {formatLimit(subscription.features.recordingMinutes)} min
              </p>
            </div>
          </div>
          
          {subscription.features.recordingMinutes !== -1 && (
            <div className="space-y-2">
              <div className={`w-full h-2 rounded-full ${getProgressBarColor(usagePercentages.recording)}`}>
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(usagePercentages.recording)}`}
                  style={{ width: `${Math.min(usagePercentages.recording, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-600">{usagePercentages.recording}% used</p>
            </div>
          )}
          
          {subscription.features.recordingMinutes === -1 && (
            <div className="flex items-center gap-1 text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">Unlimited</span>
            </div>
          )}
        </div>

        {/* Data Exports */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Download className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-900">Data Exports</h4>
              <p className="text-xs text-gray-500">This month</p>
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {usage.dataExports}
          </div>
          {!subscription.features.exportData && (
            <p className="text-xs text-red-600 mt-1">
              Not available in your plan
            </p>
          )}
        </div>
      </div>

      {/* Feature Availability */}
      <div className="bg-white rounded-lg shadow p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Plan Features</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded-full ${subscription.features.advancedAnalytics ? 'bg-green-500' : 'bg-gray-300'}`} />
            <span className="text-sm text-gray-700">Advanced Analytics</span>
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded-full ${subscription.features.exportData ? 'bg-green-500' : 'bg-gray-300'}`} />
            <span className="text-sm text-gray-700">Data Export</span>
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded-full ${subscription.features.teamCollaboration ? 'bg-green-500' : 'bg-gray-300'}`} />
            <span className="text-sm text-gray-700">Team Collaboration</span>
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded-full ${subscription.features.prioritySupport ? 'bg-green-500' : 'bg-gray-300'}`} />
            <span className="text-sm text-gray-700">Priority Support</span>
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded-full ${subscription.features.customBranding ? 'bg-green-500' : 'bg-gray-300'}`} />
            <span className="text-sm text-gray-700">Custom Branding</span>
          </div>
        </div>
      </div>

      {/* Refresh Button */}
      <div className="text-center">
        <button
          onClick={fetchUsageStats}
          className="text-sm text-gray-600 hover:text-gray-800 underline"
        >
          Refresh Usage Stats
        </button>
      </div>
    </div>
  );
};

export default UsageDashboard;
