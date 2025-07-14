# 📊 ANALYTICS & BUSINESS INTELLIGENCE SYSTEM - COMPREHENSIVE REQUIREMENTS
## Advanced Data Analytics & Insights Platform

**Created**: July 12, 2025  
**Status**: 🟢 GREENFIELD SPECIFICATION  
**Scope**: Complete analytics infrastructure, reporting dashboards, and business intelligence  
**Dependencies**: User Management (03-USER_MANAGEMENT_SYSTEM.md), Study Creation (04-STUDY_CREATION_SYSTEM.md), Admin Dashboard (06-ADMIN_DASHBOARD_SYSTEM.md)

---

## 📋 EXECUTIVE SUMMARY

The Analytics & Business Intelligence System provides comprehensive data analysis, reporting capabilities, and actionable insights to drive platform optimization, user engagement, and business growth through advanced analytics and visualization.

### **🎯 Core Value Proposition**
> "Transform platform data into actionable insights that drive user engagement, research quality, and business growth"

### **🏆 Success Metrics**
- **Data Coverage**: 100% of user interactions tracked
- **Insight Accuracy**: >99% data reliability
- **Decision Impact**: 40% improvement in data-driven decisions
- **Report Utilization**: 85% of users actively use analytics

---

## 🗄️ DATABASE SCHEMA

### **Analytics Infrastructure Tables**
```sql
-- Event tracking for comprehensive analytics
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Event identification
  event_name VARCHAR(100) NOT NULL,
  event_category event_category NOT NULL,
  event_action VARCHAR(100) NOT NULL,
  
  -- User context
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  session_id UUID NOT NULL,
  anonymous_id UUID,
  
  -- Event properties
  properties JSONB DEFAULT '{}',
  user_properties JSONB DEFAULT '{}',
  
  -- Technical context
  page_url TEXT,
  page_title VARCHAR(200),
  referrer TEXT,
  user_agent TEXT,
  
  -- Device and location
  device_type device_type,
  browser VARCHAR(50),
  operating_system VARCHAR(50),
  screen_resolution VARCHAR(20),
  viewport_size VARCHAR(20),
  
  -- Geographic data
  country VARCHAR(2),
  region VARCHAR(100),
  city VARCHAR(100),
  timezone VARCHAR(50),
  
  -- Performance metrics
  page_load_time INTEGER, -- milliseconds
  time_on_page INTEGER, -- seconds
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  server_received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User sessions for journey analysis
CREATE TABLE analytics_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Session identification
  session_token UUID NOT NULL UNIQUE,
  anonymous_id UUID,
  
  -- Session details
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  
  -- Entry and exit
  entry_page TEXT,
  exit_page TEXT,
  entry_referrer TEXT,
  
  -- Engagement metrics
  page_views INTEGER DEFAULT 0,
  events_count INTEGER DEFAULT 0,
  interactions_count INTEGER DEFAULT 0,
  scroll_depth_max INTEGER DEFAULT 0, -- percentage
  
  -- Technical context
  device_type device_type,
  browser VARCHAR(50),
  operating_system VARCHAR(50),
  
  -- Geographic data
  country VARCHAR(2),
  region VARCHAR(100),
  city VARCHAR(100),
  timezone VARCHAR(50),
  
  -- Quality indicators
  bounce BOOLEAN DEFAULT FALSE,
  engaged BOOLEAN DEFAULT FALSE,
  conversion BOOLEAN DEFAULT FALSE,
  
  -- Marketing attribution
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  utm_term VARCHAR(100),
  utm_content VARCHAR(100)
);

-- Funnel analysis for conversion tracking
CREATE TABLE analytics_funnels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Funnel definition
  name VARCHAR(200) NOT NULL,
  description TEXT,
  
  -- Funnel steps (ordered array of events)
  steps JSONB NOT NULL, -- [{"event": "page_view", "conditions": {...}}, ...]
  
  -- Configuration
  time_window_hours INTEGER DEFAULT 24,
  allow_repeat_events BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  created_by UUID NOT NULL REFERENCES users(id),
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Funnel results for performance tracking
CREATE TABLE funnel_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  funnel_id UUID NOT NULL REFERENCES analytics_funnels(id) ON DELETE CASCADE,
  
  -- Time period
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Results by step
  step_results JSONB NOT NULL, -- [{"step": 1, "users": 1000, "conversions": 800}, ...]
  
  -- Aggregate metrics
  total_users INTEGER NOT NULL,
  completed_users INTEGER NOT NULL,
  conversion_rate DECIMAL(5,2) NOT NULL,
  
  -- Segmentation
  segment_data JSONB DEFAULT '{}',
  
  -- Calculation metadata
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  calculation_duration_ms INTEGER
);

-- Cohort analysis for retention tracking
CREATE TABLE cohort_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Cohort definition
  name VARCHAR(200) NOT NULL,
  cohort_type cohort_type NOT NULL,
  
  -- Time grouping
  time_unit time_unit NOT NULL, -- daily, weekly, monthly
  
  -- Events that define cohort entry and return
  cohort_event VARCHAR(100) NOT NULL, -- what defines someone joining the cohort
  return_event VARCHAR(100) NOT NULL, -- what defines someone returning
  
  -- Filters
  user_filters JSONB DEFAULT '{}',
  event_filters JSONB DEFAULT '{}',
  
  -- Configuration
  max_periods INTEGER DEFAULT 12, -- how many periods to track
  
  -- Metadata
  created_by UUID NOT NULL REFERENCES users(id),
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cohort results for retention analysis
CREATE TABLE cohort_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  analysis_id UUID NOT NULL REFERENCES cohort_analyses(id) ON DELETE CASCADE,
  
  -- Cohort identification
  cohort_period DATE NOT NULL, -- when this cohort was created (2025-01-01)
  return_period INTEGER NOT NULL, -- periods since cohort creation (0, 1, 2, ...)
  
  -- Metrics
  cohort_size INTEGER NOT NULL, -- total users in this cohort
  returned_users INTEGER NOT NULL, -- users who returned in this period
  retention_rate DECIMAL(5,2) NOT NULL, -- percentage
  
  -- Revenue metrics (if applicable)
  revenue_total DECIMAL(12,2) DEFAULT 0,
  revenue_per_user DECIMAL(8,2) DEFAULT 0,
  
  -- Calculation metadata
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Custom dashboards for user-specific analytics
CREATE TABLE analytics_dashboards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Dashboard details
  name VARCHAR(200) NOT NULL,
  description TEXT,
  
  -- Ownership
  created_by UUID NOT NULL REFERENCES users(id),
  organization_id UUID REFERENCES organizations(id),
  
  -- Configuration
  layout JSONB NOT NULL, -- widget positions and configurations
  filters JSONB DEFAULT '{}', -- default filters
  
  -- Sharing
  visibility dashboard_visibility DEFAULT 'private',
  shared_with UUID[] DEFAULT '{}', -- specific user IDs
  
  -- Status
  is_favorite BOOLEAN DEFAULT FALSE,
  last_viewed TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dashboard widgets for modular analytics
CREATE TABLE dashboard_widgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dashboard_id UUID NOT NULL REFERENCES analytics_dashboards(id) ON DELETE CASCADE,
  
  -- Widget configuration
  widget_type widget_type NOT NULL,
  title VARCHAR(200) NOT NULL,
  
  -- Data source
  data_source widget_data_source NOT NULL,
  query_config JSONB NOT NULL,
  
  -- Display configuration
  chart_type chart_type,
  display_options JSONB DEFAULT '{}',
  
  -- Layout
  position_x INTEGER NOT NULL,
  position_y INTEGER NOT NULL,
  width INTEGER NOT NULL DEFAULT 4,
  height INTEGER NOT NULL DEFAULT 3,
  
  -- Caching
  cache_duration_minutes INTEGER DEFAULT 60,
  last_cached TIMESTAMP WITH TIME ZONE,
  cached_data JSONB,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Automated reports for scheduled analytics
CREATE TABLE analytics_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Report details
  name VARCHAR(200) NOT NULL,
  description TEXT,
  report_type report_type NOT NULL,
  
  -- Configuration
  template_config JSONB NOT NULL,
  filters JSONB DEFAULT '{}',
  
  -- Scheduling
  schedule_enabled BOOLEAN DEFAULT FALSE,
  schedule_frequency schedule_frequency,
  schedule_day_of_week INTEGER, -- 0-6 for weekly reports
  schedule_day_of_month INTEGER, -- 1-31 for monthly reports
  schedule_time TIME DEFAULT '09:00:00',
  
  -- Recipients
  recipients JSONB NOT NULL, -- [{"email": "...", "type": "email|slack|webhook"}, ...]
  
  -- Delivery options
  format report_format DEFAULT 'pdf',
  include_raw_data BOOLEAN DEFAULT FALSE,
  
  -- Ownership
  created_by UUID NOT NULL REFERENCES users(id),
  organization_id UUID REFERENCES organizations(id),
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  last_sent TIMESTAMP WITH TIME ZONE,
  next_send TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Report executions for delivery tracking
CREATE TABLE report_executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID NOT NULL REFERENCES analytics_reports(id) ON DELETE CASCADE,
  
  -- Execution details
  triggered_by execution_trigger NOT NULL,
  triggered_by_user UUID REFERENCES users(id),
  
  -- Status
  status execution_status NOT NULL DEFAULT 'pending',
  
  -- Results
  execution_time_ms INTEGER,
  file_url TEXT,
  file_size_bytes INTEGER,
  
  -- Delivery
  recipients_delivered JSONB DEFAULT '[]',
  delivery_failures JSONB DEFAULT '[]',
  
  -- Error handling
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  
  -- Timestamps
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE
);

-- A/B test tracking for experimentation
CREATE TABLE ab_experiments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Experiment details
  name VARCHAR(200) NOT NULL,
  description TEXT,
  hypothesis TEXT,
  
  -- Configuration
  variants JSONB NOT NULL, -- [{"name": "control", "weight": 50}, {"name": "variant_a", "weight": 50}]
  
  -- Targeting
  traffic_allocation DECIMAL(3,2) DEFAULT 1.00, -- percentage of users to include
  user_filters JSONB DEFAULT '{}',
  
  -- Success metrics
  primary_metric VARCHAR(100) NOT NULL,
  secondary_metrics VARCHAR(100)[] DEFAULT '{}',
  
  -- Status and timeline
  status experiment_status NOT NULL DEFAULT 'draft',
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  planned_duration_days INTEGER,
  
  -- Statistical configuration
  confidence_level DECIMAL(3,2) DEFAULT 0.95,
  minimum_sample_size INTEGER,
  minimum_effect_size DECIMAL(5,4),
  
  -- Ownership
  created_by UUID NOT NULL REFERENCES users(id),
  organization_id UUID REFERENCES organizations(id),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Experiment assignments for user variant tracking
CREATE TABLE experiment_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  experiment_id UUID NOT NULL REFERENCES ab_experiments(id) ON DELETE CASCADE,
  
  -- User assignment
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_id UUID,
  anonymous_id UUID,
  
  -- Assignment details
  variant_name VARCHAR(100) NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Conversion tracking
  converted BOOLEAN DEFAULT FALSE,
  conversion_value DECIMAL(10,2) DEFAULT 0,
  converted_at TIMESTAMP WITH TIME ZONE,
  
  UNIQUE(experiment_id, user_id)
);

-- Create ENUMs for analytics system
CREATE TYPE event_category AS ENUM (
  'page_view', 'user_interaction', 'study_action', 'authentication',
  'payment', 'error', 'performance', 'conversion', 'engagement'
);

CREATE TYPE device_type AS ENUM ('desktop', 'mobile', 'tablet', 'unknown');

CREATE TYPE cohort_type AS ENUM ('acquisition', 'activation', 'retention', 'revenue');

CREATE TYPE time_unit AS ENUM ('hour', 'day', 'week', 'month');

CREATE TYPE dashboard_visibility AS ENUM ('private', 'organization', 'public');

CREATE TYPE widget_type AS ENUM (
  'metric', 'chart', 'table', 'funnel', 'cohort', 'heatmap', 'text', 'image'
);

CREATE TYPE widget_data_source AS ENUM (
  'events', 'users', 'sessions', 'studies', 'revenue', 'custom_query'
);

CREATE TYPE chart_type AS ENUM (
  'line', 'bar', 'pie', 'area', 'scatter', 'funnel', 'cohort_table', 'number'
);

CREATE TYPE report_type AS ENUM (
  'executive_summary', 'user_engagement', 'study_performance', 'revenue_analysis',
  'custom_dashboard', 'cohort_analysis', 'funnel_analysis', 'ab_test_results'
);

CREATE TYPE schedule_frequency AS ENUM ('daily', 'weekly', 'monthly', 'quarterly');

CREATE TYPE report_format AS ENUM ('pdf', 'csv', 'excel', 'json');

CREATE TYPE execution_trigger AS ENUM ('scheduled', 'manual', 'api', 'webhook');

CREATE TYPE execution_status AS ENUM ('pending', 'running', 'completed', 'failed', 'cancelled');

CREATE TYPE experiment_status AS ENUM (
  'draft', 'review', 'approved', 'running', 'paused', 'completed', 'archived'
);

-- Performance indexes for analytics queries
CREATE INDEX idx_analytics_events_user ON analytics_events(user_id, created_at);
CREATE INDEX idx_analytics_events_session ON analytics_events(session_id, created_at);
CREATE INDEX idx_analytics_events_category ON analytics_events(event_category, event_name, created_at);
CREATE INDEX idx_analytics_events_time ON analytics_events(created_at);
CREATE INDEX idx_analytics_events_properties ON analytics_events USING gin(properties);

CREATE INDEX idx_analytics_sessions_user ON analytics_sessions(user_id, started_at);
CREATE INDEX idx_analytics_sessions_time ON analytics_sessions(started_at, ended_at);
CREATE INDEX idx_analytics_sessions_device ON analytics_sessions(device_type, browser);

CREATE INDEX idx_funnel_results_funnel ON funnel_results(funnel_id, period_start);
CREATE INDEX idx_cohort_results_analysis ON cohort_results(analysis_id, cohort_period);

CREATE INDEX idx_dashboard_widgets_dashboard ON dashboard_widgets(dashboard_id, position_y, position_x);
CREATE INDEX idx_report_executions_report ON report_executions(report_id, started_at);

CREATE INDEX idx_experiment_assignments_experiment ON experiment_assignments(experiment_id, assigned_at);
CREATE INDEX idx_experiment_assignments_user ON experiment_assignments(user_id, experiment_id);

-- Time-series partitioning for analytics_events (for better performance)
-- This would be implemented with pg_partman or similar for production
```

---

## 🎨 UI COMPONENTS ARCHITECTURE

### **AnalyticsDashboard Component**
```typescript
// src/components/analytics/AnalyticsDashboard.tsx
interface AnalyticsDashboardProps {
  user: User;
  initialDashboard?: string;
  timeRange?: TimeRange;
}

interface AnalyticsDashboardState {
  dashboards: Dashboard[];
  activeDashboard: Dashboard | null;
  widgets: Widget[];
  timeRange: TimeRange;
  filters: DashboardFilters;
  isEditing: boolean;
  loading: boolean;
  error: string | null;
  realTimeEnabled: boolean;
}

interface AnalyticsMetrics {
  userMetrics: UserAnalyticsMetrics;
  studyMetrics: StudyAnalyticsMetrics;
  engagementMetrics: EngagementMetrics;
  performanceMetrics: PerformanceMetrics;
  conversionMetrics: ConversionMetrics;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  user,
  initialDashboard,
  timeRange: initialTimeRange
}) => {
  const [state, setState] = useState<AnalyticsDashboardState>({
    dashboards: [],
    activeDashboard: null,
    widgets: [],
    timeRange: initialTimeRange || { period: 'day', value: 30 },
    filters: {},
    isEditing: false,
    loading: true,
    error: null,
    realTimeEnabled: false
  });

  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const { subscribe: subscribeToRealtime } = useRealTimeAnalytics();
  const { trackEvent } = useAnalytics();

  useEffect(() => {
    loadDashboards();
  }, []);

  useEffect(() => {
    if (state.activeDashboard) {
      loadDashboardData();
    }
  }, [state.activeDashboard, state.timeRange, state.filters]);

  useEffect(() => {
    if (state.realTimeEnabled && state.activeDashboard) {
      const unsubscribe = subscribeToRealtime(
        state.activeDashboard.id,
        (updates) => handleRealTimeUpdate(updates)
      );
      return unsubscribe;
    }
  }, [state.realTimeEnabled, state.activeDashboard]);

  const loadDashboards = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const response = await fetch('/api/analytics/dashboards');
      if (!response.ok) throw new Error('Failed to load dashboards');

      const data = await response.json();
      
      setState(prev => ({
        ...prev,
        dashboards: data.dashboards,
        activeDashboard: data.dashboards.find(d => d.id === initialDashboard) || data.dashboards[0] || null
      }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load dashboards'
      }));
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const loadDashboardData = async () => {
    if (!state.activeDashboard) return;

    try {
      setState(prev => ({ ...prev, loading: true }));

      const response = await fetch('/api/analytics/dashboard/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dashboardId: state.activeDashboard.id,
          timeRange: state.timeRange,
          filters: state.filters
        })
      });

      if (!response.ok) throw new Error('Failed to load dashboard data');

      const data = await response.json();
      
      setMetrics(data.metrics);
      setState(prev => ({ ...prev, widgets: data.widgets }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load dashboard data'
      }));
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const handleRealTimeUpdate = (updates: RealTimeUpdates) => {
    setMetrics(prev => {
      if (!prev) return prev;
      return { ...prev, ...updates };
    });
  };

  const handleDashboardChange = (dashboardId: string) => {
    const dashboard = state.dashboards.find(d => d.id === dashboardId);
    if (dashboard) {
      setState(prev => ({ ...prev, activeDashboard: dashboard }));
      trackEvent('dashboard_switch', { dashboard_id: dashboardId });
    }
  };

  const handleTimeRangeChange = (timeRange: TimeRange) => {
    setState(prev => ({ ...prev, timeRange }));
    trackEvent('analytics_time_range_change', { range: timeRange });
  };

  const handleToggleEdit = () => {
    setState(prev => ({ ...prev, isEditing: !prev.isEditing }));
    
    if (!state.isEditing) {
      trackEvent('dashboard_edit_start', { 
        dashboard_id: state.activeDashboard?.id 
      });
    }
  };

  const handleWidgetUpdate = (widgetId: string, updates: Partial<Widget>) => {
    setState(prev => ({
      ...prev,
      widgets: prev.widgets.map(w => 
        w.id === widgetId ? { ...w, ...updates } : w
      )
    }));
  };

  const handleSaveDashboard = async () => {
    if (!state.activeDashboard) return;

    try {
      const response = await fetch('/api/analytics/dashboards', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dashboardId: state.activeDashboard.id,
          widgets: state.widgets,
          layout: generateLayoutFromWidgets(state.widgets)
        })
      });

      if (!response.ok) throw new Error('Failed to save dashboard');

      setState(prev => ({ ...prev, isEditing: false }));
      trackEvent('dashboard_saved', { 
        dashboard_id: state.activeDashboard?.id,
        widget_count: state.widgets.length
      });

    } catch (error) {
      console.error('Failed to save dashboard:', error);
    }
  };

  if (state.loading && !metrics) {
    return <AnalyticsDashboardSkeleton />;
  }

  if (state.error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <AnalyticsErrorState error={state.error} onRetry={loadDashboardData} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="md:flex md:items-center md:justify-between">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-gray-900">
                  Analytics Dashboard
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                  {state.activeDashboard?.name || 'Loading dashboard...'}
                </p>
              </div>
              
              <div className="mt-4 md:mt-0 md:ml-4 flex items-center space-x-3">
                
                {/* Real-time Toggle */}
                <button
                  onClick={() => setState(prev => ({ ...prev, realTimeEnabled: !prev.realTimeEnabled }))}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    state.realTimeEnabled
                      ? 'bg-green-100 text-green-700 border border-green-200'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Zap className="w-4 h-4 mr-1" />
                  {state.realTimeEnabled ? 'Live' : 'Live Off'}
                </button>

                {/* Export Button */}
                <ExportDashboardButton
                  dashboard={state.activeDashboard}
                  timeRange={state.timeRange}
                  filters={state.filters}
                />

                {/* Edit Toggle */}
                <button
                  onClick={handleToggleEdit}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    state.isEditing
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  {state.isEditing ? 'Done Editing' : 'Edit'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 flex items-center justify-between">
            
            {/* Dashboard Selector */}
            <DashboardSelector
              dashboards={state.dashboards}
              activeDashboard={state.activeDashboard}
              onDashboardChange={handleDashboardChange}
            />

            {/* Time Range and Filters */}
            <div className="flex items-center space-x-4">
              <AnalyticsFilters
                filters={state.filters}
                onChange={(filters) => setState(prev => ({ ...prev, filters }))}
              />
              
              <TimeRangeSelector
                value={state.timeRange}
                onChange={handleTimeRangeChange}
                presets={[
                  { label: 'Last 7 days', period: 'day', value: 7 },
                  { label: 'Last 30 days', period: 'day', value: 30 },
                  { label: 'Last 3 months', period: 'month', value: 3 },
                  { label: 'Last 12 months', period: 'month', value: 12 }
                ]}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Key Metrics Overview */}
        {metrics && (
          <div className="mb-8">
            <AnalyticsOverviewCards
              metrics={metrics}
              timeRange={state.timeRange}
              isLoading={state.loading}
            />
          </div>
        )}

        {/* Widget Grid */}
        {state.activeDashboard && (
          <AnalyticsWidgetGrid
            widgets={state.widgets}
            metrics={metrics}
            isEditing={state.isEditing}
            onWidgetUpdate={handleWidgetUpdate}
            onWidgetAdd={(widget) => setState(prev => ({
              ...prev,
              widgets: [...prev.widgets, widget]
            }))}
            onWidgetRemove={(widgetId) => setState(prev => ({
              ...prev,
              widgets: prev.widgets.filter(w => w.id !== widgetId)
            }))}
          />
        )}

        {/* Save Changes */}
        {state.isEditing && (
          <div className="fixed bottom-6 right-6">
            <button
              onClick={handleSaveDashboard}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </button>
          </div>
        )}
      </div>

      {/* Real-time Status */}
      {state.realTimeEnabled && (
        <RealTimeStatusIndicator
          isConnected={true}
          lastUpdate={new Date()}
        />
      )}
    </div>
  );
};
```

### **AnalyticsWidgetGrid Component**
```typescript
// src/components/analytics/AnalyticsWidgetGrid.tsx
interface AnalyticsWidgetGridProps {
  widgets: Widget[];
  metrics: AnalyticsMetrics | null;
  isEditing: boolean;
  onWidgetUpdate: (widgetId: string, updates: Partial<Widget>) => void;
  onWidgetAdd: (widget: Widget) => void;
  onWidgetRemove: (widgetId: string) => void;
}

export const AnalyticsWidgetGrid: React.FC<AnalyticsWidgetGridProps> = ({
  widgets,
  metrics,
  isEditing,
  onWidgetUpdate,
  onWidgetAdd,
  onWidgetRemove
}) => {
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);
  const [showAddWidget, setShowAddWidget] = useState(false);

  const renderWidget = (widget: Widget) => {
    const widgetData = getWidgetData(widget, metrics);
    
    switch (widget.widget_type) {
      case 'metric':
        return (
          <MetricWidget
            widget={widget}
            data={widgetData}
            isEditing={isEditing}
            onUpdate={(updates) => onWidgetUpdate(widget.id, updates)}
          />
        );
        
      case 'chart':
        return (
          <ChartWidget
            widget={widget}
            data={widgetData}
            isEditing={isEditing}
            onUpdate={(updates) => onWidgetUpdate(widget.id, updates)}
          />
        );
        
      case 'funnel':
        return (
          <FunnelWidget
            widget={widget}
            data={widgetData}
            isEditing={isEditing}
            onUpdate={(updates) => onWidgetUpdate(widget.id, updates)}
          />
        );
        
      case 'cohort':
        return (
          <CohortWidget
            widget={widget}
            data={widgetData}
            isEditing={isEditing}
            onUpdate={(updates) => onWidgetUpdate(widget.id, updates)}
          />
        );
        
      case 'table':
        return (
          <TableWidget
            widget={widget}
            data={widgetData}
            isEditing={isEditing}
            onUpdate={(updates) => onWidgetUpdate(widget.id, updates)}
          />
        );
        
      default:
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-gray-500">Unknown widget type: {widget.widget_type}</p>
          </div>
        );
    }
  };

  const getWidgetGridStyle = (widget: Widget) => ({
    gridColumn: `span ${widget.width}`,
    gridRow: `span ${widget.height}`
  });

  const handleDragStart = (widgetId: string) => {
    if (isEditing) {
      setDraggedWidget(widgetId);
    }
  };

  const handleDragEnd = () => {
    setDraggedWidget(null);
  };

  const handleDrop = (targetPosition: { x: number; y: number }) => {
    if (draggedWidget) {
      onWidgetUpdate(draggedWidget, {
        position_x: targetPosition.x,
        position_y: targetPosition.y
      });
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Add Widget Button */}
      {isEditing && (
        <div className="flex justify-center">
          <button
            onClick={() => setShowAddWidget(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Widget
          </button>
        </div>
      )}

      {/* Widget Grid */}
      <div 
        className={`grid grid-cols-12 gap-6 ${isEditing ? 'min-h-96' : ''}`}
        style={{
          gridAutoRows: '120px' // Base height for grid rows
        }}
      >
        {widgets
          .sort((a, b) => a.position_y - b.position_y || a.position_x - b.position_x)
          .map((widget) => (
            <div
              key={widget.id}
              style={getWidgetGridStyle(widget)}
              className={`relative ${
                isEditing ? 'cursor-move' : ''
              } ${
                draggedWidget === widget.id ? 'opacity-50' : ''
              }`}
              draggable={isEditing}
              onDragStart={() => handleDragStart(widget.id)}
              onDragEnd={handleDragEnd}
            >
              {/* Widget Content */}
              {renderWidget(widget)}

              {/* Edit Controls */}
              {isEditing && (
                <div className="absolute top-2 right-2 flex items-center space-x-1">
                  <button
                    onClick={() => onWidgetRemove(widget.id)}
                    className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                    title="Remove widget"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  
                  <button
                    className="p-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors cursor-move"
                    title="Drag to reposition"
                  >
                    <Move className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          ))}

        {/* Drop Zones (when editing) */}
        {isEditing && draggedWidget && (
          <DropZones
            currentWidgets={widgets}
            onDrop={handleDrop}
          />
        )}
      </div>

      {/* Add Widget Modal */}
      {showAddWidget && (
        <AddWidgetModal
          onWidgetAdd={(widget) => {
            onWidgetAdd(widget);
            setShowAddWidget(false);
          }}
          onClose={() => setShowAddWidget(false)}
        />
      )}
    </div>
  );
};
```

---

## 🔧 API IMPLEMENTATION

### **Analytics Data API**
```typescript
// api/analytics/dashboard/data.ts
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createServerSupabaseClient({ req, res });
  
  // Verify authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { dashboardId, timeRange, filters } = req.body;
    
    // Verify access to dashboard
    const { data: dashboard } = await supabase
      .from('analytics_dashboards')
      .select('*')
      .eq('id', dashboardId)
      .single();

    if (!dashboard) {
      return res.status(404).json({ error: 'Dashboard not found' });
    }

    // Check permissions
    const hasAccess = await checkDashboardAccess(supabase, dashboard, user.id);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get dashboard widgets
    const { data: widgets } = await supabase
      .from('dashboard_widgets')
      .select('*')
      .eq('dashboard_id', dashboardId)
      .order('position_y')
      .order('position_x');

    // Calculate metrics for each widget
    const metricsPromises = widgets?.map(async (widget) => {
      const data = await calculateWidgetData(supabase, widget, timeRange, filters);
      return { ...widget, data };
    }) || [];

    const widgetsWithData = await Promise.all(metricsPromises);

    // Calculate overall dashboard metrics
    const overallMetrics = await calculateOverallMetrics(supabase, timeRange, filters, user.id);

    return res.status(200).json({
      metrics: overallMetrics,
      widgets: widgetsWithData
    });

  } catch (error) {
    console.error('Analytics dashboard data error:', error);
    return res.status(500).json({ error: 'Failed to load dashboard data' });
  }
}

async function calculateWidgetData(supabase: any, widget: any, timeRange: any, filters: any) {
  const { widget_type, data_source, query_config } = widget;
  
  switch (widget_type) {
    case 'metric':
      return await calculateMetricWidget(supabase, query_config, timeRange, filters);
    case 'chart':
      return await calculateChartWidget(supabase, query_config, timeRange, filters);
    case 'funnel':
      return await calculateFunnelWidget(supabase, query_config, timeRange, filters);
    case 'cohort':
      return await calculateCohortWidget(supabase, query_config, timeRange, filters);
    case 'table':
      return await calculateTableWidget(supabase, query_config, timeRange, filters);
    default:
      return null;
  }
}

async function calculateMetricWidget(supabase: any, config: any, timeRange: any, filters: any) {
  const { metric, aggregation, comparison } = config;
  const timeStart = getTimeRangeStart(timeRange);
  const timeEnd = new Date();

  let query = supabase
    .from('analytics_events')
    .select('*', { count: 'exact' });

  // Apply time range
  query = query.gte('created_at', timeStart.toISOString());
  query = query.lte('created_at', timeEnd.toISOString());

  // Apply filters
  if (filters.user_type) {
    query = query.eq('user_properties->role', filters.user_type);
  }
  if (filters.country) {
    query = query.eq('country', filters.country);
  }

  // Apply metric-specific filters
  switch (metric) {
    case 'page_views':
      query = query.eq('event_category', 'page_view');
      break;
    case 'unique_users':
      query = query.select('user_id').not('user_id', 'is', null);
      break;
    case 'conversions':
      query = query.eq('event_category', 'conversion');
      break;
  }

  const { data, count, error } = await query;
  if (error) throw error;

  let value = 0;
  switch (aggregation) {
    case 'count':
      value = count || 0;
      break;
    case 'unique_count':
      const uniqueValues = new Set(data?.map(d => d.user_id).filter(Boolean));
      value = uniqueValues.size;
      break;
    case 'sum':
      value = data?.reduce((sum, d) => sum + (d.properties?.value || 0), 0) || 0;
      break;
    case 'average':
      const total = data?.reduce((sum, d) => sum + (d.properties?.value || 0), 0) || 0;
      value = data?.length ? total / data.length : 0;
      break;
  }

  // Calculate comparison if requested
  let comparisonValue = null;
  let percentageChange = null;
  
  if (comparison?.enabled) {
    const comparisonStart = new Date(timeStart);
    const comparisonEnd = new Date(timeStart);
    const duration = timeEnd.getTime() - timeStart.getTime();
    
    comparisonStart.setTime(comparisonStart.getTime() - duration);
    
    const { count: comparisonCount } = await supabase
      .from('analytics_events')
      .select('*', { count: 'exact' })
      .gte('created_at', comparisonStart.toISOString())
      .lte('created_at', comparisonEnd.toISOString());
    
    comparisonValue = comparisonCount || 0;
    percentageChange = comparisonValue > 0 
      ? ((value - comparisonValue) / comparisonValue) * 100 
      : value > 0 ? 100 : 0;
  }

  return {
    value,
    comparisonValue,
    percentageChange,
    trend: getTrendDirection(percentageChange),
    lastUpdated: new Date().toISOString()
  };
}

async function calculateChartWidget(supabase: any, config: any, timeRange: any, filters: any) {
  const { chart_type, metrics, group_by } = config;
  const timeStart = getTimeRangeStart(timeRange);
  const timeEnd = new Date();

  let query = supabase
    .from('analytics_events')
    .select('*');

  // Apply time range
  query = query.gte('created_at', timeStart.toISOString());
  query = query.lte('created_at', timeEnd.toISOString());

  const { data, error } = await query;
  if (error) throw error;

  // Group data by time period
  const groupedData = groupDataByTimePeriod(data, group_by, timeStart, timeEnd);
  
  return {
    chartType: chart_type,
    series: metrics.map((metric: string) => ({
      name: metric,
      data: groupedData.map(group => ({
        x: group.period,
        y: calculateMetricValue(group.events, metric)
      }))
    })),
    categories: groupedData.map(group => group.period),
    lastUpdated: new Date().toISOString()
  };
}

async function calculateOverallMetrics(supabase: any, timeRange: any, filters: any, userId: string) {
  const timeStart = getTimeRangeStart(timeRange);
  const timeEnd = new Date();

  // Parallel queries for better performance
  const [
    totalUsers,
    activeUsers,
    totalSessions,
    pageViews,
    studyCreations,
    studyCompletions
  ] = await Promise.all([
    // Total users
    supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', timeStart.toISOString()),

    // Active users
    supabase
      .from('analytics_sessions')
      .select('user_id', { count: 'exact', head: true })
      .gte('started_at', timeStart.toISOString())
      .not('user_id', 'is', null),

    // Total sessions
    supabase
      .from('analytics_sessions')
      .select('*', { count: 'exact', head: true })
      .gte('started_at', timeStart.toISOString()),

    // Page views
    supabase
      .from('analytics_events')
      .select('*', { count: 'exact', head: true })
      .eq('event_category', 'page_view')
      .gte('created_at', timeStart.toISOString()),

    // Study creations
    supabase
      .from('studies')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', timeStart.toISOString()),

    // Study completions
    supabase
      .from('analytics_events')
      .select('*', { count: 'exact', head: true })
      .eq('event_name', 'study_completed')
      .gte('created_at', timeStart.toISOString())
  ]);

  return {
    userMetrics: {
      totalUsers: totalUsers.count || 0,
      activeUsers: activeUsers.count || 0,
      newUsers: totalUsers.count || 0 // In this timeframe
    },
    engagementMetrics: {
      totalSessions: totalSessions.count || 0,
      pageViews: pageViews.count || 0,
      averageSessionDuration: 0 // Would calculate from session data
    },
    studyMetrics: {
      studyCreations: studyCreations.count || 0,
      studyCompletions: studyCompletions.count || 0,
      completionRate: studyCreations.count ? 
        (studyCompletions.count || 0) / studyCreations.count * 100 : 0
    }
  };
}
```

---

## 🧪 TESTING SPECIFICATIONS

### **Analytics Dashboard Testing**
```typescript
// tests/analytics/analytics-dashboard.test.ts
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';
import { mockUser, mockAnalyticsData } from '@/test-utils/mocks';

describe('AnalyticsDashboard', () => {
  beforeEach(() => {
    fetchMock.mockImplementation((url) => {
      if (url.includes('/api/analytics/dashboards')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            dashboards: mockAnalyticsData.dashboards
          })
        });
      }
      if (url.includes('/api/analytics/dashboard/data')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            metrics: mockAnalyticsData.metrics,
            widgets: mockAnalyticsData.widgets
          })
        });
      }
      return Promise.reject(new Error('Not mocked'));
    });
  });

  it('should display analytics overview cards', async () => {
    render(<AnalyticsDashboard user={mockUser} />);

    await waitFor(() => {
      expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
    });

    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('Active Sessions')).toBeInTheDocument();
    expect(screen.getByText('Page Views')).toBeInTheDocument();
  });

  it('should switch between time ranges', async () => {
    render(<AnalyticsDashboard user={mockUser} />);

    const timeRangeSelector = await screen.findByDisplayValue('Last 30 days');
    fireEvent.change(timeRangeSelector, { target: { value: 'Last 7 days' } });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/analytics/dashboard/data',
        expect.objectContaining({
          body: expect.stringContaining('"value":7')
        })
      );
    });
  });

  it('should enable real-time updates', async () => {
    const mockSubscribe = jest.fn();
    jest.mocked(useRealTimeAnalytics).mockReturnValue({
      subscribe: mockSubscribe,
      unsubscribe: jest.fn()
    });

    render(<AnalyticsDashboard user={mockUser} />);

    const realTimeToggle = await screen.findByText('Live Off');
    fireEvent.click(realTimeToggle);

    expect(screen.getByText('Live')).toBeInTheDocument();
    expect(mockSubscribe).toHaveBeenCalled();
  });

  it('should enter edit mode for dashboard customization', async () => {
    render(<AnalyticsDashboard user={mockUser} />);

    const editButton = await screen.findByText('Edit');
    fireEvent.click(editButton);

    expect(screen.getByText('Done Editing')).toBeInTheDocument();
    expect(screen.getByText('Add Widget')).toBeInTheDocument();
  });

  it('should display and update metric widgets', async () => {
    render(<AnalyticsDashboard user={mockUser} />);

    await waitFor(() => {
      expect(screen.getByText('1,234')).toBeInTheDocument(); // Sample metric value
    });

    // Check for trend indicators
    expect(screen.getByText('+15.2%')).toBeInTheDocument();
  });

  it('should handle dashboard switching', async () => {
    render(<AnalyticsDashboard user={mockUser} />);

    const dashboardSelector = await screen.findByDisplayValue('User Engagement');
    fireEvent.change(dashboardSelector, { target: { value: 'dashboard-2' } });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/analytics/dashboard/data',
        expect.objectContaining({
          body: expect.stringContaining('"dashboardId":"dashboard-2"')
        })
      );
    });
  });
});
```

### **Widget System Testing**
```typescript
// tests/analytics/analytics-widgets.test.ts
describe('Analytics Widgets', () => {
  it('should render metric widget with correct formatting', () => {
    const widget = {
      id: 'widget-1',
      widget_type: 'metric',
      title: 'Total Users',
      data: { value: 1234, percentageChange: 15.2 }
    };

    render(<MetricWidget widget={widget} />);

    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('1,234')).toBeInTheDocument();
    expect(screen.getByText('+15.2%')).toBeInTheDocument();
  });

  it('should render chart widget with data visualization', () => {
    const widget = {
      id: 'widget-2',
      widget_type: 'chart',
      title: 'Page Views Trend',
      data: {
        chartType: 'line',
        series: [{ name: 'Page Views', data: [100, 120, 140] }],
        categories: ['Day 1', 'Day 2', 'Day 3']
      }
    };

    render(<ChartWidget widget={widget} />);

    expect(screen.getByText('Page Views Trend')).toBeInTheDocument();
    // Chart rendering would be tested with chart library specific methods
  });

  it('should handle widget drag and drop in edit mode', () => {
    const mockOnUpdate = jest.fn();
    
    render(
      <AnalyticsWidgetGrid
        widgets={mockWidgets}
        isEditing={true}
        onWidgetUpdate={mockOnUpdate}
        onWidgetAdd={jest.fn()}
        onWidgetRemove={jest.fn()}
      />
    );

    const widget = screen.getByTestId('widget-1');
    
    // Simulate drag and drop
    fireEvent.dragStart(widget);
    fireEvent.dragEnd(widget);

    // Would verify position update in actual implementation
  });
});
```

---

## 🎯 SUCCESS CRITERIA & VALIDATION

### **Analytics System KPIs**
```typescript
interface AnalyticsSystemKPIs {
  dataAccuracy: {
    eventTrackingReliability: number; // Target: >99.9%
    dataConsistencyScore: number; // Target: >99%
    reportAccuracy: number; // Target: >99.5%
    realTimeLatency: number; // Target: <5 seconds
  };
  
  userAdoption: {
    activeAnalyticsUsers: number; // Target: >85% of users
    dashboardUtilization: number; // Target: >70% weekly usage
    reportGenerationRate: number; // Target: >50 reports/week
    customDashboardCreation: number; // Target: >30% create custom
  };
  
  businessImpact: {
    dataDriverDecisions: number; // Target: >80% decisions use analytics
    insightActionableRate: number; // Target: >60% insights acted upon
    performanceImprovements: number; // Target: >25% metric improvements
    userSatisfactionScore: number; // Target: >4.6/5
  };
  
  systemPerformance: {
    queryResponseTime: number; // Target: <2 seconds average
    dashboardLoadTime: number; // Target: <3 seconds
    reportGenerationTime: number; // Target: <30 seconds
    systemUptime: number; // Target: >99.9%
  };
}
```

### **Data Quality Metrics**
```typescript
const ANALYTICS_QUALITY_TARGETS = {
  dataFreshness: {
    target: '<5 minutes',
    measurement: 'Real-time data latency',
    acceptance: '95% of data within target'
  },
  
  reportReliability: {
    target: '>99.5%',
    measurement: 'Report generation success rate',
    acceptance: 'Monthly success rate above target'
  },
  
  insightAccuracy: {
    target: '>95%',
    measurement: 'Manual validation of automated insights',
    acceptance: 'Quarterly validation above target'
  },
  
  userExperience: {
    target: '<3 seconds',
    measurement: 'Average dashboard load time',
    acceptance: '90th percentile under target'
  }
};
```

---

## 🚀 IMPLEMENTATION ROADMAP

### **Phase 1: Core Analytics Infrastructure (Week 1)**
- [ ] Event tracking system
- [ ] Session analytics
- [ ] Basic dashboard framework
- [ ] Key metric calculations
- [ ] Time-series data storage

### **Phase 2: Visualization & Dashboards (Week 2)**
- [ ] Widget system architecture
- [ ] Chart visualization library
- [ ] Dashboard builder interface
- [ ] Export and sharing capabilities
- [ ] Real-time data updates

### **Phase 3: Advanced Analytics (Week 3)**
- [ ] Funnel analysis system
- [ ] Cohort analysis tools
- [ ] A/B testing framework
- [ ] Custom report builder
- [ ] Automated insights engine

### **Phase 4: Business Intelligence (Week 4)**
- [ ] Executive dashboards
- [ ] Automated reporting system
- [ ] Predictive analytics
- [ ] API for external integrations
- [ ] Advanced user segmentation

---

**📊 ANALYTICS & BUSINESS INTELLIGENCE SYSTEM: Transforming platform data into actionable insights that drive user engagement, optimize performance, and accelerate business growth through intelligent analytics.**
