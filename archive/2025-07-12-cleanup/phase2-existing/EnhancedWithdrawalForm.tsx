import React, { useState, useEffect } from 'react';
import { CreditCard, Banknote, DollarSign, AlertCircle, Check, X, Shield, Clock, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Badge } from '../ui/Badge';
import toast from 'react-hot-toast';
import { formatCurrency, SupportedCurrency, CURRENCY_CONFIG, convertCurrency } from '../../services/wallet.service';

interface WalletData {
  balance: number;
  currency: SupportedCurrency;
  total_withdrawn?: number;
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

interface WithdrawalLimits {
  min: number;
  max: number;
  daily: number;
  monthly: number;
  processingFee: number;
}

export const EnhancedWithdrawalForm: React.FC<WithdrawalFormProps> = ({
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
  const [isValidating, setIsValidating] = useState(false);
  const [step, setStep] = useState<'amount' | 'method' | 'details' | 'review'>('amount');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<SupportedCurrency>(wallet.currency || 'USD');

  // Enhanced withdrawal limits and fees based on currency
  const limits: WithdrawalLimits = {
    min: selectedCurrency === 'USD' ? 5.00 : 18.75, // ~5 USD in SAR
    max: Math.min(convertCurrency(wallet.balance, wallet.currency, selectedCurrency), selectedCurrency === 'USD' ? 1000.00 : 3750.00),
    daily: selectedCurrency === 'USD' ? 500.00 : 1875.00,
    monthly: selectedCurrency === 'USD' ? 2000.00 : 7500.00,
    processingFee: formData.payment_method === 'crypto' ? (selectedCurrency === 'USD' ? 2.00 : 7.50) : (selectedCurrency === 'USD' ? 0.50 : 1.88)
  };

  const netAmount = Math.max(0, formData.amount - limits.processingFee);
  const canWithdraw = wallet.balance >= limits.min && formData.amount >= limits.min;

  const formatWalletCurrency = (amount: number, currency: SupportedCurrency = selectedCurrency) => {
    return formatCurrency(amount, currency);
  };

  // Enhanced validation with real-time feedback
  const validateStep = async (stepToValidate: string): Promise<boolean> => {
    setIsValidating(true);
    const newErrors: Record<string, string> = {};

    try {
      switch (stepToValidate) {
        case 'amount':
          if (formData.amount < limits.min) {
            newErrors.amount = `Minimum withdrawal is ${formatWalletCurrency(limits.min)}`;
          } else if (formData.amount > limits.max) {
            newErrors.amount = `Cannot exceed ${formatWalletCurrency(limits.max)}`;
          } else if (formData.amount > wallet.balance) {
            newErrors.amount = `Insufficient balance: ${formatWalletCurrency(wallet.balance, wallet.currency)}`;
          } else if (formData.amount > limits.daily) {
            newErrors.amount = `Daily limit exceeded: ${formatWalletCurrency(limits.daily)}`;
          }
          break;

        case 'method':
          if (!formData.payment_method) {
            newErrors.payment_method = 'Please select a payment method';
          }
          break;

        case 'details':
          if (formData.payment_method === 'paypal') {
            if (!formData.payment_details.email) {
              newErrors.email = 'PayPal email is required';
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.payment_details.email)) {
              newErrors.email = 'Please enter a valid email address';
            }
          } else if (formData.payment_method === 'bank_transfer') {
            if (!formData.payment_details.account_number) {
              newErrors.account_number = 'Account number is required';
            } else if (formData.payment_details.account_number.length < 8) {
              newErrors.account_number = 'Account number must be at least 8 digits';
            }
            if (!formData.payment_details.routing_number) {
              newErrors.routing_number = 'Routing number is required';
            } else if (!/^\d{9}$/.test(formData.payment_details.routing_number)) {
              newErrors.routing_number = 'Routing number must be exactly 9 digits';
            }
            if (!formData.payment_details.bank_name) {
              newErrors.bank_name = 'Bank name is required';
            }
          } else if (formData.payment_method === 'crypto') {
            if (!formData.payment_details.wallet_address) {
              newErrors.wallet_address = 'Wallet address is required';
            } else if (formData.payment_details.wallet_address.length < 26) {
              newErrors.wallet_address = 'Invalid wallet address format';
            }
          }
          break;

        case 'review':
          if (!agreedToTerms) {
            newErrors.terms = 'You must agree to the terms and conditions';
          }
          break;
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    } finally {
      setIsValidating(false);
    }
  };

  const handleNextStep = async () => {
    const isValid = await validateStep(step);
    if (isValid) {
      const steps = ['amount', 'method', 'details', 'review'];
      const currentIndex = steps.indexOf(step);
      if (currentIndex < steps.length - 1) {
        setStep(steps[currentIndex + 1] as any);
      }
    }
  };

  const handlePrevStep = () => {
    const steps = ['amount', 'method', 'details', 'review'];
    const currentIndex = steps.indexOf(step);
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1] as any);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const isValid = await validateStep('review');
    if (!isValid) return;

    try {
      await onSubmit(formData);
      toast.success('Withdrawal request submitted successfully!');
    } catch (error) {
      console.error('Withdrawal failed:', error);
    }
  };

  // Real-time validation on input change
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      validateStep(step);
    }
  }, [formData, step]);

  const getStepIcon = (stepName: string) => {
    const steps = ['amount', 'method', 'details', 'review'];
    const currentIndex = steps.indexOf(step);
    const stepIndex = steps.indexOf(stepName);
    
    if (stepIndex < currentIndex) {
      return <Check className="h-4 w-4 text-green-600" />;
    } else if (stepIndex === currentIndex) {
      return <div className="h-4 w-4 rounded-full bg-blue-600"></div>;
    } else {
      return <div className="h-4 w-4 rounded-full bg-gray-300"></div>;
    }
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-green-600" />
          Request Withdrawal
        </CardTitle>
        
        {/* Progress Steps */}
        <div className="flex items-center justify-between mt-4">
          {['amount', 'method', 'details', 'review'].map((stepName, index) => (
            <div key={stepName} className="flex items-center">
              <div className="flex flex-col items-center">
                {getStepIcon(stepName)}
                <span className="text-xs mt-1 capitalize">{stepName}</span>
              </div>
              {index < 3 && (
                <div className="w-8 h-px bg-gray-300 mx-2"></div>
              )}
            </div>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Amount */}
          {step === 'amount' && (
            <div className="space-y-4">
              {/* Currency Selection */}
              <div>
                <Label htmlFor="currency">Withdrawal Currency</Label>
                <select
                  id="currency"
                  value={selectedCurrency}
                  onChange={(e) => setSelectedCurrency(e.target.value as SupportedCurrency)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="USD">🇺🇸 USD - US Dollar</option>
                  <option value="SAR">🇸🇦 SAR - Saudi Riyal</option>
                </select>
                {selectedCurrency !== wallet.currency && (
                  <p className="text-xs text-amber-600 mt-1">
                    Converting from {wallet.currency} to {selectedCurrency} (rates may apply)
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="amount">Withdrawal Amount</Label>
                <div className="relative mt-1">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min={limits.min}
                    max={limits.max}
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                    className={`pl-10 ${errors.amount ? 'border-red-500' : ''}`}
                    placeholder="0.00"
                  />
                </div>
                {errors.amount && (
                  <p className="text-sm text-red-600 mt-1">{errors.amount}</p>
                )}
              </div>

              {/* Amount Info */}
              <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Available Balance:</span>
                  <span className="font-semibold">{formatWalletCurrency(wallet.balance, wallet.currency)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Processing Fee:</span>
                  <span>{formatWalletCurrency(limits.processingFee)}</span>
                </div>
                <div className="flex justify-between text-sm border-t pt-2">
                  <span className="font-semibold">You'll Receive:</span>
                  <span className="font-semibold text-green-600">{formatWalletCurrency(netAmount)}</span>
                </div>
              </div>

              {/* Limits Info */}
              <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
                <div>
                  <span className="block">Daily Limit:</span>
                  <span className="font-medium">{formatWalletCurrency(limits.daily)}</span>
                </div>
                <div>
                  <span className="block">Monthly Limit:</span>
                  <span className="font-medium">{formatWalletCurrency(limits.monthly)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Payment Method */}
          {step === 'method' && (
            <div className="space-y-4">
              <Label>Select Payment Method</Label>
              <div className="grid gap-3">
                {/* PayPal Option */}
                <div
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    formData.payment_method === 'paypal'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, payment_method: 'paypal' }))}
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="font-medium">PayPal</div>
                      <div className="text-sm text-gray-600">Fee: $0.50 • Processing: 1-2 business days</div>
                    </div>
                  </div>
                </div>

                {/* Bank Transfer Option */}
                <div
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    formData.payment_method === 'bank_transfer'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, payment_method: 'bank_transfer' }))}
                >
                  <div className="flex items-center gap-3">
                    <Banknote className="h-5 w-5 text-green-600" />
                    <div>
                      <div className="font-medium">Bank Transfer</div>
                      <div className="text-sm text-gray-600">Fee: $0.50 • Processing: 3-5 business days</div>
                    </div>
                  </div>
                </div>

                {/* Crypto Option */}
                <div
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    formData.payment_method === 'crypto'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, payment_method: 'crypto' }))}
                >
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-orange-600" />
                    <div>
                      <div className="font-medium">Cryptocurrency (USDC)</div>
                      <div className="text-sm text-gray-600">Fee: $2.00 • Processing: 10-30 minutes</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Payment Details */}
          {step === 'details' && (
            <div className="space-y-4">
              <Label>Payment Details</Label>
              
              {formData.payment_method === 'paypal' && (
                <div>
                  <Label htmlFor="email">PayPal Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.payment_details.email || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      payment_details: { ...prev.payment_details, email: e.target.value }
                    }))}
                    className={errors.email ? 'border-red-500' : ''}
                    placeholder="your-email@example.com"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600 mt-1">{errors.email}</p>
                  )}
                </div>
              )}

              {formData.payment_method === 'bank_transfer' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="account_number">Account Number</Label>
                    <Input
                      id="account_number"
                      type="text"
                      value={formData.payment_details.account_number || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        payment_details: { ...prev.payment_details, account_number: e.target.value }
                      }))}
                      className={errors.account_number ? 'border-red-500' : ''}
                      placeholder="123456789"
                    />
                    {errors.account_number && (
                      <p className="text-sm text-red-600 mt-1">{errors.account_number}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="routing_number">Routing Number</Label>
                    <Input
                      id="routing_number"
                      type="text"
                      value={formData.payment_details.routing_number || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        payment_details: { ...prev.payment_details, routing_number: e.target.value }
                      }))}
                      className={errors.routing_number ? 'border-red-500' : ''}
                      placeholder="123456789"
                    />
                    {errors.routing_number && (
                      <p className="text-sm text-red-600 mt-1">{errors.routing_number}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="bank_name">Bank Name</Label>
                    <Input
                      id="bank_name"
                      type="text"
                      value={formData.payment_details.bank_name || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        payment_details: { ...prev.payment_details, bank_name: e.target.value }
                      }))}
                      className={errors.bank_name ? 'border-red-500' : ''}
                      placeholder="Bank of America"
                    />
                    {errors.bank_name && (
                      <p className="text-sm text-red-600 mt-1">{errors.bank_name}</p>
                    )}
                  </div>
                </div>
              )}

              {formData.payment_method === 'crypto' && (
                <div>
                  <Label htmlFor="wallet_address">USDC Wallet Address</Label>
                  <Input
                    id="wallet_address"
                    type="text"
                    value={formData.payment_details.wallet_address || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      payment_details: { ...prev.payment_details, wallet_address: e.target.value }
                    }))}
                    className={errors.wallet_address ? 'border-red-500' : ''}
                    placeholder="0x742d35Cc6A7d7D7D7D7D7D7D7D7D7D7D"
                  />
                  {errors.wallet_address && (
                    <p className="text-sm text-red-600 mt-1">{errors.wallet_address}</p>
                  )}
                  <p className="text-xs text-gray-600 mt-1">
                    Only USDC on Ethereum network is supported
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Review */}
          {step === 'review' && (
            <div className="space-y-4">
              <Label>Review Withdrawal</Label>
              
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="flex justify-between">
                  <span>Amount:</span>
                  <span className="font-semibold">{formatWalletCurrency(formData.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Processing Fee:</span>
                  <span>{formatWalletCurrency(limits.processingFee)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-semibold">You'll Receive:</span>
                  <span className="font-semibold text-green-600">{formatWalletCurrency(netAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Method:</span>
                  <span className="capitalize">{formData.payment_method.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Processing Time:</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formData.payment_method === 'crypto' ? '10-30 min' : 
                     formData.payment_method === 'paypal' ? '1-2 days' : '3-5 days'}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1"
                />
                <label htmlFor="terms" className="text-sm text-gray-600">
                  I agree to the withdrawal terms and conditions. I understand that this request cannot be cancelled once submitted.
                </label>
              </div>
              {errors.terms && (
                <p className="text-sm text-red-600">{errors.terms}</p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            {step !== 'amount' && (
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevStep}
                disabled={loading || isValidating}
                className="flex-1"
              >
                Back
              </Button>
            )}
            
            {step !== 'review' ? (
              <Button
                type="button"
                onClick={handleNextStep}
                disabled={loading || isValidating || !canWithdraw}
                className="flex-1"
              >
                {isValidating ? 'Validating...' : 'Next'}
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={loading || isValidating || !canWithdraw || !agreedToTerms}
                className="flex-1"
              >
                {loading ? 'Processing...' : 'Submit Withdrawal'}
              </Button>
            )}
            
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>

          {!canWithdraw && (
            <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">Cannot process withdrawal</p>
                <p>Minimum withdrawal amount is {formatWalletCurrency(limits.min)} and you need sufficient balance.</p>
              </div>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};