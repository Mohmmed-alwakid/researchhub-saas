import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Check, 
  Download,
  AlertCircle,
  Crown,
  Zap,
  Sparkles
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { paymentService, type SubscriptionPlan, type Subscription, type Invoice } from '../../services/payment.service';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';

interface SubscriptionManagerProps {
  onUpgrade?: () => void;
}

export const SubscriptionManager: React.FC<SubscriptionManagerProps> = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [upgradeLoading, setUpgradeLoading] = useState<string | null>(null);

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      setIsLoading(true);
      const [plansResponse, subscriptionResponse, invoicesResponse] = await Promise.all([
        paymentService.getPlans(),
        paymentService.getSubscription(),
        paymentService.getInvoices()
      ]);

      if (plansResponse.success) {
        setPlans(plansResponse.plans);
      }

      if (subscriptionResponse.success) {
        setCurrentSubscription(subscriptionResponse.subscription);
      }

      if (invoicesResponse.success) {
        setInvoices(invoicesResponse.invoices);
      }
    } catch (error) {
      console.error('Error loading subscription data:', error);
      toast.error('Failed to load subscription information');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = async (plan: SubscriptionPlan) => {
    try {
      setUpgradeLoading(plan.id);
      
      const response = await paymentService.createCheckoutSession({
        priceId: plan.stripePriceId,
        successUrl: `${window.location.origin}/app/settings/billing?success=true`,
        cancelUrl: `${window.location.origin}/app/settings/billing?canceled=true`
      });

      if (response.success) {
        window.location.href = response.url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.error('Failed to initiate upgrade process');
    } finally {
      setUpgradeLoading(null);
    }
  };

  const handleManageBilling = async () => {
    try {
      const response = await paymentService.createPortalSession();
      if (response.success) {
        window.open(response.url, '_blank');
      }
    } catch (error) {
      console.error('Error opening billing portal:', error);
      toast.error('Failed to open billing portal');
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription?')) {
      return;
    }

    try {
      const response = await paymentService.cancelSubscription();
      if (response.success) {
        toast.success('Subscription cancelled successfully');
        loadSubscriptionData();
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast.error('Failed to cancel subscription');
    }
  };

  const handleDownloadInvoice = async (invoiceId: string) => {
    try {
      const response = await paymentService.downloadInvoice(invoiceId);
      if (response.success) {
        window.open(response.url, '_blank');
      }
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast.error('Failed to download invoice');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  const getPlanIcon = (planName: string) => {
    const name = planName.toLowerCase();
    if (name.includes('pro') || name.includes('premium')) {
      return <Crown className="w-5 h-5" />;
    }
    if (name.includes('enterprise')) {
      return <Sparkles className="w-5 h-5" />;
    }
    return <Zap className="w-5 h-5" />;
  };
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Current Subscription */}
      {currentSubscription && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Current Subscription</h3>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-indigo-100 rounded-lg">
                  {getPlanIcon(currentSubscription.plan.name)}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{currentSubscription.plan.name}</h4>
                  <p className="text-sm text-gray-500">
                    {formatPrice(currentSubscription.plan.price)} / {currentSubscription.plan.interval}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Next billing date</p>
                <p className="font-medium">{formatDate(currentSubscription.currentPeriodEnd)}</p>
              </div>
            </div>

            <div className="mt-4 flex items-center space-x-3">
              <Button onClick={handleManageBilling} variant="outline">
                <CreditCard className="w-4 h-4 mr-2" />
                Manage Billing
              </Button>
              {currentSubscription.status === 'active' && !currentSubscription.cancelAtPeriodEnd && (
                <Button onClick={handleCancelSubscription} variant="outline" className="text-red-600 hover:text-red-700">
                  Cancel Subscription
                </Button>
              )}
            </div>

            {currentSubscription.cancelAtPeriodEnd && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                  <span className="text-sm text-yellow-800">
                    Your subscription will be cancelled on {formatDate(currentSubscription.currentPeriodEnd)}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Available Plans */}
      <div>
        <h3 className="text-lg font-semibold mb-6">
          {currentSubscription ? 'Upgrade Your Plan' : 'Choose Your Plan'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const isCurrentPlan = currentSubscription?.plan.id === plan.id;
            
            return (
              <Card 
                key={plan.id} 
                className={`relative ${plan.popular ? 'ring-2 ring-indigo-600' : ''} ${isCurrentPlan ? 'bg-gray-50' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-indigo-600 text-white px-3 py-1 text-xs font-medium rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-xl mx-auto mb-4">
                      {getPlanIcon(plan.name)}
                    </div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">{plan.name}</h4>
                    <p className="text-gray-600 mb-4">{plan.description}</p>
                    <div className="mb-6">
                      <span className="text-4xl font-bold text-gray-900">{formatPrice(plan.price)}</span>
                      <span className="text-gray-500">/{plan.interval}</span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-sm text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handleUpgrade(plan)}
                    disabled={isCurrentPlan || upgradeLoading === plan.id}
                    isLoading={upgradeLoading === plan.id}
                    className="w-full"
                    variant={plan.popular ? 'primary' : 'outline'}
                  >
                    {isCurrentPlan ? 'Current Plan' : 'Upgrade to ' + plan.name}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recent Invoices */}
      {invoices.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Recent Invoices</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {invoices.slice(0, 5).map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-lg">
                      <CreditCard className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Invoice #{invoice.number}</p>
                      <p className="text-sm text-gray-500">{formatDate(invoice.created)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="font-medium">{formatPrice(invoice.amount)}</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      invoice.status === 'paid' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {invoice.status}
                    </span>
                    <Button
                      onClick={() => handleDownloadInvoice(invoice.id)}
                      variant="ghost"
                      size="sm"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SubscriptionManager;
