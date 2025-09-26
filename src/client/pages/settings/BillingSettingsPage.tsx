import { useState, useEffect } from 'react';
import { 
  Users, 
  BarChart3, 
  Clock, 
  Download,
  AlertCircle,
  TrendingUp,
  CreditCard
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useSearchParams } from 'react-router-dom';
import { Button } from '../../components/ui/Button';

import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { PointsManager } from '../../components/subscription/PointsManager';
import { pointsService } from '../../services/payment.service';

interface UsageStats {
  success: boolean;
  usage: {
    studiesCreated: number;
    participantsRecruited: number;
    recordingMinutes: number;
    dataExports: number;
  };
  limits: {
    studiesCreated: number;
    participantsRecruited: number;
    recordingMinutes: number;
    dataExports: number;
  };
}

const BillingSettingsPage = () => {
  const [searchParams] = useSearchParams();
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);

  useEffect(() => {
    // Handle payment success/cancel callbacks
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');

    if (success) {
      toast.success('Subscription updated successfully!');
    } else if (canceled) {
      toast.error('Payment was cancelled');
    }

    loadUsageStats();
  }, [searchParams]);

  const loadUsageStats = async () => {
    try {
      // Points system doesn't need usage stats - just show points balance
      const response = await pointsService.getBalance();
      if (response.success) {
        setUsageStats({
          success: true,
          usage: {
            studiesCreated: response.balance?.totalSpent || 0,
            participantsRecruited: 0,
            recordingMinutes: 0,
            dataExports: 0
          },
          limits: {
            studiesCreated: -1,
            participantsRecruited: -1,
            recordingMinutes: -1,
            dataExports: -1
          }
        });
      }
    } catch (error) {
      console.error('Error loading usage stats:', error);
    }
  };
  const formatUsagePercentage = (used: number, limit: number) => {
    if (limit === -1) return '∞'; // Unlimited
    return Math.round((used / limit) * 100);
  };

  const getUsagePercentageNumber = (used: number, limit: number): number => {
    if (limit === -1) return 0; // For unlimited, return 0 for comparison purposes
    return Math.round((used / limit) * 100);
  };

  const getUsageColor = (used: number, limit: number) => {
    const percentage = formatUsagePercentage(used, limit);
    if (percentage === '∞') return 'text-green-600';
    if (typeof percentage === 'number') {
      if (percentage >= 90) return 'text-red-600';
      if (percentage >= 70) return 'text-yellow-600';
    }
    return 'text-green-600';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Billing & Subscription</h1>
        <p className="mt-2 text-gray-600">
          Manage your subscription, view usage, and download invoices.
        </p>
      </div>      {/* Points Manager */}
      <div className="mb-8">
        <PointsManager />
      </div>

      {/* Manual Payment Option */}
      <div className="mb-8">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">Alternative Payment Methods</h3>
            <p className="text-sm text-gray-600">For users in regions where online payments are not available</p>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Bank Transfer / Manual Payment</h4>
                  <p className="text-sm text-gray-600">
                    Pay via bank transfer, cash deposit, or other local payment methods
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                className="border-blue-300 text-blue-700 hover:bg-blue-100"
                onClick={() => window.open('/app/payments/manual', '_blank')}
              >
                Get Started
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usage Overview */}
      {usageStats && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Usage</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Studies Created */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Studies Created</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {usageStats.usage.studiesCreated}
                    </p>
                    <p className={`text-sm ${getUsageColor(usageStats.usage.studiesCreated, usageStats.limits.studiesCreated)}`}>
                      of {usageStats.limits.studiesCreated === -1 ? 'unlimited' : usageStats.limits.studiesCreated}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                {usageStats.limits.studiesCreated !== -1 && (
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">                      <div 
                        className={`h-2 rounded-full ${
                          getUsagePercentageNumber(usageStats.usage.studiesCreated, usageStats.limits.studiesCreated) >= 90 
                            ? 'bg-red-500' 
                            : getUsagePercentageNumber(usageStats.usage.studiesCreated, usageStats.limits.studiesCreated) >= 70 
                            ? 'bg-yellow-500' 
                            : 'bg-green-500'
                        }`}
                        style={{
                          width: `${Math.min(getUsagePercentageNumber(usageStats.usage.studiesCreated, usageStats.limits.studiesCreated), 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Participants */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Participants</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {usageStats.usage.participantsRecruited}
                    </p>
                    <p className={`text-sm ${getUsageColor(usageStats.usage.participantsRecruited, usageStats.limits.participantsRecruited)}`}>
                      of {usageStats.limits.participantsRecruited === -1 ? 'unlimited' : usageStats.limits.participantsRecruited}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                {usageStats.limits.participantsRecruited !== -1 && (
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">                      <div 
                        className={`h-2 rounded-full ${
                          getUsagePercentageNumber(usageStats.usage.participantsRecruited, usageStats.limits.participantsRecruited) >= 90 
                            ? 'bg-red-500' 
                            : getUsagePercentageNumber(usageStats.usage.participantsRecruited, usageStats.limits.participantsRecruited) >= 70 
                            ? 'bg-yellow-500' 
                            : 'bg-green-500'
                        }`}
                        style={{
                          width: `${Math.min(getUsagePercentageNumber(usageStats.usage.participantsRecruited, usageStats.limits.participantsRecruited), 100)}%`
                        }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recording Minutes */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Recording Minutes</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {Math.round(usageStats.usage.recordingMinutes / 60)}h
                    </p>
                    <p className={`text-sm ${getUsageColor(usageStats.usage.recordingMinutes, usageStats.limits.recordingMinutes)}`}>
                      of {usageStats.limits.recordingMinutes === -1 ? 'unlimited' : `${Math.round(usageStats.limits.recordingMinutes / 60)}h`}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                {usageStats.limits.recordingMinutes !== -1 && (
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">                      <div 
                        className={`h-2 rounded-full ${
                          getUsagePercentageNumber(usageStats.usage.recordingMinutes, usageStats.limits.recordingMinutes) >= 90 
                            ? 'bg-red-500' 
                            : getUsagePercentageNumber(usageStats.usage.recordingMinutes, usageStats.limits.recordingMinutes) >= 70 
                            ? 'bg-yellow-500' 
                            : 'bg-green-500'
                        }`}
                        style={{
                          width: `${Math.min(getUsagePercentageNumber(usageStats.usage.recordingMinutes, usageStats.limits.recordingMinutes), 100)}%`
                        }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Data Exports */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Data Exports</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {usageStats.usage.dataExports}
                    </p>
                    <p className={`text-sm ${getUsageColor(usageStats.usage.dataExports, usageStats.limits.dataExports)}`}>
                      of {usageStats.limits.dataExports === -1 ? 'unlimited' : usageStats.limits.dataExports}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Download className="w-6 h-6 text-indigo-600" />
                  </div>
                </div>
                {usageStats.limits.dataExports !== -1 && (
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">                      <div 
                        className={`h-2 rounded-full ${
                          getUsagePercentageNumber(usageStats.usage.dataExports, usageStats.limits.dataExports) >= 90 
                            ? 'bg-red-500' 
                            : getUsagePercentageNumber(usageStats.usage.dataExports, usageStats.limits.dataExports) >= 70 
                            ? 'bg-yellow-500' 
                            : 'bg-green-500'
                        }`}
                        style={{
                          width: `${Math.min(getUsagePercentageNumber(usageStats.usage.dataExports, usageStats.limits.dataExports), 100)}%`
                        }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Help & Support */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Need Help?</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-3">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg flex-shrink-0">
                  <AlertCircle className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Billing Questions</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Have questions about your invoice or payment? Our billing team is here to help.
                  </p>
                  <Button variant="outline" size="sm" className="mt-2">
                    Contact Billing Support
                  </Button>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg flex-shrink-0">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Upgrade Benefits</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Unlock advanced features, higher limits, and priority support with our premium plans.
                  </p>
                  <Button variant="outline" size="sm" className="mt-2">
                    View All Features
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BillingSettingsPage;
