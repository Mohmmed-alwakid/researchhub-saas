import React, { useState, useEffect, useCallback } from 'react';
import {
  DollarSign,
  TrendingUp,
  Users,
  CreditCard,
  Download,
  AlertCircle
} from 'lucide-react';
import { getEnhancedFinancialOverview, type FinancialReport } from '../../services/admin.service';

interface FinancialDashboardProps {
  className?: string;
}

export const FinancialDashboard: React.FC<FinancialDashboardProps> = ({ className = '' }) => {
  const [financial, setFinancial] = useState<FinancialReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  const fetchFinancialData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getEnhancedFinancialOverview();
      setFinancial(data as FinancialReport);
    } catch (err) {
      console.error('Failed to fetch financial data:', err);
      setError('Failed to load financial data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFinancialData();
  }, [fetchFinancialData]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getTimeframeLabel = (tf: string) => {
    switch (tf) {
      case '7d': return 'Last 7 Days';
      case '30d': return 'Last 30 Days';
      case '90d': return 'Last 90 Days';
      case '1y': return 'Last Year';
      default: return 'Last 30 Days';
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Financial Data Unavailable</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchFinancialData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!financial) {
    return null;
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Financial Dashboard</h2>
          <p className="text-gray-600">Revenue, subscriptions, and financial metrics</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as '7d' | '30d' | '90d' | '1y')}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            aria-label="Select timeframe for financial data"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>
          <button 
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            title="Download financial report"
            aria-label="Download financial report"
          >
            <Download className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Key Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-green-500 rounded-lg">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div className="text-sm font-medium text-green-600">
              +{Math.round((financial.summary.totalRevenue / 10000) * 100)}%
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(financial.summary.totalRevenue)}
            </div>
            <div className="text-sm text-gray-600">Total Revenue</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-blue-500 rounded-lg">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div className="text-sm font-medium text-green-600">
              +{Math.round((financial.summary.mrr / 1000) * 100)}%
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(financial.summary.mrr)}
            </div>
            <div className="text-sm text-gray-600">Monthly Recurring Revenue</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-purple-500 rounded-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className="text-sm font-medium text-green-600">
              +{Math.round((financial.summary.activeSubscriptions / financial.summary.totalCustomers) * 100)}%
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-gray-900">
              {financial.summary.activeSubscriptions}
            </div>
            <div className="text-sm text-gray-600">Active Subscriptions</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-red-500 rounded-lg">
              <CreditCard className="h-6 w-6 text-white" />
            </div>
            <div className="text-sm font-medium text-red-600">
              {financial.summary.churnRate}%
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-gray-900">
              {financial.summary.cancelledSubscriptions}
            </div>
            <div className="text-sm text-gray-600">Churn Rate</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trends */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Revenue Trends</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Daily Revenue ({getTimeframeLabel(timeframe)})</span>
              <span className="text-sm text-gray-500">
                Avg: {formatCurrency(financial.trends.revenue.reduce((sum, r) => sum + r.revenue, 0) / financial.trends.revenue.length)}
              </span>
            </div>
            <div className="h-32 bg-gray-100 rounded-lg p-2 flex items-end space-x-1">
              {financial.trends.revenue.map((trend, index) => {
                const maxRevenue = Math.max(...financial.trends.revenue.map(r => r.revenue));
                const heightPercent = Math.max((trend.revenue / maxRevenue) * 100, 5);
                return (
                  <div
                    key={index}
                    className="bg-green-500 rounded-t flex-1 transition-all hover:bg-green-600"
                    style={{ height: `${heightPercent}%` }}
                    title={`${trend.date}: ${formatCurrency(trend.revenue)}`}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Plan Breakdown */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Revenue by Plan</h3>
          <div className="space-y-3">
            {Object.entries(financial.breakdown.byPlan).map(([plan, revenue]) => {
              const totalRevenue = Object.values(financial.breakdown.byPlan).reduce((sum, r) => sum + r, 0);
              const percentage = totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0;
              return (
                <div key={plan} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{plan}</span>
                    <span className="text-sm text-gray-500">{formatCurrency(revenue)} ({percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Customers */}
      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Top Customers</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subscriptions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {financial.breakdown.topCustomers.map((customer, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {customer.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {customer.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(customer.totalRevenue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {customer.subscriptionCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>  );
};

export default FinancialDashboard;
