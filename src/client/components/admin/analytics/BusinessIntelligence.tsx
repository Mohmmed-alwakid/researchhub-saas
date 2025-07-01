import React, { useState, useEffect, useCallback } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Target, 
  Users,
  BarChart3,
  PieChart,
  Calendar,
  Download
} from 'lucide-react';

interface RevenueMetrics {
  totalRevenue: number;
  monthlyRecurringRevenue: number;
  averageOrderValue: number;
  revenueGrowthRate: number;
  churnRate: number;
  lifetimeValue: number;
}

interface CustomerMetrics {
  totalCustomers: number;
  activeCustomers: number;
  newCustomers: number;
  customerAcquisitionCost: number;
  customerSatisfactionScore: number;
  retentionRate: number;
}

interface ProductMetrics {
  totalStudies: number;
  averageStudyCompletion: number;
  popularTemplates: string[];
  featureAdoptionRate: number;
}

interface BusinessIntelligenceData {
  period: string;
  revenue: RevenueMetrics;
  customers: CustomerMetrics;
  product: ProductMetrics;
  trends: {
    date: string;
    revenue: number;
    customers: number;
    studies: number;
  }[];
  segments: {
    segment: string;
    revenue: number;
    customers: number;
    percentage: number;
  }[];
  forecasts: {
    metric: string;
    current: number;
    projected: number;
    confidence: number;
  }[];
}

export const BusinessIntelligence: React.FC = () => {
  const [data, setData] = useState<BusinessIntelligenceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('3m');
  const [viewMode, setViewMode] = useState<'overview' | 'detailed' | 'forecasts'>('overview');

  const fetchBusinessData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/analytics/business?timeRange=${timeRange}`);
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch business intelligence data:', error);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchBusinessData();
  }, [fetchBusinessData]);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatPercentage = (percentage: number): string => {
    return `${percentage.toFixed(1)}%`;
  };

  const handleExportReport = () => {
    // Implementation for exporting business intelligence report
    console.log('Exporting BI report...');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Failed to load business intelligence data</p>
        <button 
          onClick={fetchBusinessData}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="1m">Last month</option>
            <option value="3m">Last 3 months</option>
            <option value="6m">Last 6 months</option>
            <option value="1y">Last year</option>
          </select>
          
          <div className="flex border border-gray-300 rounded">
            <button
              onClick={() => setViewMode('overview')}
              className={`px-3 py-2 text-sm ${
                viewMode === 'overview' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setViewMode('detailed')}
              className={`px-3 py-2 text-sm ${
                viewMode === 'detailed' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Detailed
            </button>
            <button
              onClick={() => setViewMode('forecasts')}
              className={`px-3 py-2 text-sm ${
                viewMode === 'forecasts' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Forecasts
            </button>
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={handleExportReport}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
          <button
            onClick={fetchBusinessData}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Revenue Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(data.revenue.totalRevenue)}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600">
              +{formatPercentage(data.revenue.revenueGrowthRate)} growth
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">MRR</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(data.revenue.monthlyRecurringRevenue)}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-600">
              {formatPercentage(data.revenue.churnRate)} churn rate
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Customers</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(data.customers.activeCustomers)}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-600">
              +{formatNumber(data.customers.newCustomers)} new this period
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">AOV</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(data.revenue.averageOrderValue)}
              </p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <Target className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-600">
              {formatCurrency(data.revenue.lifetimeValue)} LTV
            </span>
          </div>
        </div>
      </div>

      {viewMode === 'detailed' && (
        <>
          {/* Customer Segments */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <PieChart className="w-5 h-5 mr-2" />
              Customer Segments
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {data.segments.map((segment, index) => (
                <div key={index} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">{segment.segment}</h4>
                    <span className="text-sm text-gray-600">
                      {formatPercentage(segment.percentage)}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Revenue</span>
                      <span className="font-medium">{formatCurrency(segment.revenue)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Customers</span>
                      <span className="font-medium">{formatNumber(segment.customers)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Product Metrics */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Product Performance
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Study Creation</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Studies</span>
                    <span className="font-medium">{formatNumber(data.product.totalStudies)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Avg. Completion</span>
                    <span className="font-medium">{formatPercentage(data.product.averageStudyCompletion)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Feature Adoption</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Adoption Rate</span>
                    <span className="font-medium">{formatPercentage(data.product.featureAdoptionRate)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Popular Templates</h4>
                <div className="space-y-1">
                  {data.product.popularTemplates.slice(0, 3).map((template, index) => (
                    <div key={index} className="text-sm text-gray-600">
                      {index + 1}. {template}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {viewMode === 'forecasts' && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Forecasts</h3>
          <div className="space-y-6">
            {data.forecasts.map((forecast, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">{forecast.metric}</h4>
                  <span className="text-sm text-gray-600">
                    {formatPercentage(forecast.confidence)} confidence
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Current</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {forecast.metric.includes('Revenue') || forecast.metric.includes('Cost') 
                        ? formatCurrency(forecast.current)
                        : formatNumber(forecast.current)
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Projected</p>
                    <p className="text-lg font-semibold text-green-600">
                      {forecast.metric.includes('Revenue') || forecast.metric.includes('Cost') 
                        ? formatCurrency(forecast.projected)
                        : formatNumber(forecast.projected)
                      }
                    </p>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${forecast.confidence}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
