# 🔗 INTEGRATIONS & API ECOSYSTEM - COMPREHENSIVE REQUIREMENTS
## Third-Party Integrations & Developer Platform

**Created**: July 12, 2025  
**Status**: 🟢 GREENFIELD SPECIFICATION  
**Scope**: Complete API ecosystem, third-party integrations, and developer platform  
**Dependencies**: Platform Foundation (01-PLATFORM_FOUNDATION.md), Authentication (02-AUTHENTICATION_SYSTEM.md)

---

## 📋 EXECUTIVE SUMMARY

The Integrations & API Ecosystem provides comprehensive connectivity with external services, robust API infrastructure, and developer tools to extend platform capabilities and enable seamless workflow integration.

### **🎯 Core Value Proposition**
> "Seamless connectivity with existing workflows through powerful APIs and intelligent integrations that enhance research productivity"

### **🏆 Success Metrics**
- **API Adoption**: 70% of organizations use integrations
- **Developer Satisfaction**: 4.8/5 API experience rating
- **Integration Reliability**: 99.9% uptime across all connections
- **Ecosystem Growth**: 25+ third-party integrations

---

## 🗄️ DATABASE SCHEMA

### **API Management Tables**
```sql
-- API key management and authentication
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Key identification
  key_name VARCHAR(200) NOT NULL,
  key_hash VARCHAR(255) NOT NULL UNIQUE, -- Hashed version of the key
  key_prefix VARCHAR(8) NOT NULL, -- First 8 chars for identification
  
  -- Ownership
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Permissions and scope
  scopes api_scope[] NOT NULL DEFAULT '{}',
  permissions JSONB DEFAULT '{}',
  
  -- Rate limiting
  rate_limit_per_minute INTEGER DEFAULT 1000,
  rate_limit_per_hour INTEGER DEFAULT 10000,
  rate_limit_per_day INTEGER DEFAULT 100000,
  
  -- Usage tracking
  requests_count BIGINT DEFAULT 0,
  last_used TIMESTAMP WITH TIME ZONE,
  
  -- Status and security
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMP WITH TIME ZONE,
  ip_whitelist INET[] DEFAULT '{}',
  
  -- Metadata
  description TEXT,
  environment api_environment DEFAULT 'production',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_rate_limits CHECK (
    rate_limit_per_minute > 0 AND 
    rate_limit_per_hour > 0 AND 
    rate_limit_per_day > 0
  )
);

-- API request logging for analytics and debugging
CREATE TABLE api_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Request identification
  api_key_id UUID REFERENCES api_keys(id) ON DELETE SET NULL,
  request_id UUID NOT NULL UNIQUE,
  
  -- Request details
  method VARCHAR(10) NOT NULL,
  endpoint VARCHAR(500) NOT NULL,
  path_parameters JSONB DEFAULT '{}',
  query_parameters JSONB DEFAULT '{}',
  
  -- Headers and body
  request_headers JSONB DEFAULT '{}',
  request_body_size INTEGER DEFAULT 0,
  
  -- Response details
  status_code INTEGER NOT NULL,
  response_size INTEGER DEFAULT 0,
  response_time_ms INTEGER NOT NULL,
  
  -- Client information
  user_agent TEXT,
  ip_address INET,
  
  -- Error tracking
  error_code VARCHAR(50),
  error_message TEXT,
  
  -- Timestamps
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexing hints
  date_partition DATE GENERATED ALWAYS AS (DATE(requested_at)) STORED
);

-- Third-party integrations configuration
CREATE TABLE integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Integration identification
  integration_type integration_type NOT NULL,
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  
  -- Configuration
  config JSONB NOT NULL DEFAULT '{}',
  credentials JSONB DEFAULT '{}', -- Encrypted
  webhook_url TEXT,
  
  -- Status
  status integration_status DEFAULT 'inactive',
  is_enabled BOOLEAN DEFAULT FALSE,
  
  -- Health monitoring
  last_health_check TIMESTAMP WITH TIME ZONE,
  health_status health_status DEFAULT 'unknown',
  error_count INTEGER DEFAULT 0,
  last_error TEXT,
  
  -- Usage tracking
  sync_count BIGINT DEFAULT 0,
  last_sync TIMESTAMP WITH TIME ZONE,
  
  -- Ownership
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES users(id),
  
  -- Metadata
  description TEXT,
  version VARCHAR(20),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Integration sync logs for debugging and monitoring
CREATE TABLE integration_sync_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  integration_id UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
  
  -- Sync details
  sync_type sync_type NOT NULL,
  trigger_type trigger_type NOT NULL,
  
  -- Status
  status sync_status NOT NULL DEFAULT 'pending',
  
  -- Data
  records_processed INTEGER DEFAULT 0,
  records_successful INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  
  -- Execution details
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_ms INTEGER,
  
  -- Error tracking
  error_message TEXT,
  error_details JSONB DEFAULT '{}',
  
  -- Metadata
  sync_data JSONB DEFAULT '{}',
  external_reference VARCHAR(200)
);

-- Webhook management and delivery
CREATE TABLE webhooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Webhook identification
  name VARCHAR(200) NOT NULL,
  url TEXT NOT NULL,
  
  -- Configuration
  events webhook_event[] NOT NULL DEFAULT '{}',
  filters JSONB DEFAULT '{}',
  
  -- Security
  secret VARCHAR(255), -- For signature verification
  custom_headers JSONB DEFAULT '{}',
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Retry configuration
  max_retries INTEGER DEFAULT 3,
  retry_delay_seconds INTEGER DEFAULT 60,
  
  -- Health monitoring
  last_delivery TIMESTAMP WITH TIME ZONE,
  success_count BIGINT DEFAULT 0,
  failure_count BIGINT DEFAULT 0,
  
  -- Ownership
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES users(id),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Webhook delivery attempts and status
CREATE TABLE webhook_deliveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  webhook_id UUID NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,
  
  -- Event details
  event_type webhook_event NOT NULL,
  event_data JSONB NOT NULL,
  
  -- Delivery attempt
  attempt_number INTEGER NOT NULL DEFAULT 1,
  
  -- Request details
  request_headers JSONB DEFAULT '{}',
  request_body TEXT NOT NULL,
  
  -- Response details
  status_code INTEGER,
  response_headers JSONB DEFAULT '{}',
  response_body TEXT,
  response_time_ms INTEGER,
  
  -- Status
  status delivery_status NOT NULL DEFAULT 'pending',
  
  -- Error tracking
  error_message TEXT,
  
  -- Scheduling
  scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  delivered_at TIMESTAMP WITH TIME ZONE,
  
  -- Next retry (if failed)
  next_retry_at TIMESTAMP WITH TIME ZONE
);

-- OAuth applications for third-party access
CREATE TABLE oauth_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Application details
  name VARCHAR(200) NOT NULL,
  description TEXT,
  
  -- OAuth credentials
  client_id VARCHAR(255) NOT NULL UNIQUE,
  client_secret_hash VARCHAR(255) NOT NULL,
  
  -- Configuration
  redirect_uris TEXT[] NOT NULL DEFAULT '{}',
  scopes api_scope[] NOT NULL DEFAULT '{}',
  
  -- Application metadata
  website_url TEXT,
  logo_url TEXT,
  privacy_policy_url TEXT,
  terms_of_service_url TEXT,
  
  -- Status
  is_approved BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Usage tracking
  user_count INTEGER DEFAULT 0,
  request_count BIGINT DEFAULT 0,
  
  -- Ownership
  created_by UUID NOT NULL REFERENCES users(id),
  organization_id UUID REFERENCES organizations(id),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- OAuth tokens for user authorization
CREATE TABLE oauth_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Token details
  access_token_hash VARCHAR(255) NOT NULL UNIQUE,
  refresh_token_hash VARCHAR(255) UNIQUE,
  token_type VARCHAR(20) DEFAULT 'Bearer',
  
  -- Relationship
  application_id UUID NOT NULL REFERENCES oauth_applications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Scope and permissions
  scopes api_scope[] NOT NULL DEFAULT '{}',
  
  -- Expiration
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  refresh_expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Status
  is_revoked BOOLEAN DEFAULT FALSE,
  revoked_at TIMESTAMP WITH TIME ZONE,
  
  -- Usage tracking
  last_used TIMESTAMP WITH TIME ZONE,
  request_count BIGINT DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(application_id, user_id)
);

-- API rate limiting tracking
CREATE TABLE api_rate_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Identifier (API key or OAuth token)
  identifier_hash VARCHAR(255) NOT NULL,
  identifier_type rate_limit_type NOT NULL,
  
  -- Rate limit window
  window_start TIMESTAMP WITH TIME ZONE NOT NULL,
  window_duration_minutes INTEGER NOT NULL,
  
  -- Counters
  request_count INTEGER DEFAULT 0,
  limit_exceeded_count INTEGER DEFAULT 0,
  
  -- Status
  is_blocked BOOLEAN DEFAULT FALSE,
  blocked_until TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(identifier_hash, window_start, window_duration_minutes)
);

-- Integration marketplace and directory
CREATE TABLE integration_marketplace (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Integration details
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  tagline VARCHAR(300),
  description TEXT NOT NULL,
  
  -- Developer information
  developer_name VARCHAR(200) NOT NULL,
  developer_email VARCHAR(255),
  developer_website TEXT,
  
  -- Integration metadata
  category integration_category NOT NULL,
  tags VARCHAR(50)[] DEFAULT '{}',
  
  -- Assets
  logo_url TEXT,
  screenshot_urls TEXT[] DEFAULT '{}',
  video_url TEXT,
  
  -- Pricing
  pricing_model pricing_model DEFAULT 'free',
  pricing_details JSONB DEFAULT '{}',
  
  -- Technical details
  integration_type integration_type NOT NULL,
  supported_events webhook_event[] DEFAULT '{}',
  required_scopes api_scope[] DEFAULT '{}',
  
  -- Documentation
  documentation_url TEXT,
  setup_instructions TEXT,
  api_reference_url TEXT,
  
  -- Status and approval
  status marketplace_status DEFAULT 'draft',
  is_featured BOOLEAN DEFAULT FALSE,
  approval_notes TEXT,
  
  -- Metrics
  install_count INTEGER DEFAULT 0,
  rating_average DECIMAL(3,2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  
  -- Ownership
  created_by UUID NOT NULL REFERENCES users(id),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE
);

-- Create ENUMs for integrations system
CREATE TYPE api_scope AS ENUM (
  'read:users', 'write:users', 'read:studies', 'write:studies',
  'read:organizations', 'write:organizations', 'read:analytics',
  'write:analytics', 'read:integrations', 'write:integrations',
  'read:templates', 'write:templates', 'admin:all'
);

CREATE TYPE api_environment AS ENUM ('development', 'staging', 'production');

CREATE TYPE integration_type AS ENUM (
  'oauth', 'webhook', 'api_polling', 'file_sync', 'email', 'slack',
  'teams', 'zapier', 'custom', 'data_export', 'sso', 'analytics'
);

CREATE TYPE integration_status AS ENUM ('inactive', 'active', 'error', 'syncing');

CREATE TYPE health_status AS ENUM ('healthy', 'warning', 'error', 'unknown');

CREATE TYPE sync_type AS ENUM ('full', 'incremental', 'manual', 'automatic');

CREATE TYPE trigger_type AS ENUM ('scheduled', 'webhook', 'manual', 'api_call');

CREATE TYPE sync_status AS ENUM ('pending', 'running', 'completed', 'failed', 'cancelled');

CREATE TYPE webhook_event AS ENUM (
  'user.created', 'user.updated', 'user.deleted',
  'study.created', 'study.updated', 'study.published', 'study.completed',
  'organization.created', 'organization.updated',
  'application.submitted', 'application.approved', 'application.rejected',
  'payment.completed', 'payment.failed',
  'integration.connected', 'integration.disconnected'
);

CREATE TYPE delivery_status AS ENUM ('pending', 'delivered', 'failed', 'cancelled');

CREATE TYPE rate_limit_type AS ENUM ('api_key', 'oauth_token', 'ip_address');

CREATE TYPE integration_category AS ENUM (
  'communication', 'productivity', 'analytics', 'data_export',
  'authentication', 'payment', 'marketing', 'design', 'development'
);

CREATE TYPE pricing_model AS ENUM ('free', 'freemium', 'paid', 'enterprise');

CREATE TYPE marketplace_status AS ENUM ('draft', 'submitted', 'approved', 'rejected', 'published');

-- Performance indexes for integrations queries
CREATE INDEX idx_api_keys_organization ON api_keys(organization_id, is_active);
CREATE INDEX idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX idx_api_requests_key ON api_requests(api_key_id, requested_at);
CREATE INDEX idx_api_requests_date ON api_requests(date_partition, status_code);
CREATE INDEX idx_integrations_org ON integrations(organization_id, status);
CREATE INDEX idx_integration_sync_logs_integration ON integration_sync_logs(integration_id, started_at);
CREATE INDEX idx_webhooks_org ON webhooks(organization_id, is_active);
CREATE INDEX idx_webhook_deliveries_webhook ON webhook_deliveries(webhook_id, scheduled_at);
CREATE INDEX idx_webhook_deliveries_status ON webhook_deliveries(status, next_retry_at);
CREATE INDEX idx_oauth_applications_client ON oauth_applications(client_id);
CREATE INDEX idx_oauth_tokens_application ON oauth_tokens(application_id, expires_at);
CREATE INDEX idx_oauth_tokens_user ON oauth_tokens(user_id, is_revoked);
CREATE INDEX idx_api_rate_limits_identifier ON api_rate_limits(identifier_hash, window_start);
CREATE INDEX idx_integration_marketplace_category ON integration_marketplace(category, status);

-- Partitioning for api_requests (monthly partitions)
-- This would be implemented with pg_partman for production

-- Function to encrypt sensitive data
CREATE OR REPLACE FUNCTION encrypt_sensitive_data(data TEXT)
RETURNS TEXT AS $$
BEGIN
  -- In production, this would use proper encryption
  -- For now, we'll use a placeholder
  RETURN encode(digest(data, 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql;
```

---

## 🎨 UI COMPONENTS ARCHITECTURE

### **IntegrationsHub Component**
```typescript
// src/components/integrations/IntegrationsHub.tsx
interface IntegrationsHubProps {
  user: User;
  organization: Organization;
}

interface IntegrationsHubState {
  availableIntegrations: MarketplaceIntegration[];
  installedIntegrations: Integration[];
  categories: IntegrationCategory[];
  activeTab: 'marketplace' | 'installed' | 'api_keys' | 'webhooks';
  searchQuery: string;
  selectedCategory: string;
  filters: IntegrationFilters;
  loading: boolean;
  error: string | null;
}

interface IntegrationFilters {
  category: string[];
  pricingModel: string[];
  integrationTypes: string[];
  featured: boolean;
}

export const IntegrationsHub: React.FC<IntegrationsHubProps> = ({
  user,
  organization
}) => {
  const [state, setState] = useState<IntegrationsHubState>({
    availableIntegrations: [],
    installedIntegrations: [],
    categories: [],
    activeTab: 'marketplace',
    searchQuery: '',
    selectedCategory: '',
    filters: {
      category: [],
      pricingModel: [],
      integrationTypes: [],
      featured: false
    },
    loading: true,
    error: null
  });

  const { trackEvent } = useAnalytics();

  useEffect(() => {
    loadIntegrations();
  }, [state.activeTab, state.searchQuery, state.filters]);

  const loadIntegrations = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const [marketplaceResponse, installedResponse] = await Promise.all([
        fetch(`/api/integrations/marketplace?${new URLSearchParams({
          search: state.searchQuery,
          category: state.selectedCategory,
          ...state.filters
        })}`),
        fetch('/api/integrations/installed')
      ]);

      if (!marketplaceResponse.ok || !installedResponse.ok) {
        throw new Error('Failed to load integrations');
      }

      const [marketplaceData, installedData] = await Promise.all([
        marketplaceResponse.json(),
        installedResponse.json()
      ]);

      setState(prev => ({
        ...prev,
        availableIntegrations: marketplaceData.integrations,
        installedIntegrations: installedData.integrations,
        categories: marketplaceData.categories
      }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load integrations'
      }));
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const handleTabChange = (tab: typeof state.activeTab) => {
    setState(prev => ({ ...prev, activeTab: tab }));
    trackEvent('integrations_tab_change', { tab });
  };

  const handleInstallIntegration = async (integrationId: string) => {
    try {
      const response = await fetch('/api/integrations/install', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ integrationId })
      });

      if (!response.ok) throw new Error('Failed to install integration');

      const result = await response.json();
      
      // Handle OAuth redirect if needed
      if (result.requiresAuth && result.authUrl) {
        window.location.href = result.authUrl;
        return;
      }

      // Refresh integrations list
      await loadIntegrations();
      
      trackEvent('integration_installed', { integration_id: integrationId });

    } catch (error) {
      console.error('Integration installation failed:', error);
    }
  };

  const handleConfigureIntegration = (integration: Integration) => {
    setState(prev => ({ 
      ...prev, 
      selectedIntegration: integration,
      showConfigModal: true 
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8">
            <div className="md:flex md:items-center md:justify-between">
              <div className="flex-1 min-w-0">
                <h1 className="text-3xl font-bold text-gray-900">
                  Integrations Hub
                </h1>
                <p className="mt-2 text-lg text-gray-600">
                  Connect ResearchHub with your favorite tools and services
                </p>
              </div>
              
              <div className="mt-4 md:mt-0 md:ml-4">
                <CreateIntegrationButton
                  onIntegrationCreated={() => loadIntegrations()}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'marketplace', name: 'Marketplace', icon: Store, count: state.availableIntegrations.length },
              { id: 'installed', name: 'Installed', icon: CheckCircle, count: state.installedIntegrations.length },
              { id: 'api_keys', name: 'API Keys', icon: Key, count: 0 },
              { id: 'webhooks', name: 'Webhooks', icon: Webhook, count: 0 }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id as typeof state.activeTab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  state.activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                  {tab.count > 0 && (
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                      {tab.count}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Search and Filters */}
        {state.activeTab === 'marketplace' && (
          <div className="mb-8">
            <IntegrationSearchFilters
              searchQuery={state.searchQuery}
              selectedCategory={state.selectedCategory}
              filters={state.filters}
              categories={state.categories}
              onSearchChange={(query) => setState(prev => ({ ...prev, searchQuery: query }))}
              onCategoryChange={(category) => setState(prev => ({ ...prev, selectedCategory: category }))}
              onFiltersChange={(filters) => setState(prev => ({ ...prev, filters }))}
            />
          </div>
        )}

        {/* Tab Content */}
        {state.loading ? (
          <IntegrationsLoadingState />
        ) : state.error ? (
          <IntegrationsErrorState error={state.error} onRetry={loadIntegrations} />
        ) : (
          <>
            {state.activeTab === 'marketplace' && (
              <IntegrationsMarketplace
                integrations={state.availableIntegrations}
                installedIntegrations={state.installedIntegrations}
                onInstall={handleInstallIntegration}
                onViewDetails={(integration) => {
                  setState(prev => ({ 
                    ...prev, 
                    selectedIntegration: integration,
                    showDetailsModal: true 
                  }));
                }}
              />
            )}

            {state.activeTab === 'installed' && (
              <InstalledIntegrations
                integrations={state.installedIntegrations}
                onConfigure={handleConfigureIntegration}
                onDisconnect={async (integrationId) => {
                  await fetch(`/api/integrations/${integrationId}`, { method: 'DELETE' });
                  loadIntegrations();
                }}
                onToggle={async (integrationId, enabled) => {
                  await fetch(`/api/integrations/${integrationId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ enabled })
                  });
                  loadIntegrations();
                }}
              />
            )}

            {state.activeTab === 'api_keys' && (
              <APIKeysManagement
                organization={organization}
                user={user}
              />
            )}

            {state.activeTab === 'webhooks' && (
              <WebhooksManagement
                organization={organization}
                user={user}
              />
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {state.showDetailsModal && state.selectedIntegration && (
        <IntegrationDetailsModal
          integration={state.selectedIntegration}
          onClose={() => setState(prev => ({ ...prev, showDetailsModal: false }))}
          onInstall={() => {
            handleInstallIntegration(state.selectedIntegration!.id);
            setState(prev => ({ ...prev, showDetailsModal: false }));
          }}
        />
      )}

      {state.showConfigModal && state.selectedIntegration && (
        <IntegrationConfigModal
          integration={state.selectedIntegration}
          onClose={() => setState(prev => ({ ...prev, showConfigModal: false }))}
          onSave={() => {
            loadIntegrations();
            setState(prev => ({ ...prev, showConfigModal: false }));
          }}
        />
      )}
    </div>
  );
};
```

### **APIKeysManagement Component**
```typescript
// src/components/integrations/APIKeysManagement.tsx
interface APIKeysManagementProps {
  organization: Organization;
  user: User;
}

interface APIKeysState {
  apiKeys: APIKey[];
  selectedKey: APIKey | null;
  showCreateModal: boolean;
  showDeleteModal: boolean;
  loading: boolean;
  error: string | null;
}

export const APIKeysManagement: React.FC<APIKeysManagementProps> = ({
  organization,
  user
}) => {
  const [state, setState] = useState<APIKeysState>({
    apiKeys: [],
    selectedKey: null,
    showCreateModal: false,
    showDeleteModal: false,
    loading: true,
    error: null
  });

  const { trackEvent } = useAnalytics();

  useEffect(() => {
    loadAPIKeys();
  }, []);

  const loadAPIKeys = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const response = await fetch('/api/api-keys');
      if (!response.ok) throw new Error('Failed to load API keys');

      const data = await response.json();
      setState(prev => ({ ...prev, apiKeys: data.apiKeys }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load API keys'
      }));
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const handleCreateAPIKey = async (keyData: CreateAPIKeyData) => {
    try {
      const response = await fetch('/api/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(keyData)
      });

      if (!response.ok) throw new Error('Failed to create API key');

      const data = await response.json();
      
      // Show the API key to the user (only time it's visible)
      setState(prev => ({ 
        ...prev, 
        showCreateModal: false,
        newAPIKey: data.apiKey // This will trigger a modal to show the key
      }));

      await loadAPIKeys();
      
      trackEvent('api_key_created', {
        scopes: keyData.scopes,
        organization_id: organization.id
      });

    } catch (error) {
      console.error('API key creation failed:', error);
    }
  };

  const handleDeleteAPIKey = async (keyId: string) => {
    try {
      const response = await fetch(`/api/api-keys/${keyId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete API key');

      setState(prev => ({ 
        ...prev, 
        showDeleteModal: false,
        selectedKey: null
      }));

      await loadAPIKeys();
      
      trackEvent('api_key_deleted', { key_id: keyId });

    } catch (error) {
      console.error('API key deletion failed:', error);
    }
  };

  const handleToggleKeyStatus = async (keyId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/api-keys/${keyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive })
      });

      if (!response.ok) throw new Error('Failed to update API key');

      await loadAPIKeys();
      
      trackEvent('api_key_toggled', { 
        key_id: keyId, 
        is_active: isActive 
      });

    } catch (error) {
      console.error('API key update failed:', error);
    }
  };

  if (state.loading) {
    return <APIKeysLoadingSkeleton />;
  }

  if (state.error) {
    return <APIKeysErrorState error={state.error} onRetry={loadAPIKeys} />;
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">API Keys</h2>
          <p className="mt-1 text-sm text-gray-600">
            Manage API keys for programmatic access to ResearchHub
          </p>
        </div>
        
        <div className="mt-4 md:mt-0">
          <button
            onClick={() => setState(prev => ({ ...prev, showCreateModal: true }))}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create API Key
          </button>
        </div>
      </div>

      {/* API Keys List */}
      {state.apiKeys.length === 0 ? (
        <EmptyAPIKeysState
          onCreateFirst={() => setState(prev => ({ ...prev, showCreateModal: true }))}
        />
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Your API Keys</h3>
          </div>
          
          <div className="divide-y divide-gray-200">
            {state.apiKeys.map((apiKey) => (
              <APIKeyItem
                key={apiKey.id}
                apiKey={apiKey}
                onToggleStatus={(isActive) => handleToggleKeyStatus(apiKey.id, isActive)}
                onViewUsage={() => {
                  setState(prev => ({ 
                    ...prev, 
                    selectedKey: apiKey,
                    showUsageModal: true 
                  }));
                }}
                onDelete={() => {
                  setState(prev => ({ 
                    ...prev, 
                    selectedKey: apiKey,
                    showDeleteModal: true 
                  }));
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Usage Statistics */}
      <APIUsageStatistics
        organization={organization}
        timeRange={{ period: 'day', value: 30 }}
      />

      {/* Developer Resources */}
      <DeveloperResources />

      {/* Modals */}
      {state.showCreateModal && (
        <CreateAPIKeyModal
          organization={organization}
          onClose={() => setState(prev => ({ ...prev, showCreateModal: false }))}
          onCreate={handleCreateAPIKey}
        />
      )}

      {state.showDeleteModal && state.selectedKey && (
        <DeleteAPIKeyModal
          apiKey={state.selectedKey}
          onClose={() => setState(prev => ({ ...prev, showDeleteModal: false }))}
          onConfirm={() => handleDeleteAPIKey(state.selectedKey!.id)}
        />
      )}

      {state.newAPIKey && (
        <NewAPIKeyModal
          apiKey={state.newAPIKey}
          onClose={() => setState(prev => ({ ...prev, newAPIKey: null }))}
        />
      )}

      {state.showUsageModal && state.selectedKey && (
        <APIKeyUsageModal
          apiKey={state.selectedKey}
          onClose={() => setState(prev => ({ ...prev, showUsageModal: false }))}
        />
      )}
    </div>
  );
};
```

---

## 🔧 API IMPLEMENTATION

### **API Keys Management API**
```typescript
// api/api-keys/index.ts
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createServerSupabaseClient({ req, res });
  
  // Verify authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  switch (req.method) {
    case 'GET':
      return handleGetAPIKeys(req, res, supabase, user);
    case 'POST':
      return handleCreateAPIKey(req, res, supabase, user);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function handleGetAPIKeys(req: any, res: any, supabase: any, user: any) {
  try {
    // Get user's organization
    const { data: userProfile } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    if (!userProfile?.organization_id) {
      return res.status(400).json({ error: 'User must belong to an organization' });
    }

    // Get API keys for the organization
    const { data: apiKeys, error } = await supabase
      .from('api_keys')
      .select(`
        id,
        key_name,
        key_prefix,
        scopes,
        rate_limit_per_minute,
        rate_limit_per_hour,
        rate_limit_per_day,
        requests_count,
        last_used,
        is_active,
        expires_at,
        created_at,
        created_by:users!created_by(name)
      `)
      .eq('organization_id', userProfile.organization_id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return res.status(200).json({ apiKeys });

  } catch (error) {
    console.error('Get API keys error:', error);
    return res.status(500).json({ error: 'Failed to fetch API keys' });
  }
}

async function handleCreateAPIKey(req: any, res: any, supabase: any, user: any) {
  try {
    const {
      keyName,
      scopes,
      rateLimits,
      expiresAt,
      description,
      ipWhitelist
    } = req.body;

    // Validate required fields
    if (!keyName || !scopes || scopes.length === 0) {
      return res.status(400).json({ error: 'Key name and scopes are required' });
    }

    // Get user's organization
    const { data: userProfile } = await supabase
      .from('users')
      .select('organization_id, role')
      .eq('id', user.id)
      .single();

    if (!userProfile?.organization_id) {
      return res.status(400).json({ error: 'User must belong to an organization' });
    }

    // Check permissions for sensitive scopes
    const sensitiveScopes = ['write:users', 'write:organizations', 'admin:all'];
    const hasSensitiveScopes = scopes.some((scope: string) => sensitiveScopes.includes(scope));
    
    if (hasSensitiveScopes && userProfile.role !== 'admin') {
      return res.status(403).json({ error: 'Admin role required for sensitive scopes' });
    }

    // Generate API key
    const apiKey = generateAPIKey(); // Custom function to generate secure key
    const keyHash = await hashAPIKey(apiKey);
    const keyPrefix = apiKey.substring(0, 8);

    // Create API key record
    const { data: newAPIKey, error } = await supabase
      .from('api_keys')
      .insert({
        key_name: keyName,
        key_hash: keyHash,
        key_prefix: keyPrefix,
        scopes,
        rate_limit_per_minute: rateLimits?.perMinute || 1000,
        rate_limit_per_hour: rateLimits?.perHour || 10000,
        rate_limit_per_day: rateLimits?.perDay || 100000,
        expires_at: expiresAt,
        description,
        ip_whitelist: ipWhitelist || [],
        created_by: user.id,
        organization_id: userProfile.organization_id
      })
      .select()
      .single();

    if (error) throw error;

    // Log API key creation
    await logAPIActivity(supabase, {
      apiKeyId: newAPIKey.id,
      action: 'created',
      userId: user.id,
      details: { keyName, scopes }
    });

    // Return the API key (this is the ONLY time the full key is returned)
    return res.status(201).json({
      apiKey: {
        ...newAPIKey,
        key: apiKey // Full key only returned on creation
      }
    });

  } catch (error) {
    console.error('Create API key error:', error);
    return res.status(500).json({ error: 'Failed to create API key' });
  }
}

function generateAPIKey(): string {
  // Generate a secure API key with format: rh_live_[32 random chars]
  const prefix = 'rh_live_';
  const randomBytes = crypto.randomBytes(16);
  const randomString = randomBytes.toString('hex');
  return prefix + randomString;
}

async function hashAPIKey(apiKey: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(apiKey);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
```

### **Integrations Marketplace API**
```typescript
// api/integrations/marketplace.ts
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      search = '',
      category = '',
      pricing_model = '',
      featured = '',
      limit = '20',
      offset = '0'
    } = req.query;

    const supabase = createServerSupabaseClient({ req, res });

    // Build query
    let query = supabase
      .from('integration_marketplace')
      .select(`
        *,
        developer:users!created_by(name, avatar_url)
      `)
      .eq('status', 'published')
      .range(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string) - 1);

    // Apply filters
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,tags.cs.{${search}}`);
    }

    if (category) {
      query = query.eq('category', category);
    }

    if (pricing_model) {
      query = query.eq('pricing_model', pricing_model);
    }

    if (featured === 'true') {
      query = query.eq('is_featured', true);
    }

    // Order by featured first, then by rating
    query = query.order('is_featured', { ascending: false })
                 .order('rating_average', { ascending: false })
                 .order('install_count', { ascending: false });

    const { data: integrations, error } = await query;

    if (error) throw error;

    // Get categories for filtering
    const { data: categories } = await supabase
      .from('integration_marketplace')
      .select('category')
      .eq('status', 'published')
      .group('category');

    return res.status(200).json({
      integrations: integrations || [],
      categories: categories?.map(c => c.category) || [],
      pagination: {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        hasMore: (integrations?.length || 0) === parseInt(limit as string)
      }
    });

  } catch (error) {
    console.error('Marketplace integrations error:', error);
    return res.status(500).json({ error: 'Failed to fetch integrations' });
  }
}
```

### **Webhooks Management API**
```typescript
// api/webhooks/index.ts
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createServerSupabaseClient({ req, res });
  
  // Verify authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  switch (req.method) {
    case 'GET':
      return handleGetWebhooks(req, res, supabase, user);
    case 'POST':
      return handleCreateWebhook(req, res, supabase, user);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function handleGetWebhooks(req: any, res: any, supabase: any, user: any) {
  try {
    // Get user's organization
    const { data: userProfile } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    if (!userProfile?.organization_id) {
      return res.status(400).json({ error: 'User must belong to an organization' });
    }

    // Get webhooks for the organization
    const { data: webhooks, error } = await supabase
      .from('webhooks')
      .select(`
        *,
        recent_deliveries:webhook_deliveries(
          id,
          status,
          delivered_at,
          response_time_ms
        )
      `)
      .eq('organization_id', userProfile.organization_id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Add delivery statistics
    const webhooksWithStats = await Promise.all(
      webhooks.map(async (webhook) => {
        const { data: deliveryStats } = await supabase
          .from('webhook_deliveries')
          .select('status')
          .eq('webhook_id', webhook.id)
          .gte('scheduled_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()); // Last 7 days

        const successCount = deliveryStats?.filter(d => d.status === 'delivered').length || 0;
        const totalCount = deliveryStats?.length || 0;
        const successRate = totalCount > 0 ? (successCount / totalCount) * 100 : 0;

        return {
          ...webhook,
          stats: {
            successRate,
            totalDeliveries: totalCount,
            successfulDeliveries: successCount
          }
        };
      })
    );

    return res.status(200).json({ webhooks: webhooksWithStats });

  } catch (error) {
    console.error('Get webhooks error:', error);
    return res.status(500).json({ error: 'Failed to fetch webhooks' });
  }
}

async function handleCreateWebhook(req: any, res: any, supabase: any, user: any) {
  try {
    const {
      name,
      url,
      events,
      filters,
      secret,
      customHeaders
    } = req.body;

    // Validate required fields
    if (!name || !url || !events || events.length === 0) {
      return res.status(400).json({ error: 'Name, URL, and events are required' });
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return res.status(400).json({ error: 'Invalid webhook URL' });
    }

    // Get user's organization
    const { data: userProfile } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    if (!userProfile?.organization_id) {
      return res.status(400).json({ error: 'User must belong to an organization' });
    }

    // Create webhook
    const { data: webhook, error } = await supabase
      .from('webhooks')
      .insert({
        name,
        url,
        events,
        filters: filters || {},
        secret: secret || generateWebhookSecret(),
        custom_headers: customHeaders || {},
        organization_id: userProfile.organization_id,
        created_by: user.id
      })
      .select()
      .single();

    if (error) throw error;

    // Test webhook with a ping event
    await sendWebhookPing(webhook);

    return res.status(201).json({ webhook });

  } catch (error) {
    console.error('Create webhook error:', error);
    return res.status(500).json({ error: 'Failed to create webhook' });
  }
}

function generateWebhookSecret(): string {
  return crypto.randomBytes(32).toString('hex');
}

async function sendWebhookPing(webhook: any) {
  try {
    const payload = {
      event: 'webhook.test',
      data: {
        webhook_id: webhook.id,
        timestamp: new Date().toISOString(),
        message: 'This is a test webhook delivery'
      }
    };

    const signature = generateWebhookSignature(payload, webhook.secret);

    await fetch(webhook.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-ResearchHub-Signature': signature,
        'X-ResearchHub-Event': 'webhook.test',
        ...webhook.custom_headers
      },
      body: JSON.stringify(payload)
    });

  } catch (error) {
    console.error('Webhook ping failed:', error);
  }
}
```

---

## 🧪 TESTING SPECIFICATIONS

### **Integrations Hub Testing**
```typescript
// tests/integrations/integrations-hub.test.ts
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { IntegrationsHub } from '@/components/integrations/IntegrationsHub';
import { mockUser, mockOrganization, mockIntegrations } from '@/test-utils/mocks';

describe('IntegrationsHub', () => {
  beforeEach(() => {
    fetchMock.mockImplementation((url) => {
      if (url.includes('/api/integrations/marketplace')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            integrations: mockIntegrations.marketplace,
            categories: mockIntegrations.categories
          })
        });
      }
      if (url.includes('/api/integrations/installed')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            integrations: mockIntegrations.installed
          })
        });
      }
      return Promise.reject(new Error('Not mocked'));
    });
  });

  it('should display marketplace integrations by default', async () => {
    render(
      <IntegrationsHub 
        user={mockUser} 
        organization={mockOrganization} 
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Integrations Hub')).toBeInTheDocument();
    });

    expect(screen.getByText('Marketplace')).toHaveClass('border-blue-500');
    expect(screen.getByText(mockIntegrations.marketplace[0].name)).toBeInTheDocument();
  });

  it('should switch to installed integrations tab', async () => {
    render(
      <IntegrationsHub 
        user={mockUser} 
        organization={mockOrganization} 
      />
    );

    const installedTab = await screen.findByText('Installed');
    fireEvent.click(installedTab);

    await waitFor(() => {
      expect(screen.getByText('Installed')).toHaveClass('border-blue-500');
    });

    expect(screen.getByText(mockIntegrations.installed[0].name)).toBeInTheDocument();
  });

  it('should filter integrations by category', async () => {
    render(
      <IntegrationsHub 
        user={mockUser} 
        organization={mockOrganization} 
      />
    );

    const categoryFilter = await screen.findByText('Communication');
    fireEvent.click(categoryFilter);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('category=communication'),
        expect.any(Object)
      );
    });
  });

  it('should install an integration', async () => {
    fetchMock.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true })
      })
    );

    render(
      <IntegrationsHub 
        user={mockUser} 
        organization={mockOrganization} 
      />
    );

    const installButton = await screen.findByText('Install');
    fireEvent.click(installButton);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/integrations/install',
        expect.objectContaining({
          method: 'POST'
        })
      );
    });
  });

  it('should display API keys management', async () => {
    render(
      <IntegrationsHub 
        user={mockUser} 
        organization={mockOrganization} 
      />
    );

    const apiKeysTab = await screen.findByText('API Keys');
    fireEvent.click(apiKeysTab);

    expect(screen.getByText('Manage API keys for programmatic access')).toBeInTheDocument();
  });
});
```

### **API Keys Testing**
```typescript
// tests/integrations/api-keys.test.ts
describe('API Keys Management', () => {
  it('should create a new API key', async () => {
    const mockAPIKey = {
      id: 'key-1',
      key: 'rh_live_abcd1234efgh5678',
      name: 'Test API Key',
      scopes: ['read:studies', 'write:studies']
    };

    fetchMock.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ apiKey: mockAPIKey })
      })
    );

    render(
      <APIKeysManagement 
        user={mockUser} 
        organization={mockOrganization} 
      />
    );

    fireEvent.click(screen.getByText('Create API Key'));

    // Fill form
    fireEvent.change(screen.getByLabelText(/key name/i), {
      target: { value: 'Test API Key' }
    });
    
    fireEvent.click(screen.getByLabelText(/read:studies/i));
    fireEvent.click(screen.getByText('Create Key'));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/api-keys',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('Test API Key')
        })
      );
    });

    // Should show the API key (only time it's visible)
    expect(screen.getByText('rh_live_abcd1234efgh5678')).toBeInTheDocument();
  });

  it('should toggle API key status', async () => {
    const mockAPIKeys = [{
      id: 'key-1',
      name: 'Test Key',
      is_active: true,
      scopes: ['read:studies']
    }];

    fetchMock.mockImplementation((url) => {
      if (url.includes('/api/api-keys') && !url.includes('key-1')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ apiKeys: mockAPIKeys })
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });

    render(
      <APIKeysManagement 
        user={mockUser} 
        organization={mockOrganization} 
      />
    );

    const toggleButton = await screen.findByRole('switch');
    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/api-keys/key-1',
        expect.objectContaining({
          method: 'PATCH',
          body: expect.stringContaining('"isActive":false')
        })
      );
    });
  });
});
```

---

## 🎯 SUCCESS CRITERIA & VALIDATION

### **Integrations Ecosystem KPIs**
```typescript
interface IntegrationsEcosystemKPIs {
  adoption: {
    organizationsUsingIntegrations: number; // Target: >70%
    averageIntegrationsPerOrg: number; // Target: >3
    integrationUsageGrowth: number; // Target: >15% monthly
    developerAPIAdoption: number; // Target: >40% of orgs
  };
  
  reliability: {
    integrationUptime: number; // Target: >99.9%
    webhookDeliverySuccess: number; // Target: >98%
    apiResponseTime: number; // Target: <200ms average
    errorRate: number; // Target: <0.1%
  };
  
  ecosystem: {
    availableIntegrations: number; // Target: >25
    communityIntegrations: number; // Target: >10
    apiKeyUsage: number; // Target: >1M requests/month
    developerSatisfaction: number; // Target: >4.8/5
  };
  
  businessImpact: {
    workflowEfficiencyGain: number; // Target: >30%
    timeToValueReduction: number; // Target: >50%
    customerRetention: number; // Target: >5% increase
    apiRevenueGrowth: number; // Target: >25% annually
  };
}
```

### **Technical Performance Targets**
```typescript
const INTEGRATIONS_PERFORMANCE_TARGETS = {
  apiLatency: {
    target: '<200ms',
    measurement: 'Average API response time',
    acceptance: '95th percentile under target'
  },
  
  webhookDelivery: {
    target: '>98%',
    measurement: 'Webhook delivery success rate',
    acceptance: 'Weekly success rate above target'
  },
  
  integrationHealth: {
    target: '>99.9%',
    measurement: 'Integration uptime and availability',
    acceptance: 'Monthly uptime above target'
  },
  
  developerExperience: {
    target: '<5 minutes',
    measurement: 'Time to first successful API call',
    acceptance: 'Developer onboarding under target'
  }
};
```

---

## 🚀 IMPLEMENTATION ROADMAP

### **Phase 1: Core API Infrastructure (Week 1)**
- [ ] API key management system
- [ ] Rate limiting and authentication
- [ ] Basic webhook framework
- [ ] Core API endpoints
- [ ] Developer documentation

### **Phase 2: Integration Framework (Week 2)**
- [ ] Integration management interface
- [ ] OAuth application support
- [ ] Webhook delivery system
- [ ] Integration health monitoring
- [ ] Error handling and retry logic

### **Phase 3: Marketplace & Discovery (Week 3)**
- [ ] Integration marketplace
- [ ] Third-party integrations
- [ ] Integration templates
- [ ] Community contributions
- [ ] Usage analytics dashboard

### **Phase 4: Advanced Features (Week 4)**
- [ ] Advanced API features
- [ ] Enterprise integrations
- [ ] Custom integration builder
- [ ] Integration testing tools
- [ ] Performance optimization

---

**🔗 INTEGRATIONS & API ECOSYSTEM: Connecting ResearchHub seamlessly with existing workflows through powerful APIs and intelligent integrations that enhance research productivity and accelerate insights.**
