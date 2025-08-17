import React, { useState, useEffect, useCallback } from 'react';
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
  const [loading, setLoading] = useState(true);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getAuthToken = () => {
    let token = '';
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      try {
        const { state } = JSON.parse(authStorage);
        token = state?.token || '';
      } catch {
        // fallback: token remains ''
      }
    }
    return token;
  };

  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getAuthToken();
      const response = await fetch('/api/subscriptions?action=plans', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error || 'Failed to fetch plans');
      }
      const result = await response.json();
      if (result.success) {
        setPlans(result.plans || []);
      } else {
        throw new Error(result.error || 'Failed to fetch plans');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch plans';
      setError(errorMessage);
      // Keep mock data as fallback
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
        }
      ];
      setPlans(mockPlans);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSubscriptions = useCallback(async () => {
    try {
      setError(null);
      const token = getAuthToken();
      const response = await fetch('/api/subscriptions?action=subscriptions', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error || 'Failed to fetch subscriptions');
      }
      const result = await response.json();
      if (result.success) {
        setSubscriptions(result.subscriptions || []);
      } else {
        throw new Error(result.error || 'Failed to fetch subscriptions');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch subscriptions';
      setError(errorMessage);
      setSubscriptions([]);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
    fetchSubscriptions();
  }, [fetchPlans, fetchSubscriptions]);

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
          "Points system for study access control",
          "Automated billing and invoicing"
        ]}
        expectedRelease="Q4 2024"
      />
    );
  }

  const handleSavePlan = async () => {
    if (!editingPlan) return;

    try {
      const token = getAuthToken();
      const isNewPlan = !editingPlan.id || editingPlan.id.startsWith('new_');
      
      const url = isNewPlan 
        ? '/api/subscriptions?action=plans'
        : `/api/subscriptions?action=plan&id=${editingPlan.id}`;
        
      const method = isNewPlan ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editingPlan.name,
          description: editingPlan.description,
          price: editingPlan.price,
          interval: editingPlan.interval,
          features: editingPlan.features,
          limits: editingPlan.limits,
          is_active: editingPlan.isActive
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save plan');
      }

      const result = await response.json();
      if (result.success) {
        await fetchPlans(); // Refresh the plans list
        setShowPlanModal(false);
        setEditingPlan(null);
        // Show success message
        alert(isNewPlan ? 'Plan created successfully!' : 'Plan updated successfully!');
      } else {
        throw new Error(result.error || 'Failed to save plan');
      }
    } catch (error) {
      console.error('Failed to save plan:', error);
      alert('Failed to save plan. Please try again.');
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (!confirm('Are you sure you want to delete this plan? This action cannot be undone.')) {
      return;
    }

    try {
      const token = getAuthToken();
      const response = await fetch(`/api/subscriptions?action=plan&id=${planId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete plan');
      }

      const result = await response.json();
      if (result.success) {
        await fetchPlans(); // Refresh the plans list
        alert('Plan deleted successfully!');
      } else {
        throw new Error(result.error || 'Failed to delete plan');
      }
    } catch (error) {
      console.error('Failed to delete plan:', error);
      alert('Failed to delete plan. Please try again.');
    }
  };

  const handleCreatePlan = () => {
    const newPlan: SubscriptionPlan = {
      id: `new_${Date.now()}`,
      name: '',
      description: '',
      price: 0,
      interval: 'month',
      features: [],
      limits: {
        studies: 0,
        participants: 0,
        storage: 0,
        recordings: 0
      },
      isActive: true,
      subscriberCount: 0,
      revenue: 0
    };
    setEditingPlan(newPlan);
    setShowPlanModal(true);
  };

  const handleEditPlan = (plan: SubscriptionPlan) => {
    setEditingPlan({ ...plan });
    setShowPlanModal(true);
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
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case 'active':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'past_due':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'canceled':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'incomplete':
        return `${baseClasses} bg-gray-100 text-gray-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const renderPlansTab = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Subscription Plans</h2>
        <button
          onClick={handleCreatePlan}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Plan
        </button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                <p className="text-sm text-gray-600">{plan.description}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditPlan(plan)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeletePlan(plan.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="mb-4">
              <div className="text-2xl font-bold text-gray-900">
                ${plan.price}
                <span className="text-sm font-normal text-gray-600">/{plan.interval}</span>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              {plan.features.slice(0, 3).map((feature, index) => (
                <div key={index} className="text-sm text-gray-600">
                  • {feature}
                </div>
              ))}
              {plan.features.length > 3 && (
                <div className="text-sm text-gray-500">
                  +{plan.features.length - 3} more features
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                <Users className="w-4 h-4 inline mr-1" />
                {plan.subscriberCount} subscribers
              </div>
              <div className="text-sm font-medium text-green-600">
                ${plan.revenue}/month
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSubscriptionsTab = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Active Subscriptions</h2>
      
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Plan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Next Billing
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {subscriptions.map((subscription) => (
              <tr key={subscription.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {subscription.userName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {subscription.userEmail}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {subscription.planName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {getStatusIcon(subscription.status)}
                    <span className={`ml-2 ${getStatusBadge(subscription.status)}`}>
                      {subscription.status}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${subscription.amount}/{subscription.interval}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900 mr-3">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="text-red-600 hover:text-red-900">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Subscription Analytics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 border border-gray-200 rounded-lg">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Subscribers</p>
              <p className="text-2xl font-bold text-gray-900">
                {plans.reduce((sum, plan) => sum + plan.subscriberCount, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 border border-gray-200 rounded-lg">
          <div className="flex items-center">
            <DollarSign className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                ${plans.reduce((sum, plan) => sum + plan.revenue, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 border border-gray-200 rounded-lg">
          <div className="flex items-center">
            <CreditCard className="w-8 h-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Plans</p>
              <p className="text-2xl font-bold text-gray-900">
                {plans.filter(plan => plan.isActive).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 border border-gray-200 rounded-lg">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-indigo-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Growth Rate</p>
              <p className="text-2xl font-bold text-gray-900">+12%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPlanModal = () => {
    if (!showPlanModal || !editingPlan) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4">
            {editingPlan.id.startsWith('new_') ? 'Create New Plan' : 'Edit Plan'}
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Plan Name
              </label>
              <input
                type="text"
                value={editingPlan.name}
                onChange={(e) => setEditingPlan({...editingPlan, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Enter plan name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={editingPlan.description}
                onChange={(e) => setEditingPlan({...editingPlan, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={3}
                placeholder="Enter plan description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price
                </label>
                <input
                  type="number"
                  value={editingPlan.price}
                  onChange={(e) => setEditingPlan({...editingPlan, price: parseFloat(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Interval
                </label>
                <select
                  value={editingPlan.interval}
                  onChange={(e) => setEditingPlan({...editingPlan, interval: e.target.value as 'month' | 'year'})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="month">Monthly</option>
                  <option value="year">Yearly</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Features (one per line)
              </label>
              <textarea
                value={editingPlan.features.join('\n')}
                onChange={(e) => setEditingPlan({
                  ...editingPlan, 
                  features: e.target.value.split('\n').filter(f => f.trim())
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={4}
                placeholder="Enter features, one per line"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={editingPlan.isActive}
                onChange={(e) => setEditingPlan({...editingPlan, isActive: e.target.checked})}
                className="mr-2"
              />
              <label className="text-sm font-medium text-gray-700">
                Active Plan
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => {
                setShowPlanModal(false);
                setEditingPlan(null);
              }}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSavePlan}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {editingPlan.id.startsWith('new_') ? 'Create Plan' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading subscription data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav style={{ marginBottom: '-1px', display: 'flex', gap: '32px' }}>
          {[
            { id: 'plans', label: 'Plans', icon: CreditCard },
            { id: 'subscriptions', label: 'Subscriptions', icon: Users },
            { id: 'analytics', label: 'Analytics', icon: TrendingUp },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'plans' | 'subscriptions' | 'analytics')}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'plans' && renderPlansTab()}
      {activeTab === 'subscriptions' && renderSubscriptionsTab()}
      {activeTab === 'analytics' && renderAnalyticsTab()}

      {/* Plan Modal */}
      {renderPlanModal()}
    </div>
  );
};

export default SubscriptionManager;