-- Template Marketplace Database Schema
-- ResearchHub Enterprise Features & AI Integration - Week 2
-- Created: June 29, 2025

-- Template Categories for organized browsing
CREATE TABLE template_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(50), -- Icon name for UI
  color VARCHAR(20), -- Hex color for category theming
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Community Templates for sharing and discovery
CREATE TABLE community_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  category_id UUID REFERENCES template_categories(id),
  author_id UUID REFERENCES auth.users(id) NOT NULL,
  author_name VARCHAR(100) NOT NULL, -- Cached for performance
  
  -- Template Content
  blocks JSONB NOT NULL, -- Array of study blocks
  estimated_duration INTEGER, -- in minutes
  participant_count_estimate INTEGER,
  
  -- Publishing & Visibility
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'published', 'rejected', 'archived')),
  visibility VARCHAR(20) DEFAULT 'public' CHECK (visibility IN ('public', 'private', 'organization')),
  is_featured BOOLEAN DEFAULT false,
  
  -- Metadata
  tags TEXT[], -- Array of searchable tags
  research_type VARCHAR(50), -- e.g., 'usability', 'concept_testing', 'card_sort'
  target_audience TEXT,
  instructions TEXT, -- Setup instructions for researchers
  
  -- Analytics & Performance
  usage_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  
  -- Moderation
  moderation_notes TEXT,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Template Reviews and Ratings
CREATE TABLE template_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES community_templates(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES auth.users(id) NOT NULL,
  reviewer_name VARCHAR(100) NOT NULL, -- Cached for performance
  
  -- Review Content
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(200),
  comment TEXT,
  
  -- Review Metadata
  usage_context VARCHAR(50), -- How they used the template
  organization_size VARCHAR(20), -- Company size context
  is_verified BOOLEAN DEFAULT false, -- Verified purchase/usage
  
  -- Helpfulness tracking
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,
  
  -- Moderation
  is_flagged BOOLEAN DEFAULT false,
  flag_reason TEXT,
  is_approved BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Prevent duplicate reviews from same user
  UNIQUE(template_id, reviewer_id)
);

-- Template Usage Analytics
CREATE TABLE template_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES community_templates(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  study_id UUID, -- References studies table when created
  
  -- Usage Details
  action VARCHAR(50) NOT NULL, -- 'viewed', 'previewed', 'used', 'customized'
  customizations JSONB, -- Track what was modified
  
  -- Analytics Data
  session_id UUID, -- Track user session
  user_agent TEXT,
  ip_address INET,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Template Likes/Favorites
CREATE TABLE template_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES community_templates(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Prevent duplicate likes
  UNIQUE(template_id, user_id)
);

-- Template Collections (for organizing templates)
CREATE TABLE template_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES auth.users(id) NOT NULL,
  is_public BOOLEAN DEFAULT false,
  template_ids UUID[], -- Array of template IDs
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for Performance
CREATE INDEX idx_community_templates_status ON community_templates(status);
CREATE INDEX idx_community_templates_category ON community_templates(category_id);
CREATE INDEX idx_community_templates_author ON community_templates(author_id);
CREATE INDEX idx_community_templates_featured ON community_templates(is_featured);
CREATE INDEX idx_community_templates_published ON community_templates(published_at);
CREATE INDEX idx_community_templates_rating ON community_templates(average_rating);
CREATE INDEX idx_community_templates_usage ON community_templates(usage_count);
CREATE INDEX idx_community_templates_tags ON community_templates USING GIN(tags);

CREATE INDEX idx_template_reviews_template ON template_reviews(template_id);
CREATE INDEX idx_template_reviews_reviewer ON template_reviews(reviewer_id);
CREATE INDEX idx_template_reviews_rating ON template_reviews(rating);

CREATE INDEX idx_template_usage_template ON template_usage(template_id);
CREATE INDEX idx_template_usage_user ON template_usage(user_id);
CREATE INDEX idx_template_usage_action ON template_usage(action);
CREATE INDEX idx_template_usage_created ON template_usage(created_at);

CREATE INDEX idx_template_likes_template ON template_likes(template_id);
CREATE INDEX idx_template_likes_user ON template_likes(user_id);

-- Row Level Security (RLS) Policies

-- Community Templates
ALTER TABLE community_templates ENABLE ROW LEVEL SECURITY;

-- Public read access to published templates
CREATE POLICY "Public read published templates" ON community_templates
  FOR SELECT USING (status = 'published' AND visibility = 'public');

-- Authors can manage their own templates
CREATE POLICY "Authors manage own templates" ON community_templates
  FOR ALL USING (auth.uid() = author_id);

-- Admin/moderator access
CREATE POLICY "Admin access templates" ON community_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'moderator')
    )
  );

-- Template Reviews
ALTER TABLE template_reviews ENABLE ROW LEVEL SECURITY;

-- Public read access to approved reviews
CREATE POLICY "Public read approved reviews" ON template_reviews
  FOR SELECT USING (is_approved = true);

-- Users can manage their own reviews
CREATE POLICY "Users manage own reviews" ON template_reviews
  FOR ALL USING (auth.uid() = reviewer_id);

-- Admin/moderator access
CREATE POLICY "Admin access reviews" ON template_reviews
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'moderator')
    )
  );

-- Template Usage
ALTER TABLE template_usage ENABLE ROW LEVEL SECURITY;

-- Users can view their own usage
CREATE POLICY "Users view own usage" ON template_usage
  FOR SELECT USING (auth.uid() = user_id);

-- Anyone can insert usage (for analytics)
CREATE POLICY "Public insert usage" ON template_usage
  FOR INSERT WITH CHECK (true);

-- Template authors can view usage of their templates
CREATE POLICY "Authors view template usage" ON template_usage
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM community_templates 
      WHERE id = template_id 
      AND author_id = auth.uid()
    )
  );

-- Template Likes
ALTER TABLE template_likes ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public read likes" ON template_likes
  FOR SELECT USING (true);

-- Users can manage their own likes
CREATE POLICY "Users manage own likes" ON template_likes
  FOR ALL USING (auth.uid() = user_id);

-- Template Categories
ALTER TABLE template_categories ENABLE ROW LEVEL SECURITY;

-- Public read access to active categories
CREATE POLICY "Public read active categories" ON template_categories
  FOR SELECT USING (is_active = true);

-- Admin access for category management
CREATE POLICY "Admin manage categories" ON template_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Template Collections
ALTER TABLE template_collections ENABLE ROW LEVEL SECURITY;

-- Public read access to public collections
CREATE POLICY "Public read public collections" ON template_collections
  FOR SELECT USING (is_public = true);

-- Users can manage their own collections
CREATE POLICY "Users manage own collections" ON template_collections
  FOR ALL USING (auth.uid() = owner_id);

-- Functions for automatic updates

-- Update template average rating when reviews change
CREATE OR REPLACE FUNCTION update_template_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE community_templates
  SET 
    average_rating = (
      SELECT COALESCE(AVG(rating), 0)
      FROM template_reviews
      WHERE template_id = COALESCE(NEW.template_id, OLD.template_id)
      AND is_approved = true
    ),
    review_count = (
      SELECT COUNT(*)
      FROM template_reviews
      WHERE template_id = COALESCE(NEW.template_id, OLD.template_id)
      AND is_approved = true
    ),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.template_id, OLD.template_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger for rating updates
CREATE TRIGGER update_template_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON template_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_template_rating();

-- Update template like count when likes change
CREATE OR REPLACE FUNCTION update_template_likes()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE community_templates
  SET 
    like_count = (
      SELECT COUNT(*)
      FROM template_likes
      WHERE template_id = COALESCE(NEW.template_id, OLD.template_id)
    ),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.template_id, OLD.template_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger for like count updates
CREATE TRIGGER update_template_likes_trigger
  AFTER INSERT OR DELETE ON template_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_template_likes();

-- Insert default categories
INSERT INTO template_categories (name, description, icon, color, sort_order) VALUES
('Usability Testing', 'Templates for testing user experience and interface design', 'Monitor', '#3B82F6', 1),
('Concept Testing', 'Templates for validating ideas and concepts with users', 'Lightbulb', '#8B5CF6', 2),
('Information Architecture', 'Templates for card sorting, tree testing, and navigation', 'Sitemap', '#10B981', 3),
('User Research', 'Templates for interviews, surveys, and user feedback', 'Users', '#F59E0B', 4),
('A/B Testing', 'Templates for comparing design variations and features', 'GitBranch', '#EF4444', 5),
('Content Testing', 'Templates for testing messaging, copy, and content', 'FileText', '#6366F1', 6),
('Mobile Testing', 'Templates optimized for mobile user experience testing', 'Smartphone', '#EC4899', 7),
('Accessibility Testing', 'Templates for testing inclusive design and accessibility', 'Shield', '#14B8A6', 8);

-- Sample featured templates (to be inserted after template creation system is built)
-- These will be created through the application UI
