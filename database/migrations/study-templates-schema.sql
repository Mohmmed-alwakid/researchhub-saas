-- Study Templates Schema for Template Creation UI
-- Created: July 10, 2025
-- Purpose: Core template management for researchers

-- Study Templates table for basic template creation and management
CREATE TABLE IF NOT EXISTS study_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  purpose TEXT NOT NULL,
  difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  
  -- Template Content
  blocks JSONB NOT NULL DEFAULT '[]'::jsonb,
  estimated_duration INTEGER NOT NULL DEFAULT 0, -- in minutes
  recommended_participants JSONB NOT NULL DEFAULT '{"min": 5, "max": 15}'::jsonb,
  tags TEXT[] DEFAULT '{}',
  
  -- Metadata
  metadata JSONB NOT NULL DEFAULT '{
    "author": "",
    "version": "1.0.0",
    "isPublic": false
  }'::jsonb,
  
  -- Timestamps and ownership
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_study_templates_creator ON study_templates(creator_id);
CREATE INDEX IF NOT EXISTS idx_study_templates_category ON study_templates(category);
CREATE INDEX IF NOT EXISTS idx_study_templates_difficulty ON study_templates(difficulty);
CREATE INDEX IF NOT EXISTS idx_study_templates_public ON study_templates((metadata->>'isPublic'));
CREATE INDEX IF NOT EXISTS idx_study_templates_created ON study_templates(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_study_templates_tags ON study_templates USING GIN(tags);

-- Full text search index
CREATE INDEX IF NOT EXISTS idx_study_templates_search ON study_templates USING GIN(
  to_tsvector('english', title || ' ' || description || ' ' || purpose)
);

-- Row Level Security (RLS) Policies
ALTER TABLE study_templates ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view public templates and their own templates
CREATE POLICY "study_templates_view_policy" ON study_templates
  FOR SELECT
  USING (
    (metadata->>'isPublic')::boolean = true 
    OR creator_id = auth.uid()
  );

-- Policy: Users can insert their own templates
CREATE POLICY "study_templates_insert_policy" ON study_templates
  FOR INSERT
  WITH CHECK (creator_id = auth.uid());

-- Policy: Users can update their own templates
CREATE POLICY "study_templates_update_policy" ON study_templates
  FOR UPDATE
  USING (creator_id = auth.uid())
  WITH CHECK (creator_id = auth.uid());

-- Policy: Users can delete their own templates
CREATE POLICY "study_templates_delete_policy" ON study_templates
  FOR DELETE
  USING (creator_id = auth.uid());

-- Admin override policy: Admins can manage all templates
CREATE POLICY "study_templates_admin_policy" ON study_templates
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_study_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER study_templates_updated_at_trigger
  BEFORE UPDATE ON study_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_study_templates_updated_at();

-- Insert some default templates for testing
INSERT INTO study_templates (
  title, description, category, purpose, difficulty, blocks, estimated_duration, 
  recommended_participants, tags, metadata, creator_id
) VALUES
(
  'Basic Usability Testing',
  'A simple usability testing template for websites and applications',
  'usability-testing',
  'Test user interactions and identify usability issues',
  'beginner',
  '[
    {
      "id": "welcome_1",
      "type": "welcome_screen",
      "title": "Welcome to Our Usability Study",
      "description": "Thank you for participating in our usability testing session",
      "settings": {
        "title": "Welcome to Our Usability Study",
        "description": "We''ll be testing how easy it is to use our website. Your honest feedback will help us improve the user experience.",
        "showProgressBar": true,
        "continueButtonText": "Start Testing"
      },
      "isRequired": true,
      "estimatedDuration": 2
    },
    {
      "id": "context_1",
      "type": "context_screen",
      "title": "Testing Instructions",
      "description": "Instructions for the usability testing session",
      "settings": {
        "title": "What You''ll Be Doing",
        "content": "You''ll be asked to complete some common tasks on our website. Please think aloud as you navigate - tell us what you''re thinking, what''s confusing, and what works well.",
        "showContinueButton": true
      },
      "isRequired": true,
      "estimatedDuration": 3
    },
    {
      "id": "test_1",
      "type": "5_second_test",
      "title": "First Impression Test",
      "description": "Capture initial reactions to the homepage",
      "settings": {
        "imageUrl": "",
        "question": "What do you think this website is for?",
        "displayDuration": 5,
        "followUpQuestions": [
          "What was your first impression?",
          "What company or service do you think this is?"
        ]
      },
      "isRequired": true,
      "estimatedDuration": 5
    },
    {
      "id": "feedback_1",
      "type": "open_question",
      "title": "Overall Experience Feedback",
      "description": "Collect qualitative feedback about the experience",
      "settings": {
        "question": "Please describe your overall experience using the website. What worked well? What was confusing or frustrating?",
        "placeholder": "Share your thoughts about the website navigation, design, and ease of use...",
        "required": true,
        "maxLength": 1000
      },
      "isRequired": true,
      "estimatedDuration": 8
    },
    {
      "id": "rating_1",
      "type": "opinion_scale",
      "title": "Ease of Use Rating",
      "description": "Rate the overall ease of use",
      "settings": {
        "question": "How would you rate the overall ease of use of this website?",
        "scaleType": "stars",
        "minValue": 1,
        "maxValue": 5,
        "minLabel": "Very Difficult",
        "maxLabel": "Very Easy"
      },
      "isRequired": true,
      "estimatedDuration": 2
    },
    {
      "id": "thank_you_1",
      "type": "thank_you",
      "title": "Thank You",
      "description": "Study completion message",
      "settings": {
        "title": "Thank You for Your Feedback!",
        "message": "Your insights will help us improve the user experience. We appreciate the time you took to participate in our study.",
        "showConfetti": true,
        "redirectUrl": ""
      },
      "isRequired": true,
      "estimatedDuration": 1
    }
  ]'::jsonb,
  21,
  '{"min": 8, "max": 12}'::jsonb,
  ARRAY['usability', 'website', 'user-testing', 'feedback'],
  '{"author": "ResearchHub Team", "version": "1.0.0", "isPublic": true}'::jsonb,
  (SELECT id FROM auth.users LIMIT 1)
) ON CONFLICT DO NOTHING;

-- Insert Content Testing Template
INSERT INTO study_templates (
  title, description, category, purpose, difficulty, blocks, estimated_duration, 
  recommended_participants, tags, metadata, creator_id
) VALUES
(
  'Content Effectiveness Study',
  'Test how well your content communicates key messages and resonates with users',
  'content-testing',
  'Evaluate content clarity, comprehension, and effectiveness',
  'intermediate',
  '[
    {
      "id": "welcome_2",
      "type": "welcome_screen",
      "title": "Welcome to Our Content Study",
      "description": "Help us understand how well our content works for users like you",
      "settings": {
        "title": "Welcome to Our Content Study",
        "description": "We''re testing how clear and effective our content is. Your feedback will help us communicate better with our audience.",
        "showProgressBar": true,
        "continueButtonText": "Begin Study"
      },
      "isRequired": true,
      "estimatedDuration": 2
    },
    {
      "id": "comprehension_1",
      "type": "multiple_choice",
      "title": "Content Comprehension Check",
      "description": "Test understanding of key messages",
      "settings": {
        "question": "After reading the content, what do you think is the main benefit being offered?",
        "options": [
          "Option A: Cost savings",
          "Option B: Time efficiency", 
          "Option C: Better quality",
          "Option D: Ease of use"
        ],
        "allowMultiple": false,
        "required": true
      },
      "isRequired": true,
      "estimatedDuration": 3
    },
    {
      "id": "clarity_1",
      "type": "opinion_scale",
      "title": "Content Clarity Rating",
      "description": "Rate how clear and understandable the content is",
      "settings": {
        "question": "How clear and easy to understand was the content?",
        "scaleType": "numerical",
        "minValue": 1,
        "maxValue": 7,
        "minLabel": "Very Confusing",
        "maxLabel": "Very Clear"
      },
      "isRequired": true,
      "estimatedDuration": 2
    },
    {
      "id": "feedback_2",
      "type": "open_question",
      "title": "Content Improvement Suggestions",
      "description": "Gather suggestions for content improvement",
      "settings": {
        "question": "What would you change about this content to make it clearer or more compelling?",
        "placeholder": "Please share any suggestions for improving the content...",
        "required": false,
        "maxLength": 500
      },
      "isRequired": false,
      "estimatedDuration": 5
    },
    {
      "id": "thank_you_2",
      "type": "thank_you",
      "title": "Thank You",
      "description": "Study completion message",
      "settings": {
        "title": "Thank You for Your Insights!",
        "message": "Your feedback will help us create clearer, more effective content. We appreciate your participation!",
        "showConfetti": true,
        "redirectUrl": ""
      },
      "isRequired": true,
      "estimatedDuration": 1
    }
  ]'::jsonb,
  13,
  '{"min": 10, "max": 15}'::jsonb,
  ARRAY['content', 'messaging', 'clarity', 'comprehension'],
  '{"author": "ResearchHub Team", "version": "1.0.0", "isPublic": true}'::jsonb,
  (SELECT id FROM auth.users LIMIT 1)
) ON CONFLICT DO NOTHING;
