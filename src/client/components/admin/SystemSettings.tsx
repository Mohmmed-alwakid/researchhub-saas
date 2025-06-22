import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Globe, 
  Mail, 
  Database, 
  Shield, 
  FileText, 
  Save, 
  RefreshCw,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useFeatureFlags } from '../../../shared/config/featureFlags.ts';
import { ComingSoon } from '../common/ComingSoon';

interface SystemConfiguration {
  platform: {
    name: string;
    version: string;
    environment: 'development' | 'staging' | 'production';
    maintenanceMode: boolean;
    maxUsers: number;
    maxStudies: number;
  };
  email: {
    provider: 'smtp' | 'sendgrid' | 'aws-ses';
    fromAddress: string;
    fromName: string;
    dailyLimit: number;
    enabled: boolean;
  };
  storage: {
    provider: 'local' | 'aws-s3' | 'azure-blob';
    maxFileSize: number;
    allowedTypes: string[];
    retentionPeriod: number;
  };
  security: {
    sessionTimeout: number;
    passwordMinLength: number;
    mfaRequired: boolean;
    loginAttempts: number;
    lockoutDuration: number;
  };
  features: {
    signupEnabled: boolean;
    studySharing: boolean;
    publicProfiles: boolean;
    apiAccess: boolean;
    advancedAnalytics: boolean;
  };
  billing: {
    currency: 'USD' | 'EUR' | 'GBP';
    taxRate: number;
    trialPeriod: number;
    gracePeriod: number;
  };
}

const defaultConfig: SystemConfiguration = {
  platform: {
    name: 'Afkar',
    version: '2.1.0',
    environment: 'production',
    maintenanceMode: false,
    maxUsers: 10000,
    maxStudies: 50000
  },
  email: {
    provider: 'smtp',    fromAddress: 'noreply@afkar.com',
    fromName: 'Afkar',
    dailyLimit: 1000,
    enabled: true
  },
  storage: {
    provider: 'aws-s3',
    maxFileSize: 100,
    allowedTypes: ['image/*', 'video/*', 'application/pdf'],
    retentionPeriod: 365
  },
  security: {
    sessionTimeout: 1440,
    passwordMinLength: 8,
    mfaRequired: false,
    loginAttempts: 5,
    lockoutDuration: 30
  },
  features: {
    signupEnabled: true,
    studySharing: true,
    publicProfiles: false,
    apiAccess: true,
    advancedAnalytics: true
  },
  billing: {
    currency: 'USD',
    taxRate: 0.08,
    trialPeriod: 14,
    gracePeriod: 7
  }
};

const SystemSettings: React.FC = () => {
  const { ENABLE_ADVANCED_ADMIN_SETTINGS } = useFeatureFlags();
  const [config, setConfig] = useState<SystemConfiguration>(defaultConfig);
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [activeTab, setActiveTab] = useState('platform');

  const tabs = [
    { id: 'platform', label: 'Platform', icon: Globe },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'storage', label: 'Storage', icon: Database },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'features', label: 'Features', icon: FileText },
    { id: 'billing', label: 'Billing', icon: Settings }
  ];

  useEffect(() => {
    loadConfiguration();
  }, []);

  // Show Coming Soon if advanced admin settings are disabled
  if (!ENABLE_ADVANCED_ADMIN_SETTINGS) {
    return (
      <ComingSoon
        variant="card"
        title="System Settings"
        description="Configure platform settings, email, storage, security, and advanced features for your research platform."
        features={[
          "Platform configuration and maintenance mode",
          "Email provider settings and notifications",
          "Storage configuration and file management",
          "Security settings and access controls",
          "Feature toggles and permissions",
          "Billing and subscription settings"
        ]}
        expectedRelease="Q4 2024"
      />
    );
  }

  const loadConfiguration = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // In real implementation: const response = await fetch('/api/admin/config');
      setConfig(defaultConfig);
    } catch (error) {
      console.error('Failed to load configuration:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveConfiguration = async () => {
    setSaveStatus('saving');
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      // In real implementation: await fetch('/api/admin/config', { method: 'PUT', body: JSON.stringify(config) });
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Failed to save configuration:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const updateConfig = (section: keyof SystemConfiguration, field: string, value: string | number | boolean) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const renderPlatformSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">        <div>
          <label htmlFor="platform-name" className="block text-sm font-medium text-gray-700 mb-2">
            Platform Name
          </label>
          <input
            id="platform-name"
            type="text"
            value={config.platform.name}
            onChange={(e) => updateConfig('platform', 'name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="platform-version" className="block text-sm font-medium text-gray-700 mb-2">
            Version
          </label>
          <input
            id="platform-version"
            type="text"
            value={config.platform.version}
            onChange={(e) => updateConfig('platform', 'version', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="platform-environment" className="block text-sm font-medium text-gray-700 mb-2">
            Environment
          </label>
          <select
            id="platform-environment"
            value={config.platform.environment}
            onChange={(e) => updateConfig('platform', 'environment', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="development">Development</option>
            <option value="staging">Staging</option>
            <option value="production">Production</option>
          </select>
        </div>        <div>
          <label htmlFor="maintenance-mode" className="flex items-center space-x-2">
            <input
              id="maintenance-mode"
              type="checkbox"
              checked={config.platform.maintenanceMode}
              onChange={(e) => updateConfig('platform', 'maintenanceMode', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">Maintenance Mode</span>
          </label>
        </div>
        <div>
          <label htmlFor="max-users" className="block text-sm font-medium text-gray-700 mb-2">
            Max Users
          </label>
          <input
            id="max-users"
            type="number"
            value={config.platform.maxUsers}
            onChange={(e) => updateConfig('platform', 'maxUsers', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="max-studies" className="block text-sm font-medium text-gray-700 mb-2">
            Max Studies
          </label>
          <input
            id="max-studies"
            type="number"
            value={config.platform.maxStudies}
            onChange={(e) => updateConfig('platform', 'maxStudies', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );

  const renderEmailSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">        <div>
          <label htmlFor="email-provider" className="block text-sm font-medium text-gray-700 mb-2">
            Email Provider
          </label>
          <select
            id="email-provider"
            value={config.email.provider}
            onChange={(e) => updateConfig('email', 'provider', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="smtp">SMTP</option>
            <option value="sendgrid">SendGrid</option>
            <option value="aws-ses">AWS SES</option>
          </select>
        </div>
        <div>
          <label htmlFor="email-enabled" className="flex items-center space-x-2">
            <input
              id="email-enabled"
              type="checkbox"
              checked={config.email.enabled}
              onChange={(e) => updateConfig('email', 'enabled', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">Email Enabled</span>
          </label>
        </div>
        <div>
          <label htmlFor="email-from-address" className="block text-sm font-medium text-gray-700 mb-2">
            From Address
          </label>
          <input
            id="email-from-address"
            type="email"
            value={config.email.fromAddress}
            onChange={(e) => updateConfig('email', 'fromAddress', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="email-from-name" className="block text-sm font-medium text-gray-700 mb-2">
            From Name
          </label>
          <input
            id="email-from-name"
            type="text"
            value={config.email.fromName}
            onChange={(e) => updateConfig('email', 'fromName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="email-daily-limit" className="block text-sm font-medium text-gray-700 mb-2">
            Daily Send Limit
          </label>
          <input
            id="email-daily-limit"
            type="number"
            value={config.email.dailyLimit}
            onChange={(e) => updateConfig('email', 'dailyLimit', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">        <div>
          <label htmlFor="session-timeout" className="block text-sm font-medium text-gray-700 mb-2">
            Session Timeout (minutes)
          </label>
          <input
            id="session-timeout"
            type="number"
            value={config.security.sessionTimeout}
            onChange={(e) => updateConfig('security', 'sessionTimeout', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="password-min-length" className="block text-sm font-medium text-gray-700 mb-2">
            Password Min Length
          </label>
          <input
            id="password-min-length"
            type="number"
            value={config.security.passwordMinLength}
            onChange={(e) => updateConfig('security', 'passwordMinLength', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="mfa-required" className="flex items-center space-x-2">
            <input
              id="mfa-required"
              type="checkbox"
              checked={config.security.mfaRequired}
              onChange={(e) => updateConfig('security', 'mfaRequired', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">Require MFA</span>
          </label>
        </div>
        <div>
          <label htmlFor="max-login-attempts" className="block text-sm font-medium text-gray-700 mb-2">
            Max Login Attempts
          </label>
          <input
            id="max-login-attempts"
            type="number"
            value={config.security.loginAttempts}
            onChange={(e) => updateConfig('security', 'loginAttempts', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="lockout-duration" className="block text-sm font-medium text-gray-700 mb-2">
            Lockout Duration (minutes)
          </label>
          <input
            id="lockout-duration"
            type="number"
            value={config.security.lockoutDuration}
            onChange={(e) => updateConfig('security', 'lockoutDuration', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );

  const renderCurrentTab = () => {
    switch (activeTab) {
      case 'platform':
        return renderPlatformSettings();
      case 'email':
        return renderEmailSettings();
      case 'security':
        return renderSecuritySettings();
      case 'storage':
        return <div className="text-gray-600">Storage settings coming soon...</div>;
      case 'features':
        return <div className="text-gray-600">Feature toggles coming soon...</div>;
      case 'billing':
        return <div className="text-gray-600">Billing configuration coming soon...</div>;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading configuration...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">System Settings</h2>
          <p className="text-gray-600 mt-1">Configure platform settings and preferences</p>
        </div>
        <button
          onClick={saveConfiguration}
          disabled={saveStatus === 'saving'}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saveStatus === 'saving' ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </>
          )}
        </button>
      </div>

      {/* Save Status */}
      {saveStatus === 'success' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
          <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
          <span className="text-green-800">Configuration saved successfully!</span>
        </div>
      )}

      {saveStatus === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
          <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
          <span className="text-red-800">Failed to save configuration. Please try again.</span>
        </div>
      )}

      {/* Maintenance Mode Warning */}
      {config.platform.maintenanceMode && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
          <span className="text-yellow-800">Platform is currently in maintenance mode.</span>
        </div>
      )}

      {/* Settings Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {renderCurrentTab()}
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;
