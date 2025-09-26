import React, { useState } from 'react';
import { X, CreditCard, TrendingUp, Users, BarChart3 } from 'lucide-react';
import PayPalSubscriptionModal from './PayPalSubscriptionModal';

interface PlanLimitError {
  success: false;
  error: string;
  planLimitExceeded: true;
  details: {
    reason: string;
    currentPlan: string;
    requiredPlan: string;
    upgradeMessage: string;
    currentUsage?: number;
    planLimit?: number;
    planFeatures: {
      id: string;
      name: string;
      price: number;
      maxStudies: number;
      maxParticipantsPerStudy: number;
      recordingMinutes: number;
      advancedAnalytics: boolean;
      exportData: boolean;
      teamCollaboration: boolean;
      prioritySupport: boolean;
      customBranding: boolean;
    };
  };
}

interface PlanLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  error: PlanLimitError;
  onUpgrade: (planId: string) => void;
  userId?: string;
  userInfo?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export const PlanLimitModal: React.FC<PlanLimitModalProps> = ({
  isOpen,
  onClose,
  error,
  onUpgrade,
  userId,
  userInfo
}) => {
  const [showPayPalModal, setShowPayPalModal] = useState(false);
  
  if (!isOpen) return null;

  const details = error.details;

  const handleUpgradeClick = () => {
    if (userId && userInfo) {
      setShowPayPalModal(true);
    } else {
      // Fallback to original upgrade handler
      onUpgrade(details.requiredPlan);
    }
  };

  const handlePayPalClose = () => {
    setShowPayPalModal(false);
  };

  const handleUpgradeComplete = (planId: string) => {
    setShowPayPalModal(false);
    onClose();
    onUpgrade(planId);
  };

  const getIcon = () => {
    switch (details.reason) {
      case 'Study limit exceeded':
        return <BarChart3 className="w-12 h-12 text-blue-500" />;
      case 'Participant limit exceeded for this study':
        return <Users className="w-12 h-12 text-green-500" />;
      case 'Data export not available in your plan':
        return <TrendingUp className="w-12 h-12 text-purple-500" />;
      default:
        return <CreditCard className="w-12 h-12 text-orange-500" />;
    }
  };

  const getPlanBadgeColor = (planId: string) => {
    const colors = {
      free: 'bg-gray-100 text-gray-800',
      basic: 'bg-blue-100 text-blue-800',
      pro: 'bg-purple-100 text-purple-800',
      enterprise: 'bg-orange-100 text-orange-800'
    };
    return colors[planId as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPlanFeatures = (planId: string) => {
    const features = {
      basic: ['15 studies/month', '50 participants/study', 'Data export', 'Advanced analytics'],
      pro: ['Unlimited studies', '500 participants/study', 'Team collaboration', 'Priority support'],
      enterprise: ['Unlimited everything', 'Custom branding', 'Dedicated support', 'API access']
    };
    return features[planId as keyof typeof features] || [];
  };

  const getPlanPrice = (planId: string) => {
    const prices = {
      basic: '$29',
      pro: '$99',
      enterprise: '$299'
    };
    return prices[planId as keyof typeof prices] || '';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            {getIcon()}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {details.reason.includes('Study limit') ? 'Study Limit Reached' :
                 details.reason.includes('Participant limit') ? 'Participant Limit Reached' :
                 details.reason.includes('export') ? 'Data Export Unavailable' :
                 details.reason.includes('analytics') ? 'Advanced Analytics Unavailable' :
                 details.reason.includes('collaboration') ? 'Team Collaboration Unavailable' :
                 'Plan Upgrade Required'}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-gray-500">Current plan:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPlanBadgeColor(details.currentPlan)}`}>
                  {details.currentPlan.charAt(0).toUpperCase() + details.currentPlan.slice(1)}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Current Usage Info */}
          {details.currentUsage !== undefined && details.planLimit !== undefined && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-red-800">Current Usage</span>
                <span className="text-sm text-red-600">
                  {details.currentUsage} / {details.planLimit === -1 ? '∞' : details.planLimit}
                </span>
              </div>
              <div className="w-full bg-red-200 rounded-full h-2">
                <div 
                  className="bg-red-500 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: details.planLimit === -1 ? '0%' : 
                           `${Math.min((details.currentUsage / details.planLimit) * 100, 100)}%` 
                  }}
                />
              </div>
            </div>
          )}

          {/* Upgrade Message */}
          <div className="text-center mb-6">
            <p className="text-gray-600 mb-4">
              {details.upgradeMessage}
            </p>
          </div>

          {/* Recommended Plan */}
          <div className="border border-gray-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPlanBadgeColor(details.requiredPlan)}`}>
                  {details.requiredPlan.charAt(0).toUpperCase() + details.requiredPlan.slice(1)} Plan
                </span>
                <span className="text-lg font-bold text-gray-900">
                  {getPlanPrice(details.requiredPlan)}<span className="text-sm text-gray-500">/month</span>
                </span>
              </div>
            </div>
            
            <ul className="space-y-2">
              {getPlanFeatures(details.requiredPlan).map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleUpgradeClick}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <CreditCard className="w-4 h-4" />
              Upgrade to {details.requiredPlan.charAt(0).toUpperCase() + details.requiredPlan.slice(1)}
            </button>
            
            <button
              onClick={onClose}
              className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Maybe Later
            </button>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center">
              {userId && userInfo ? 'Secure payment with PayPal' : 'Upgrade instantly with secure payment processing'}. Cancel anytime.
            </p>
          </div>
        </div>
      </div>

      {/* PayPal Subscription Modal */}
      {userId && userInfo && (
        <PayPalSubscriptionModal
          isOpen={showPayPalModal}
          onClose={handlePayPalClose}
          currentPlan={details.currentPlan}
          userId={userId}
          userInfo={userInfo}
          onSubscriptionSuccess={handleUpgradeComplete}
        />
      )}
    </div>
  );
};

export default PlanLimitModal;
