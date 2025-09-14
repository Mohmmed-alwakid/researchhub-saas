import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Coins, 
  CreditCard, 
  TrendingUp, 
  Calendar, 
  Gift, 
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign
} from 'lucide-react';

/**
 * Researcher Points Dashboard Component
 * 
 * Features:
 * - Current points balance display
 * - Subscription plan information
 * - Monthly point allocation status
 * - Points usage history and analytics
 * - Study cost calculator
 * - Plan upgrade options
 */

interface PointsBalance {
  userId: string;
  currentBalance: number;
  totalEarned: number;
  totalSpent: number;
  lastUpdated: string;
}

interface PlanInfo {
  currentPlan: string;
  planDetails: {
    name: string;
    monthlyPoints: number;
    price: number;
    features: string[];
  };
  monthlyAllocation: {
    total: number;
    allocated: number;
    remaining: number;
  };
  upgradeAvailable: boolean;
}

interface UsageStats {
  studiesCreated: number;
  pointsSpent: number;
  pointsEarned: number;
  averageCostPerStudy: number;
}

interface StudyCost {
  blockCount: number;
  participantCount: number;
  baseCost: number;
  blockCost: number;
  participantCost: number;
  totalCost: number;
}

const ResearcherPointsDashboard: React.FC = () => {
  const [balance, setBalance] = useState<PointsBalance | null>(null);
  const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Cost calculator state
  const [costCalc, setCostCalc] = useState({
    blocks: 5,
    participants: 10,
    cost: null as StudyCost | null
  });

  // Fetch all points data
  useEffect(() => {
    const fetchPointsData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken');
        
        // Fetch balance
        const balanceResponse = await fetch('/api/points?action=balance', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const balanceData = await balanceResponse.json();
        
        // Fetch plan info
        const planResponse = await fetch('/api/points?action=plan-info', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const planData = await planResponse.json();
        
        // Fetch usage stats
        const statsResponse = await fetch('/api/points?action=stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const statsData = await statsResponse.json();
        
        if (balanceData.success) setBalance(balanceData.balance);
        if (planData.success) setPlanInfo(planData.data);
        if (statsData.success) setUsageStats(statsData.stats);
        
      } catch (err) {
        setError('Failed to fetch points data');
        console.error('Points data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPointsData();
  }, []);

  // Calculate study cost
  const calculateCost = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/points?action=calculate-cost', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          blockCount: costCalc.blocks,
          participantCount: costCalc.participants
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setCostCalc(prev => ({ ...prev, cost: data.cost }));
      }
    } catch (err) {
      console.error('Cost calculation error:', err);
    }
  };

  // Allocate monthly points
  const allocateMonthlyPoints = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/points?action=allocate-monthly-points', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const data = await response.json();
      if (data.success) {
        // Refresh data
        window.location.reload();
      } else {
        setError(data.error);
      }
    } catch {
      setError('Failed to allocate monthly points');
    }
  };

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case 'free': return 'bg-gray-100 text-gray-800';
      case 'basic': return 'bg-blue-100 text-blue-800';
      case 'pro': return 'bg-purple-100 text-purple-800';
      case 'enterprise': return 'bg-gold-100 text-gold-800';
      default: return 'bg-gray-100 text-gray-800';
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Points Dashboard</h1>
          <p className="text-gray-600">Manage your research points and subscription</p>
        </div>
        {planInfo?.upgradeAvailable && (
          <Button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
            <TrendingUp className="w-4 h-4 mr-2" />
            Upgrade Plan
          </Button>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="calculator">Cost Calculator</TabsTrigger>
          <TabsTrigger value="history">Usage History</TabsTrigger>
          <TabsTrigger value="plan">Plan Details</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Current Balance Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
                <Coins className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {balance?.currentBalance || 0} points
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Last updated: {balance?.lastUpdated ? new Date(balance.lastUpdated).toLocaleDateString() : 'Never'}
                </p>
              </CardContent>
            </Card>

            {/* Total Earned Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
                <Gift className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {balance?.totalEarned || 0} points
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  All-time earnings
                </p>
              </CardContent>
            </Card>

            {/* Total Spent Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                <DollarSign className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {balance?.totalSpent || 0} points
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  On {usageStats?.studiesCreated || 0} studies
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Allocation Card */}
          {planInfo && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Monthly Point Allocation</span>
                  <Badge className={getPlanBadgeColor(planInfo.currentPlan)}>
                    {planInfo.planDetails.name}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    This month's allocation
                  </span>
                  <span className="font-semibold">
                    {planInfo.monthlyAllocation.allocated} / {planInfo.monthlyAllocation.total} points
                  </span>
                </div>
                
                <Progress 
                  value={(planInfo.monthlyAllocation.allocated / planInfo.monthlyAllocation.total) * 100}
                  className="w-full"
                />
                
                {planInfo.monthlyAllocation.remaining > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-green-600">
                      {planInfo.monthlyAllocation.remaining} points available to claim
                    </span>
                    <Button 
                      onClick={allocateMonthlyPoints}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Claim Points
                    </Button>
                  </div>
                )}
                
                {planInfo.monthlyAllocation.remaining === 0 && (
                  <div className="flex items-center text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                    All monthly points have been allocated
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Usage Statistics */}
          {usageStats && (
            <Card>
              <CardHeader>
                <CardTitle>Usage Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {usageStats.studiesCreated}
                    </div>
                    <div className="text-sm text-gray-600">Studies Created</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {usageStats.pointsSpent}
                    </div>
                    <div className="text-sm text-gray-600">Points Spent</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {usageStats.pointsEarned}
                    </div>
                    <div className="text-sm text-gray-600">Points Earned</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {usageStats.averageCostPerStudy}
                    </div>
                    <div className="text-sm text-gray-600">Avg Cost/Study</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Cost Calculator Tab */}
        <TabsContent value="calculator" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Study Cost Calculator</CardTitle>
              <p className="text-sm text-gray-600">
                Calculate how many points your next study will cost
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Blocks
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={costCalc.blocks}
                    onChange={(e) => setCostCalc(prev => ({ ...prev, blocks: parseInt(e.target.value) || 1 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    First 5 blocks are free
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Participants
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={costCalc.participants}
                    onChange={(e) => setCostCalc(prev => ({ ...prev, participants: parseInt(e.target.value) || 1 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    First 10 participants are free
                  </p>
                </div>
              </div>

              <Button onClick={calculateCost} className="w-full">
                Calculate Cost
              </Button>

              {costCalc.cost && (
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <h4 className="font-semibold text-gray-900">Cost Breakdown</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Base cost:</span>
                      <span>{costCalc.cost.baseCost} points</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Additional blocks ({Math.max(0, costCalc.cost.blockCount - 5)} × 2):</span>
                      <span>{costCalc.cost.blockCost} points</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Additional participants ({Math.max(0, costCalc.cost.participantCount - 10)} × 1):</span>
                      <span>{costCalc.cost.participantCost} points</span>
                    </div>
                    <hr className="my-2" />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total cost:</span>
                      <span className="text-blue-600">{costCalc.cost.totalCost} points</span>
                    </div>
                  </div>
                  
                  {balance && balance.currentBalance < costCalc.cost.totalCost && (
                    <Alert className="border-orange-200 bg-orange-50">
                      <AlertCircle className="h-4 w-4 text-orange-600" />
                      <AlertDescription className="text-orange-700">
                        Insufficient balance. You need {costCalc.cost.totalCost - balance.currentBalance} more points.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>Transaction history will be displayed here</p>
                <p className="text-sm">This feature will be implemented in the next update</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Plan Details Tab */}
        <TabsContent value="plan" className="space-y-6">
          {planInfo && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Current Plan</span>
                  <Badge className={getPlanBadgeColor(planInfo.currentPlan)}>
                    {planInfo.planDetails.name}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Plan Benefits</h4>
                    <ul className="space-y-1">
                      {planInfo.planDetails.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm text-gray-600">
                          <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Plan Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Monthly points:</span>
                        <span className="font-semibold">{planInfo.planDetails.monthlyPoints}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Monthly price:</span>
                        <span className="font-semibold">
                          {planInfo.planDetails.price > 0 ? `$${planInfo.planDetails.price}` : 'Free'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {planInfo.upgradeAvailable && (
                  <div className="pt-4 border-t">
                    <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Upgrade Plan
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ResearcherPointsDashboard;
