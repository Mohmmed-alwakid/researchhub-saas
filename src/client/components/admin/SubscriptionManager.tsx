import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Plus, 
  Edit, 
  Trash2,
  Eye,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useFeatureFlags } from '../../../shared/config/featureFlags.ts';
import { ComingSoon } from '../common/ComingSoon';

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  limits: {
    studies: number;
    participants: number;
    storage: number; // in GB
    recordings: number;
  };
  isActive: boolean;
  subscriberCount: number;
  revenue: number;
}

interface Subscription {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  planId: string;
  planName: string;
  status: 'active' | 'past_due' | 'canceled' | 'incomplete';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  amount: number;
  interval: 'month' | 'year';
}

const SubscriptionManager: React.FC = () => {
  const { ENABLE_SUBSCRIPTION_MANAGEMENT } = useFeatureFlags();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [activeTab, setActiveTab] = useState<'plans' | 'subscriptions' | 'analytics'>('plans');
  const [loading, setLoading] = useState(true);  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);

  useEffect(() => {
    fetchPlans();
    fetchSubscriptions();
  }, []);

  // Show Coming Soon if subscription management is disabled
  if (!ENABLE_SUBSCRIPTION_MANAGEMENT) {
    return (
      <ComingSoon
        variant="card"
        title="Subscription Management"
        description="Manage subscription plans, billing, and revenue analytics with our comprehensive subscription system."
        features={[
          "Create and manage subscription plans",
          "Real-time billing and payment processing",
          "Revenue analytics and reporting",
          "Subscriber management and support",
          "Stripe integration for secure payments",
          "Automated billing and invoicing"
        ]}        expectedRelease="Q4 2024"
      />
    );
  }

  const fetchPlans = async () => {
    try {
      // Mock data - replace with actual API call
      const mockPlans: SubscriptionPlan[] = [
        {
          id: 'free',
          name: 'Free',
          description: 'Perfect for getting started with user research',
          price: 0,
          interval: 'month',
          features: [
            'Up to 2 studies',
            '10 participants per study',
            'Basic analytics',
            'Email support'
          ],
          limits: {
            studies: 2,
            participants: 10,
            storage: 1,
            recordings: 5
          },
          isActive: true,
          subscriberCount: 1250,
          revenue: 0
        },
        {
          id: 'basic',
          name: 'Basic',
          description: 'Ideal for small teams and regular research',
          price: 29,
          interval: 'month',
          features: [
            'Up to 10 studies',
            '50 participants per study',
            'Advanced analytics',
            'Screen recording',
            'Priority support'
          ],
          limits: {
            studies: 10,
            participants: 50,
            storage: 10,
            recordings: 50
          },
          isActive: true,
          subscriberCount: 420,
          revenue: 12180
        },
        {
          id: 'pro',
          name: 'Pro',
          description: 'Best for growing teams and frequent research',
          price: 79,
          interval: 'month',
          features: [
            'Unlimited studies',
            '200 participants per study',
            'Real-time analytics',
            'Heatmaps & click tracking',
            'API access',
            'Custom integrations'
          ],
          limits: {
            studies: -1, // unlimited
            participants: 200,
            storage: 100,
            recordings: 500
          },
          isActive: true,
          subscriberCount: 180,
          revenue: 14220
        },
        {
          id: 'enterprise',
          name: 'Enterprise',
          description: 'For large organizations with advanced needs',
          price: 199,
          interval: 'month',
          features: [
            'Everything in Pro',
            'Unlimited participants',
            'White-label solution',
            'Dedicated support',
            'Custom onboarding',
            'SLA guarantee'
          ],
          limits: {
            studies: -1,
            participants: -1,
            storage: 1000,
            recordings: -1
          },
          isActive: true,
          subscriberCount: 45,
          revenue: 8955
        }
      ];
      setPlans(mockPlans);
    } catch (error) {
      console.error('Failed to fetch plans:', error);
    }
  };

  const fetchSubscriptions = async () => {
    try {
      // Mock data - replace with actual API call
      const mockSubscriptions: Subscription[] = [
        {
          id: 'sub_1',
          userId: 'user_1',
          userName: 'John Doe',
          userEmail: 'john@example.com',
          planId: 'pro',
          planName: 'Pro',
          status: 'active',
          currentPeriodStart: new Date('2024-01-01'),
          currentPeriodEnd: new Date('2024-02-01'),
          amount: 79,
          interval: 'month'
        },
        {
          id: 'sub_2',
          userId: 'user_2',
          userName: 'Sarah Wilson',
          userEmail: 'sarah@example.com',
          planId: 'enterprise',
          planName: 'Enterprise',
          status: 'active',
          currentPeriodStart: new Date('2024-01-15'),
          currentPeriodEnd: new Date('2024-02-15'),
          amount: 199,
          interval: 'month'
        },
        {
          id: 'sub_3',
          userId: 'user_3',
          userName: 'Mike Johnson',
          userEmail: 'mike@example.com',
          planId: 'basic',
          planName: 'Basic',
          status: 'past_due',
          currentPeriodStart: new Date('2023-12-20'),
          currentPeriodEnd: new Date('2024-01-20'),
          amount: 29,
          interval: 'month'
        }
      ];
      setSubscriptions(mockSubscriptions);
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'past_due':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'canceled':
      case 'incomplete':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'past_due':
        return 'bg-yellow-100 text-yellow-800';
      case 'canceled':
      case 'incomplete':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalRevenue = plans.reduce((sum, plan) => sum + plan.revenue, 0);
  const totalSubscribers = plans.reduce((sum, plan) => sum + plan.subscriberCount, 0);
  const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600">      </div>

      {/* Plan Modal - TODO: Implement full modal functionality */}
      {showPlanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">
              {editingPlan ? 'Edit Plan' : 'Create New Plan'}
            </h3>
            <p className="text-gray-600 mb-4">Plan management feature coming soon.</p>
            <button
              onClick={() => setShowPlanModal(false)}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subscription Management</h1>
          <p className="text-gray-600">Manage plans, pricing, and subscriber analytics</p>
        </div>
        <button
          onClick={() => {
            setEditingPlan(null);
            setShowPlanModal(true);
          }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Plan
        </button>
      </div>

      {/* Revenue Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-lg bg-green-50">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <TrendingUp className="w-4 h-4 text-green-600" />
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-gray-900">
              ${totalRevenue.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Monthly Revenue</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-lg bg-blue-50">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-gray-900">
              {totalSubscribers.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Subscribers</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-lg bg-purple-50">
              <CreditCard className="w-6 h-6 text-purple-600" />
            </div>
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-gray-900">
              {activeSubscriptions}
            </div>
            <div className="text-sm text-gray-600">Active Subscriptions</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-lg bg-orange-50">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <TrendingUp className="w-4 h-4 text-orange-600" />
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-gray-900">
              ${(totalRevenue / totalSubscribers).toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">ARPU</div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'plans', label: 'Subscription Plans' },
            { key: 'subscriptions', label: 'Active Subscriptions' },
            { key: 'analytics', label: 'Revenue Analytics' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as 'plans' | 'subscriptions' | 'analytics')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'plans' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div key={plan.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Plan Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setEditingPlan(plan);
                        setShowPlanModal(true);
                      }}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2">{plan.description}</p>
              </div>

              {/* Pricing */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold text-gray-900">
                    ${plan.price}
                  </span>
                  <span className="text-gray-600 ml-2">/{plan.interval}</span>
                </div>
              </div>

              {/* Features */}
              <div className="p-6 border-b border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Features</h4>
                <ul className="space-y-2">
                  {plan.features.slice(0, 4).map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-600">
                      <CheckCircle className="w-3 h-3 text-green-600 mr-2" />
                      {feature}
                    </li>
                  ))}
                  {plan.features.length > 4 && (
                    <li className="text-xs text-gray-500">
                      +{plan.features.length - 4} more features
                    </li>
                  )}
                </ul>
              </div>

              {/* Stats */}
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-lg font-semibold text-gray-900">
                      {plan.subscriberCount}
                    </div>
                    <div className="text-xs text-gray-600">Subscribers</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-gray-900">
                      ${plan.revenue.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-600">Revenue</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'subscriptions' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subscriber
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Next Billing
                  </th>
                  <th className="w-12 px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {subscriptions.map((subscription) => (
                  <tr key={subscription.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{subscription.userName}</div>
                        <div className="text-sm text-gray-600">{subscription.userEmail}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-900">
                        {subscription.planName}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {getStatusIcon(subscription.status)}
                        <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(subscription.status)}`}>
                          {subscription.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      ${subscription.amount}/{subscription.interval}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {subscription.currentPeriodEnd.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <button className="p-2 hover:bg-gray-100 rounded-lg">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Analytics</h3>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-gray-600">Revenue chart would be rendered here</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Plan Distribution</h3>
              <div className="space-y-3">
                {plans.map((plan) => (
                  <div key={plan.id} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">{plan.name}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(plan.subscriberCount / totalSubscribers) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600">
                        {plan.subscriberCount}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Plan</h3>
              <div className="space-y-3">
                {plans.filter(p => p.revenue > 0).map((plan) => (
                  <div key={plan.id} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">{plan.name}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${(plan.revenue / totalRevenue) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600">
                        ${plan.revenue.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionManager;
