import React, { useState, useEffect } from 'react';
import { 
  ArrowLeftRight, 
  TrendingUp, 
  TrendingDown,
  RefreshCw,
  AlertCircle,
  Info
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface ConversionRate {
  points: number;
  usd: number;
  lastUpdated: string;
  trend?: 'up' | 'down' | 'stable';
  change?: number;
}

interface ConversionRateDisplayProps {
  className?: string;
  showHistory?: boolean;
  showTrend?: boolean;
  interactive?: boolean;
}

export const ConversionRateDisplay: React.FC<ConversionRateDisplayProps> = ({
  className = '',
  showHistory = false,
  showTrend = false,
  interactive = false
}) => {
  const [currentRate, setCurrentRate] = useState<ConversionRate>({
    points: 100,
    usd: 1,
    lastUpdated: new Date().toISOString(),
    trend: 'stable',
    change: 0
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [convertFrom, setConvertFrom] = useState<'points' | 'usd'>('points');

  // In a real app, this would fetch from an API
  const fetchConversionRate = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulated API call - in real app, this would be an actual endpoint
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // For now, we use a fixed rate: 100 points = $1 USD
      const rate: ConversionRate = {
        points: 100,
        usd: 1,
        lastUpdated: new Date().toISOString(),
        trend: 'stable',
        change: 0
      };
      
      setCurrentRate(rate);
    } catch (err) {
      console.error('Failed to fetch conversion rate:', err);
      setError('Failed to fetch current conversion rate');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversionRate();
  }, []);

  const convertAmount = (value: string, from: 'points' | 'usd') => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue <= 0) return '';
    
    if (from === 'points') {
      return (numValue / currentRate.points).toFixed(2);
    } else {
      return (numValue * currentRate.points).toFixed(0);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPoints = (points: number) => {
    return new Intl.NumberFormat('en-US').format(points);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <ArrowLeftRight className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Current Rate Display */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ArrowLeftRight className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Conversion Rate</h3>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchConversionRate}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {error ? (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Rate Display */}
              <div className="flex items-center justify-center gap-4 p-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatPoints(currentRate.points)}
                  </div>
                  <div className="text-sm text-gray-600">Points</div>
                </div>
                
                <div className="text-2xl text-gray-400">
                  <ArrowLeftRight className="h-6 w-6" />
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(currentRate.usd)}
                  </div>
                  <div className="text-sm text-gray-600">USD</div>
                </div>
              </div>

              {/* Trend Information */}
              {showTrend && (
                <div className="flex items-center justify-center gap-2 text-sm">
                  {getTrendIcon(currentRate.trend || 'stable')}
                  <span className={getTrendColor(currentRate.trend || 'stable')}>
                    {currentRate.trend === 'stable' ? 'Stable rate' : 
                     currentRate.trend === 'up' ? 'Rate increased' : 'Rate decreased'}
                  </span>
                  {currentRate.change !== 0 && currentRate.change && (
                    <Badge variant="secondary" className="ml-2">
                      {currentRate.change > 0 ? '+' : ''}{currentRate.change}%
                    </Badge>
                  )}
                </div>
              )}

              {/* Last Updated */}
              <div className="text-center text-sm text-gray-500">
                Last updated: {formatDate(currentRate.lastUpdated)}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Interactive Converter */}
      {interactive && (
        <Card>
          <CardHeader>
            <h4 className="font-medium">Quick Converter</h4>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Input */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <select
                  value={convertFrom}
                  onChange={(e) => setConvertFrom(e.target.value as 'points' | 'usd')}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="points">Points</option>
                  <option value="usd">USD</option>
                </select>
              </div>

              {/* Result */}
              {amount && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {convertFrom === 'points' ? 'USD Value:' : 'Points Value:'}
                    </span>
                    <span className="font-semibold">
                      {convertFrom === 'points' ? 
                        formatCurrency(parseFloat(convertAmount(amount, 'points'))) :
                        formatPoints(parseFloat(convertAmount(amount, 'usd')))
                      }
                    </span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Information Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">How it Works</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Researchers purchase points to pay participants</li>
                <li>• Participants earn points by completing studies</li>
                <li>• Points can be withdrawn as real money</li>
                <li>• Current rate: {formatPoints(currentRate.points)} points = {formatCurrency(currentRate.usd)}</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
