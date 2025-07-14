# 📊 ADMIN DASHBOARD SYSTEM - COMPREHENSIVE REQUIREMENTS
## Advanced Platform Administration & Management

**Created**: July 12, 2025  
**Status**: 🟢 GREENFIELD SPECIFICATION  
**Scope**: Complete admin interface, system management, and analytics platform  
**Dependencies**: User Management (03-USER_MANAGEMENT_SYSTEM.md), Platform Foundation (01-PLATFORM_FOUNDATION.md)

---

## 📋 EXECUTIVE SUMMARY

The Admin Dashboard System provides comprehensive platform administration capabilities, enabling administrators to manage users, organizations, studies, analytics, and system health with enterprise-grade tools and insights.

### **🎯 Core Value Proposition**
> "Powerful administrative control with actionable insights to optimize platform performance and user experience"

### **🏆 Success Metrics**
- **Admin Efficiency**: <2 minutes average task completion time
- **System Health**: 99.9% uptime monitoring accuracy
- **Issue Resolution**: <15 minutes mean time to resolution
- **Data Insights**: 100% business metric coverage

---

## 🗄️ DATABASE SCHEMA

### **Admin Management Tables**
```sql
-- Admin activity tracking and audit logs
CREATE TABLE admin_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Activity details
  action admin_action NOT NULL,
  resource_type admin_resource_type NOT NULL,
  resource_id UUID,
  
  -- Activity context
  description TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  
  -- Impact tracking
  affected_users UUID[] DEFAULT '{}',
  affected_entities JSONB DEFAULT '{}',
  
  -- Request context
  ip_address INET,
  user_agent TEXT,
  session_id UUID,
  
  -- Results
  status action_status NOT NULL DEFAULT 'completed',
  error_message TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System settings and configuration management
CREATE TABLE admin_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category setting_category NOT NULL,
  key VARCHAR(100) NOT NULL,
  value JSONB NOT NULL,
  
  -- Metadata
  label VARCHAR(200) NOT NULL,
  description TEXT,
  data_type setting_data_type NOT NULL,
  validation_rules JSONB DEFAULT '{}',
  
  -- Access control
  is_public BOOLEAN DEFAULT FALSE,
  requires_restart BOOLEAN DEFAULT FALSE,
  is_encrypted BOOLEAN DEFAULT FALSE,
  
  -- Change tracking
  created_by UUID NOT NULL REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- History
  previous_value JSONB,
  change_reason TEXT,
  
  UNIQUE(category, key)
);

-- System health monitoring and alerts
CREATE TABLE system_health_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Metric details
  metric_name VARCHAR(100) NOT NULL,
  metric_category health_category NOT NULL,
  metric_value DECIMAL(15,6) NOT NULL,
  metric_unit VARCHAR(20),
  
  -- Thresholds
  warning_threshold DECIMAL(15,6),
  critical_threshold DECIMAL(15,6),
  
  -- Status
  status health_status NOT NULL DEFAULT 'healthy',
  alert_level alert_level,
  
  -- Context
  source VARCHAR(50) NOT NULL,
  tags JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  measured_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System alerts and notifications for admins
CREATE TABLE admin_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Alert details
  alert_type alert_type NOT NULL,
  severity alert_severity NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  
  -- Related resources
  resource_type admin_resource_type,
  resource_id UUID,
  affected_count INTEGER DEFAULT 0,
  
  -- Alert data
  alert_data JSONB DEFAULT '{}',
  conditions_met JSONB DEFAULT '{}',
  
  -- Status tracking
  status alert_status NOT NULL DEFAULT 'active',
  acknowledged_by UUID REFERENCES users(id),
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES users(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolution_notes TEXT,
  
  -- Timestamps
  triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Platform analytics aggregations
CREATE TABLE platform_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Time period
  period_type period_type NOT NULL,
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- User metrics
  total_users INTEGER DEFAULT 0,
  active_users INTEGER DEFAULT 0,
  new_users INTEGER DEFAULT 0,
  churned_users INTEGER DEFAULT 0,
  
  -- Study metrics
  total_studies INTEGER DEFAULT 0,
  active_studies INTEGER DEFAULT 0,
  completed_studies INTEGER DEFAULT 0,
  study_completion_rate DECIMAL(5,2) DEFAULT 0,
  
  -- Engagement metrics
  total_sessions INTEGER DEFAULT 0,
  avg_session_duration DECIMAL(10,2) DEFAULT 0,
  total_page_views INTEGER DEFAULT 0,
  bounce_rate DECIMAL(5,2) DEFAULT 0,
  
  -- Performance metrics
  avg_page_load_time DECIMAL(10,3) DEFAULT 0,
  avg_api_response_time DECIMAL(10,3) DEFAULT 0,
  error_rate DECIMAL(5,2) DEFAULT 0,
  uptime_percentage DECIMAL(5,2) DEFAULT 100,
  
  -- Business metrics
  total_revenue DECIMAL(12,2) DEFAULT 0,
  new_revenue DECIMAL(12,2) DEFAULT 0,
  mrr DECIMAL(12,2) DEFAULT 0, -- Monthly Recurring Revenue
  churn_rate DECIMAL(5,2) DEFAULT 0,
  
  -- System metrics
  database_size_mb DECIMAL(12,2) DEFAULT 0,
  storage_used_gb DECIMAL(12,2) DEFAULT 0,
  bandwidth_used_gb DECIMAL(12,2) DEFAULT 0,
  
  -- Calculated fields
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_source VARCHAR(50) DEFAULT 'system'
);

-- User behavior analysis
CREATE TABLE user_behavior_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Session data
  session_id UUID NOT NULL,
  session_start TIMESTAMP WITH TIME ZONE NOT NULL,
  session_end TIMESTAMP WITH TIME ZONE,
  session_duration INTEGER, -- seconds
  
  -- Interaction data
  pages_visited INTEGER DEFAULT 0,
  actions_taken INTEGER DEFAULT 0,
  studies_created INTEGER DEFAULT 0,
  studies_completed INTEGER DEFAULT 0,
  
  -- Device and context
  device_type device_type,
  browser VARCHAR(50),
  operating_system VARCHAR(50),
  screen_resolution VARCHAR(20),
  location_country VARCHAR(2),
  
  -- Engagement metrics
  engagement_score DECIMAL(3,2) DEFAULT 0, -- 0-1 scale
  feature_usage JSONB DEFAULT '{}',
  conversion_events JSONB DEFAULT '{}',
  
  -- Quality indicators
  error_count INTEGER DEFAULT 0,
  support_interactions INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content moderation and safety
CREATE TABLE content_moderation (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Content details
  content_type content_type NOT NULL,
  content_id UUID NOT NULL,
  content_text TEXT,
  content_metadata JSONB DEFAULT '{}',
  
  -- User context
  submitted_by UUID REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id),
  
  -- Moderation results
  moderation_status moderation_status NOT NULL DEFAULT 'pending',
  automated_flags JSONB DEFAULT '{}',
  risk_score DECIMAL(3,2) DEFAULT 0, -- 0-1 scale
  
  -- Human review
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_decision moderation_decision,
  review_reason TEXT,
  
  -- Actions taken
  action_taken moderation_action,
  action_reason TEXT,
  escalated BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ENUMs for admin system
CREATE TYPE admin_action AS ENUM (
  'create', 'update', 'delete', 'approve', 'reject', 'suspend', 'activate',
  'export', 'import', 'backup', 'restore', 'configure', 'monitor', 'alert'
);

CREATE TYPE admin_resource_type AS ENUM (
  'user', 'organization', 'study', 'payment', 'system_setting', 'alert', 'report'
);

CREATE TYPE action_status AS ENUM ('pending', 'in_progress', 'completed', 'failed', 'cancelled');

CREATE TYPE setting_category AS ENUM (
  'authentication', 'security', 'performance', 'features', 'integrations',
  'notifications', 'billing', 'analytics', 'moderation', 'maintenance'
);

CREATE TYPE setting_data_type AS ENUM ('string', 'number', 'boolean', 'json', 'array', 'encrypted');

CREATE TYPE health_category AS ENUM (
  'system', 'database', 'api', 'authentication', 'storage', 'network', 'security'
);

CREATE TYPE health_status AS ENUM ('healthy', 'warning', 'critical', 'unknown');

CREATE TYPE alert_level AS ENUM ('info', 'warning', 'error', 'critical');

CREATE TYPE alert_type AS ENUM (
  'system_health', 'security_incident', 'performance_degradation', 'user_activity',
  'billing_issue', 'integration_failure', 'data_anomaly', 'maintenance_required'
);

CREATE TYPE alert_severity AS ENUM ('low', 'medium', 'high', 'critical');

CREATE TYPE alert_status AS ENUM ('active', 'acknowledged', 'resolved', 'dismissed', 'expired');

CREATE TYPE period_type AS ENUM ('hour', 'day', 'week', 'month', 'quarter', 'year');

CREATE TYPE device_type AS ENUM ('desktop', 'mobile', 'tablet', 'unknown');

CREATE TYPE content_type AS ENUM ('study_title', 'study_description', 'user_profile', 'feedback', 'comment');

CREATE TYPE moderation_status AS ENUM ('pending', 'approved', 'flagged', 'rejected', 'escalated');

CREATE TYPE moderation_decision AS ENUM ('approve', 'flag', 'reject', 'escalate', 'request_changes');

CREATE TYPE moderation_action AS ENUM ('none', 'warn', 'edit', 'hide', 'delete', 'suspend_user', 'ban_user');

-- Performance indexes for admin queries
CREATE INDEX idx_admin_activities_admin ON admin_activities(admin_id, created_at);
CREATE INDEX idx_admin_activities_action ON admin_activities(action, created_at);
CREATE INDEX idx_admin_activities_resource ON admin_activities(resource_type, resource_id);
CREATE INDEX idx_admin_settings_category ON admin_settings(category, key);
CREATE INDEX idx_system_health_metrics_name ON system_health_metrics(metric_name, measured_at);
CREATE INDEX idx_system_health_metrics_status ON system_health_metrics(status, alert_level);
CREATE INDEX idx_admin_alerts_type ON admin_alerts(alert_type, severity, status);
CREATE INDEX idx_admin_alerts_resource ON admin_alerts(resource_type, resource_id);
CREATE INDEX idx_platform_analytics_period ON platform_analytics(period_type, period_start);
CREATE INDEX idx_user_behavior_analytics_user ON user_behavior_analytics(user_id, session_start);
CREATE INDEX idx_content_moderation_status ON content_moderation(moderation_status, submitted_at);
CREATE INDEX idx_content_moderation_user ON content_moderation(submitted_by, submitted_at);
```

---

## 🎨 UI COMPONENTS ARCHITECTURE

### **AdminDashboard Component**
```typescript
// src/components/admin/AdminDashboard.tsx
interface AdminDashboardProps {
  user: AdminUser;
  permissions: AdminPermission[];
}

interface DashboardState {
  activeTab: DashboardTab;
  timeRange: TimeRange;
  filters: DashboardFilters;
  refreshInterval: number;
  isLoading: boolean;
  error: string | null;
}

interface DashboardMetrics {
  systemHealth: SystemHealthMetrics;
  userMetrics: UserMetrics;
  studyMetrics: StudyMetrics;
  performanceMetrics: PerformanceMetrics;
  businessMetrics: BusinessMetrics;
  alerts: Alert[];
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  user,
  permissions
}) => {
  const [state, setState] = useState<DashboardState>({
    activeTab: 'overview',
    timeRange: { period: 'day', value: 7 },
    filters: {},
    refreshInterval: 30000, // 30 seconds
    isLoading: true,
    error: null
  });

  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [realTimeData, setRealTimeData] = useState<RealTimeMetrics>({});

  // Real-time data connection
  const { subscribe, unsubscribe } = useRealtimeMetrics();
  const { hasPermission } = useAdminPermissions(permissions);

  useEffect(() => {
    loadDashboardData();
    
    // Set up auto-refresh
    const refreshTimer = setInterval(loadDashboardData, state.refreshInterval);
    
    // Set up real-time updates for critical metrics
    const unsubscribeRealtime = subscribe(['system_health', 'active_users', 'alerts'], 
      (data) => setRealTimeData(prev => ({ ...prev, ...data }))
    );

    return () => {
      clearInterval(refreshTimer);
      unsubscribeRealtime();
    };
  }, [state.timeRange, state.filters]);

  const loadDashboardData = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await fetch('/api/admin/dashboard/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timeRange: state.timeRange,
          filters: state.filters,
          permissions
        })
      });

      if (!response.ok) throw new Error('Failed to load dashboard data');

      const data = await response.json();
      setMetrics(data.metrics);

    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to load data'
      }));
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleTabChange = (tab: DashboardTab) => {
    setState(prev => ({ ...prev, activeTab: tab }));
  };

  const handleTimeRangeChange = (timeRange: TimeRange) => {
    setState(prev => ({ ...prev, timeRange }));
  };

  const handleFilterChange = (filters: DashboardFilters) => {
    setState(prev => ({ ...prev, filters }));
  };

  if (state.isLoading && !metrics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <AdminLoadingSpinner />
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <AdminErrorDisplay 
          error={state.error} 
          onRetry={loadDashboardData}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Header */}
      <AdminHeader 
        user={user}
        alerts={metrics?.alerts || []}
        systemHealth={metrics?.systemHealth}
      />

      {/* Navigation */}
      <AdminNavigation
        activeTab={state.activeTab}
        onTabChange={handleTabChange}
        permissions={permissions}
      />

      {/* Controls */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 flex items-center justify-between">
            
            {/* Time Range Selector */}
            <TimeRangeSelector
              value={state.timeRange}
              onChange={handleTimeRangeChange}
              options={[
                { label: 'Last 24 hours', period: 'day', value: 1 },
                { label: 'Last 7 days', period: 'day', value: 7 },
                { label: 'Last 30 days', period: 'day', value: 30 },
                { label: 'Last 3 months', period: 'month', value: 3 },
                { label: 'Last 12 months', period: 'month', value: 12 }
              ]}
            />

            {/* Filters */}
            <DashboardFilters
              filters={state.filters}
              onChange={handleFilterChange}
              options={{
                userTypes: ['admin', 'researcher', 'participant'],
                studyTypes: ['usability', 'interview', 'survey'],
                organizations: metrics?.availableOrganizations || []
              }}
            />

            {/* Refresh Controls */}
            <div className="flex items-center space-x-3">
              <RefreshIntervalSelector
                value={state.refreshInterval}
                onChange={(interval) => setState(prev => ({ ...prev, refreshInterval: interval }))}
              />
              
              <button
                onClick={loadDashboardData}
                disabled={state.isLoading}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Refresh now"
              >
                <RefreshCw className={`w-5 h-5 ${state.isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Critical Alerts */}
        {metrics?.alerts && metrics.alerts.filter(a => a.severity === 'critical').length > 0 && (
          <div className="mb-6">
            <CriticalAlertsPanel 
              alerts={metrics.alerts.filter(a => a.severity === 'critical')}
              onDismiss={loadDashboardData}
            />
          </div>
        )}

        {/* Tab Content */}
        {state.activeTab === 'overview' && (
          <AdminOverviewTab
            metrics={metrics!}
            realTimeData={realTimeData}
            timeRange={state.timeRange}
            onDrillDown={(section) => handleTabChange(section as DashboardTab)}
          />
        )}

        {state.activeTab === 'users' && hasPermission('manage_users') && (
          <AdminUsersTab
            metrics={metrics!.userMetrics}
            timeRange={state.timeRange}
            filters={state.filters}
          />
        )}

        {state.activeTab === 'studies' && hasPermission('manage_studies') && (
          <AdminStudiesTab
            metrics={metrics!.studyMetrics}
            timeRange={state.timeRange}
            filters={state.filters}
          />
        )}

        {state.activeTab === 'system' && hasPermission('manage_system') && (
          <AdminSystemTab
            systemHealth={metrics!.systemHealth}
            performanceMetrics={metrics!.performanceMetrics}
            realTimeData={realTimeData}
          />
        )}

        {state.activeTab === 'analytics' && hasPermission('view_analytics') && (
          <AdminAnalyticsTab
            businessMetrics={metrics!.businessMetrics}
            userBehavior={metrics!.userBehavior}
            timeRange={state.timeRange}
          />
        )}

        {state.activeTab === 'settings' && hasPermission('manage_settings') && (
          <AdminSettingsTab
            settings={metrics!.systemSettings}
            onUpdate={loadDashboardData}
          />
        )}
      </div>

      {/* Real-time status indicator */}
      <RealTimeStatusIndicator
        isConnected={realTimeData.connected}
        lastUpdate={realTimeData.lastUpdate}
        dataHealth={realTimeData.health}
      />
    </div>
  );
};
```

### **SystemHealthMonitor Component**
```typescript
// src/components/admin/SystemHealthMonitor.tsx
interface SystemHealthMonitorProps {
  systemHealth: SystemHealthMetrics;
  realTimeData: RealTimeMetrics;
  onAlertAction: (alertId: string, action: AlertAction) => void;
}

interface HealthMetric {
  name: string;
  category: string;
  value: number;
  unit: string;
  status: 'healthy' | 'warning' | 'critical';
  threshold: {
    warning: number;
    critical: number;
  };
  trend: 'up' | 'down' | 'stable';
  history: HealthDataPoint[];
}

export const SystemHealthMonitor: React.FC<SystemHealthMonitorProps> = ({
  systemHealth,
  realTimeData,
  onAlertAction
}) => {
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d'>('24h');

  const healthCategories = [
    {
      id: 'system',
      name: 'System',
      icon: Server,
      metrics: systemHealth.system || []
    },
    {
      id: 'database',
      name: 'Database',
      icon: Database,
      metrics: systemHealth.database || []
    },
    {
      id: 'api',
      name: 'API',
      icon: Zap,
      metrics: systemHealth.api || []
    },
    {
      id: 'security',
      name: 'Security',
      icon: Shield,
      metrics: systemHealth.security || []
    }
  ];

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getOverallHealth = (): { status: string; score: number } => {
    const allMetrics = healthCategories.flatMap(cat => cat.metrics);
    if (allMetrics.length === 0) return { status: 'unknown', score: 0 };

    const criticalCount = allMetrics.filter(m => m.status === 'critical').length;
    const warningCount = allMetrics.filter(m => m.status === 'warning').length;
    const healthyCount = allMetrics.filter(m => m.status === 'healthy').length;

    if (criticalCount > 0) return { status: 'critical', score: 0 };
    if (warningCount > 0) return { status: 'warning', score: 60 };
    return { status: 'healthy', score: 100 };
  };

  const overallHealth = getOverallHealth();

  return (
    <div className="space-y-6">
      
      {/* Overall Health Score */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">System Health</h2>
            <p className="text-sm text-gray-600">Real-time platform monitoring</p>
          </div>
          
          <div className="text-right">
            <div className={`text-3xl font-bold ${getStatusColor(overallHealth.status).split(' ')[0]}`}>
              {overallHealth.score}%
            </div>
            <div className={`text-sm px-2 py-1 rounded-full ${getStatusColor(overallHealth.status)}`}>
              {overallHealth.status.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Health Score Visualization */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Health Score</span>
            <span>{overallHealth.score}/100</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                overallHealth.status === 'healthy' ? 'bg-green-600' :
                overallHealth.status === 'warning' ? 'bg-yellow-600' : 'bg-red-600'
              }`}
              style={{ width: `${overallHealth.score}%` }}
            />
          </div>
        </div>
      </div>

      {/* Health Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {healthCategories.map((category) => {
          const categoryHealth = category.metrics.reduce((acc, metric) => {
            if (metric.status === 'critical') acc.critical++;
            else if (metric.status === 'warning') acc.warning++;
            else acc.healthy++;
            return acc;
          }, { healthy: 0, warning: 0, critical: 0 });

          const categoryStatus = categoryHealth.critical > 0 ? 'critical' :
                                categoryHealth.warning > 0 ? 'warning' : 'healthy';

          return (
            <div key={category.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <category.icon className="w-6 h-6 text-gray-600" />
                  <div>
                    <h3 className="font-medium text-gray-900">{category.name}</h3>
                    <p className="text-sm text-gray-600">{category.metrics.length} metrics</p>
                  </div>
                </div>
                
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(categoryStatus)}`}>
                  {categoryStatus.toUpperCase()}
                </div>
              </div>

              {/* Metrics Summary */}
              <div className="mt-4 space-y-2">
                {category.metrics.slice(0, 3).map((metric) => (
                  <div key={metric.name} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{metric.name}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">
                        {metric.value}{metric.unit}
                      </span>
                      <div className={`w-2 h-2 rounded-full ${
                        metric.status === 'healthy' ? 'bg-green-600' :
                        metric.status === 'warning' ? 'bg-yellow-600' : 'bg-red-600'
                      }`} />
                    </div>
                  </div>
                ))}
                
                {category.metrics.length > 3 && (
                  <button
                    onClick={() => setSelectedMetric(category.id)}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    View {category.metrics.length - 3} more...
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Critical Alerts */}
      {systemHealth.alerts && systemHealth.alerts.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Active Alerts</h3>
          </div>
          
          <div className="divide-y divide-gray-200">
            {systemHealth.alerts.map((alert) => (
              <AlertItem
                key={alert.id}
                alert={alert}
                onAction={(action) => onAlertAction(alert.id, action)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Detailed Metric View Modal */}
      {selectedMetric && (
        <MetricDetailModal
          category={healthCategories.find(c => c.id === selectedMetric)!}
          timeRange={timeRange}
          onClose={() => setSelectedMetric(null)}
          onTimeRangeChange={setTimeRange}
        />
      )}
    </div>
  );
};
```

---

## 🔧 API IMPLEMENTATION

### **Admin Dashboard API**
```typescript
// api/admin/dashboard/metrics.ts
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createServerSupabaseClient({ req, res });
  
  // Verify admin access
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { data: adminUser } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!adminUser || adminUser.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { timeRange, filters, permissions } = req.body;
    
    // Build metrics based on permissions
    const metrics: DashboardMetrics = {};

    // System health (always included for admins)
    metrics.systemHealth = await getSystemHealthMetrics(supabase, timeRange);

    // User metrics
    if (permissions.includes('manage_users')) {
      metrics.userMetrics = await getUserMetrics(supabase, timeRange, filters);
    }

    // Study metrics
    if (permissions.includes('manage_studies')) {
      metrics.studyMetrics = await getStudyMetrics(supabase, timeRange, filters);
    }

    // Performance metrics
    if (permissions.includes('view_analytics')) {
      metrics.performanceMetrics = await getPerformanceMetrics(supabase, timeRange);
    }

    // Business metrics
    if (permissions.includes('view_business_metrics')) {
      metrics.businessMetrics = await getBusinessMetrics(supabase, timeRange);
    }

    // Active alerts
    metrics.alerts = await getActiveAlerts(supabase);

    return res.status(200).json({ metrics });

  } catch (error) {
    console.error('Admin dashboard error:', error);
    return res.status(500).json({ error: 'Failed to fetch dashboard metrics' });
  }
}

async function getSystemHealthMetrics(supabase: any, timeRange: TimeRange) {
  const { data: healthMetrics } = await supabase
    .from('system_health_metrics')
    .select('*')
    .gte('measured_at', getTimeRangeStart(timeRange))
    .order('measured_at', { ascending: false });

  const categorizedMetrics = healthMetrics?.reduce((acc, metric) => {
    if (!acc[metric.metric_category]) {
      acc[metric.metric_category] = [];
    }
    acc[metric.metric_category].push({
      name: metric.metric_name,
      value: metric.metric_value,
      unit: metric.metric_unit,
      status: metric.status,
      measuredAt: metric.measured_at
    });
    return acc;
  }, {}) || {};

  return {
    system: categorizedMetrics.system || [],
    database: categorizedMetrics.database || [],
    api: categorizedMetrics.api || [],
    security: categorizedMetrics.security || []
  };
}

async function getUserMetrics(supabase: any, timeRange: TimeRange, filters: any) {
  const timeStart = getTimeRangeStart(timeRange);
  
  // Total users
  const { count: totalUsers } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true });

  // Active users (logged in within time range)
  const { count: activeUsers } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .gte('last_active', timeStart);

  // New users
  const { count: newUsers } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', timeStart);

  // User growth data
  const { data: userGrowth } = await supabase
    .from('platform_analytics')
    .select('period_start, new_users, total_users')
    .eq('period_type', 'day')
    .gte('period_start', timeStart)
    .order('period_start');

  // User activity by role
  const { data: usersByRole } = await supabase
    .from('users')
    .select('role')
    .not('role', 'is', null);

  const roleDistribution = usersByRole?.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {}) || {};

  return {
    totalUsers: totalUsers || 0,
    activeUsers: activeUsers || 0,
    newUsers: newUsers || 0,
    userGrowth: userGrowth || [],
    roleDistribution,
    retentionRate: await calculateUserRetention(supabase, timeRange)
  };
}

async function getStudyMetrics(supabase: any, timeRange: TimeRange, filters: any) {
  const timeStart = getTimeRangeStart(timeRange);

  // Study counts by status
  const { data: studiesByStatus } = await supabase
    .from('studies')
    .select('status')
    .gte('created_at', timeStart);

  const statusDistribution = studiesByStatus?.reduce((acc, study) => {
    acc[study.status] = (acc[study.status] || 0) + 1;
    return acc;
  }, {}) || {};

  // Study completion rates
  const { data: studyCompletions } = await supabase
    .rpc('get_study_completion_stats', {
      start_date: timeStart,
      end_date: new Date().toISOString()
    });

  // Popular study types
  const { data: studyTypes } = await supabase
    .from('studies')
    .select('study_type')
    .gte('created_at', timeStart);

  const typeDistribution = studyTypes?.reduce((acc, study) => {
    acc[study.study_type] = (acc[study.study_type] || 0) + 1;
    return acc;
  }, {}) || {};

  return {
    statusDistribution,
    completionStats: studyCompletions?.[0] || {},
    typeDistribution,
    averageParticipants: await getAverageParticipantsPerStudy(supabase, timeRange),
    topPerformingStudies: await getTopPerformingStudies(supabase, timeRange)
  };
}

async function getPerformanceMetrics(supabase: any, timeRange: TimeRange) {
  const timeStart = getTimeRangeStart(timeRange);

  const { data: performanceData } = await supabase
    .from('platform_analytics')
    .select(`
      period_start,
      avg_page_load_time,
      avg_api_response_time,
      error_rate,
      uptime_percentage
    `)
    .gte('period_start', timeStart)
    .order('period_start');

  // Calculate averages
  const avgLoadTime = performanceData?.reduce((sum, d) => sum + d.avg_page_load_time, 0) / (performanceData?.length || 1);
  const avgApiTime = performanceData?.reduce((sum, d) => sum + d.avg_api_response_time, 0) / (performanceData?.length || 1);
  const avgErrorRate = performanceData?.reduce((sum, d) => sum + d.error_rate, 0) / (performanceData?.length || 1);
  const avgUptime = performanceData?.reduce((sum, d) => sum + d.uptime_percentage, 0) / (performanceData?.length || 1);

  return {
    averagePageLoadTime: avgLoadTime || 0,
    averageApiResponseTime: avgApiTime || 0,
    errorRate: avgErrorRate || 0,
    uptime: avgUptime || 100,
    performanceTrend: performanceData || []
  };
}

async function getActiveAlerts(supabase: any) {
  const { data: alerts } = await supabase
    .from('admin_alerts')
    .select('*')
    .eq('status', 'active')
    .order('triggered_at', { ascending: false })
    .limit(10);

  return alerts || [];
}
```

---

## 🧪 TESTING SPECIFICATIONS

### **Admin Dashboard Testing**
```typescript
// tests/admin/admin-dashboard.test.ts
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { mockAdminUser, mockDashboardMetrics } from '@/test-utils/mocks';

describe('AdminDashboard', () => {
  const mockPermissions = [
    'manage_users',
    'manage_studies',
    'view_analytics',
    'manage_system'
  ];

  beforeEach(() => {
    fetchMock.mockImplementation((url) => {
      if (url.includes('/api/admin/dashboard/metrics')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ metrics: mockDashboardMetrics })
        });
      }
      return Promise.reject(new Error('Not mocked'));
    });
  });

  it('should display system health overview', async () => {
    render(
      <AdminDashboard 
        user={mockAdminUser} 
        permissions={mockPermissions}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('System Health')).toBeInTheDocument();
    });

    expect(screen.getByText('100%')).toBeInTheDocument(); // Health score
    expect(screen.getByText('HEALTHY')).toBeInTheDocument();
  });

  it('should switch between dashboard tabs', async () => {
    render(
      <AdminDashboard 
        user={mockAdminUser} 
        permissions={mockPermissions}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Overview')).toBeInTheDocument();
    });

    // Click Users tab
    fireEvent.click(screen.getByText('Users'));
    
    await waitFor(() => {
      expect(screen.getByText('User Management')).toBeInTheDocument();
    });
  });

  it('should filter data by time range', async () => {
    render(
      <AdminDashboard 
        user={mockAdminUser} 
        permissions={mockPermissions}
      />
    );

    // Change time range
    const timeRangeSelector = await screen.findByLabelText(/time range/i);
    fireEvent.change(timeRangeSelector, { target: { value: '30d' } });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/admin/dashboard/metrics',
        expect.objectContaining({
          body: expect.stringContaining('"period":"day","value":30')
        })
      );
    });
  });

  it('should display critical alerts prominently', async () => {
    const criticalAlert = {
      id: '1',
      severity: 'critical',
      title: 'Database Connection Error',
      message: 'Unable to connect to primary database'
    };

    fetchMock.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          metrics: {
            ...mockDashboardMetrics,
            alerts: [criticalAlert]
          }
        })
      })
    );

    render(
      <AdminDashboard 
        user={mockAdminUser} 
        permissions={mockPermissions}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Database Connection Error')).toBeInTheDocument();
    });

    expect(screen.getByText('CRITICAL')).toBeInTheDocument();
  });

  it('should handle permission restrictions', () => {
    const limitedPermissions = ['view_analytics']; // No user management

    render(
      <AdminDashboard 
        user={mockAdminUser} 
        permissions={limitedPermissions}
      />
    );

    // Users tab should not be visible
    expect(screen.queryByText('Users')).not.toBeInTheDocument();
    
    // Analytics should be visible
    expect(screen.getByText('Analytics')).toBeInTheDocument();
  });

  it('should auto-refresh dashboard data', async () => {
    render(
      <AdminDashboard 
        user={mockAdminUser} 
        permissions={mockPermissions}
      />
    );

    // Initial load
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    // Fast-forward time to trigger auto-refresh
    jest.advanceTimersByTime(30000); // 30 seconds

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });
  });
});
```

### **System Health Monitoring Testing**
```typescript
// tests/admin/system-health.test.ts
describe('System Health Monitoring', () => {
  it('should categorize health metrics correctly', () => {
    const healthMetrics = {
      system: [
        { name: 'CPU Usage', value: 45, unit: '%', status: 'healthy' },
        { name: 'Memory Usage', value: 78, unit: '%', status: 'warning' }
      ],
      database: [
        { name: 'Query Time', value: 150, unit: 'ms', status: 'critical' }
      ]
    };

    render(
      <SystemHealthMonitor 
        systemHealth={healthMetrics}
        realTimeData={{}}
        onAlertAction={jest.fn()}
      />
    );

    expect(screen.getByText('System')).toBeInTheDocument();
    expect(screen.getByText('Database')).toBeInTheDocument();
    expect(screen.getByText('CPU Usage')).toBeInTheDocument();
    expect(screen.getByText('45%')).toBeInTheDocument();
  });

  it('should calculate overall health score', () => {
    const healthMetrics = {
      system: [
        { name: 'CPU', value: 45, status: 'healthy' },
        { name: 'Memory', value: 78, status: 'warning' }
      ],
      database: [
        { name: 'Query Time', value: 150, status: 'critical' }
      ]
    };

    render(
      <SystemHealthMonitor 
        systemHealth={healthMetrics}
        realTimeData={{}}
        onAlertAction={jest.fn()}
      />
    );

    // Should show critical status due to critical database metric
    expect(screen.getByText('0%')).toBeInTheDocument();
    expect(screen.getByText('CRITICAL')).toBeInTheDocument();
  });

  it('should handle alert actions', () => {
    const mockOnAlertAction = jest.fn();
    const alert = {
      id: 'alert-1',
      severity: 'critical',
      title: 'High CPU Usage',
      message: 'CPU usage above 90%'
    };

    render(
      <SystemHealthMonitor 
        systemHealth={{ alerts: [alert] }}
        realTimeData={{}}
        onAlertAction={mockOnAlertAction}
      />
    );

    fireEvent.click(screen.getByText('Acknowledge'));

    expect(mockOnAlertAction).toHaveBeenCalledWith('alert-1', 'acknowledge');
  });
});
```

---

## 🎯 SUCCESS CRITERIA & VALIDATION

### **Admin Efficiency KPIs**
```typescript
interface AdminEfficiencyKPIs {
  taskCompletion: {
    averageTaskTime: number; // Target: <2 minutes
    taskSuccessRate: number; // Target: >98%
    userOperationsPerHour: number; // Target: >30
    systemOperationsPerHour: number; // Target: >20
  };
  
  systemMonitoring: {
    issueDetectionTime: number; // Target: <1 minute
    falsePositiveRate: number; // Target: <5%
    alertResolutionTime: number; // Target: <15 minutes
    systemHealthAccuracy: number; // Target: >99%
  };
  
  dataInsights: {
    reportGenerationTime: number; // Target: <10 seconds
    dataFreshnessLatency: number; // Target: <5 minutes
    analyticsAccuracy: number; // Target: >99%
    metricsCoverage: number; // Target: 100%
  };
  
  userExperience: {
    adminSatisfactionScore: number; // Target: >4.5/5
    dashboardUsabilityScore: number; // Target: >4.7/5
    featureDiscoverability: number; // Target: >90%
    supportTicketVolume: number; // Target: <2/month
  };
}
```

### **System Reliability Metrics**
```typescript
const ADMIN_SYSTEM_TARGETS = {
  availability: {
    target: '99.99%',
    measurement: 'Admin dashboard uptime',
    acceptance: 'Monthly availability above target'
  },
  
  performance: {
    target: '<2 seconds',
    measurement: 'Dashboard load time',
    acceptance: '95th percentile under target'
  },
  
  dataAccuracy: {
    target: '100%',
    measurement: 'Real-time metric accuracy',
    acceptance: 'All metrics match source systems'
  },
  
  alertEffectiveness: {
    target: '<1% false positives',
    measurement: 'Alert false positive rate',
    acceptance: 'Monthly false positive rate under target'
  }
};
```

---

## 🚀 IMPLEMENTATION ROADMAP

### **Phase 1: Core Dashboard (Week 1)**
- [ ] Basic dashboard layout and navigation
- [ ] System health monitoring
- [ ] User and study metrics
- [ ] Alert management system
- [ ] Permission-based access control

### **Phase 2: Advanced Analytics (Week 2)**
- [ ] Business intelligence dashboards
- [ ] Performance monitoring
- [ ] Real-time data streaming
- [ ] Custom reporting tools
- [ ] Data export capabilities

### **Phase 3: Management Tools (Week 3)**
- [ ] User management interface
- [ ] Study moderation tools
- [ ] System configuration panel
- [ ] Content moderation dashboard
- [ ] Bulk operations support

### **Phase 4: Optimization & Scale (Week 4)**
- [ ] Performance optimization
- [ ] Advanced filtering and search
- [ ] Automated alerting rules
- [ ] Compliance reporting
- [ ] Documentation and training

---

**📊 ADMIN DASHBOARD SYSTEM: Empowering administrators with comprehensive platform management, real-time insights, and efficient operational control for optimal platform performance.**
