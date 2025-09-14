import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Shield,
  Settings,
  Download,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Calendar,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';

/**
 * Admin Analytics Dashboard Component
 * 
 * Features:
 * - Study cost analysis and participant earnings breakdown
 * - Platform revenue tracking and profit margins
 * - Participant audit trail by study
 * - Fraud detection and security monitoring
 * - Configurable platform settings management
 * - Export capabilities for reporting
 * - Real-time alerts and notifications
 */

interface StudyAnalysis {
  studyId: string;
  title: string;
  status: string;
  researcher: {
    id: string;
    email: string;
    name: string;
  };
  costs: {
    calculatedCost: number;
    actualResearcherSpent: number;
    discrepancy: number;
  };
  participantRewards: Array<{
    participantId: string;
    participantEmail: string;
    amount: number;
    completedAt: string;
  }>;
  totalParticipantEarnings: number;
  platformRevenue: {
    studyCost: number;
    totalParticipantPayout: number;
    platformFee: number;
    netRevenue: number;
    profitMargin: string;
  };
  flags: {
    costDiscrepancy: boolean;
    lowCompletionRate: boolean;
    suspiciousActivity: boolean;
  };
}

interface PlatformRevenue {
  researcherSpending: number;
  participantEarnings: number;
  withdrawalFees: number;
  expiredPoints: number;
  netRevenue: number;
  profitMargin: number;
}

interface PlatformSettings {
  STUDY_BASE_COST: number;
  COST_PER_BLOCK: number;
  COST_PER_PARTICIPANT: number;
  PARTICIPANT_BASE_REWARD: number;
  PARTICIPANT_BONUS_PER_BLOCK: number;
  PLATFORM_FEE_PERCENT: number;
  WITHDRAWAL_FEE_PERCENT: number;
  FRAUD_DETECTION_THRESHOLD: number;
}

const AdminAnalyticsDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Data states
  const [studyAnalysis, setStudyAnalysis] = useState<StudyAnalysis[]>([]);
  const [platformRevenue, setPlatformRevenue] = useState<PlatformRevenue | null>(null);
  const [participantAudit, setParticipantAudit] = useState<any[]>([]);
  const [fraudAlerts, setFraudAlerts] = useState<any[]>([]);
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings | null>(null);
  
  // Filter states
  const [dateRange, setDateRange] = useState('30d');
  const [selectedStudy, setSelectedStudy] = useState('');
  const [selectedParticipant, setSelectedParticipant] = useState('');
  
  // Settings management
  const [settingsMode, setSettingsMode] = useState<'view' | 'edit'>('view');
  const [editedSettings, setEditedSettings] = useState<PlatformSettings | null>(null);

  // Fetch all analytics data
  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      // Fetch study analysis
      const studyResponse = await fetch('/api/admin-analytics?action=study-analysis', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const studyData = await studyResponse.json();
      
      // Fetch platform revenue
      const revenueResponse = await fetch(`/api/admin-analytics?action=platform-revenue&period=${dateRange}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const revenueData = await revenueResponse.json();
      
      // Fetch participant audit
      const auditResponse = await fetch('/api/admin-analytics?action=participant-audit', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const auditData = await auditResponse.json();
      
      // Fetch fraud alerts
      const fraudResponse = await fetch('/api/admin-analytics?action=fraud-detection', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const fraudData = await fraudResponse.json();
      
      // Fetch platform settings
      const settingsResponse = await fetch('/api/admin-analytics?action=settings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const settingsData = await settingsResponse.json();
      
      if (studyData.success) setStudyAnalysis(studyData.data.studies);
      if (revenueData.success) setPlatformRevenue(revenueData.data.revenue);
      if (auditData.success) setParticipantAudit(auditData.data.sessions);
      if (fraudData.success) setFraudAlerts(fraudData.data.alerts);
      if (settingsData.success) setPlatformSettings(settingsData.data.settings);
      
    } catch (err) {
      setError('Failed to fetch analytics data');
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange, fetchAnalyticsData]);

  // Update platform settings
  const updateSettings = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/admin-analytics?action=update-settings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          settings: editedSettings,
          reason: 'Admin dashboard update'
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setPlatformSettings(editedSettings);
        setSettingsMode('view');
        alert('Settings updated successfully!');
      } else {
        alert('Failed to update settings: ' + data.error);
      }
    } catch (err) {
      alert('Failed to update settings');
    }
  };

  // Export data
  const exportData = async (type: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/admin-analytics?action=export-data&type=${type}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `afkar-analytics-${type}-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    } catch (err) {
      alert('Failed to export data');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Analytics</h1>
          <p className="text-gray-600">Platform insights and revenue management</p>
        </div>
        <div className="flex space-x-4">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => exportData('complete')} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Key Metrics Overview */}
      {platformRevenue && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Platform Revenue</p>
                  <p className="text-2xl font-bold text-green-600">${(platformRevenue.netRevenue * 0.1).toFixed(2)}</p>
                  <p className="text-sm text-gray-500">{platformRevenue.profitMargin}% profit margin</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Researcher Spending</p>
                  <p className="text-2xl font-bold text-blue-600">${(platformRevenue.researcherSpending * 0.1).toFixed(2)}</p>
                  <p className="text-sm text-gray-500">{platformRevenue.researcherSpending} points</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Participant Earnings</p>
                  <p className="text-2xl font-bold text-purple-600">${(platformRevenue.participantEarnings * 0.1).toFixed(2)}</p>
                  <p className="text-sm text-gray-500">{platformRevenue.participantEarnings} points</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Fraud Alerts</p>
                  <p className="text-2xl font-bold text-red-600">{fraudAlerts.length}</p>
                  <p className="text-sm text-gray-500">Require attention</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="studies">Study Analysis</TabsTrigger>
          <TabsTrigger value="participants">Participants</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Revenue Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                {platformRevenue && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Researcher Spending</span>
                      <span className="font-medium">${(platformRevenue.researcherSpending * 0.1).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Participant Payouts</span>
                      <span className="font-medium text-red-600">-${(platformRevenue.participantEarnings * 0.1).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Withdrawal Fees</span>
                      <span className="font-medium text-green-600">+${(platformRevenue.withdrawalFees * 0.1).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Expired Points</span>
                      <span className="font-medium text-green-600">+${(platformRevenue.expiredPoints * 0.1).toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center font-bold">
                        <span>Net Platform Revenue</span>
                        <span className="text-green-600">${(platformRevenue.netRevenue * 0.1).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  Top Earning Studies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {studyAnalysis.slice(0, 5).map((study) => (
                    <div key={study.studyId} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium truncate">{study.title}</p>
                        <p className="text-sm text-gray-500">{study.researcher.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-600">
                          ${(study.platformRevenue.netRevenue * 0.1).toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500">{study.platformRevenue.profitMargin}% margin</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Study Analysis Tab */}
        <TabsContent value="studies" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Study Cost Analysis</CardTitle>
              <p className="text-sm text-gray-600">
                How much studies cost researchers vs. how much participants earn
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {studyAnalysis.map((study) => (
                  <div key={study.studyId} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-medium">{study.title}</h3>
                        <p className="text-sm text-gray-500">
                          by {study.researcher.name} ({study.researcher.email})
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        {study.flags.costDiscrepancy && (
                          <Badge variant="destructive">Cost Discrepancy</Badge>
                        )}
                        {study.flags.lowCompletionRate && (
                          <Badge variant="destructive">Low Completion</Badge>
                        )}
                        {study.flags.suspiciousActivity && (
                          <Badge variant="destructive">Suspicious Activity</Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Researcher Paid</p>
                        <p className="font-medium">${(study.costs.actualResearcherSpent * 0.1).toFixed(2)}</p>
                        <p className="text-xs text-gray-500">{study.costs.actualResearcherSpent} points</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Participants Earned</p>
                        <p className="font-medium">${(study.totalParticipantEarnings * 0.1).toFixed(2)}</p>
                        <p className="text-xs text-gray-500">{study.totalParticipantEarnings} points</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Afkar Revenue</p>
                        <p className="font-medium text-green-600">${(study.platformRevenue.netRevenue * 0.1).toFixed(2)}</p>
                        <p className="text-xs text-gray-500">{study.platformRevenue.profitMargin}% margin</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Participants</p>
                        <p className="font-medium">{study.participantRewards.length}</p>
                        <p className="text-xs text-gray-500">completed sessions</p>
                      </div>
                    </div>

                    {study.participantRewards.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm font-medium text-gray-700 mb-2">Participant Earnings:</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          {study.participantRewards.slice(0, 6).map((reward, idx) => (
                            <div key={idx} className="flex justify-between">
                              <span className="truncate">{reward.participantEmail}</span>
                              <span className="font-medium">${(reward.amount * 0.1).toFixed(2)}</span>
                            </div>
                          ))}
                          {study.participantRewards.length > 6 && (
                            <p className="text-gray-500 text-xs">
                              +{study.participantRewards.length - 6} more participants
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Participants Tab */}
        <TabsContent value="participants" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Participant Earnings Audit</CardTitle>
              <p className="text-sm text-gray-600">
                Track how participants earn points from each study
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {participantAudit.slice(0, 20).map((session) => (
                  <div key={session.sessionId} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{session.participant.name || session.participant.email}</p>
                      <p className="text-sm text-gray-500">{session.study.title}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(session.session.completedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">
                        ${(session.earnings.actual * 0.1).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500">{session.earnings.actual} points</p>
                      {session.earnings.discrepancy !== 0 && (
                        <p className="text-xs text-red-500">
                          {session.earnings.discrepancy > 0 ? '+' : ''}{session.earnings.discrepancy} discrepancy
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Fraud Detection Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {fraudAlerts.map((alert) => (
                  <div key={alert.transactionId} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{alert.user.name || alert.user.email}</p>
                        <p className="text-sm text-gray-500">{alert.type} transaction</p>
                        <p className="text-xs text-gray-400">
                          {new Date(alert.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant={alert.riskLevel === 'high' ? 'destructive' : 'secondary'}>
                          {alert.riskLevel} risk
                        </Badge>
                        <p className="font-medium text-lg mt-1">${(alert.amount * 0.1).toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-700">Flags:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {alert.flags.map((flag: string, idx: number) => (
                          <Badge key={idx} variant="outline">{flag}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Platform Settings
                </div>
                <Button
                  onClick={() => {
                    if (settingsMode === 'view') {
                      setEditedSettings(platformSettings);
                      setSettingsMode('edit');
                    } else {
                      updateSettings();
                    }
                  }}
                  variant={settingsMode === 'edit' ? 'default' : 'outline'}
                >
                  {settingsMode === 'edit' ? 'Save Changes' : 'Edit Settings'}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {platformSettings && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium mb-4">Study Costs (What Researchers Pay)</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Base Cost per Study</label>
                        {settingsMode === 'edit' ? (
                          <Input
                            type="number"
                            value={editedSettings?.STUDY_BASE_COST || 0}
                            onChange={(e) => setEditedSettings(prev => prev ? 
                              { ...prev, STUDY_BASE_COST: parseInt(e.target.value) } : null
                            )}
                          />
                        ) : (
                          <p className="text-lg font-medium">{platformSettings.STUDY_BASE_COST} points</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Cost per Block</label>
                        {settingsMode === 'edit' ? (
                          <Input
                            type="number"
                            value={editedSettings?.COST_PER_BLOCK || 0}
                            onChange={(e) => setEditedSettings(prev => prev ? 
                              { ...prev, COST_PER_BLOCK: parseInt(e.target.value) } : null
                            )}
                          />
                        ) : (
                          <p className="text-lg font-medium">{platformSettings.COST_PER_BLOCK} points</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-4">Participant Rewards</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Base Reward per Study</label>
                        {settingsMode === 'edit' ? (
                          <Input
                            type="number"
                            value={editedSettings?.PARTICIPANT_BASE_REWARD || 0}
                            onChange={(e) => setEditedSettings(prev => prev ? 
                              { ...prev, PARTICIPANT_BASE_REWARD: parseInt(e.target.value) } : null
                            )}
                          />
                        ) : (
                          <p className="text-lg font-medium">{platformSettings.PARTICIPANT_BASE_REWARD} points</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Bonus per Block</label>
                        {settingsMode === 'edit' ? (
                          <Input
                            type="number"
                            value={editedSettings?.PARTICIPANT_BONUS_PER_BLOCK || 0}
                            onChange={(e) => setEditedSettings(prev => prev ? 
                              { ...prev, PARTICIPANT_BONUS_PER_BLOCK: parseInt(e.target.value) } : null
                            )}
                          />
                        ) : (
                          <p className="text-lg font-medium">{platformSettings.PARTICIPANT_BONUS_PER_BLOCK} points</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-4">Platform Revenue</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Platform Fee (%)</label>
                        {settingsMode === 'edit' ? (
                          <Input
                            type="number"
                            step="0.1"
                            value={editedSettings?.PLATFORM_FEE_PERCENT || 0}
                            onChange={(e) => setEditedSettings(prev => prev ? 
                              { ...prev, PLATFORM_FEE_PERCENT: parseFloat(e.target.value) } : null
                            )}
                          />
                        ) : (
                          <p className="text-lg font-medium">{platformSettings.PLATFORM_FEE_PERCENT}%</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Withdrawal Fee (%)</label>
                        {settingsMode === 'edit' ? (
                          <Input
                            type="number"
                            step="0.1"
                            value={editedSettings?.WITHDRAWAL_FEE_PERCENT || 0}
                            onChange={(e) => setEditedSettings(prev => prev ? 
                              { ...prev, WITHDRAWAL_FEE_PERCENT: parseFloat(e.target.value) } : null
                            )}
                          />
                        ) : (
                          <p className="text-lg font-medium">{platformSettings.WITHDRAWAL_FEE_PERCENT}%</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-4">Security Thresholds</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Fraud Detection Threshold</label>
                        {settingsMode === 'edit' ? (
                          <Input
                            type="number"
                            value={editedSettings?.FRAUD_DETECTION_THRESHOLD || 0}
                            onChange={(e) => setEditedSettings(prev => prev ? 
                              { ...prev, FRAUD_DETECTION_THRESHOLD: parseInt(e.target.value) } : null
                            )}
                          />
                        ) : (
                          <p className="text-lg font-medium">{platformSettings.FRAUD_DETECTION_THRESHOLD} points</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminAnalyticsDashboard;
