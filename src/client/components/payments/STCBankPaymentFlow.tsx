import React, { useState, useEffect } from 'react';
import { stcBankService, STCPaymentIntent, PaymentProvider } from '../../services/payment.service';

interface STCBankPaymentFlowProps {
  amount: number;
  currency?: string;
  description?: string;
  metadata?: Record<string, string | number>;
  onSuccess?: (paymentId: string) => void;
  onError?: (error: string) => void;
  onCancel?: () => void;
}

const STCBankPaymentFlow: React.FC<STCBankPaymentFlowProps> = ({
  amount,
  currency = 'SAR',
  description = 'ResearchHub Payment',
  metadata = {},
  onSuccess,
  onError,
  onCancel
}) => {
  const [loading, setLoading] = useState(false);
  const [paymentIntent, setPaymentIntent] = useState<STCPaymentIntent | null>(null);
  const [providers, setProviders] = useState<PaymentProvider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<'stcbank' | 'dodopayments'>('stcbank');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadPaymentProviders();
  }, []);

  const loadPaymentProviders = async () => {
    try {
      const response = await stcBankService.getPaymentProviders();
      if (response.success && response.providers) {
        setProviders(response.providers);
        if (response.default) {
          setSelectedProvider(response.default as 'stcbank' | 'dodopayments');
        }
      }
    } catch (err) {
      console.error('Failed to load payment providers:', err);
    }
  };

  const createPaymentIntent = async () => {
    if (!amount || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await stcBankService.createPaymentIntent(
        amount,
        currency,
        description,
        metadata
      );

      if (response.success && response.paymentIntent) {
        setPaymentIntent(response.paymentIntent);
      } else {
        setError(response.error || 'Failed to create payment intent');
        onError?.(response.error || 'Payment creation failed');
      }
    } catch (error) {
      const errorMessage = 'Failed to create payment intent';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = () => {
    if (paymentIntent) {
      // Redirect to STC Bank payment page
      stcBankService.redirectToPayment(paymentIntent);
      // Call success callback with payment ID for tracking
      onSuccess?.(paymentIntent.payment_id);
    }
  };

  const handleCancel = () => {
    setPaymentIntent(null);
    setError('');
    onCancel?.();
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  };

  const selectedProviderInfo = providers.find(p => p.name === selectedProvider);
  const fees = selectedProviderInfo ? 
    (amount * selectedProviderInfo.fees.percentage / 100) + selectedProviderInfo.fees.fixed : 0;
  const totalAmount = amount + fees;

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Complete Your Payment
        </h3>
        <p className="text-gray-600">
          {description}
        </p>
      </div>

      {!paymentIntent ? (
        <div className="space-y-4">
          {/* Payment Provider Selection */}
          {providers.length > 1 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method
              </label>
              <div className="space-y-2">
                {providers.map((provider) => (
                  <label key={provider.name} className="flex items-center">
                    <input
                      type="radio"
                      name="provider"
                      value={provider.name}
                      checked={selectedProvider === provider.name}
                      onChange={(e) => setSelectedProvider(e.target.value as 'stcbank' | 'dodopayments')}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium">{provider.display_name}</div>
                      <div className="text-xs text-gray-500">
                        Supported: {provider.supported_currencies.join(', ')}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Payment Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Amount:</span>
              <span className="font-medium">{formatAmount(amount, currency)}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Processing Fee:</span>
              <span className="font-medium">{formatAmount(fees, currency)}</span>
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-900">Total:</span>
                <span className="font-bold text-lg">{formatAmount(totalAmount, currency)}</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <div className="text-red-800 text-sm">{error}</div>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              onClick={createPaymentIntent}
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Payment...
                </div>
              ) : (
                'Continue to Payment'
              )}
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-3 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Payment Intent Created */}
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  Payment Ready
                </h3>
                <div className="mt-1 text-sm text-green-700">
                  Click below to complete your payment securely with STC Bank.
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Payment ID:</span>
                <span className="font-mono text-xs">{paymentIntent.payment_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-medium">{formatAmount(paymentIntent.amount / 100, paymentIntent.currency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="capitalize font-medium">{paymentIntent.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Expires:</span>
                <span className="text-sm">{new Date(paymentIntent.expires_at).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handlePayment}
              className="flex-1 bg-green-600 text-white py-3 px-4 rounded-md font-medium hover:bg-green-700 transition-colors"
            >
              Pay with STC Bank
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-3 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default STCBankPaymentFlow;
