import React, { useState, useEffect } from 'react';
import { CreditCard, DollarSign, Zap, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { pointsService } from '../../services/payment.service';

interface ConversionRates {
  pointsPerDollar: number;
  minimumPurchase: number;
  minimumWithdrawal: number;
  purchaseFee: { percent: number; fixed: number };
  withdrawalFee: { percent: number; fixed: number };
}

interface PointPurchaseFlowProps {
  onSuccess?: (points: number) => void;
  onCancel?: () => void;
}

const PRESET_AMOUNTS = [
  { dollars: 10, points: 1000 },
  { dollars: 25, points: 2500 },
  { dollars: 50, points: 5000 },
  { dollars: 100, points: 10000 },
  { dollars: 250, points: 25000 },
];

export const PointPurchaseFlow: React.FC<PointPurchaseFlowProps> = ({ 
  onSuccess, 
  onCancel 
}) => {
  const [currentStep, setCurrentStep] = useState<'select' | 'confirm' | 'payment' | 'success'>('select');
  const [selectedAmount, setSelectedAmount] = useState<{ dollars: number; points: number } | null>(null);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [conversionRates, setConversionRates] = useState<ConversionRates | null>(null);
  const [loading, setLoading] = useState(false);
  const [paymentIntent, setPaymentIntent] = useState<any>(null);

  useEffect(() => {
    fetchConversionRates();
  }, []);

  const fetchConversionRates = async () => {
    try {
      const response = await pointsService.getConversionRates();
      if (response.success && response.data) {
        setConversionRates(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch conversion rates:', error);
      toast.error('Failed to load pricing information');
    }
  };

  const calculateFees = (amount: number) => {
    if (!conversionRates) return { total: 0, breakdown: '' };
    
    const percentFee = amount * conversionRates.purchaseFee.percent;
    const fixedFee = conversionRates.purchaseFee.fixed;
    const total = percentFee + fixedFee;
    
    return {
      total,
      breakdown: `${(conversionRates.purchaseFee.percent * 100).toFixed(1)}% + $${fixedFee.toFixed(2)}`
    };
  };

  const handleAmountSelect = (amount: { dollars: number; points: number }) => {
    setSelectedAmount(amount);
    setCurrentStep('confirm');
  };

  const handleCustomAmount = () => {
    const dollars = parseFloat(customAmount);
    if (!conversionRates) return;
    
    if (dollars < conversionRates.minimumPurchase) {
      toast.error(`Minimum purchase is $${conversionRates.minimumPurchase}`);
      return;
    }
    
    const points = dollars * conversionRates.pointsPerDollar;
    setSelectedAmount({ dollars, points });
    setCurrentStep('confirm');
  };

  const handleConfirmPurchase = async () => {
    if (!selectedAmount) return;
    
    try {
      setLoading(true);
      const response = await pointsService.createPaymentIntent(
        selectedAmount.dollars,
        selectedAmount.points
      );
      
      if (response.success && response.data) {
        setPaymentIntent(response.data);
        setCurrentStep('payment');
      } else {
        toast.error(response.error || 'Failed to create payment');
      }
    } catch (error) {
      console.error('Payment intent creation failed:', error);
      toast.error('Failed to initialize payment');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    setCurrentStep('success');
    if (onSuccess && selectedAmount) {
      onSuccess(selectedAmount.points);
    }
    toast.success(`Successfully purchased ${selectedAmount?.points.toLocaleString()} points!`);
  };

  const renderStepSelect = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Zap className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Purchase Research Points</h2>
        <p className="text-gray-600">
          Add points to your account to create studies and recruit participants
        </p>
      </div>

      {conversionRates && (
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-blue-900">Current Rate</span>
          </div>
          <p className="text-blue-800">
            <span className="text-xl font-bold">{conversionRates.pointsPerDollar} points</span> = $1.00 USD
          </p>
          <p className="text-sm text-blue-700 mt-1">
            Processing fees: {calculateFees(1).breakdown}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PRESET_AMOUNTS.map((amount) => {
          const fees = calculateFees(amount.dollars);
          const total = amount.dollars + fees.total;
          
          return (
            <Card 
              key={amount.dollars}
              className="cursor-pointer hover:border-blue-500 hover:shadow-md transition-all"
              onClick={() => handleAmountSelect(amount)}
            >
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {amount.points.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 mb-2">points</div>
                <div className="text-lg font-semibold text-blue-600 mb-1">
                  ${amount.dollars}
                </div>
                <div className="text-xs text-gray-500">
                  + ${fees.total.toFixed(2)} fees = ${total.toFixed(2)} total
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="border-t pt-6">
        <h3 className="font-semibold text-gray-900 mb-3">Custom Amount</h3>
        <div className="flex gap-3">
          <div className="flex-1">
            <input
              type="number"
              placeholder="Enter amount in USD"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min={conversionRates?.minimumPurchase}
            />
            {conversionRates && customAmount && (
              <p className="text-sm text-gray-600 mt-1">
                = {(parseFloat(customAmount) * conversionRates.pointsPerDollar).toLocaleString()} points
              </p>
            )}
          </div>
          <Button 
            onClick={handleCustomAmount}
            disabled={!customAmount || parseFloat(customAmount) < (conversionRates?.minimumPurchase || 10)}
          >
            Continue
          </Button>
        </div>
      </div>

      {onCancel && (
        <div className="flex justify-center pt-4">
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      )}
    </div>
  );

  const renderStepConfirm = () => {
    if (!selectedAmount || !conversionRates) return null;
    
    const fees = calculateFees(selectedAmount.dollars);
    const total = selectedAmount.dollars + fees.total;

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Confirm Purchase</h2>
          <p className="text-gray-600">Review your purchase details below</p>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Points to purchase:</span>
                <span className="font-semibold text-lg">{selectedAmount.points.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Base amount:</span>
                <span>${selectedAmount.dollars.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Processing fees:</span>
                <span>${fees.total.toFixed(2)}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-lg">Total:</span>
                  <span className="font-bold text-xl text-blue-600">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-semibold mb-1">Important:</p>
              <p>Points are non-refundable once purchased. Make sure you're purchasing the right amount for your research needs.</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button 
            variant="secondary" 
            onClick={() => setCurrentStep('select')}
            className="flex-1"
          >
            Back
          </Button>
          <Button 
            onClick={handleConfirmPurchase}
            disabled={loading}
            className="flex-1"
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4 mr-2" />
                Pay ${total.toFixed(2)}
              </>
            )}
          </Button>
        </div>
      </div>
    );
  };

  const renderStepPayment = () => (
    <div className="space-y-6 text-center">
      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
        <CreditCard className="w-8 h-8 text-blue-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900">Payment Processing</h2>
      <p className="text-gray-600">
        In a real implementation, this would show the Stripe payment form.
      </p>
      
      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-gray-600 mb-4">Mock Payment Intent Created:</p>
          <pre className="bg-gray-100 p-3 rounded text-xs text-left overflow-x-auto">
            {JSON.stringify(paymentIntent, null, 2)}
          </pre>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button 
          variant="secondary" 
          onClick={() => setCurrentStep('confirm')}
          className="flex-1"
        >
          Back
        </Button>
        <Button 
          onClick={handlePaymentSuccess}
          className="flex-1"
        >
          Simulate Success
        </Button>
      </div>
    </div>
  );

  const renderStepSuccess = () => (
    <div className="space-y-6 text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="w-8 h-8 text-green-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900">Purchase Successful!</h2>
      <p className="text-gray-600">
        Your points have been added to your account and are ready to use.
      </p>
      
      {selectedAmount && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                +{selectedAmount.points.toLocaleString()}
              </div>
              <div className="text-gray-600">points added to your account</div>
            </div>
          </CardContent>
        </Card>
      )}

      <Button onClick={onCancel} className="w-full">
        Done
      </Button>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto p-6">
      {currentStep === 'select' && renderStepSelect()}
      {currentStep === 'confirm' && renderStepConfirm()}
      {currentStep === 'payment' && renderStepPayment()}
      {currentStep === 'success' && renderStepSuccess()}
    </div>
  );
};

export default PointPurchaseFlow;
