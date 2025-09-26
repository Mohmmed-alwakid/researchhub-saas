import React from 'react';
import { ArrowRight, CreditCard } from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { useAuthStore } from '../../stores/authStore';

interface PricingCTAProps {
  planId: string;
  ctaText: string;
  variant?: 'primary' | 'secondary' | 'outline';
  isEnterprise?: boolean;
}

export const PricingCTA: React.FC<PricingCTAProps> = ({
  planId,
  ctaText,
  variant = 'primary',
  isEnterprise = false
}) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const handleCTAClick = () => {
    if (isEnterprise) {
      // Handle enterprise contact sales
      window.open('mailto:sales@researchhub.com?subject=Enterprise Plan Inquiry', '_blank');
      return;
    }

    if (planId === 'free') {
      // For free plan, redirect to registration
      navigate('/register');
      return;
    }

    if (!user) {
      // If not logged in, redirect to login with plan selection
      navigate(`/login?plan=${planId}&returnTo=/app/settings/billing`);
      return;
    }

    // If logged in, redirect to billing settings with plan selection
    navigate(`/app/settings/billing?plan=${planId}`);
  };

  return (
    <Button
      onClick={handleCTAClick}
      variant={variant}
      className="w-full"
      rightIcon={
        isEnterprise ? (
          <CreditCard className="h-4 w-4" />
        ) : (
          <ArrowRight className="h-4 w-4" />
        )
      }
    >
      {ctaText}
    </Button>
  );
};

export default PricingCTA;
