import React, { useEffect, useState } from 'react';
import { stcBankService, STCPaymentVerification } from '../../services/payment.service';


interface PaymentResultProps {
  type: 'success' | 'failure' | 'cancel';
  paymentId?: string;
  onContinue?: () => void;
  onRetry?: () => void;
}

const PaymentResultPage: React.FC<PaymentResultProps> = ({ 
  type, 
  paymentId,
  onContinue,
  onRetry 
}) => {
  const [payment, setPayment] = useState<STCPaymentVerification | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {    
    if (paymentId && type === 'success') {
      verifyPayment(paymentId);
    } else {
      setLoading(false);
    }
  }, [paymentId, type]);

  const verifyPayment = async (paymentId: string) => {
    try {
      const response = await stcBankService.verifyPayment(paymentId);
      
      if (response.success && response.payment) {
        setPayment(response.payment);
      } else {
        setError(response.error || 'Failed to verify payment');
      }
    } catch {
      setError('Failed to verify payment');
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount / 100); // Convert from smallest unit
  };

  const handleContinue = () => {
    if (onContinue) {
      onContinue();
    } else {
      console.log('Navigate to dashboard');
    }
  };

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      console.log('Navigate to payment page');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {type === 'success' && (
            <>
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Payment Successful!
              </h2>
              <p className="text-gray-600 mb-6">
                Your payment has been processed successfully.
              </p>
              
              {payment && (
                <div className="bg-white rounded-lg shadow p-6 mb-6 text-left">
                  <h3 className="text-lg font-semibold mb-4">Payment Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment ID:</span>
                      <span className="font-mono text-sm">{payment.payment_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-semibold text-green-600">
                        {formatAmount(payment.amount, payment.currency)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="capitalize font-medium text-green-600">{payment.status}</span>
                    </div>
                    {payment.paid_at && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Paid At:</span>
                        <span className="text-sm">{new Date(payment.paid_at).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
                  <div className="text-yellow-800 text-sm">
                    <strong>Note:</strong> Payment was successful, but we couldn't verify all details. {error}
                  </div>
                </div>
              )}
            </>
          )}

          {type === 'failure' && (
            <>
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Payment Failed
              </h2>
              <p className="text-gray-600 mb-6">
                Your payment could not be processed. Please try again.
              </p>
              
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                <div className="text-red-800 text-sm">
                  <strong>Common reasons for payment failure:</strong>
                  <ul className="mt-2 list-disc list-inside">
                    <li>Insufficient funds</li>
                    <li>Card expired or blocked</li>
                    <li>Network connection issues</li>
                    <li>Payment timeout</li>
                  </ul>
                </div>
              </div>
            </>
          )}

          {type === 'cancel' && (
            <>
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-4">
                <svg className="h-8 w-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Payment Cancelled
              </h2>
              <p className="text-gray-600 mb-6">
                You cancelled the payment process.
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
                <div className="text-blue-800 text-sm">
                  <strong>No charges were made to your account.</strong> You can try again whenever you're ready.
                </div>
              </div>
            </>
          )}

          <div className="flex space-x-4 justify-center">
            {type === 'success' && (
              <button
                onClick={handleContinue}
                className="bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors"
              >
                Continue to Dashboard
              </button>
            )}

            {(type === 'failure' || type === 'cancel') && (
              <>
                <button
                  onClick={handleRetry}
                  className="bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={handleContinue}
                  className="bg-gray-300 text-gray-700 px-6 py-3 rounded-md font-medium hover:bg-gray-400 transition-colors"
                >
                  Back to Dashboard
                </button>
              </>
            )}
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              If you have any questions, please contact our support team.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentResultPage;
