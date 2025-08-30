-- TEMPLATES API PERFORMANCE OPTIMIZATION
-- Add indexes for faster template queries

-- Template search performance index
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_study_templates_public ON study_templates(is_public) WHERE is_public = true;

-- Template category filtering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_study_templates_category ON study_templates(category);

-- Template difficulty filtering  
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_study_templates_difficulty ON study_templates(difficulty);

-- Template name search (case insensitive)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_study_templates_name_search ON study_templates USING gin(to_tsvector('english', name));

-- Template description search (case insensitive)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_study_templates_description_search ON study_templates USING gin(to_tsvector('english', description));

-- Combined search index for name and description
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_study_templates_full_search ON study_templates USING gin(to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, '')));

-- Template ordering by creation date
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_study_templates_created_at ON study_templates(created_at DESC);

-- Creator lookup for template ownership
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_study_templates_creator ON study_templates(creator_id);

-- Composite index for common query pattern (public + ordered by date)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_study_templates_public_created ON study_templates(is_public, created_at DESC) WHERE is_public = true;
