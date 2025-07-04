-- Enhanced Study Builder Database Schema
-- This migration adds proper study types and task templates with constraints

-- Study Types Table with Task Constraints
CREATE TABLE IF NOT EXISTS study_types (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT DEFAULT '📋',
  allowed_tasks TEXT[] NOT NULL DEFAULT '{}',
  forbidden_tasks TEXT[] DEFAULT '{}',
  max_tasks INTEGER NOT NULL DEFAULT 10,
  min_tasks INTEGER NOT NULL DEFAULT 1,
  recommended_duration INTEGER DEFAULT 30,
  recording_recommended BOOLEAN DEFAULT false,
  features TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced Task Templates
CREATE TABLE IF NOT EXISTS task_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  description TEXT NOT NULL,
  icon TEXT DEFAULT '📝',
  estimated_duration INTEGER NOT NULL DEFAULT 5,
  complexity_level INTEGER DEFAULT 1, -- 1-5 scale
  required_fields JSONB NOT NULL DEFAULT '{}',
  optional_fields JSONB DEFAULT '{}',
  default_settings JSONB NOT NULL DEFAULT '{}',
  compatibility_tags TEXT[] DEFAULT '{}',
  preview_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert Study Types with Proper Constraints
INSERT INTO study_types (id, name, description, icon, allowed_tasks, forbidden_tasks, max_tasks, min_tasks, recording_recommended, features) VALUES
('usability', 'Usability Testing', 'Test how users interact with your website, app, or prototype to identify usability issues', '🖱️', 
 ARRAY['website_navigation', 'prototype_testing', 'task_completion', 'user_feedback', 'first_click', 'accessibility_test'], 
 ARRAY['survey_questionnaire', 'interview_deep_dive'], 10, 1, true, 
 ARRAY['screen_recording', 'click_tracking', 'heatmaps', 'task_timing']),

('survey', 'Survey Research', 'Collect structured quantitative feedback through questionnaires and rating scales', '📋',
 ARRAY['questionnaire', 'rating_scale', 'multiple_choice', 'open_ended', 'demographics', 'nps_score'],
 ARRAY['prototype_testing', 'website_navigation', 'screen_recording'], 5, 1, false,
 ARRAY['response_validation', 'skip_logic', 'randomization']),

('interview', 'User Interview', 'Conduct one-on-one conversations to gather deep qualitative insights', '🎙️',
 ARRAY['interview_questions', 'conversation_starter', 'follow_up', 'demographic_questions'],
 ARRAY['prototype_testing', 'website_navigation'], 3, 1, true,
 ARRAY['audio_recording', 'note_taking', 'transcript_generation']),

('card_sorting', 'Card Sorting', 'Understand how users categorize and organize information', '🃏',
 ARRAY['card_sorting', 'category_creation', 'category_labeling', 'similarity_rating'],
 ARRAY['prototype_testing', 'website_navigation', 'survey_questionnaire'], 2, 1, false,
 ARRAY['drag_drop', 'category_analysis', 'similarity_matrix']),

('tree_testing', 'Tree Testing', 'Test the findability of topics in your website or app structure', '🌳',
 ARRAY['tree_navigation', 'findability_test', 'path_analysis', 'menu_testing'],
 ARRAY['visual_design', 'survey_questionnaire'], 8, 2, false,
 ARRAY['path_tracking', 'success_metrics', 'time_analysis'])

ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  allowed_tasks = EXCLUDED.allowed_tasks,
  forbidden_tasks = EXCLUDED.forbidden_tasks,
  max_tasks = EXCLUDED.max_tasks,
  min_tasks = EXCLUDED.min_tasks,
  recording_recommended = EXCLUDED.recording_recommended,
  features = EXCLUDED.features;

-- Insert Comprehensive Task Templates
INSERT INTO task_templates (id, name, category, subcategory, description, icon, estimated_duration, complexity_level, required_fields, default_settings, compatibility_tags) VALUES

-- USABILITY TESTING TASKS
('website_navigation', 'Website Navigation', 'usability', 'navigation', 'Have users navigate through your website to complete specific goals', '🧭', 5, 2,
 '{"url": {"type": "text", "required": true, "label": "Website URL"}, "goal": {"type": "textarea", "required": true, "label": "Navigation Goal"}}',
 '{"recordScreen": true, "trackClicks": true, "allowBackNavigation": true, "timeLimit": 300}',
 ARRAY['navigation', 'website', 'user_flow']),

('prototype_testing', 'Prototype Testing', 'usability', 'testing', 'Test interactive prototypes and wireframes for usability issues', '🎨', 8, 3,
 '{"prototypeUrl": {"type": "text", "required": true, "label": "Prototype URL"}, "scenario": {"type": "textarea", "required": true, "label": "Test Scenario"}}',
 '{"recordScreen": true, "trackInteractions": true, "allowAnnotations": true}',
 ARRAY['prototype', 'testing', 'interaction']),

('task_completion', 'Task Completion', 'usability', 'measurement', 'Measure how successfully users complete specific tasks', '✅', 3, 2,
 '{"task": {"type": "textarea", "required": true, "label": "Task Description"}, "successCriteria": {"type": "textarea", "required": true, "label": "Success Criteria"}}',
 '{"recordScreen": true, "timeLimit": true, "measureSuccess": true, "allowHints": false}',
 ARRAY['task', 'completion', 'measurement']),

('user_feedback', 'User Feedback', 'usability', 'feedback', 'Collect qualitative feedback from users about their experience', '💬', 5, 1,
 '{"questions": {"type": "array", "required": true, "label": "Feedback Questions"}}',
 '{"allowOpenEnded": true, "recordAudio": true, "showRating": true}',
 ARRAY['feedback', 'qualitative', 'experience']),

('first_click', 'First Click Test', 'usability', 'testing', 'Test where users click first when trying to complete a task', '👆', 2, 1,
 '{"imageUrl": {"type": "text", "required": true, "label": "Page Screenshot URL"}, "question": {"type": "text", "required": true, "label": "Task Question"}}',
 '{"highlightClicks": true, "showHeatmap": true, "timeLimit": 30}',
 ARRAY['click', 'heatmap', 'first_impression']),

-- SURVEY TASKS
('questionnaire', 'Questionnaire', 'survey', 'structured', 'Structured questions with various response types', '📝', 10, 2,
 '{"questions": {"type": "array", "required": true, "label": "Questions List"}}',
 '{"allowSkip": false, "randomizeOrder": false, "showProgress": true, "validateResponses": true}',
 ARRAY['questionnaire', 'structured', 'responses']),

('rating_scale', 'Rating Scale', 'survey', 'scale', 'Collect ratings on numerical or agreement scales', '⭐', 2, 1,
 '{"statement": {"type": "text", "required": true, "label": "Statement to Rate"}, "scale": {"type": "select", "required": true, "label": "Scale Type", "options": ["1-5", "1-7", "1-10", "likert"]}}',
 '{"scaleType": "likert", "showLabels": true, "requireResponse": true}',
 ARRAY['rating', 'scale', 'likert']),

('multiple_choice', 'Multiple Choice', 'survey', 'choice', 'Single or multiple selection questions', '☑️', 3, 1,
 '{"question": {"type": "text", "required": true, "label": "Question"}, "options": {"type": "array", "required": true, "label": "Answer Options"}}',
 '{"allowMultiple": false, "randomizeOptions": false, "requireResponse": true}',
 ARRAY['choice', 'selection', 'options']),

('demographics', 'Demographics', 'survey', 'background', 'Collect participant background information', '👥', 5, 1,
 '{"fields": {"type": "array", "required": true, "label": "Demographic Fields"}}',
 '{"includeAge": true, "includeGender": true, "includeExperience": true, "allowSkip": true}',
 ARRAY['demographics', 'background', 'participant']),

-- INTERVIEW TASKS
('interview_questions', 'Interview Questions', 'interview', 'structured', 'Guided conversation with structured questions', '❓', 15, 3,
 '{"questions": {"type": "array", "required": true, "label": "Interview Questions"}, "type": {"type": "select", "required": true, "label": "Interview Type", "options": ["structured", "semi-structured", "unstructured"]}}',
 '{"recordAudio": true, "allowNotes": true, "showQuestions": true, "flexibleTiming": true}',
 ARRAY['interview', 'questions', 'conversation']),

('conversation_starter', 'Conversation Starter', 'interview', 'opener', 'Open-ended topics to begin natural conversations', '💭', 10, 2,
 '{"topic": {"type": "text", "required": true, "label": "Conversation Topic"}, "context": {"type": "textarea", "required": false, "label": "Background Context"}}',
 '{"recordAudio": true, "timeLimit": false, "allowDigression": true}',
 ARRAY['conversation', 'opener', 'natural']),

-- CARD SORTING TASKS
('card_sorting', 'Card Sorting', 'card_sorting', 'organization', 'Sort cards into categories that make sense to users', '🗂️', 12, 3,
 '{"cards": {"type": "array", "required": true, "label": "Cards to Sort"}, "sortType": {"type": "select", "required": true, "label": "Sort Type", "options": ["open", "closed", "hybrid"]}}',
 '{"sortType": "open", "maxCategories": 10, "allowCustomCategories": true, "trackTime": true}',
 ARRAY['sorting', 'categories', 'organization']),

('category_creation', 'Category Creation', 'card_sorting', 'labeling', 'Create and name new categories for content organization', '🏷️', 8, 2,
 '{"items": {"type": "array", "required": true, "label": "Items to Categorize"}}',
 '{"allowCustomCategories": true, "maxCategories": 15, "requireLabels": true}',
 ARRAY['categories', 'labeling', 'creation']),

-- TREE TESTING TASKS
('tree_navigation', 'Tree Navigation', 'tree_testing', 'navigation', 'Navigate through a site structure to find information', '🗺️', 6, 2,
 '{"siteMap": {"type": "object", "required": true, "label": "Site Structure"}, "findTask": {"type": "text", "required": true, "label": "What to Find"}}',
 '{"showPath": false, "allowBacktrack": true, "trackAllPaths": true, "timeLimit": 300}',
 ARRAY['navigation', 'tree', 'findability']),

('findability_test', 'Findability Test', 'tree_testing', 'testing', 'Test how easily users can find specific content', '🔍', 8, 3,
 '{"contentItem": {"type": "text", "required": true, "label": "Content to Find"}, "tree": {"type": "object", "required": true, "label": "Navigation Tree"}}',
 '{"trackPath": true, "timeLimit": true, "measureSuccess": true, "allowHints": false}',
 ARRAY['findability', 'content', 'success'])

ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  subcategory = EXCLUDED.subcategory,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  estimated_duration = EXCLUDED.estimated_duration,
  complexity_level = EXCLUDED.complexity_level,
  required_fields = EXCLUDED.required_fields,
  default_settings = EXCLUDED.default_settings,
  compatibility_tags = EXCLUDED.compatibility_tags;

-- Enhanced Studies Table
ALTER TABLE studies 
ADD COLUMN IF NOT EXISTS study_type_id TEXT REFERENCES study_types(id),
ADD COLUMN IF NOT EXISTS estimated_duration INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS total_tasks INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS study_version INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS template_used TEXT,
ADD COLUMN IF NOT EXISTS validation_status TEXT DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS last_validated_at TIMESTAMP WITH TIME ZONE;

-- Enhanced Study Tasks Table
CREATE TABLE IF NOT EXISTS study_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  study_id UUID NOT NULL REFERENCES studies(id) ON DELETE CASCADE,
  template_id TEXT NOT NULL REFERENCES task_templates(id),
  name TEXT NOT NULL,
  description TEXT,
  custom_instructions TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  estimated_duration INTEGER NOT NULL DEFAULT 5,
  complexity_level INTEGER DEFAULT 1,
  settings JSONB NOT NULL DEFAULT '{}',
  validation_rules JSONB DEFAULT '{}',
  is_required BOOLEAN NOT NULL DEFAULT true,
  is_template BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_order_index CHECK (order_index >= 0),
  CONSTRAINT valid_duration CHECK (estimated_duration > 0),
  CONSTRAINT valid_complexity CHECK (complexity_level BETWEEN 1 AND 5)
);

-- Task Dependencies (for complex flows)
CREATE TABLE IF NOT EXISTS task_dependencies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES study_tasks(id) ON DELETE CASCADE,
  depends_on_task_id UUID NOT NULL REFERENCES study_tasks(id) ON DELETE CASCADE,
  dependency_type TEXT NOT NULL DEFAULT 'sequential', -- 'sequential', 'conditional', 'parallel'
  condition_rules JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT no_self_dependency CHECK (task_id != depends_on_task_id)
);

-- Create Performance Indexes
CREATE INDEX IF NOT EXISTS idx_study_tasks_study_id ON study_tasks(study_id);
CREATE INDEX IF NOT EXISTS idx_study_tasks_order ON study_tasks(study_id, order_index);
CREATE INDEX IF NOT EXISTS idx_study_tasks_template ON study_tasks(template_id);
CREATE INDEX IF NOT EXISTS idx_studies_type ON studies(study_type_id);
CREATE INDEX IF NOT EXISTS idx_studies_status ON studies(validation_status);
CREATE INDEX IF NOT EXISTS idx_task_dependencies_task ON task_dependencies(task_id);

-- RLS Policies for new tables
ALTER TABLE study_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_dependencies ENABLE ROW LEVEL SECURITY;

-- Public read access for study types and task templates
CREATE POLICY "Allow public read access to study_types" ON study_types FOR SELECT USING (true);
CREATE POLICY "Allow public read access to task_templates" ON task_templates FOR SELECT USING (true);

-- Study tasks follow study ownership
CREATE POLICY "Users can view study tasks for their studies" ON study_tasks 
  FOR SELECT USING (
    study_id IN (
      SELECT id FROM studies WHERE researcher_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage study tasks for their studies" ON study_tasks 
  FOR ALL USING (
    study_id IN (
      SELECT id FROM studies WHERE researcher_id = auth.uid()
    )
  );

-- Task dependencies follow task ownership
CREATE POLICY "Users can view task dependencies for their studies" ON task_dependencies 
  FOR SELECT USING (
    task_id IN (
      SELECT st.id FROM study_tasks st 
      JOIN studies s ON st.study_id = s.id 
      WHERE s.researcher_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage task dependencies for their studies" ON task_dependencies 
  FOR ALL USING (
    task_id IN (
      SELECT st.id FROM study_tasks st 
      JOIN studies s ON st.study_id = s.id 
      WHERE s.researcher_id = auth.uid()
    )
  );

-- Update triggers
CREATE OR REPLACE FUNCTION update_study_tasks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_study_total_tasks()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE studies 
  SET total_tasks = (
    SELECT COUNT(*) FROM study_tasks WHERE study_id = COALESCE(NEW.study_id, OLD.study_id)
  ),
  estimated_duration = (
    SELECT COALESCE(SUM(estimated_duration), 0) FROM study_tasks WHERE study_id = COALESCE(NEW.study_id, OLD.study_id)
  )
  WHERE id = COALESCE(NEW.study_id, OLD.study_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_update_study_tasks_updated_at ON study_tasks;
CREATE TRIGGER trigger_update_study_tasks_updated_at
  BEFORE UPDATE ON study_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_study_tasks_updated_at();

DROP TRIGGER IF EXISTS trigger_update_study_total_tasks_insert ON study_tasks;
CREATE TRIGGER trigger_update_study_total_tasks_insert
  AFTER INSERT ON study_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_study_total_tasks();

DROP TRIGGER IF EXISTS trigger_update_study_total_tasks_update ON study_tasks;
CREATE TRIGGER trigger_update_study_total_tasks_update
  AFTER UPDATE ON study_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_study_total_tasks();

DROP TRIGGER IF EXISTS trigger_update_study_total_tasks_delete ON study_tasks;
CREATE TRIGGER trigger_update_study_total_tasks_delete
  AFTER DELETE ON study_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_study_total_tasks();
