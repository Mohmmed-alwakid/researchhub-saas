# 📚 API DOCUMENTATION & DEVELOPER RESOURCES - COMPREHENSIVE REQUIREMENTS
## Developer-Focused API Documentation Hub

**Created**: July 12, 2025  
**Status**: 🟢 GREENFIELD SPECIFICATION - ALIGNED WITH STUDY-CENTRIC ARCHITECTURE  
**Scope**: Streamlined API documentation, developer tools, and integration resources  
**Dependencies**: Integrations & API Ecosystem (09-INTEGRATIONS_API_ECOSYSTEM.md), Platform Foundation (01-PLATFORM_FOUNDATION.md)  
**Architecture**: Standalone developer-focused page in 8-page researcher system

---

## 📋 EXECUTIVE SUMMARY

The API Documentation & Developer Resources system serves as the dedicated **8th page** in the streamlined researcher architecture, providing comprehensive documentation, interactive API explorers, and developer tools specifically for researchers who need to integrate ResearchHub with external systems or build custom solutions.

### **🎯 Core Value Proposition**
> "Researcher-friendly API documentation that enables seamless integration with external tools, custom analytics, and workflow automation without requiring deep technical expertise"

### **🏆 Success Metrics**
- **Researcher Developer Adoption**: >60% of researchers use API features
- **Integration Success Rate**: >90% successful first integrations
- **Time to First API Call**: <10 minutes for researchers
- **Documentation Usability**: >4.8/5 researcher satisfaction rating

### **🎯 Integration with Study-Centric Architecture**
This API Documentation page complements the core study-centric workflow by:
- **Study Data Export**: APIs for extracting study results and analytics
- **External Tool Integration**: Connect studies with CRM, analytics, and business tools
- **Automation Workflows**: Enable researchers to automate repetitive tasks
- **Custom Dashboards**: APIs for building organization-specific reporting

---

## 🗄️ DATABASE SCHEMA

### **Documentation Management Tables**
```sql
-- API documentation structure
CREATE TABLE api_documentation (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Documentation identification
  endpoint_path VARCHAR(500) NOT NULL,
  http_method http_method NOT NULL,
  api_version VARCHAR(20) NOT NULL DEFAULT 'v1',
  
  -- Documentation content
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  summary TEXT,
  
  -- Request specification
  request_schema JSONB DEFAULT '{}',
  request_examples JSONB DEFAULT '{}',
  
  -- Response specification
  response_schema JSONB DEFAULT '{}',
  response_examples JSONB DEFAULT '{}',
  error_responses JSONB DEFAULT '{}',
  
  -- Parameters
  path_parameters JSONB DEFAULT '{}',
  query_parameters JSONB DEFAULT '{}',
  header_parameters JSONB DEFAULT '{}',
  
  -- Authentication
  auth_required BOOLEAN DEFAULT TRUE,
  auth_scopes TEXT[] DEFAULT '{}',
  
  -- Metadata
  tags TEXT[] DEFAULT '{}',
  category doc_category NOT NULL,
  is_deprecated BOOLEAN DEFAULT FALSE,
  deprecated_message TEXT,
  
  -- Status and visibility
  status doc_status DEFAULT 'draft',
  is_public BOOLEAN DEFAULT TRUE,
  
  -- Versioning
  version INTEGER DEFAULT 1,
  parent_id UUID REFERENCES api_documentation(id),
  
  -- Authorship
  created_by UUID REFERENCES users(id),
  last_updated_by UUID REFERENCES users(id),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(endpoint_path, http_method, api_version)
);

-- Code examples and snippets
CREATE TABLE code_examples (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relationship
  documentation_id UUID NOT NULL REFERENCES api_documentation(id) ON DELETE CASCADE,
  
  -- Example details
  language programming_language NOT NULL,
  framework VARCHAR(100),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  
  -- Code content
  code_snippet TEXT NOT NULL,
  
  -- Example metadata
  example_type example_type NOT NULL,
  complexity_level complexity_level DEFAULT 'basic',
  
  -- Dependencies
  dependencies JSONB DEFAULT '{}',
  prerequisites TEXT,
  
  -- Testing
  is_tested BOOLEAN DEFAULT FALSE,
  test_results JSONB DEFAULT '{}',
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Authorship
  created_by UUID REFERENCES users(id),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Developer guides and tutorials
CREATE TABLE developer_guides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Guide identification
  slug VARCHAR(200) NOT NULL UNIQUE,
  title VARCHAR(300) NOT NULL,
  subtitle VARCHAR(500),
  
  -- Content
  content TEXT NOT NULL,
  content_format content_format DEFAULT 'markdown',
  
  -- Guide structure
  guide_type guide_type NOT NULL,
  difficulty_level difficulty_level DEFAULT 'beginner',
  estimated_time_minutes INTEGER,
  
  -- Navigation
  order_index INTEGER DEFAULT 0,
  parent_guide_id UUID REFERENCES developer_guides(id),
  
  -- Categorization
  category guide_category NOT NULL,
  tags TEXT[] DEFAULT '{}',
  
  -- Prerequisites and requirements
  prerequisites TEXT,
  required_tools JSONB DEFAULT '{}',
  
  -- Status and visibility
  status content_status DEFAULT 'draft',
  is_featured BOOLEAN DEFAULT FALSE,
  
  -- SEO and discoverability
  meta_description TEXT,
  meta_keywords TEXT[],
  
  -- Authorship
  created_by UUID REFERENCES users(id),
  last_updated_by UUID REFERENCES users(id),
  
  -- Engagement metrics
  view_count INTEGER DEFAULT 0,
  completion_rate DECIMAL(5,2) DEFAULT 0,
  rating_average DECIMAL(3,2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE
);

-- SDK and client library documentation
CREATE TABLE sdk_documentation (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- SDK identification
  name VARCHAR(200) NOT NULL,
  language programming_language NOT NULL,
  version VARCHAR(50) NOT NULL,
  
  -- SDK details
  description TEXT NOT NULL,
  repository_url TEXT,
  package_manager_url TEXT,
  
  -- Installation instructions
  installation_instructions TEXT NOT NULL,
  quick_start_guide TEXT NOT NULL,
  
  -- Documentation content
  api_reference TEXT,
  examples_collection JSONB DEFAULT '{}',
  
  -- Support and compatibility
  supported_versions TEXT[],
  minimum_version VARCHAR(50),
  compatibility_notes TEXT,
  
  -- Release information
  release_notes TEXT,
  changelog TEXT,
  
  -- Status
  status sdk_status DEFAULT 'active',
  is_official BOOLEAN DEFAULT TRUE,
  
  -- Downloads and usage
  download_count INTEGER DEFAULT 0,
  github_stars INTEGER DEFAULT 0,
  
  -- Maintenance
  maintained_by UUID REFERENCES users(id),
  last_updated_by UUID REFERENCES users(id),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(name, language, version)
);

-- Interactive API explorer sessions
CREATE TABLE api_explorer_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Session identification
  user_id UUID REFERENCES users(id),
  session_token VARCHAR(255) NOT NULL UNIQUE,
  
  -- API exploration data
  endpoint_tests JSONB DEFAULT '{}',
  saved_requests JSONB DEFAULT '{}',
  
  -- Environment configuration
  environment explorer_environment DEFAULT 'sandbox',
  api_key_id UUID REFERENCES api_keys(id),
  
  -- Session metadata
  ip_address INET,
  user_agent TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Developer feedback and suggestions
CREATE TABLE developer_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Feedback identification
  feedback_type feedback_type NOT NULL,
  
  -- Target of feedback
  target_type target_type NOT NULL,
  target_id UUID NOT NULL, -- Can reference various documentation entities
  
  -- Feedback content
  title VARCHAR(300),
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  
  -- User information
  user_id UUID REFERENCES users(id),
  user_email VARCHAR(255),
  user_name VARCHAR(200),
  
  -- Categorization
  category feedback_category,
  severity feedback_severity DEFAULT 'medium',
  
  -- Status and resolution
  status feedback_status DEFAULT 'open',
  assigned_to UUID REFERENCES users(id),
  resolution_notes TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  
  -- Context
  user_agent TEXT,
  page_url TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Documentation analytics and metrics
CREATE TABLE documentation_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Analytics scope
  date DATE NOT NULL,
  
  -- Page/endpoint identification
  resource_type analytics_resource_type NOT NULL,
  resource_id UUID NOT NULL,
  resource_path VARCHAR(500),
  
  -- Traffic metrics
  page_views INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  bounce_rate DECIMAL(5,4) DEFAULT 0,
  avg_time_on_page INTEGER DEFAULT 0, -- seconds
  
  -- API usage metrics
  api_calls INTEGER DEFAULT 0,
  successful_calls INTEGER DEFAULT 0,
  error_calls INTEGER DEFAULT 0,
  
  -- User engagement
  code_copy_events INTEGER DEFAULT 0,
  example_run_events INTEGER DEFAULT 0,
  feedback_submissions INTEGER DEFAULT 0,
  
  -- Search and discovery
  search_impressions INTEGER DEFAULT 0,
  search_clicks INTEGER DEFAULT 0,
  
  -- Geographic data
  top_countries JSONB DEFAULT '{}',
  top_referrers JSONB DEFAULT '{}',
  
  -- Performance metrics
  avg_load_time_ms INTEGER DEFAULT 0,
  
  -- Created timestamp
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(date, resource_type, resource_id)
);

-- Documentation versioning and history
CREATE TABLE documentation_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Version identification
  document_id UUID NOT NULL,
  document_type version_document_type NOT NULL,
  version_number INTEGER NOT NULL,
  
  -- Version content
  content_snapshot JSONB NOT NULL,
  
  -- Change information
  change_type change_type NOT NULL,
  change_description TEXT,
  breaking_changes BOOLEAN DEFAULT FALSE,
  migration_notes TEXT,
  
  -- Authorship
  created_by UUID REFERENCES users(id),
  approved_by UUID REFERENCES users(id),
  
  -- Status
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(document_id, document_type, version_number)
);

-- Create ENUMs for documentation system
CREATE TYPE http_method AS ENUM ('GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD');

CREATE TYPE doc_category AS ENUM (
  'authentication', 'users', 'studies', 'participants', 'organizations',
  'billing', 'integrations', 'webhooks', 'analytics', 'admin'
);

CREATE TYPE doc_status AS ENUM ('draft', 'review', 'published', 'deprecated', 'archived');

CREATE TYPE programming_language AS ENUM (
  'javascript', 'typescript', 'python', 'java', 'csharp', 'php', 'ruby',
  'go', 'rust', 'swift', 'kotlin', 'curl', 'shell'
);

CREATE TYPE example_type AS ENUM (
  'request', 'response', 'full_example', 'sdk_usage', 'webhook_handler'
);

CREATE TYPE complexity_level AS ENUM ('basic', 'intermediate', 'advanced');

CREATE TYPE content_format AS ENUM ('markdown', 'html', 'json', 'yaml');

CREATE TYPE guide_type AS ENUM (
  'quickstart', 'tutorial', 'how_to', 'reference', 'concept', 'migration'
);

CREATE TYPE difficulty_level AS ENUM ('beginner', 'intermediate', 'advanced', 'expert');

CREATE TYPE guide_category AS ENUM (
  'getting_started', 'authentication', 'api_usage', 'integrations',
  'webhooks', 'sdks', 'best_practices', 'troubleshooting'
);

CREATE TYPE content_status AS ENUM ('draft', 'review', 'published', 'archived');

CREATE TYPE sdk_status AS ENUM ('active', 'maintenance', 'deprecated', 'archived');

CREATE TYPE explorer_environment AS ENUM ('sandbox', 'staging', 'production');

CREATE TYPE feedback_type AS ENUM (
  'bug_report', 'improvement_suggestion', 'content_feedback', 'feature_request'
);

CREATE TYPE target_type AS ENUM (
  'api_documentation', 'developer_guide', 'sdk_documentation', 'code_example'
);

CREATE TYPE feedback_category AS ENUM (
  'accuracy', 'clarity', 'completeness', 'usability', 'performance'
);

CREATE TYPE feedback_severity AS ENUM ('low', 'medium', 'high', 'critical');

CREATE TYPE feedback_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');

CREATE TYPE analytics_resource_type AS ENUM (
  'api_endpoint', 'guide', 'sdk', 'example', 'tutorial'
);

CREATE TYPE version_document_type AS ENUM (
  'api_documentation', 'developer_guide', 'sdk_documentation'
);

CREATE TYPE change_type AS ENUM (
  'major', 'minor', 'patch', 'documentation', 'deprecation'
);

-- Performance indexes for documentation queries
CREATE INDEX idx_api_documentation_endpoint ON api_documentation(endpoint_path, api_version);
CREATE INDEX idx_api_documentation_category ON api_documentation(category, status);
CREATE INDEX idx_code_examples_doc ON code_examples(documentation_id, language);
CREATE INDEX idx_developer_guides_category ON developer_guides(category, status);
CREATE INDEX idx_developer_guides_slug ON developer_guides(slug);
CREATE INDEX idx_sdk_documentation_language ON sdk_documentation(language, status);
CREATE INDEX idx_api_explorer_sessions_user ON api_explorer_sessions(user_id, is_active);
CREATE INDEX idx_developer_feedback_target ON developer_feedback(target_type, target_id);
CREATE INDEX idx_documentation_analytics_date ON documentation_analytics(date, resource_type);
CREATE INDEX idx_documentation_versions_document ON documentation_versions(document_id, document_type);

-- RLS policies for documentation security
ALTER TABLE api_documentation ENABLE ROW LEVEL SECURITY;
ALTER TABLE developer_guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE developer_feedback ENABLE ROW LEVEL SECURITY;

-- Public documentation is visible to all authenticated users
CREATE POLICY public_documentation_access ON api_documentation
  FOR SELECT USING (is_public = TRUE AND status = 'published');

CREATE POLICY public_guides_access ON developer_guides
  FOR SELECT USING (status = 'published');

-- Function to generate API documentation
CREATE OR REPLACE FUNCTION generate_api_documentation(
  endpoint_path_param VARCHAR(500),
  method_param http_method,
  title_param VARCHAR(200),
  description_param TEXT,
  request_schema_param JSONB DEFAULT '{}',
  response_schema_param JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
  doc_id UUID;
BEGIN
  INSERT INTO api_documentation (
    endpoint_path,
    http_method,
    title,
    description,
    request_schema,
    response_schema,
    category,
    status
  ) VALUES (
    endpoint_path_param,
    method_param,
    title_param,
    description_param,
    request_schema_param,
    response_schema_param,
    'users', -- Default category
    'draft'
  ) RETURNING id INTO doc_id;
  
  RETURN doc_id;
END;
$$ LANGUAGE plpgsql;

-- Function to track documentation analytics
CREATE OR REPLACE FUNCTION track_documentation_view(
  resource_type_param analytics_resource_type,
  resource_id_param UUID,
  resource_path_param VARCHAR(500) DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  INSERT INTO documentation_analytics (
    date,
    resource_type,
    resource_id,
    resource_path,
    page_views,
    unique_visitors
  ) VALUES (
    CURRENT_DATE,
    resource_type_param,
    resource_id_param,
    resource_path_param,
    1,
    1
  )
  ON CONFLICT (date, resource_type, resource_id)
  DO UPDATE SET
    page_views = documentation_analytics.page_views + 1,
    unique_visitors = documentation_analytics.unique_visitors + 1;
END;
$$ LANGUAGE plpgsql;
```

---

## 🎨 UI COMPONENTS ARCHITECTURE

### **APIDocumentationHub Component**
```typescript
// src/components/docs/APIDocumentationHub.tsx
interface APIDocumentationHubProps {
  user?: User;
}

interface APIDocumentationState {
  documentation: APIDocumentation[];
  categories: DocCategory[];
  selectedCategory: string;
  searchQuery: string;
  selectedEndpoint: APIDocumentation | null;
  codeLanguage: ProgrammingLanguage;
  apiExplorerOpen: boolean;
  loading: boolean;
  researcherMode: boolean; // New: Simplified view for researchers
}

export const APIDocumentationHub: React.FC<APIDocumentationHubProps> = ({
  user
}) => {
  const [state, setState] = useState<APIDocumentationState>({
    documentation: [],
    categories: [],
    selectedCategory: 'studies', // Default to study-related APIs
    searchQuery: '',
    selectedEndpoint: null,
    codeLanguage: 'javascript',
    apiExplorerOpen: false,
    loading: true,
    researcherMode: user?.role === 'researcher' // Simplified mode for researchers
  });

  const { trackEvent } = useAnalytics();

  // Focus on researcher-relevant API categories
  const researcherCategories = [
    'studies', 'participants', 'results', 'analytics', 'exports'
  ];

  useEffect(() => {
    loadDocumentation();
    loadCategories();
  }, [state.selectedCategory, state.searchQuery]);

  const loadDocumentation = async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));

      const queryParams = new URLSearchParams({
        category: state.selectedCategory,
        search: state.searchQuery,
        status: 'published',
        // Filter for researcher-relevant endpoints
        ...(state.researcherMode && { researcherFriendly: 'true' })
      });

      const response = await fetch(`/api/documentation?${queryParams}`);
      if (!response.ok) throw new Error('Failed to load documentation');

      const data = await response.json();
      setState(prev => ({ ...prev, documentation: data.documentation }));

    } catch (error) {
      console.error('Load documentation error:', error);
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  // ...existing code...

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Researcher-Focused Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900">
                ResearchHub API Documentation
              </h1>
              <p className="mt-4 text-xl text-gray-600">
                Connect your studies with external tools and automate your research workflows
              </p>
              
              {/* Researcher-Focused Quick Actions */}
              <div className="mt-8 flex justify-center space-x-4">
                <button
                  onClick={() => setState(prev => ({ ...prev, showQuickStart: true }))}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <PlayCircle className="w-5 h-5 mr-2" />
                  Quick Start for Researchers
                </button>
                
                <button
                  onClick={() => setState(prev => ({ ...prev, showCommonIntegrations: true }))}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Link className="w-5 h-5 mr-2" />
                  Common Integrations
                </button>
                
                <button
                  onClick={() => setState(prev => ({ ...prev, apiExplorerOpen: true }))}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Code className="w-5 h-5 mr-2" />
                  Test API Calls
                </button>
              </div>

              {/* Researcher Use Cases */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900">Export Study Data</h3>
                  <p className="text-blue-700 text-sm mt-1">Get study results in CSV, JSON, or integrate with your analytics tools</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-900">Automate Workflows</h3>
                  <p className="text-green-700 text-sm mt-1">Trigger actions when studies complete or participants respond</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-900">Custom Dashboards</h3>
                  <p className="text-purple-700 text-sm mt-1">Build organization-specific reporting and visualization tools</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Researcher-Focused Sidebar */}
          <div className="lg:col-span-1">
            <ResearcherAPISidebar
              categories={state.researcherMode ? researcherCategories : state.categories}
              selectedCategory={state.selectedCategory}
              documentation={state.documentation}
              searchQuery={state.searchQuery}
              researcherMode={state.researcherMode}
              onCategoryChange={(category) => setState(prev => ({ ...prev, selectedCategory: category }))}
              onSearchChange={(query) => setState(prev => ({ ...prev, searchQuery: query }))}
              onEndpointSelect={handleEndpointSelect}
              selectedEndpoint={state.selectedEndpoint}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {state.selectedEndpoint ? (
              <ResearcherAPIEndpointDocumentation
                endpoint={state.selectedEndpoint}
                codeLanguage={state.codeLanguage}
                researcherMode={state.researcherMode}
                onLanguageChange={(language) => setState(prev => ({ ...prev, codeLanguage: language }))}
                onTryItOut={() => handleTryItOut(state.selectedEndpoint!)}
                onCopyCode={handleCopyCode}
                user={user}
              />
            ) : (
              <ResearcherAPIOverview
                documentation={state.documentation}
                onEndpointSelect={handleEndpointSelect}
                researcherMode={state.researcherMode}
                loading={state.loading}
              />
            )}
          </div>
        </div>
      </div>

      {/* Researcher-Focused Modals */}
      {state.apiExplorerOpen && (
        <ResearcherAPIExplorer
          endpoint={state.selectedEndpoint}
          user={user}
          onClose={() => setState(prev => ({ ...prev, apiExplorerOpen: false }))}
          onRequest={(request) => {
            trackEvent('researcher_api_request', {
              endpoint: request.endpoint,
              method: request.method,
              status: request.status
            });
          }}
        />
      )}

      {/* Quick Start for Researchers Modal */}
      {state.showQuickStart && (
        <ResearcherQuickStartModal
          onClose={() => setState(prev => ({ ...prev, showQuickStart: false }))}
        />
      )}

      {/* Common Integrations Modal */}
      {state.showCommonIntegrations && (
        <CommonIntegrationsModal
          onClose={() => setState(prev => ({ ...prev, showCommonIntegrations: false }))}
        />
      )}
    </div>
  );
};
```

### **APIEndpointDocumentation Component**
```typescript
// src/components/docs/APIEndpointDocumentation.tsx
interface APIEndpointDocumentationProps {
  endpoint: APIDocumentation;
  codeLanguage: ProgrammingLanguage;
  onLanguageChange: (language: ProgrammingLanguage) => void;
  onTryItOut: () => void;
  onCopyCode: (code: string, language: string) => void;
  user?: User;
}

export const APIEndpointDocumentation: React.FC<APIEndpointDocumentationProps> = ({
  endpoint,
  codeLanguage,
  onLanguageChange,
  onTryItOut,
  onCopyCode,
  user
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'examples' | 'responses'>('overview');
  const [codeExamples, setCodeExamples] = useState<CodeExample[]>([]);

  useEffect(() => {
    loadCodeExamples();
  }, [endpoint.id, codeLanguage]);

  const loadCodeExamples = async () => {
    try {
      const response = await fetch(`/api/documentation/${endpoint.id}/examples?language=${codeLanguage}`);
      if (!response.ok) throw new Error('Failed to load examples');

      const data = await response.json();
      setCodeExamples(data.examples);

    } catch (error) {
      console.error('Load code examples error:', error);
    }
  };

  const getMethodColor = (method: string) => {
    const colors = {
      'GET': 'bg-blue-100 text-blue-800',
      'POST': 'bg-green-100 text-green-800',
      'PUT': 'bg-yellow-100 text-yellow-800',
      'PATCH': 'bg-orange-100 text-orange-800',
      'DELETE': 'bg-red-100 text-red-800'
    };
    return colors[method as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getMethodColor(endpoint.http_method)}`}>
                {endpoint.http_method}
              </span>
              <code className="text-lg font-mono text-gray-900">
                {endpoint.endpoint_path}
              </code>
            </div>
            <h1 className="mt-2 text-2xl font-bold text-gray-900">
              {endpoint.title}
            </h1>
            <p className="mt-1 text-gray-600">
              {endpoint.description}
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <LanguageSelector
              value={codeLanguage}
              onChange={onLanguageChange}
            />
            
            {user && (
              <button
                onClick={onTryItOut}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Play className="w-4 h-4 mr-2" />
                Try it out
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'overview', name: 'Overview', icon: FileText },
            { id: 'examples', name: 'Code Examples', icon: Code },
            { id: 'responses', name: 'Responses', icon: ArrowRight }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <tab.icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            
            {/* Authentication */}
            {endpoint.auth_required && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Authentication</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <Lock className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="text-blue-800 font-medium">API Key Required</span>
                  </div>
                  <p className="mt-2 text-blue-700">
                    This endpoint requires authentication using an API key in the Authorization header.
                  </p>
                  {endpoint.auth_scopes.length > 0 && (
                    <div className="mt-3">
                      <span className="text-blue-800 font-medium">Required Scopes:</span>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {endpoint.auth_scopes.map((scope) => (
                          <span key={scope} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                            {scope}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Parameters */}
            <ParametersSection
              pathParameters={endpoint.path_parameters}
              queryParameters={endpoint.query_parameters}
              headerParameters={endpoint.header_parameters}
            />

            {/* Request Body */}
            {endpoint.request_schema && Object.keys(endpoint.request_schema).length > 0 && (
              <RequestBodySection
                schema={endpoint.request_schema}
                examples={endpoint.request_examples}
              />
            )}
          </div>
        )}

        {/* Code Examples Tab */}
        {activeTab === 'examples' && (
          <div className="space-y-6">
            {codeExamples.length > 0 ? (
              codeExamples.map((example) => (
                <CodeExampleCard
                  key={example.id}
                  example={example}
                  onCopy={() => onCopyCode(example.code_snippet, example.language)}
                />
              ))
            ) : (
              <EmptyCodeExamples
                language={codeLanguage}
                endpoint={endpoint}
              />
            )}
          </div>
        )}

        {/* Responses Tab */}
        {activeTab === 'responses' && (
          <div className="space-y-6">
            <ResponsesSection
              responseSchema={endpoint.response_schema}
              responseExamples={endpoint.response_examples}
              errorResponses={endpoint.error_responses}
            />
          </div>
        )}
      </div>
    </div>
  );
};
```

### **DeveloperGuideHub Component**
```typescript
// src/components/docs/DeveloperGuideHub.tsx
interface DeveloperGuideHubProps {
  user?: User;
}

interface DeveloperGuideState {
  guides: DeveloperGuide[];
  categories: GuideCategory[];
  selectedCategory: string;
  searchQuery: string;
  selectedGuide: DeveloperGuide | null;
  loading: boolean;
}

export const DeveloperGuideHub: React.FC<DeveloperGuideHubProps> = ({
  user
}) => {
  const [state, setState] = useState<DeveloperGuideState>({
    guides: [],
    categories: [],
    selectedCategory: 'all',
    searchQuery: '',
    selectedGuide: null,
    loading: true
  });

  const { trackEvent } = useAnalytics();

  useEffect(() => {
    loadGuides();
    loadCategories();
  }, [state.selectedCategory, state.searchQuery]);

  const loadGuides = async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));

      const queryParams = new URLSearchParams({
        category: state.selectedCategory,
        search: state.searchQuery,
        status: 'published'
      });

      const response = await fetch(`/api/documentation/guides?${queryParams}`);
      if (!response.ok) throw new Error('Failed to load guides');

      const data = await response.json();
      setState(prev => ({ ...prev, guides: data.guides }));

    } catch (error) {
      console.error('Load guides error:', error);
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const handleGuideSelect = async (guide: DeveloperGuide) => {
    setState(prev => ({ ...prev, selectedGuide: guide }));
    
    // Track guide view
    await fetch('/api/documentation/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resourceType: 'guide',
        resourceId: guide.id,
        resourcePath: `/docs/guides/${guide.slug}`
      })
    });

    trackEvent('developer_guide_viewed', {
      guide_slug: guide.slug,
      category: guide.category,
      difficulty: guide.difficulty_level
    });
  };

  const handleGuideComplete = async (guide: DeveloperGuide) => {
    await fetch(`/api/documentation/guides/${guide.id}/complete`, {
      method: 'POST'
    });

    trackEvent('developer_guide_completed', {
      guide_slug: guide.slug,
      time_spent: Date.now() - (guide.startTime || Date.now())
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900">
                Developer Guides
              </h1>
              <p className="mt-4 text-xl text-gray-600">
                Comprehensive tutorials and guides to help you build with ResearchHub
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {state.selectedGuide ? (
          <GuideViewer
            guide={state.selectedGuide}
            onComplete={() => handleGuideComplete(state.selectedGuide!)}
            onBack={() => setState(prev => ({ ...prev, selectedGuide: null }))}
            user={user}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <GuidesSidebar
                categories={state.categories}
                selectedCategory={state.selectedCategory}
                searchQuery={state.searchQuery}
                onCategoryChange={(category) => setState(prev => ({ ...prev, selectedCategory: category }))}
                onSearchChange={(query) => setState(prev => ({ ...prev, searchQuery: query }))}
              />
            </div>

            {/* Guides Grid */}
            <div className="lg:col-span-3">
              {state.loading ? (
                <GuidesLoadingSkeleton />
              ) : (
                <GuidesGrid
                  guides={state.guides}
                  onGuideSelect={handleGuideSelect}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
```

---

## 🔧 API IMPLEMENTATION

### **Documentation Management API**
```typescript
// api/documentation/index.ts
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createServerSupabaseClient({ req, res });

  switch (req.method) {
    case 'GET':
      return handleGetDocumentation(req, res, supabase);
    case 'POST':
      return handleCreateDocumentation(req, res, supabase);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function handleGetDocumentation(req: any, res: any, supabase: any) {
  try {
    const {
      category = 'all',
      search = '',
      status = 'published',
      version = 'v1',
      limit = '50',
      offset = '0'
    } = req.query;

    // Build query
    let query = supabase
      .from('api_documentation')
      .select(`
        *,
        examples:code_examples(*)
      `)
      .eq('api_version', version)
      .eq('status', status)
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1)
      .order('endpoint_path');

    // Apply filters
    if (category !== 'all') {
      query = query.eq('category', category);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,endpoint_path.ilike.%${search}%`);
    }

    const { data: documentation, error } = await query;

    if (error) throw error;

    // Get categories
    const { data: categories } = await supabase
      .from('api_documentation')
      .select('category')
      .eq('status', 'published')
      .group('category');

    return res.status(200).json({
      documentation: documentation || [],
      categories: categories?.map(c => c.category) || [],
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: (documentation?.length || 0) === parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get documentation error:', error);
    return res.status(500).json({ error: 'Failed to fetch documentation' });
  }
}

async function handleCreateDocumentation(req: any, res: any, supabase: any) {
  try {
    // Verify authentication and admin role
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { data: userProfile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userProfile?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const {
      endpointPath,
      httpMethod,
      title,
      description,
      requestSchema = {},
      responseSchema = {},
      category,
      authRequired = true,
      authScopes = []
    } = req.body;

    // Validate required fields
    if (!endpointPath || !httpMethod || !title || !description) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create documentation
    const { data: documentation, error } = await supabase
      .from('api_documentation')
      .insert({
        endpoint_path: endpointPath,
        http_method: httpMethod,
        title,
        description,
        request_schema: requestSchema,
        response_schema: responseSchema,
        category: category || 'users',
        auth_required: authRequired,
        auth_scopes: authScopes,
        created_by: user.id,
        status: 'draft'
      })
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json({ documentation });

  } catch (error) {
    console.error('Create documentation error:', error);
    return res.status(500).json({ error: 'Failed to create documentation' });
  }
}
```

### **Code Examples API**
```typescript
// api/documentation/[id]/examples.ts
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { language = 'javascript' } = req.query;
    
    const supabase = createServerSupabaseClient({ req, res });

    // Get code examples for the documentation
    const { data: examples, error } = await supabase
      .from('code_examples')
      .select('*')
      .eq('documentation_id', id)
      .eq('language', language)
      .eq('is_active', true)
      .order('complexity_level', { ascending: true });

    if (error) throw error;

    // If no examples found, generate basic examples
    if (!examples || examples.length === 0) {
      const generatedExamples = await generateCodeExamples(id as string, language as string);
      return res.status(200).json({ examples: generatedExamples });
    }

    return res.status(200).json({ examples });

  } catch (error) {
    console.error('Get code examples error:', error);
    return res.status(500).json({ error: 'Failed to fetch code examples' });
  }
}

async function generateCodeExamples(documentationId: string, language: string): Promise<CodeExample[]> {
  // Get the documentation details
  const supabase = createServiceSupabaseClient();
  
  const { data: doc } = await supabase
    .from('api_documentation')
    .select('*')
    .eq('id', documentationId)
    .single();

  if (!doc) return [];

  const examples: Partial<CodeExample>[] = [];

  // Generate basic request example
  const basicExample = generateBasicRequestExample(doc, language);
  if (basicExample) {
    examples.push(basicExample);
  }

  // Generate response handling example
  const responseExample = generateResponseHandlingExample(doc, language);
  if (responseExample) {
    examples.push(responseExample);
  }

  return examples as CodeExample[];
}

function generateBasicRequestExample(doc: any, language: string): Partial<CodeExample> | null {
  const codeGenerators = {
    javascript: generateJavaScriptExample,
    typescript: generateTypeScriptExample,
    python: generatePythonExample,
    curl: generateCurlExample
  };

  const generator = codeGenerators[language as keyof typeof codeGenerators];
  if (!generator) return null;

  return {
    language: language as ProgrammingLanguage,
    title: `${doc.http_method} ${doc.endpoint_path}`,
    description: `Basic ${language} example for ${doc.title}`,
    code_snippet: generator(doc),
    example_type: 'request',
    complexity_level: 'basic'
  };
}

function generateJavaScriptExample(doc: any): string {
  return `
const response = await fetch('${process.env.NEXT_PUBLIC_API_URL}${doc.endpoint_path}', {
  method: '${doc.http_method}',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }${doc.request_schema && Object.keys(doc.request_schema).length > 0 ? `,
  body: JSON.stringify({
    // Add your request data here
  })` : ''}
});

const data = await response.json();
console.log(data);
  `.trim();
}

function generateTypeScriptExample(doc: any): string {
  return `
interface ApiResponse {
  // Define response type based on your API
}

const response = await fetch('${process.env.NEXT_PUBLIC_API_URL}${doc.endpoint_path}', {
  method: '${doc.http_method}',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }${doc.request_schema && Object.keys(doc.request_schema).length > 0 ? `,
  body: JSON.stringify({
    // Add your request data here
  })` : ''}
});

const data: ApiResponse = await response.json();
console.log(data);
  `.trim();
}

function generatePythonExample(doc: any): string {
  return `
import requests

url = "${process.env.NEXT_PUBLIC_API_URL}${doc.endpoint_path}"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}

${doc.request_schema && Object.keys(doc.request_schema).length > 0 ? `data = {
    # Add your request data here
}

response = requests.${doc.http_method.toLowerCase()}(url, headers=headers, json=data)` : `response = requests.${doc.http_method.toLowerCase()}(url, headers=headers)`}
result = response.json()
print(result)
  `.trim();
}

function generateCurlExample(doc: any): string {
  return `
curl -X ${doc.http_method} \\
  "${process.env.NEXT_PUBLIC_API_URL}${doc.endpoint_path}" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"${doc.request_schema && Object.keys(doc.request_schema).length > 0 ? ` \\
  -d '{
    // Add your request data here
  }'` : ''}
  `.trim();
}
```

---

## 🧪 TESTING SPECIFICATIONS

### **Documentation Testing Suite**
```typescript
// tests/documentation/api-docs.test.ts
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { APIDocumentationHub } from '@/components/docs/APIDocumentationHub';
import { mockDocumentation, mockUser } from '@/test-utils/mocks';

describe('APIDocumentationHub', () => {
  beforeEach(() => {
    fetchMock.mockImplementation((url) => {
      if (url.includes('/api/documentation')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            documentation: mockDocumentation,
            categories: ['authentication', 'users', 'studies']
          })
        });
      }
      return Promise.reject(new Error('Not mocked'));
    });
  });

  it('should display API documentation categories', async () => {
    render(<APIDocumentationHub user={mockUser} />);

    await waitFor(() => {
      expect(screen.getByText('API Documentation')).toBeInTheDocument();
    });

    expect(screen.getByText('Authentication')).toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('Studies')).toBeInTheDocument();
  });

  it('should filter documentation by category', async () => {
    render(<APIDocumentationHub user={mockUser} />);

    const authCategory = await screen.findByText('Authentication');
    fireEvent.click(authCategory);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('category=authentication'),
        expect.any(Object)
      );
    });
  });

  it('should display endpoint details', async () => {
    render(<APIDocumentationHub user={mockUser} />);

    const endpoint = await screen.findByText('GET /api/users');
    fireEvent.click(endpoint);

    await waitFor(() => {
      expect(screen.getByText('List Users')).toBeInTheDocument();
      expect(screen.getByText('Retrieve a list of users')).toBeInTheDocument();
    });
  });

  it('should open API explorer', async () => {
    render(<APIDocumentationHub user={mockUser} />);

    const explorerButton = await screen.findByText('API Explorer');
    fireEvent.click(explorerButton);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('should copy code examples', async () => {
    const mockClipboard = {
      writeText: jest.fn().mockResolvedValue(undefined)
    };
    Object.assign(navigator, { clipboard: mockClipboard });

    render(<APIDocumentationHub user={mockUser} />);

    const endpoint = await screen.findByText('GET /api/users');
    fireEvent.click(endpoint);

    const codeTab = await screen.findByText('Code Examples');
    fireEvent.click(codeTab);

    const copyButton = await screen.findByRole('button', { name: /copy/i });
    fireEvent.click(copyButton);

    expect(mockClipboard.writeText).toHaveBeenCalled();
  });
});
```

### **Documentation Analytics Testing**
```typescript
// tests/documentation/analytics.test.ts
describe('Documentation Analytics', () => {
  it('should track documentation views', async () => {
    const response = await request(app)
      .post('/api/documentation/analytics')
      .send({
        resourceType: 'api_endpoint',
        resourceId: 'doc-1',
        resourcePath: '/api/users'
      })
      .expect(200);

    expect(response.body.success).toBe(true);
  });

  it('should track code copy events', async () => {
    const response = await request(app)
      .post('/api/documentation/analytics')
      .send({
        resourceType: 'api_endpoint',
        resourceId: 'doc-1',
        eventType: 'code_copy',
        metadata: { language: 'javascript' }
      })
      .expect(200);

    expect(response.body.success).toBe(true);
  });

  it('should generate analytics reports', async () => {
    const response = await request(app)
      .get('/api/documentation/analytics/report?period=week')
      .expect(200);

    expect(response.body.metrics).toBeDefined();
    expect(response.body.metrics.totalViews).toBeGreaterThanOrEqual(0);
    expect(response.body.metrics.uniqueVisitors).toBeGreaterThanOrEqual(0);
  });

  it('should track API explorer usage', async () => {
    const response = await request(app)
      .post('/api/documentation/analytics')
      .send({
        resourceType: 'api_endpoint',
        resourceId: 'doc-1',
        eventType: 'api_explorer_request',
        metadata: { 
          method: 'GET',
          status: 200,
          responseTime: 150
        }
      })
      .expect(200);

    expect(response.body.success).toBe(true);
  });
});
```

---

## 🎯 SUCCESS CRITERIA & VALIDATION

### **Documentation Excellence KPIs**
```typescript
interface DocumentationKPIs {
  completeness: {
    apiCoverage: number; // Target: >99% endpoints documented
    exampleCoverage: number; // Target: >95% endpoints have examples
    sdkCoverage: number; // Target: >80% popular languages
    guideCoverage: number; // Target: >90% use cases covered
  };
  
  usability: {
    developerSatisfaction: number; // Target: >4.9/5
    timeToFirstSuccess: number; // Target: <15 minutes
    documentationClearness: number; // Target: >4.8/5
    exampleAccuracy: number; // Target: >99% working examples
  };
  
  engagement: {
    apiExplorerUsage: number; // Target: >60% developers use
    codeExampleCopyRate: number; // Target: >40% copy code
    guideCompletionRate: number; // Target: >70% finish guides
    feedbackResponseRate: number; // Target: <24 hours response
  };
  
  performance: {
    pageLoadTime: number; // Target: <2 seconds
    searchAccuracy: number; // Target: >95% relevant results
    uptimePercentage: number; // Target: >99.9%
    apiExplorerResponseTime: number; // Target: <1 second
  };
}
```

### **Developer Experience Targets**
```typescript
const DEVELOPER_EXPERIENCE_TARGETS = {
  onboarding: {
    target: '<15 minutes',
    measurement: 'Time from signup to first successful API call',
    acceptance: '90% of developers achieve target'
  },
  
  documentation_quality: {
    target: '>4.9/5',
    measurement: 'Developer satisfaction rating',
    acceptance: 'Monthly survey above target'
  },
  
  api_explorer_success: {
    target: '>95%',
    measurement: 'Successful API requests in explorer',
    acceptance: 'Weekly success rate above target'
  },
  
  support_resolution: {
    target: '<24 hours',
    measurement: 'Average response time to developer questions',
    acceptance: 'Monthly average under target'
  }
};
```

---

## 🚀 IMPLEMENTATION ROADMAP

### **Phase 1: Researcher-Focused API Foundation (Week 1)**
- [ ] Researcher-friendly API documentation database schema
- [ ] Study-centric API endpoint organization
- [ ] Basic researcher documentation UI components
- [ ] Study data export API documentation
- [ ] Common integration examples for researchers

### **Phase 2: Interactive Tools for Researchers (Week 2)**
- [ ] Simplified API Explorer for non-technical researchers
- [ ] One-click integration templates (Zapier, webhooks)
- [ ] Study data export wizard
- [ ] Real-time API testing with study data
- [ ] Researcher feedback system

### **Phase 3: Integration Workflows (Week 3)**
- [ ] Pre-built integration guides (CRM, analytics tools)
- [ ] Workflow automation templates
- [ ] Custom dashboard building guides
- [ ] Video tutorials for common use cases
- [ ] Success story examples

### **Phase 4: Advanced Integration Support (Week 4)**
- [ ] Advanced API features documentation
- [ ] Custom webhook configurations
- [ ] Performance optimization guides
- [ ] Security best practices for researchers
- [ ] Community integration sharing

---

## 🎯 ALIGNMENT WITH STUDY-CENTRIC ARCHITECTURE

### **Integration Points with Core System:**
1. **Study Page Integration**: API documentation links from study results tab
2. **Export Functionality**: Direct API access from study analytics
3. **Workflow Automation**: APIs that trigger on study state changes
4. **Custom Reporting**: APIs for building organization dashboards
5. **External Tool Sync**: Integration guides for popular research tools

### **Researcher Journey Optimization:**
- **Discovery**: Find API features through study workflows
- **Learning**: Researcher-friendly documentation and examples
- **Implementation**: Guided setup with minimal technical knowledge required
- **Success**: Working integrations that enhance research productivity

This API Documentation page serves as the technical enablement hub while maintaining focus on researcher needs and study-centric workflows.

**📚 API DOCUMENTATION & DEVELOPER RESOURCES: Empowering developers with world-class documentation, interactive tools, and comprehensive resources that make ResearchHub integration effortless and accelerate innovation across the research ecosystem.**
