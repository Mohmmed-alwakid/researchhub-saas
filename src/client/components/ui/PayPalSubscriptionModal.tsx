import React, { useState, useEffect, useCallback } from 'react';
import { 
  CreditCard, 
  Check, 
  X, 
  Star, 
  Users, 
  Clock, 
  Download,
  Shield,
  Zap,
  Building
} from 'lucide-react';
import { paypalService, PayPalPlan } from '../../services/paypal.service';

interface PayPalSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan?: string;
  userId: string;
  userInfo: {
    firstName: string;
    lastName: string;
    email: string;
  };
  onSubscriptionSuccess?: (planId: string) => void;
}

export const PayPalSubscriptionModal: React.FC<PayPalSubscriptionModalProps> = ({
  isOpen,
  onClose,
  currentPlan = 'free',
  userId,
  userInfo,
  onSubscriptionSuccess
}) => {
  const [availablePlans, setAvailablePlans] = useState<PayPalPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'select' | 'confirm' | 'processing'>('select');

  const loadAvailablePlans = useCallback(async () => {
    try {
      const plans = await paypalService.getAvailablePlans();
      // Filter out the current plan
      const filteredPlans = plans.filter(plan => plan.id !== currentPlan);
      setAvailablePlans(filteredPlans);
    } catch (err) {
      setError('Failed to load subscription plans');
      console.error('Load plans error:', err);
    }
  }, [currentPlan]);

  useEffect(() => {
    if (isOpen) {
      loadAvailablePlans();
      // Auto-select the next upgrade plan
      const nextPlan = paypalService.getNextUpgradePlan(currentPlan);
      setSelectedPlan(nextPlan);
    }
  }, [isOpen, currentPlan, loadAvailablePlans]);

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    setError(null);
  };

  const handleContinue = () => {
    if (!selectedPlan) {
      setError('Please select a plan to continue');
      return;
    }
    setStep('confirm');
  };

  const handleSubscribe = async () => {
    if (!selectedPlan) return;

    try {
      setLoading(true);
      setError(null);
      setStep('processing');

      const subscriptionData = {
        planId: selectedPlan,
        userId,
        userInfo: {
          userId,
          firstName: userInfo.firstName,
          lastName: userInfo.lastName,
          email: userInfo.email
        }
      };

      const result = await paypalService.createSubscription(subscriptionData);

      // Call success callback if provided
      if (onSubscriptionSuccess) {
        onSubscriptionSuccess(selectedPlan);
      }

      // Redirect to PayPal for approval
      if (result.approvalUrl) {
        window.location.href = result.approvalUrl;
      } else {
        throw new Error('No approval URL received from PayPal');
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Subscription creation failed');
      setStep('confirm');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'confirm') {
      setStep('select');
    } else {
      onClose();
    }
  };

  const getPlanIcon = (planId: string) => {
    const icons = {
      basic: <Star className="w-6 h-6" />,
      pro: <Zap className="w-6 h-6" />,
      enterprise: <Building className="w-6 h-6" />
    };
    return icons[planId as keyof typeof icons] || <CreditCard className="w-6 h-6" />;
  };

  const getFeatureIcon = (feature: string) => {
    const icons: Record<string, React.ReactNode> = {
      maxStudies: <Star className="w-4 h-4" />,
      maxParticipantsPerStudy: <Users className="w-4 h-4" />,
      recordingMinutes: <Clock className="w-4 h-4" />,
      exportData: <Download className="w-4 h-4" />,
      prioritySupport: <Shield className="w-4 h-4" />
    };
    return icons[feature] || <Check className="w-4 h-4" />;
  };

  const formatFeatureValue = (key: string, value: number | boolean): string => {
    if (typeof value === 'boolean') {
      return value ? 'Included' : 'Not included';
    }
    
    if (value === -1) {
      return 'Unlimited';
    }
    
    if (key === 'recordingMinutes') {
      return `${value} minutes`;
    }
    
    return value.toString();
  };

  const selectedPlanData = availablePlans.find(plan => plan.id === selectedPlan);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {step === 'select' && 'Choose Your Plan'}
              {step === 'confirm' && 'Confirm Subscription'}
              {step === 'processing' && 'Processing...'}
            </h2>
            <p className="text-gray-600 mt-1">
              {step === 'select' && 'Upgrade your ResearchHub subscription'}
              {step === 'confirm' && 'Review your subscription details'}
              {step === 'processing' && 'Setting up your subscription'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Plan Selection Step */}
        {step === 'select' && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {availablePlans.map((plan) => (
                <div
                  key={plan.id}
                  className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                    selectedPlan === plan.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handlePlanSelect(plan.id)}
                >
                  {/* Plan Header */}
                  <div className="text-center mb-6">
                    <div className={`inline-flex p-3 rounded-full mb-4 ${
                      plan.id === 'basic' ? 'bg-blue-100 text-blue-600' :
                      plan.id === 'pro' ? 'bg-purple-100 text-purple-600' :
                      'bg-orange-100 text-orange-600'
                    }`}>
                      {getPlanIcon(plan.id)}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                    <p className="text-gray-600 text-sm mt-1">{plan.description}</p>
                    <div className="mt-4">
                      <span className="text-3xl font-bold text-gray-900">
                        {paypalService.formatPrice(plan.price, plan.currency)}
                      </span>
                      <span className="text-gray-600">/month</span>
                    </div>
                  </div>

                  {/* Key Features */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      {getFeatureIcon('maxStudies')}
                      <span className="text-sm">
                        {formatFeatureValue('maxStudies', plan.features.maxStudies)} studies
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      {getFeatureIcon('maxParticipantsPerStudy')}
                      <span className="text-sm">
                        {formatFeatureValue('maxParticipantsPerStudy', plan.features.maxParticipantsPerStudy)} participants
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      {getFeatureIcon('recordingMinutes')}
                      <span className="text-sm">
                        {formatFeatureValue('recordingMinutes', plan.features.recordingMinutes)}
                      </span>
                    </div>
                    {plan.features.advancedAnalytics && (
                      <div className="flex items-center gap-3">
                        {getFeatureIcon('advancedAnalytics')}
                        <span className="text-sm">Advanced Analytics</span>
                      </div>
                    )}
                    {plan.features.teamCollaboration && (
                      <div className="flex items-center gap-3">
                        {getFeatureIcon('teamCollaboration')}
                        <span className="text-sm">Team Collaboration</span>
                      </div>
                    )}
                    {plan.features.exportData && (
                      <div className="flex items-center gap-3">
                        {getFeatureIcon('exportData')}
                        <span className="text-sm">Data Export</span>
                      </div>
                    )}
                    {plan.features.prioritySupport && (
                      <div className="flex items-center gap-3">
                        {getFeatureIcon('prioritySupport')}
                        <span className="text-sm">Priority Support</span>
                      </div>
                    )}
                  </div>

                  {/* Selection Indicator */}
                  {selectedPlan === plan.id && (
                    <div className="mt-4 p-2 bg-blue-100 rounded-lg text-center">
                      <span className="text-blue-700 text-sm font-medium">Selected</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Continue Button */}
            <div className="flex justify-between mt-8">
              <button
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleContinue}
                disabled={!selectedPlan}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Continue to Payment
              </button>
            </div>
          </div>
        )}

        {/* Confirmation Step */}
        {step === 'confirm' && selectedPlanData && (
          <div className="p-6">
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription Summary</h3>
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${paypalService.getPlanBadgeColor(selectedPlanData.id)}`}>
                    {getPlanIcon(selectedPlanData.id)}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{selectedPlanData.name}</h4>
                    <p className="text-gray-600 text-sm">{selectedPlanData.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    {paypalService.formatPrice(selectedPlanData.price, selectedPlanData.currency)}
                  </div>
                  <div className="text-gray-600 text-sm">per month</div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h5 className="font-medium text-gray-900 mb-3">What you'll get:</h5>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(selectedPlanData.features)
                    .filter(([, value]) => value !== false)
                    .map(([key, value]) => (
                      <div key={key} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-700">
                          {key === 'maxStudies' && `${formatFeatureValue(key, value as number)} studies`}
                          {key === 'maxParticipantsPerStudy' && `${formatFeatureValue(key, value as number)} participants`}
                          {key === 'recordingMinutes' && `${formatFeatureValue(key, value as number)}`}
                          {key === 'advancedAnalytics' && 'Advanced Analytics'}
                          {key === 'exportData' && 'Data Export'}
                          {key === 'teamCollaboration' && 'Team Collaboration'}
                          {key === 'prioritySupport' && 'Priority Support'}
                          {key === 'customBranding' && 'Custom Branding'}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h5 className="font-medium text-blue-900 mb-1">Secure Payment with PayPal</h5>
                  <p className="text-blue-700 text-sm">
                    Your payment will be processed securely through PayPal. You can cancel your subscription at any time.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between">
              <button
                onClick={handleBack}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleSubscribe}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    Continue to PayPal
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Processing Step */}
        {step === 'processing' && (
          <div className="p-6 text-center">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Setting up your subscription...</h3>
            <p className="text-gray-600">
              You'll be redirected to PayPal to complete your payment securely.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PayPalSubscriptionModal;
