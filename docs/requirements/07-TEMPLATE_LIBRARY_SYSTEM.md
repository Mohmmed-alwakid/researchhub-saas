# 📚 TEMPLATE LIBRARY SYSTEM - COMPREHENSIVE REQUIREMENTS
## Advanced Template Management & Marketplace

**Created**: July 12, 2025  
**Status**: 🟢 GREENFIELD SPECIFICATION  
**Scope**: Complete template creation, management, and marketplace ecosystem  
**Dependencies**: Study Creation (04-STUDY_CREATION_SYSTEM.md), User Management (03-USER_MANAGEMENT_SYSTEM.md)

---

## 📋 EXECUTIVE SUMMARY

The Template Library System provides researchers with a comprehensive collection of pre-built study templates, enabling rapid study creation, knowledge sharing, and best practice distribution across the research community.

### **🎯 Core Value Proposition**
> "Accelerate research excellence through intelligent template discovery, customization, and community collaboration"

### **🏆 Success Metrics**
- **Template Usage**: 80% of studies start from templates
- **Research Velocity**: 60% faster study creation
- **Community Engagement**: 40% of users contribute templates
- **Quality Score**: 4.8/5 average template rating

---

## 🗄️ DATABASE SCHEMA

### **Template Management Tables**
```sql
-- Core template definitions
CREATE TABLE study_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Template identification
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  version INTEGER NOT NULL DEFAULT 1,
  
  -- Template content
  description TEXT NOT NULL,
  full_description TEXT,
  category template_category NOT NULL,
  subcategory VARCHAR(100),
  
  -- Template structure
  blocks JSONB NOT NULL DEFAULT '[]',
  settings JSONB DEFAULT '{}',
  
  -- Metadata
  tags VARCHAR(50)[] DEFAULT '{}',
  use_cases TEXT[] DEFAULT '{}',
  research_methods VARCHAR(100)[] DEFAULT '{}',
  
  -- Template configuration
  estimated_duration INTEGER, -- minutes
  participant_requirements JSONB DEFAULT '{}',
  sample_size_recommendation JSONB DEFAULT '{}',
  
  -- Ownership and permissions
  created_by UUID NOT NULL REFERENCES users(id),
  organization_id UUID REFERENCES organizations(id),
  visibility template_visibility NOT NULL DEFAULT 'public',
  
  -- Status and moderation
  status template_status NOT NULL DEFAULT 'draft',
  is_featured BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  verification_date TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES users(id),
  
  -- Usage tracking
  usage_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  favorite_count INTEGER DEFAULT 0,
  
  -- Quality metrics
  average_rating DECIMAL(3,2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  
  -- SEO and discovery
  keywords TEXT[] DEFAULT '{}',
  search_vector tsvector,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE,
  
  -- Constraints
  CONSTRAINT valid_rating CHECK (average_rating >= 0 AND average_rating <= 5),
  CONSTRAINT valid_duration CHECK (estimated_duration > 0),
  CONSTRAINT valid_version CHECK (version > 0)
);

-- Template versioning and history
CREATE TABLE template_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES study_templates(id) ON DELETE CASCADE,
  
  -- Version details
  version_number INTEGER NOT NULL,
  version_type version_type NOT NULL,
  
  -- Content snapshot
  name VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  blocks JSONB NOT NULL,
  settings JSONB DEFAULT '{}',
  
  -- Change tracking
  changes_summary TEXT,
  breaking_changes BOOLEAN DEFAULT FALSE,
  migration_notes TEXT,
  
  -- Metadata
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Publishing
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMP WITH TIME ZONE,
  
  UNIQUE(template_id, version_number)
);

-- Template categories and taxonomy
CREATE TABLE template_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Category details
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  
  -- Hierarchy
  parent_id UUID REFERENCES template_categories(id),
  level INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER DEFAULT 0,
  
  -- Visual representation
  icon VARCHAR(50),
  color VARCHAR(7), -- hex color
  image_url TEXT,
  
  -- SEO
  meta_title VARCHAR(200),
  meta_description TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  template_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Template ratings and reviews
CREATE TABLE template_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES study_templates(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Rating details
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_title VARCHAR(200),
  review_text TEXT,
  
  -- Review metadata
  helpful_count INTEGER DEFAULT 0,
  verified_usage BOOLEAN DEFAULT FALSE,
  
  -- Context
  use_case VARCHAR(200),
  study_size INTEGER,
  completion_time INTEGER, -- actual time taken
  
  -- Moderation
  is_featured BOOLEAN DEFAULT FALSE,
  is_approved BOOLEAN DEFAULT TRUE,
  moderated_by UUID REFERENCES users(id),
  moderated_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(template_id, user_id)
);

-- Template favorites and bookmarks
CREATE TABLE template_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES study_templates(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Organization
  collection_name VARCHAR(100),
  tags VARCHAR(50)[] DEFAULT '{}',
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(template_id, user_id)
);

-- Template usage analytics
CREATE TABLE template_usage_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES study_templates(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Usage context
  usage_type template_usage_type NOT NULL,
  study_id UUID REFERENCES studies(id) ON DELETE SET NULL,
  
  -- Usage details
  customization_level customization_level NOT NULL,
  blocks_modified INTEGER DEFAULT 0,
  blocks_added INTEGER DEFAULT 0,
  blocks_removed INTEGER DEFAULT 0,
  
  -- Performance metrics
  setup_time_minutes INTEGER,
  completion_success BOOLEAN,
  
  -- Context data
  organization_id UUID REFERENCES organizations(id),
  research_domain VARCHAR(100),
  participant_count INTEGER,
  
  -- Geographic and demographic
  user_country VARCHAR(2),
  user_timezone VARCHAR(50),
  
  -- Timestamps
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Template collections and curation
CREATE TABLE template_collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Collection details
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  
  -- Collection metadata
  curator_id UUID NOT NULL REFERENCES users(id),
  organization_id UUID REFERENCES organizations(id),
  
  -- Visual and branding
  cover_image_url TEXT,
  theme_color VARCHAR(7),
  
  -- Status
  is_public BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  
  -- Statistics
  template_count INTEGER DEFAULT 0,
  follower_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Collection templates (many-to-many relationship)
CREATE TABLE collection_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  collection_id UUID NOT NULL REFERENCES template_collections(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES study_templates(id) ON DELETE CASCADE,
  
  -- Positioning
  sort_order INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  curator_note TEXT,
  added_by UUID NOT NULL REFERENCES users(id),
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(collection_id, template_id)
);

-- Template submission and approval workflow
CREATE TABLE template_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES study_templates(id) ON DELETE CASCADE,
  
  -- Submission details
  submission_type submission_type NOT NULL,
  submitted_by UUID NOT NULL REFERENCES users(id),
  
  -- Review process
  status submission_status NOT NULL DEFAULT 'pending',
  assigned_reviewer UUID REFERENCES users(id),
  
  -- Review feedback
  review_notes TEXT,
  required_changes TEXT[],
  approval_conditions TEXT[],
  
  -- Decision
  decision submission_decision,
  decision_reason TEXT,
  decided_by UUID REFERENCES users(id),
  decided_at TIMESTAMP WITH TIME ZONE,
  
  -- Quality assessment
  quality_score INTEGER CHECK (quality_score >= 1 AND quality_score <= 100),
  compliance_check JSONB DEFAULT '{}',
  
  -- Timestamps
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  
  -- Follow-up
  resubmission_allowed BOOLEAN DEFAULT TRUE,
  appeal_deadline TIMESTAMP WITH TIME ZONE
);

-- Create ENUMs for template system
CREATE TYPE template_category AS ENUM (
  'usability_testing', 'user_interviews', 'surveys', 'card_sorting',
  'tree_testing', 'first_click', 'preference_testing', 'prototype_testing',
  'accessibility_testing', 'competitive_analysis', 'concept_validation',
  'information_architecture', 'user_journey', 'market_research'
);

CREATE TYPE template_visibility AS ENUM ('public', 'organization', 'private');

CREATE TYPE template_status AS ENUM (
  'draft', 'pending_review', 'approved', 'published', 'deprecated', 'archived'
);

CREATE TYPE version_type AS ENUM ('major', 'minor', 'patch', 'hotfix');

CREATE TYPE template_usage_type AS ENUM (
  'direct_use', 'customized_use', 'inspiration', 'preview_only'
);

CREATE TYPE customization_level AS ENUM (
  'none', 'minimal', 'moderate', 'extensive', 'complete_rebuild'
);

CREATE TYPE submission_type AS ENUM (
  'new_template', 'template_update', 'community_contribution'
);

CREATE TYPE submission_status AS ENUM (
  'pending', 'under_review', 'changes_requested', 'approved', 'rejected'
);

CREATE TYPE submission_decision AS ENUM (
  'approved', 'approved_with_conditions', 'rejected', 'needs_revision'
);

-- Performance indexes for template queries
CREATE INDEX idx_study_templates_category ON study_templates(category, status);
CREATE INDEX idx_study_templates_featured ON study_templates(is_featured, published_at);
CREATE INDEX idx_study_templates_usage ON study_templates(usage_count DESC, average_rating DESC);
CREATE INDEX idx_study_templates_search ON study_templates USING gin(search_vector);
CREATE INDEX idx_study_templates_tags ON study_templates USING gin(tags);
CREATE INDEX idx_template_versions_template ON template_versions(template_id, version_number);
CREATE INDEX idx_template_reviews_template ON template_reviews(template_id, rating DESC);
CREATE INDEX idx_template_favorites_user ON template_favorites(user_id, created_at);
CREATE INDEX idx_template_usage_analytics_template ON template_usage_analytics(template_id, used_at);
CREATE INDEX idx_collection_templates_collection ON collection_templates(collection_id, sort_order);

-- Search functionality
CREATE INDEX idx_study_templates_search_gin ON study_templates USING gin(to_tsvector('english', name || ' ' || description));

-- Update search vector trigger
CREATE OR REPLACE FUNCTION update_template_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', NEW.name || ' ' || NEW.description || ' ' || array_to_string(NEW.tags, ' '));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_template_search_vector_trigger
  BEFORE INSERT OR UPDATE ON study_templates
  FOR EACH ROW EXECUTE FUNCTION update_template_search_vector();
```

---

## 🎨 UI COMPONENTS ARCHITECTURE

### **TemplateLibrary Component**
```typescript
// src/components/templates/TemplateLibrary.tsx
interface TemplateLibraryProps {
  user: User;
  initialCategory?: string;
  initialSearch?: string;
}

interface TemplateLibraryState {
  templates: Template[];
  categories: TemplateCategory[];
  collections: TemplateCollection[];
  filters: TemplateFilters;
  searchQuery: string;
  selectedTemplate: Template | null;
  viewMode: 'grid' | 'list';
  sortBy: SortOption;
  loading: boolean;
  error: string | null;
  pagination: PaginationState;
}

interface TemplateFilters {
  category: string[];
  tags: string[];
  duration: DurationRange;
  rating: number;
  verified: boolean;
  featured: boolean;
  organization: string[];
}

export const TemplateLibrary: React.FC<TemplateLibraryProps> = ({
  user,
  initialCategory,
  initialSearch
}) => {
  const [state, setState] = useState<TemplateLibraryState>({
    templates: [],
    categories: [],
    collections: [],
    filters: {
      category: initialCategory ? [initialCategory] : [],
      tags: [],
      duration: { min: 0, max: 120 },
      rating: 0,
      verified: false,
      featured: false,
      organization: []
    },
    searchQuery: initialSearch || '',
    selectedTemplate: null,
    viewMode: 'grid',
    sortBy: 'popular',
    loading: true,
    error: null,
    pagination: {
      page: 1,
      limit: 24,
      total: 0,
      hasMore: false
    }
  });

  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const { trackEvent } = useAnalytics();

  useEffect(() => {
    loadTemplates();
    loadCategories();
    loadUserFavorites();
  }, [state.filters, state.searchQuery, state.sortBy, state.pagination.page]);

  const loadTemplates = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const params = new URLSearchParams({
        page: state.pagination.page.toString(),
        limit: state.pagination.limit.toString(),
        search: state.searchQuery,
        sort: state.sortBy,
        ...Object.fromEntries(
          Object.entries(state.filters).flatMap(([key, value]) => {
            if (Array.isArray(value)) {
              return value.map(v => [key, v]);
            }
            if (typeof value === 'object' && value !== null) {
              return Object.entries(value).map(([k, v]) => [`${key}_${k}`, v.toString()]);
            }
            return [[key, value.toString()]];
          })
        )
      });

      const response = await fetch(`/api/templates/search?${params}`);
      if (!response.ok) throw new Error('Failed to load templates');

      const data = await response.json();
      
      setState(prev => ({
        ...prev,
        templates: data.templates,
        pagination: {
          ...prev.pagination,
          total: data.total,
          hasMore: data.hasMore
        }
      }));

      // Track search if query exists
      if (state.searchQuery) {
        trackEvent('template_search', {
          query: state.searchQuery,
          results: data.total
        });
      }

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load templates'
      }));
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/templates/categories');
      if (!response.ok) throw new Error('Failed to load categories');

      const data = await response.json();
      setState(prev => ({ ...prev, categories: data.categories }));
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadUserFavorites = async () => {
    try {
      const response = await fetch('/api/templates/favorites');
      if (!response.ok) return;

      const data = await response.json();
      setFavorites(new Set(data.favorites.map((f: any) => f.template_id)));
    } catch (error) {
      console.error('Failed to load favorites:', error);
    }
  };

  const handleSearch = (query: string) => {
    setState(prev => ({
      ...prev,
      searchQuery: query,
      pagination: { ...prev.pagination, page: 1 }
    }));
  };

  const handleFilterChange = (newFilters: Partial<TemplateFilters>) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, ...newFilters },
      pagination: { ...prev.pagination, page: 1 }
    }));
  };

  const handleTemplateSelect = (template: Template) => {
    setState(prev => ({ ...prev, selectedTemplate: template }));
    
    trackEvent('template_preview', {
      template_id: template.id,
      template_name: template.name,
      category: template.category
    });
  };

  const handleToggleFavorite = async (templateId: string) => {
    try {
      const isFavorited = favorites.has(templateId);
      const action = isFavorited ? 'remove' : 'add';

      const response = await fetch('/api/templates/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId, action })
      });

      if (!response.ok) throw new Error('Failed to update favorite');

      setFavorites(prev => {
        const newFavorites = new Set(prev);
        if (isFavorited) {
          newFavorites.delete(templateId);
        } else {
          newFavorites.add(templateId);
        }
        return newFavorites;
      });

      trackEvent('template_favorite', {
        template_id: templateId,
        action
      });

    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const handleUseTemplate = async (template: Template) => {
    try {
      trackEvent('template_use', {
        template_id: template.id,
        template_name: template.name,
        category: template.category
      });

      // Navigate to study builder with template
      window.location.href = `/studies/create?template=${template.id}`;

    } catch (error) {
      console.error('Failed to use template:', error);
    }
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
                  Template Library
                </h1>
                <p className="mt-2 text-lg text-gray-600">
                  Discover and use professionally crafted study templates
                </p>
              </div>
              
              <div className="mt-4 md:mt-0 md:ml-4">
                <CreateTemplateButton
                  user={user}
                  onTemplateCreated={() => loadTemplates()}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Search and Filters */}
        <div className="mb-8">
          <TemplateSearchFilters
            searchQuery={state.searchQuery}
            filters={state.filters}
            categories={state.categories}
            onSearchChange={handleSearch}
            onFiltersChange={handleFilterChange}
          />
        </div>

        {/* View Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {state.pagination.total} templates found
            </span>
            
            {state.searchQuery && (
              <span className="text-sm text-gray-600">
                for "{state.searchQuery}"
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <SortSelector
              value={state.sortBy}
              onChange={(sortBy) => setState(prev => ({ ...prev, sortBy }))}
              options={[
                { value: 'popular', label: 'Most Popular' },
                { value: 'newest', label: 'Newest' },
                { value: 'rating', label: 'Highest Rated' },
                { value: 'name', label: 'Name A-Z' },
                { value: 'usage', label: 'Most Used' }
              ]}
            />
            
            <ViewModeSelector
              value={state.viewMode}
              onChange={(viewMode) => setState(prev => ({ ...prev, viewMode }))}
            />
          </div>
        </div>

        {/* Featured Collections */}
        {state.pagination.page === 1 && !state.searchQuery && (
          <div className="mb-8">
            <FeaturedCollections
              collections={state.collections}
              onCollectionSelect={(collection) => {
                handleFilterChange({
                  ...state.filters,
                  category: [collection.category]
                });
              }}
            />
          </div>
        )}

        {/* Template Grid/List */}
        {state.loading ? (
          <TemplateGridSkeleton viewMode={state.viewMode} />
        ) : state.error ? (
          <div className="text-center py-12">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">Error loading templates</h3>
            <p className="mt-2 text-gray-600">{state.error}</p>
            <button
              onClick={loadTemplates}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        ) : state.templates.length === 0 ? (
          <EmptyTemplateState
            searchQuery={state.searchQuery}
            filters={state.filters}
            onClearFilters={() => handleFilterChange({
              category: [],
              tags: [],
              duration: { min: 0, max: 120 },
              rating: 0,
              verified: false,
              featured: false,
              organization: []
            })}
          />
        ) : (
          <div className={`${
            state.viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
          }`}>
            {state.templates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                viewMode={state.viewMode}
                isFavorited={favorites.has(template.id)}
                onSelect={() => handleTemplateSelect(template)}
                onToggleFavorite={() => handleToggleFavorite(template.id)}
                onUse={() => handleUseTemplate(template)}
              />
            ))}
          </div>
        )}

        {/* Load More */}
        {state.pagination.hasMore && (
          <div className="flex justify-center mt-8">
            <button
              onClick={() => setState(prev => ({
                ...prev,
                pagination: { ...prev.pagination, page: prev.pagination.page + 1 }
              }))}
              disabled={state.loading}
              className="px-6 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              {state.loading ? 'Loading...' : 'Load More Templates'}
            </button>
          </div>
        )}
      </div>

      {/* Template Preview Modal */}
      {state.selectedTemplate && (
        <TemplatePreviewModal
          template={state.selectedTemplate}
          isFavorited={favorites.has(state.selectedTemplate.id)}
          onClose={() => setState(prev => ({ ...prev, selectedTemplate: null }))}
          onToggleFavorite={() => handleToggleFavorite(state.selectedTemplate!.id)}
          onUse={() => handleUseTemplate(state.selectedTemplate!)}
        />
      )}
    </div>
  );
};
```

### **TemplateCreator Component**
```typescript
// src/components/templates/TemplateCreator.tsx
interface TemplateCreatorProps {
  initialTemplate?: Partial<Template>;
  mode: 'create' | 'edit';
  onSave: (template: Template) => void;
  onCancel: () => void;
}

interface TemplateCreatorState {
  template: TemplateFormData;
  blocks: StudyBlock[];
  validationErrors: ValidationError[];
  previewMode: boolean;
  saving: boolean;
  activeStep: number;
}

const TEMPLATE_CREATION_STEPS = [
  { id: 'basic', name: 'Basic Information', icon: FileText },
  { id: 'blocks', name: 'Study Blocks', icon: Layout },
  { id: 'settings', name: 'Configuration', icon: Settings },
  { id: 'metadata', name: 'Metadata & Tags', icon: Tag },
  { id: 'preview', name: 'Preview & Publish', icon: Eye }
];

export const TemplateCreator: React.FC<TemplateCreatorProps> = ({
  initialTemplate,
  mode,
  onSave,
  onCancel
}) => {
  const [state, setState] = useState<TemplateCreatorState>({
    template: {
      name: initialTemplate?.name || '',
      description: initialTemplate?.description || '',
      category: initialTemplate?.category || 'usability_testing',
      tags: initialTemplate?.tags || [],
      estimatedDuration: initialTemplate?.estimatedDuration || 30,
      visibility: initialTemplate?.visibility || 'public',
      ...initialTemplate
    },
    blocks: initialTemplate?.blocks || [],
    validationErrors: [],
    previewMode: false,
    saving: false,
    activeStep: 0
  });

  const { validateTemplate } = useTemplateValidation();
  const { trackEvent } = useAnalytics();

  const handleStepChange = (stepIndex: number) => {
    // Validate current step before proceeding
    const currentStepErrors = validateCurrentStep();
    if (currentStepErrors.length > 0 && stepIndex > state.activeStep) {
      setState(prev => ({ ...prev, validationErrors: currentStepErrors }));
      return;
    }

    setState(prev => ({ 
      ...prev, 
      activeStep: stepIndex,
      validationErrors: []
    }));
  };

  const validateCurrentStep = (): ValidationError[] => {
    const step = TEMPLATE_CREATION_STEPS[state.activeStep];
    
    switch (step.id) {
      case 'basic':
        return validateBasicInfo(state.template);
      case 'blocks':
        return validateBlocks(state.blocks);
      case 'settings':
        return validateSettings(state.template);
      case 'metadata':
        return validateMetadata(state.template);
      default:
        return [];
    }
  };

  const handleTemplateChange = (updates: Partial<TemplateFormData>) => {
    setState(prev => ({
      ...prev,
      template: { ...prev.template, ...updates },
      validationErrors: prev.validationErrors.filter(e => !Object.keys(updates).includes(e.field))
    }));
  };

  const handleBlocksChange = (blocks: StudyBlock[]) => {
    setState(prev => ({ ...prev, blocks }));
  };

  const handleSave = async (publishImmediately = false) => {
    try {
      setState(prev => ({ ...prev, saving: true }));

      // Final validation
      const allErrors = validateTemplate(state.template, state.blocks);
      if (allErrors.length > 0) {
        setState(prev => ({ ...prev, validationErrors: allErrors }));
        return;
      }

      const templateData = {
        ...state.template,
        blocks: state.blocks,
        status: publishImmediately ? 'published' : 'draft'
      };

      const response = await fetch('/api/templates', {
        method: mode === 'create' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateData)
      });

      if (!response.ok) throw new Error('Failed to save template');

      const savedTemplate = await response.json();
      
      trackEvent('template_saved', {
        template_id: savedTemplate.id,
        mode,
        publish_immediately: publishImmediately,
        block_count: state.blocks.length
      });

      onSave(savedTemplate);

    } catch (error) {
      console.error('Failed to save template:', error);
    } finally {
      setState(prev => ({ ...prev, saving: false }));
    }
  };

  const renderStepContent = () => {
    const step = TEMPLATE_CREATION_STEPS[state.activeStep];
    
    switch (step.id) {
      case 'basic':
        return (
          <TemplateBasicInfoStep
            template={state.template}
            errors={state.validationErrors}
            onChange={handleTemplateChange}
          />
        );
        
      case 'blocks':
        return (
          <TemplateBlocksStep
            blocks={state.blocks}
            errors={state.validationErrors}
            onChange={handleBlocksChange}
          />
        );
        
      case 'settings':
        return (
          <TemplateSettingsStep
            template={state.template}
            errors={state.validationErrors}
            onChange={handleTemplateChange}
          />
        );
        
      case 'metadata':
        return (
          <TemplateMetadataStep
            template={state.template}
            errors={state.validationErrors}
            onChange={handleTemplateChange}
          />
        );
        
      case 'preview':
        return (
          <TemplatePreviewStep
            template={state.template}
            blocks={state.blocks}
            onSave={handleSave}
            saving={state.saving}
          />
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {mode === 'create' ? 'Create Template' : 'Edit Template'}
            </h1>
            <p className="mt-2 text-gray-600">
              Build a reusable study template for the research community
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setState(prev => ({ ...prev, previewMode: !prev.previewMode }))}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Eye className="w-4 h-4 mr-2" />
              {state.previewMode ? 'Edit Mode' : 'Preview'}
            </button>
            
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <TemplateCreationSteps
          steps={TEMPLATE_CREATION_STEPS}
          activeStep={state.activeStep}
          errors={state.validationErrors}
          onStepChange={handleStepChange}
        />
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {state.previewMode ? (
          <TemplatePreview
            template={state.template}
            blocks={state.blocks}
            onExitPreview={() => setState(prev => ({ ...prev, previewMode: false }))}
          />
        ) : (
          <div className="p-6">
            {renderStepContent()}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="mt-8 flex items-center justify-between">
        <button
          onClick={() => handleStepChange(state.activeStep - 1)}
          disabled={state.activeStep === 0}
          className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </button>

        <div className="flex items-center space-x-3">
          {state.activeStep === TEMPLATE_CREATION_STEPS.length - 1 ? (
            <>
              <button
                onClick={() => handleSave(false)}
                disabled={state.saving}
                className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Save as Draft
              </button>
              
              <button
                onClick={() => handleSave(true)}
                disabled={state.saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {state.saving ? 'Publishing...' : 'Publish Template'}
              </button>
            </>
          ) : (
            <button
              onClick={() => handleStepChange(state.activeStep + 1)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
```

---

## 🔧 API IMPLEMENTATION

### **Template Search API**
```typescript
// api/templates/search.ts
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createServerSupabaseClient({ req, res });
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      page = '1',
      limit = '24',
      search = '',
      sort = 'popular',
      category = '',
      tags = '',
      verified = '',
      featured = '',
      duration_min = '',
      duration_max = '',
      rating = '0'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    // Build base query
    let query = supabase
      .from('study_templates')
      .select(`
        *,
        created_by:users!created_by(name, avatar_url),
        organization:organizations(name),
        reviews:template_reviews(rating),
        favorites:template_favorites(id)
      `, { count: 'exact' })
      .eq('status', 'published')
      .range(offset, offset + limitNum - 1);

    // Apply filters
    if (search) {
      query = query.textSearch('search_vector', search);
    }

    if (category) {
      const categories = (category as string).split(',');
      query = query.in('category', categories);
    }

    if (tags) {
      const tagList = (tags as string).split(',');
      query = query.overlaps('tags', tagList);
    }

    if (verified === 'true') {
      query = query.eq('is_verified', true);
    }

    if (featured === 'true') {
      query = query.eq('is_featured', true);
    }

    if (duration_min || duration_max) {
      if (duration_min) query = query.gte('estimated_duration', parseInt(duration_min as string));
      if (duration_max) query = query.lte('estimated_duration', parseInt(duration_max as string));
    }

    if (rating && rating !== '0') {
      query = query.gte('average_rating', parseFloat(rating as string));
    }

    // Apply sorting
    switch (sort) {
      case 'newest':
        query = query.order('published_at', { ascending: false });
        break;
      case 'rating':
        query = query.order('average_rating', { ascending: false });
        break;
      case 'name':
        query = query.order('name', { ascending: true });
        break;
      case 'usage':
        query = query.order('usage_count', { ascending: false });
        break;
      default: // 'popular'
        query = query.order('usage_count', { ascending: false })
                     .order('average_rating', { ascending: false });
    }

    const { data: templates, error, count } = await query;

    if (error) throw error;

    // Process templates with additional data
    const processedTemplates = templates?.map(template => ({
      ...template,
      averageRating: template.reviews?.length > 0 
        ? template.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / template.reviews.length
        : 0,
      favoriteCount: template.favorites?.length || 0,
      isVerified: template.is_verified,
      isFeatured: template.is_featured
    })) || [];

    return res.status(200).json({
      templates: processedTemplates,
      total: count || 0,
      page: pageNum,
      limit: limitNum,
      hasMore: ((count || 0) > offset + limitNum)
    });

  } catch (error) {
    console.error('Template search error:', error);
    return res.status(500).json({ error: 'Failed to search templates' });
  }
}
```

### **Template Management API**
```typescript
// api/templates/index.ts
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createServerSupabaseClient({ req, res });
  
  // Verify authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  switch (req.method) {
    case 'POST':
      return handleCreateTemplate(req, res, supabase, user);
    case 'PUT':
      return handleUpdateTemplate(req, res, supabase, user);
    case 'DELETE':
      return handleDeleteTemplate(req, res, supabase, user);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function handleCreateTemplate(req: any, res: any, supabase: any, user: any) {
  try {
    const {
      name,
      description,
      category,
      blocks,
      tags,
      estimatedDuration,
      visibility,
      settings
    } = req.body;

    // Validate required fields
    if (!name || !description || !category || !blocks) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Generate slug
    const slug = generateSlug(name);

    // Check for duplicate slug
    const { data: existingTemplate } = await supabase
      .from('study_templates')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existingTemplate) {
      return res.status(400).json({ error: 'Template name already exists' });
    }

    // Create template
    const { data: template, error } = await supabase
      .from('study_templates')
      .insert({
        name,
        slug,
        description,
        category,
        blocks,
        tags: tags || [],
        estimated_duration: estimatedDuration,
        visibility: visibility || 'public',
        settings: settings || {},
        created_by: user.id,
        status: 'draft'
      })
      .select()
      .single();

    if (error) throw error;

    // Create initial version
    await supabase
      .from('template_versions')
      .insert({
        template_id: template.id,
        version_number: 1,
        version_type: 'major',
        name,
        description,
        blocks,
        settings: settings || {},
        created_by: user.id,
        is_published: false
      });

    // Log template creation
    await logTemplateActivity(supabase, {
      template_id: template.id,
      user_id: user.id,
      action: 'created',
      details: { name, category }
    });

    return res.status(201).json({ template });

  } catch (error) {
    console.error('Template creation error:', error);
    return res.status(500).json({ error: 'Failed to create template' });
  }
}

async function handleUpdateTemplate(req: any, res: any, supabase: any, user: any) {
  try {
    const { id, ...updates } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Template ID required' });
    }

    // Verify ownership or admin permission
    const { data: template } = await supabase
      .from('study_templates')
      .select('created_by')
      .eq('id', id)
      .single();

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    if (template.created_by !== user.id) {
      // Check if user is admin
      const { data: userProfile } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!userProfile || userProfile.role !== 'admin') {
        return res.status(403).json({ error: 'Permission denied' });
      }
    }

    // Update template
    const { data: updatedTemplate, error } = await supabase
      .from('study_templates')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Create new version if significant changes
    if (updates.blocks || updates.name || updates.description) {
      const { data: latestVersion } = await supabase
        .from('template_versions')
        .select('version_number')
        .eq('template_id', id)
        .order('version_number', { ascending: false })
        .limit(1)
        .single();

      await supabase
        .from('template_versions')
        .insert({
          template_id: id,
          version_number: (latestVersion?.version_number || 0) + 1,
          version_type: updates.blocks ? 'major' : 'minor',
          name: updates.name || updatedTemplate.name,
          description: updates.description || updatedTemplate.description,
          blocks: updates.blocks || updatedTemplate.blocks,
          settings: updates.settings || updatedTemplate.settings,
          created_by: user.id,
          changes_summary: updates.changesSummary,
          is_published: updates.status === 'published'
        });
    }

    return res.status(200).json({ template: updatedTemplate });

  } catch (error) {
    console.error('Template update error:', error);
    return res.status(500).json({ error: 'Failed to update template' });
  }
}

async function logTemplateActivity(supabase: any, activity: any) {
  try {
    await supabase
      .from('template_usage_analytics')
      .insert({
        template_id: activity.template_id,
        user_id: activity.user_id,
        usage_type: activity.action,
        used_at: new Date().toISOString()
      });
  } catch (error) {
    console.error('Failed to log template activity:', error);
  }
}
```

---

## 🧪 TESTING SPECIFICATIONS

### **Template Library Testing**
```typescript
// tests/templates/template-library.test.ts
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TemplateLibrary } from '@/components/templates/TemplateLibrary';
import { mockUser, mockTemplates, mockCategories } from '@/test-utils/mocks';

describe('TemplateLibrary', () => {
  beforeEach(() => {
    fetchMock.mockImplementation((url) => {
      if (url.includes('/api/templates/search')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            templates: mockTemplates,
            total: mockTemplates.length,
            hasMore: false
          })
        });
      }
      if (url.includes('/api/templates/categories')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ categories: mockCategories })
        });
      }
      return Promise.reject(new Error('Not mocked'));
    });
  });

  it('should display template grid by default', async () => {
    render(<TemplateLibrary user={mockUser} />);

    await waitFor(() => {
      expect(screen.getByText('Template Library')).toBeInTheDocument();
    });

    expect(screen.getByText(mockTemplates[0].name)).toBeInTheDocument();
    expect(screen.getByText(mockTemplates[0].description)).toBeInTheDocument();
  });

  it('should filter templates by search query', async () => {
    render(<TemplateLibrary user={mockUser} />);

    const searchInput = await screen.findByPlaceholderText(/search templates/i);
    fireEvent.change(searchInput, { target: { value: 'usability' } });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('search=usability'),
        expect.any(Object)
      );
    });
  });

  it('should filter templates by category', async () => {
    render(<TemplateLibrary user={mockUser} />);

    const categoryFilter = await screen.findByText('Usability Testing');
    fireEvent.click(categoryFilter);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('category=usability_testing'),
        expect.any(Object)
      );
    });
  });

  it('should sort templates by different criteria', async () => {
    render(<TemplateLibrary user={mockUser} />);

    const sortSelector = await screen.findByDisplayValue('Most Popular');
    fireEvent.change(sortSelector, { target: { value: 'newest' } });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('sort=newest'),
        expect.any(Object)
      );
    });
  });

  it('should toggle template favorites', async () => {
    fetchMock.mockImplementationOnce((url) => {
      if (url.includes('/api/templates/favorites')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true })
        });
      }
      return Promise.reject(new Error('Not mocked'));
    });

    render(<TemplateLibrary user={mockUser} />);

    const favoriteButton = await screen.findByLabelText(/add to favorites/i);
    fireEvent.click(favoriteButton);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/templates/favorites',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('"action":"add"')
        })
      );
    });
  });

  it('should open template preview modal', async () => {
    render(<TemplateLibrary user={mockUser} />);

    const templateCard = await screen.findByText(mockTemplates[0].name);
    fireEvent.click(templateCard);

    await waitFor(() => {
      expect(screen.getByText('Template Preview')).toBeInTheDocument();
    });

    expect(screen.getByText(mockTemplates[0].description)).toBeInTheDocument();
  });

  it('should switch between grid and list view modes', async () => {
    render(<TemplateLibrary user={mockUser} />);

    const listViewButton = await screen.findByLabelText(/list view/i);
    fireEvent.click(listViewButton);

    await waitFor(() => {
      expect(screen.getByTestId('template-list')).toBeInTheDocument();
    });
  });
});
```

### **Template Creation Testing**
```typescript
// tests/templates/template-creator.test.ts
describe('TemplateCreator', () => {
  const mockOnSave = jest.fn();
  const mockOnCancel = jest.fn();

  it('should validate basic information step', () => {
    render(
      <TemplateCreator
        mode="create"
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);

    expect(screen.getByText('Template name is required')).toBeInTheDocument();
  });

  it('should create template with blocks', async () => {
    render(
      <TemplateCreator
        mode="create"
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    // Fill basic information
    fireEvent.change(screen.getByLabelText(/template name/i), {
      target: { value: 'Test Template' }
    });
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: 'Test template description' }
    });

    // Move to blocks step
    fireEvent.click(screen.getByText('Next'));

    // Add a block
    fireEvent.click(screen.getByText('Add Block'));
    fireEvent.click(screen.getByText('Welcome Screen'));

    // Complete remaining steps
    fireEvent.click(screen.getByText('Next')); // Settings
    fireEvent.click(screen.getByText('Next')); // Metadata
    fireEvent.click(screen.getByText('Next')); // Preview

    // Publish template
    fetchMock.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ template: { id: '1', name: 'Test Template' } })
      })
    );

    fireEvent.click(screen.getByText('Publish Template'));

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalled();
    });
  });

  it('should preview template before publishing', () => {
    render(
      <TemplateCreator
        mode="create"
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.click(screen.getByText('Preview'));

    expect(screen.getByText('Template Preview')).toBeInTheDocument();
  });
});
```

---

## 🎯 SUCCESS CRITERIA & VALIDATION

### **Template Library KPIs**
```typescript
interface TemplateLibraryKPIs {
  adoption: {
    templateUsageRate: number; // Target: >80%
    studiesFromTemplates: number; // Target: >60%
    averageCustomizationLevel: string; // Target: 'moderate'
    templateToStudyConversion: number; // Target: >70%
  };
  
  discovery: {
    searchSuccessRate: number; // Target: >90%
    averageSearchTime: number; // Target: <30 seconds
    filterUsageRate: number; // Target: >50%
    templateViewToUseRatio: number; // Target: >30%
  };
  
  quality: {
    averageTemplateRating: number; // Target: >4.5/5
    communityContributionRate: number; // Target: >40%
    templateVerificationRate: number; // Target: >95%
    userSatisfactionScore: number; // Target: >4.7/5
  };
  
  engagement: {
    monthlyActiveContributors: number; // Target: Growing 15%/month
    templateUpdatesPerMonth: number; // Target: >20
    communityFeedbackVolume: number; // Target: >100/month
    templateSharingRate: number; // Target: >25%
  };
}
```

### **Performance Benchmarks**
```typescript
const TEMPLATE_SYSTEM_TARGETS = {
  searchPerformance: {
    target: '<500ms',
    measurement: 'Template search response time',
    acceptance: '95th percentile under target'
  },
  
  templateLoading: {
    target: '<2 seconds',
    measurement: 'Template preview load time',
    acceptance: 'Average load time under target'
  },
  
  libraryNavigation: {
    target: '<100ms',
    measurement: 'Filter and sort response time',
    acceptance: 'All interactions under target'
  },
  
  templateCreation: {
    target: '<10 minutes',
    measurement: 'Average template creation time',
    acceptance: 'Expert users under target'
  }
};
```

---

## 🚀 IMPLEMENTATION ROADMAP

### **Phase 1: Core Library (Week 1)**
- [ ] Template search and filtering
- [ ] Category navigation
- [ ] Template preview modal
- [ ] Basic favorites system
- [ ] Template usage tracking

### **Phase 2: Template Creation (Week 2)**
- [ ] Multi-step template creator
- [ ] Block builder integration
- [ ] Template validation system
- [ ] Preview functionality
- [ ] Publishing workflow

### **Phase 3: Community Features (Week 3)**
- [ ] Template ratings and reviews
- [ ] Collections and curation
- [ ] Advanced search capabilities
- [ ] Template sharing tools
- [ ] Usage analytics dashboard

### **Phase 4: Advanced Features (Week 4)**
- [ ] Template versioning system
- [ ] Automated quality scoring
- [ ] Recommendation engine
- [ ] Marketplace features
- [ ] API for external integrations

---

**📚 TEMPLATE LIBRARY SYSTEM: Empowering researchers with comprehensive template discovery, creation, and community collaboration for accelerated research excellence.**
