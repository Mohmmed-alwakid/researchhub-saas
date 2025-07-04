import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  CreditCard, 
  AlertCircle, 
  CheckCircle, 
  Loader2 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { pointsService } from '../../services/payment.service';

interface WithdrawalRequestFormProps {
  onSuccess?: () => void;
  className?: string;
}

export const WithdrawalRequestForm: React.FC<WithdrawalRequestFormProps> = ({ 
  onSuccess, 
  className = '' 
}) => {
  const [loading, setLoading] = useState(false);
  const [userPoints, setUserPoints] = useState(0);
  const [formData, setFormData] = useState({
    amount: '',
    method: 'paypal' as 'paypal' | 'bank_transfer',
    paypalEmail: '',
    bankAccount: '',
    routingNumber: '',
    notes: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Current conversion rate: 100 points = $1 USD
  const CONVERSION_RATE = 100;
  const MIN_WITHDRAWAL = 10; // $10 minimum
  const MAX_WITHDRAWAL = 1000; // $1000 maximum

  useEffect(() => {
    fetchUserPoints();
  }, []);

  const fetchUserPoints = async () => {
    try {
      const response = await pointsService.getBalance();
      if (response.success && response.balance) {
        setUserPoints(response.balance.currentBalance);
      }
    } catch (error) {
      console.error('Failed to fetch user points:', error);
      toast.error('Failed to load your points balance');
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Amount validation
    const amount = parseFloat(formData.amount);
    if (!amount || amount < MIN_WITHDRAWAL) {
      newErrors.amount = `Minimum withdrawal is $${MIN_WITHDRAWAL}`;
    } else if (amount > MAX_WITHDRAWAL) {
      newErrors.amount = `Maximum withdrawal is $${MAX_WITHDRAWAL}`;
    }

    // Points validation
    const requiredPoints = amount * CONVERSION_RATE;
    if (requiredPoints > userPoints) {
      newErrors.amount = `Insufficient points. You need ${requiredPoints} points but only have ${userPoints}`;
    }

    // Payment method validation
    if (formData.method === 'paypal' && !formData.paypalEmail) {
      newErrors.paypalEmail = 'PayPal email is required';
    } else if (formData.method === 'bank_transfer' && (!formData.bankAccount || !formData.routingNumber)) {
      newErrors.bankAccount = 'Bank account details are required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const amount = parseFloat(formData.amount);
      const paymentDetails = formData.method === 'paypal' ? 
        { email: formData.paypalEmail } :
        { accountNumber: formData.bankAccount, routingNumber: formData.routingNumber };

      const response = await pointsService.requestWithdrawal({
        amount,
        paymentMethod: formData.method,
        paymentDetails
      });

      if (response.success) {
        toast.success('Withdrawal request submitted successfully!');
        
        // Reset form
        setFormData({
          amount: '',
          method: 'paypal',
          paypalEmail: '',
          bankAccount: '',
          routingNumber: '',
          notes: ''
        });
        
        // Refresh points
        await fetchUserPoints();
        
        onSuccess?.();
      } else {
        toast.error(response.error || 'Failed to submit withdrawal request');
      }
    } catch (error) {
      console.error('Withdrawal request failed:', error);
      toast.error('Failed to submit withdrawal request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getMaxWithdrawal = () => {
    const maxFromPoints = Math.floor(userPoints / CONVERSION_RATE);
    return Math.min(maxFromPoints, MAX_WITHDRAWAL);
  };

  const renderPaymentMethodFields = () => {
    switch (formData.method) {
      case 'paypal':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              PayPal Email
            </label>
            <Input
              type="email"
              value={formData.paypalEmail}
              onChange={(e) => handleInputChange('paypalEmail', e.target.value)}
              placeholder="your.email@example.com"
              className={errors.paypalEmail ? 'border-red-500' : ''}
            />
            {errors.paypalEmail && (
              <p className="text-red-500 text-sm mt-1">{errors.paypalEmail}</p>
            )}
          </div>
        );
      
      case 'bank_transfer':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Number
              </label>
              <Input
                type="text"
                value={formData.bankAccount}
                onChange={(e) => handleInputChange('bankAccount', e.target.value)}
                placeholder="Account number"
                className={errors.bankAccount ? 'border-red-500' : ''}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Routing Number
              </label>
              <Input
                type="text"
                value={formData.routingNumber}
                onChange={(e) => handleInputChange('routingNumber', e.target.value)}
                placeholder="Routing number"
                className={errors.bankAccount ? 'border-red-500' : ''}
              />
            </div>
            {errors.bankAccount && (
              <p className="text-red-500 text-sm mt-1">{errors.bankAccount}</p>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <Card className={`max-w-2xl mx-auto ${className}`}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-green-600" />
          <h2 className="text-xl font-semibold">Request Withdrawal</h2>
        </div>
        <p className="text-gray-600">
          Convert your points to cash. Current rate: {CONVERSION_RATE} points = $1 USD
        </p>
      </CardHeader>
      
      <CardContent>
        {/* Points Balance */}
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Available Points</p>
              <p className="text-2xl font-bold text-blue-600">{userPoints.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Cash Value</p>
              <p className="text-2xl font-bold text-green-600">
                ${(userPoints / CONVERSION_RATE).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Withdrawal Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Withdrawal Amount ($)
            </label>
            <Input
              type="number"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              placeholder="0.00"
              min={MIN_WITHDRAWAL}
              max={getMaxWithdrawal()}
              step="0.01"
              className={errors.amount ? 'border-red-500' : ''}
            />
            {errors.amount && (
              <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
            )}
            <p className="text-sm text-gray-500 mt-1">
              Min: ${MIN_WITHDRAWAL}, Max: ${getMaxWithdrawal()}
            </p>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'paypal', label: 'PayPal', icon: CreditCard },
                { value: 'bank_transfer', label: 'Bank Transfer', icon: DollarSign }
              ].map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleInputChange('method', value)}
                  className={`p-3 border rounded-lg flex items-center justify-center gap-2 transition-colors ${
                    formData.method === value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Payment Method Fields */}
          {renderPaymentMethodFields()}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Any special instructions or notes..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none"
            />
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800">Important:</p>
                <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                  <li>• Withdrawals typically take 3-7 business days to process</li>
                  <li>• Processing fees may apply depending on payment method</li>
                  <li>• You'll receive an email confirmation once processed</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading || userPoints < MIN_WITHDRAWAL * CONVERSION_RATE}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Request Withdrawal
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
