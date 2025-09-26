import React, { useState } from 'react';
import { CreditCard, Banknote, DollarSign, AlertCircle, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';

interface WalletData {
  balance: number;
  currency: string;
}

interface WithdrawalFormProps {
  wallet: WalletData;
  onSubmit: (data: WithdrawalFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  onWithdrawalSuccess?: () => Promise<void>;
}

export interface WithdrawalFormData {
  amount: number;
  payment_method: 'paypal' | 'bank_transfer' | 'crypto';
  payment_details: {
    email?: string;
    account_number?: string;
    routing_number?: string;
    bank_name?: string;
    wallet_address?: string;
  };
}

export const WithdrawalForm: React.FC<WithdrawalFormProps> = ({
  wallet,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const [formData, setFormData] = useState<WithdrawalFormData>({
    amount: 5.00,
    payment_method: 'paypal',
    payment_details: {}
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const minWithdrawal = 5.00;
  const maxWithdrawal = wallet.balance;
  const processingFee = 0.50; // $0.50 processing fee
  const netAmount = Math.max(0, formData.amount - processingFee);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: wallet.currency || 'USD'
    }).format(amount);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Amount validation
    if (formData.amount < minWithdrawal) {
      newErrors.amount = `Minimum withdrawal is ${formatCurrency(minWithdrawal)}`;
    } else if (formData.amount > maxWithdrawal) {
      newErrors.amount = `Cannot exceed wallet balance of ${formatCurrency(maxWithdrawal)}`;
    }

    // Payment method validation
    if (formData.payment_method === 'paypal') {
      if (!formData.payment_details.email) {
        newErrors.email = 'PayPal email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.payment_details.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    } else if (formData.payment_method === 'bank_transfer') {
      if (!formData.payment_details.account_number) {
        newErrors.account_number = 'Account number is required';
      }
      if (!formData.payment_details.routing_number) {
        newErrors.routing_number = 'Routing number is required';
      }
      if (!formData.payment_details.bank_name) {
        newErrors.bank_name = 'Bank name is required';
      }
    } else if (formData.payment_method === 'crypto') {
      if (!formData.payment_details.wallet_address) {
        newErrors.wallet_address = 'Wallet address is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors below');
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Withdrawal submission error:', error);
    }
  };

  const handleAmountChange = (value: string) => {
    const amount = parseFloat(value) || 0;
    setFormData(prev => ({ ...prev, amount }));
    
    // Clear amount error when user types
    if (errors.amount) {
      setErrors(prev => ({ ...prev, amount: '' }));
    }
  };

  const handlePaymentMethodChange = (method: WithdrawalFormData['payment_method']) => {
    setFormData(prev => ({
      ...prev,
      payment_method: method,
      payment_details: {} // Clear payment details when method changes
    }));
    
    // Clear payment-related errors
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.email;
      delete newErrors.account_number;
      delete newErrors.routing_number;
      delete newErrors.bank_name;
      delete newErrors.wallet_address;
      return newErrors;
    });
  };

  const updatePaymentDetails = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      payment_details: {
        ...prev.payment_details,
        [field]: value
      }
    }));

    // Clear field-specific error
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-green-600" />
          Request Withdrawal
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Amount Section */}
          <div className="space-y-3">
            <Label htmlFor="amount" className="text-base font-medium">
              Withdrawal Amount
            </Label>
            <div className="relative">
              <Input
                id="amount"
                type="number"
                step="0.01"
                min={minWithdrawal}
                max={maxWithdrawal}
                value={formData.amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                className={`pl-8 ${errors.amount ? 'border-red-500' : ''}`}
                placeholder="0.00"
              />
              <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            </div>
            {errors.amount && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.amount}
              </p>
            )}
            <div className="text-sm text-gray-600">
              Available balance: {formatCurrency(wallet.balance)}
            </div>
          </div>

          {/* Processing Fee Summary */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">Withdrawal Summary</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Withdrawal amount:</span>
                <span>{formatCurrency(formData.amount)}</span>
              </div>
              <div className="flex justify-between text-blue-700">
                <span>Processing fee:</span>
                <span>-{formatCurrency(processingFee)}</span>
              </div>
              <div className="flex justify-between font-medium border-t border-blue-200 pt-1">
                <span>You will receive:</span>
                <span className="text-green-600">{formatCurrency(netAmount)}</span>
              </div>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Payment Method</Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'paypal', label: 'PayPal', icon: CreditCard, description: '1-2 business days' },
                { id: 'bank_transfer', label: 'Bank Transfer', icon: Banknote, description: '3-5 business days' },
                { id: 'crypto', label: 'Crypto', icon: DollarSign, description: 'Usually instant', disabled: true }
              ].map((method) => (
                <button
                  key={method.id}
                  type="button"
                  disabled={method.disabled}
                  onClick={() => handlePaymentMethodChange(method.id as WithdrawalFormData['payment_method'])}
                  className={`
                    p-4 border rounded-lg text-left transition-all
                    ${formData.payment_method === method.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                    }
                    ${method.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <method.icon className="h-4 w-4" />
                    <span className="font-medium">{method.label}</span>
                    {method.disabled && <Badge variant="secondary" className="text-xs">Soon</Badge>}
                  </div>
                  <div className="text-sm text-gray-600">{method.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Payment Details */}
          <div className="space-y-4">
            {formData.payment_method === 'paypal' && (
              <div>
                <Label htmlFor="email" className="text-base font-medium">
                  PayPal Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.payment_details.email || ''}
                  onChange={(e) => updatePaymentDetails('email', e.target.value)}
                  className={errors.email ? 'border-red-500' : ''}
                  placeholder="your-email@example.com"
                />
                {errors.email && (
                  <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.email}
                  </p>
                )}
              </div>
            )}

            {formData.payment_method === 'bank_transfer' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="bank_name" className="text-base font-medium">
                    Bank Name
                  </Label>
                  <Input
                    id="bank_name"
                    value={formData.payment_details.bank_name || ''}
                    onChange={(e) => updatePaymentDetails('bank_name', e.target.value)}
                    className={errors.bank_name ? 'border-red-500' : ''}
                    placeholder="Your Bank Name"
                  />
                  {errors.bank_name && (
                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.bank_name}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="account_number" className="text-base font-medium">
                    Account Number
                  </Label>
                  <Input
                    id="account_number"
                    value={formData.payment_details.account_number || ''}
                    onChange={(e) => updatePaymentDetails('account_number', e.target.value)}
                    className={errors.account_number ? 'border-red-500' : ''}
                    placeholder="Your account number"
                  />
                  {errors.account_number && (
                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.account_number}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="routing_number" className="text-base font-medium">
                    Routing Number
                  </Label>
                  <Input
                    id="routing_number"
                    value={formData.payment_details.routing_number || ''}
                    onChange={(e) => updatePaymentDetails('routing_number', e.target.value)}
                    className={errors.routing_number ? 'border-red-500' : ''}
                    placeholder="9-digit routing number"
                  />
                  {errors.routing_number && (
                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.routing_number}
                    </p>
                  )}
                </div>
              </div>
            )}

            {formData.payment_method === 'crypto' && (
              <div>
                <Label htmlFor="wallet_address" className="text-base font-medium">
                  Wallet Address
                </Label>
                <Input
                  id="wallet_address"
                  value={formData.payment_details.wallet_address || ''}
                  onChange={(e) => updatePaymentDetails('wallet_address', e.target.value)}
                  className={errors.wallet_address ? 'border-red-500' : ''}
                  placeholder="Your crypto wallet address"
                />
                {errors.wallet_address && (
                  <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.wallet_address}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={loading}
              className="flex-1"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || netAmount <= 0}
              isLoading={loading}
              className="flex-1"
            >
              <Check className="h-4 w-4 mr-2" />
              Request Withdrawal
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
