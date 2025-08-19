# 🏗️ ResearchHub Architecture & Design Philosophy

## Overview

ResearchHub is built as a modern, scalable user research platform that combines the flexibility of custom study creation with the power of AI-driven insights. This document explains the architectural decisions, design patterns, and core principles that guide the platform's development.

## Design Philosophy

### User-Centric Approach

**Researcher Experience First**

ResearchHub prioritizes the researcher's workflow, recognizing that effective tools enable better research outcomes. Every feature is designed to reduce friction in the research process while maintaining scientific rigor.

**Participant Accessibility**

Study participants experience clean, accessible interfaces that work seamlessly across devices. The platform follows WCAG 2.1 guidelines and optimizes for various connection speeds and technical capabilities.

**Progressive Disclosure**

Complex features are introduced gradually, allowing new users to succeed with basic functionality while providing advanced capabilities for experienced researchers.

### Technical Principles

**Performance First**

The platform is built for speed, using edge computing, optimized databases, and efficient client-side rendering to minimize load times and maximize responsiveness.

**Scalability by Design**

Architecture supports growth from individual researchers to enterprise organizations with thousands of studies and millions of participants.

**Data Integrity**

Research data requires absolute reliability. The platform implements comprehensive backup, validation, and audit logging to ensure data accuracy and availability.

## System Architecture

### Frontend Architecture

**React 18 + TypeScript Foundation**

```typescript
// Component Architecture Pattern
interface StudyBuilderProps {
  study: Study;
  onUpdate: (study: Study) => void;
  mode: 'edit' | 'preview' | 'publish';
}

export const StudyBuilder: React.FC<StudyBuilderProps> = ({
  study,
  onUpdate,
  mode
}) => {
  // Component implementation follows hooks pattern
  const [blocks, setBlocks] = useState<StudyBlock[]>(study.blocks);
  const [draggedBlock, setDraggedBlock] = useState<StudyBlock | null>(null);
  
  // Clear separation of concerns
  const blockHandlers = useBlockManagement(blocks, setBlocks);
  const dragHandlers = useDragAndDrop(draggedBlock, setDraggedBlock);
  const validationState = useStudyValidation(study);
  
  return (
    <StudyBuilderLayout>
      <BlockLibrary onDragStart={dragHandlers.start} />
      <StudyCanvas 
        blocks={blocks}
        onDrop={dragHandlers.drop}
        onBlockEdit={blockHandlers.edit}
      />
      <BlockSettings 
        selectedBlock={draggedBlock}
        onUpdate={blockHandlers.update}
      />
    </StudyBuilderLayout>
  );
};
```

**State Management Strategy**

ResearchHub uses a hybrid state management approach:

- **Local State (useState)**: Component-specific UI state
- **Server State (React Query)**: API data with caching and synchronization
- **Global State (Zustand)**: Cross-component application state

```typescript
// Example: Study Builder Global State
interface StudyBuilderStore {
  currentStudy: Study | null;
  selectedBlock: StudyBlock | null;
  isDirty: boolean;
  
  actions: {
    loadStudy: (id: string) => Promise<void>;
    updateBlock: (blockId: string, changes: Partial<StudyBlock>) => void;
    saveStudy: () => Promise<void>;
    resetState: () => void;
  };
}

const useStudyBuilderStore = create<StudyBuilderStore>((set, get) => ({
  currentStudy: null,
  selectedBlock: null,
  isDirty: false,
  
  actions: {
    loadStudy: async (id: string) => {
      const study = await api.studies.get(id);
      set({ currentStudy: study, isDirty: false });
    },
    
    updateBlock: (blockId: string, changes: Partial<StudyBlock>) => {
      const { currentStudy } = get();
      if (!currentStudy) return;
      
      const updatedStudy = {
        ...currentStudy,
        blocks: currentStudy.blocks.map(block =>
          block.id === blockId ? { ...block, ...changes } : block
        )
      };
      
      set({ currentStudy: updatedStudy, isDirty: true });
    },
    
    saveStudy: async () => {
      const { currentStudy } = get();
      if (!currentStudy) return;
      
      await api.studies.update(currentStudy.id, currentStudy);
      set({ isDirty: false });
    },
    
    resetState: () => set({ 
      currentStudy: null, 
      selectedBlock: null, 
      isDirty: false 
    })
  }
}));
```

### Backend Architecture

**Serverless Functions Pattern**

ResearchHub uses Vercel's serverless functions with a consolidated API pattern to stay within the 12-function limit while providing comprehensive functionality.

```javascript
// api/research-consolidated.js
export default async function handler(req, res) {
  // Centralized error handling and logging
  try {
    const { action } = req.query;
    
    // Route to specific action handlers
    switch (action) {
      case 'get-studies':
        return await getStudies(req, res);
      case 'create-study':
        return await createStudy(req, res);
      case 'update-study':
        return await updateStudy(req, res);
      case 'get-analytics':
        return await getAnalytics(req, res);
      default:
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid action' 
        });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}

// Individual action handlers
async function getStudies(req, res) {
  const { user } = await authenticateRequest(req);
  
  const { data, error } = await supabase
    .from('studies')
    .select('*')
    .eq('created_by', user.id)
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  
  return res.status(200).json({ success: true, data });
}
```

**Database Design**

PostgreSQL with Supabase provides ACID compliance, real-time subscriptions, and built-in Row Level Security (RLS).

```sql
-- Core table structure
CREATE TABLE studies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  study_type TEXT NOT NULL CHECK (study_type IN ('unmoderated', 'moderated')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'completed', 'archived')),
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Study configuration
  estimated_duration INTEGER, -- seconds
  max_participants INTEGER,
  settings JSONB DEFAULT '{}',
  
  -- Metadata
  tags TEXT[],
  version INTEGER DEFAULT 1
);

CREATE TABLE study_blocks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  study_id UUID REFERENCES studies(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(study_id, order_index)
);

CREATE TABLE study_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  study_id UUID REFERENCES studies(id),
  participant_id UUID, -- Can be null for anonymous
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  
  -- Session metadata
  user_agent TEXT,
  ip_address INET,
  device_info JSONB,
  total_duration INTEGER -- seconds
);

CREATE TABLE study_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES study_sessions(id) ON DELETE CASCADE,
  block_id UUID REFERENCES study_blocks(id),
  response_data JSONB NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT now(),
  
  -- Response metadata
  time_taken INTEGER, -- seconds
  interaction_events JSONB -- mouse movements, focus events, etc.
);
```

**Row Level Security (RLS) Policies**

```sql
-- Researchers can only access their own studies
CREATE POLICY studies_access_policy ON studies
  FOR ALL USING (auth.uid() = created_by);

-- Study blocks follow study access
CREATE POLICY study_blocks_access_policy ON study_blocks
  FOR ALL USING (
    study_id IN (
      SELECT id FROM studies 
      WHERE created_by = auth.uid()
    )
  );

-- Public read access for published studies (participant view)
CREATE POLICY studies_public_read_policy ON studies
  FOR SELECT USING (status = 'published');

-- Participants can create sessions and responses
CREATE POLICY sessions_participant_policy ON study_sessions
  FOR INSERT WITH CHECK (true);

CREATE POLICY responses_participant_policy ON study_responses
  FOR INSERT WITH CHECK (
    session_id IN (
      SELECT id FROM study_sessions
    )
  );
```

## Study Blocks System

### Block Architecture

The study blocks system is the core innovation of ResearchHub, providing modular, reusable components for building research studies.

**Block Interface Design**

```typescript
// Base block interface
interface StudyBlock {
  id: string;
  type: BlockType;
  order: number;
  title: string;
  description: string;
  settings: BlockSettings;
  validation?: ValidationRules;
  metadata?: BlockMetadata;
}

// Block type definitions
type BlockType = 
  | 'welcome'
  | 'open_question'
  | 'opinion_scale'
  | 'multiple_choice'
  | 'simple_input'
  | 'context_screen'
  | 'yes_no'
  | '5_second_test'
  | 'card_sort'
  | 'tree_test'
  | 'thank_you'
  | 'image_upload'
  | 'file_upload';

// Type-safe settings for each block type
interface OpenQuestionSettings extends BlockSettings {
  placeholder?: string;
  maxLength?: number;
  minLength?: number;
  required: boolean;
  aiFollowUp?: boolean;
}

interface OpinionScaleSettings extends BlockSettings {
  scaleMin: number;
  scaleMax: number;
  scaleType: 'numeric' | 'stars' | 'emoji';
  labels?: { [key: number]: string };
  required: boolean;
}
```

**Block Rendering System**

```tsx
// Dynamic block renderer
const BlockRenderer: React.FC<{
  block: StudyBlock;
  onResponse: (data: any) => void;
  mode: 'participant' | 'preview';
}> = ({ block, onResponse, mode }) => {
  
  // Block component mapping
  const blockComponents: Record<BlockType, React.ComponentType<any>> = {
    welcome: WelcomeBlock,
    open_question: OpenQuestionBlock,
    opinion_scale: OpinionScaleBlock,
    multiple_choice: MultipleChoiceBlock,
    simple_input: SimpleInputBlock,
    context_screen: ContextScreenBlock,
    yes_no: YesNoBlock,
    '5_second_test': FiveSecondTestBlock,
    card_sort: CardSortBlock,
    tree_test: TreeTestBlock,
    thank_you: ThankYouBlock,
    image_upload: ImageUploadBlock,
    file_upload: FileUploadBlock
  };
  
  const BlockComponent = blockComponents[block.type];
  
  if (!BlockComponent) {
    console.error(`Unknown block type: ${block.type}`);
    return <UnknownBlockFallback block={block} />;
  }
  
  return (
    <BlockWrapper 
      block={block} 
      mode={mode}
    >
      <BlockComponent
        block={block}
        settings={block.settings}
        onResponse={onResponse}
        mode={mode}
      />
    </BlockWrapper>
  );
};
```

### Block Development Pattern

**Creating New Block Types**

```typescript
// 1. Define block settings interface
interface CustomBlockSettings extends BlockSettings {
  customProperty: string;
  optionalSetting?: number;
  required: boolean;
}

// 2. Create block component
const CustomBlock: React.FC<BlockProps<CustomBlockSettings>> = ({
  block,
  settings,
  onResponse,
  mode
}) => {
  const [response, setResponse] = useState<string>('');
  
  const handleSubmit = () => {
    // Validate response
    if (settings.required && !response.trim()) {
      return; // Show validation error
    }
    
    // Submit response
    onResponse({
      answer: response,
      metadata: {
        timeSpent: Date.now() - startTime,
        interactions: trackingData
      }
    });
  };
  
  return (
    <div className="custom-block">
      <h2>{block.title}</h2>
      <p>{block.description}</p>
      
      {/* Custom block UI */}
      <textarea
        value={response}
        onChange={(e) => setResponse(e.target.value)}
        placeholder={settings.customProperty}
      />
      
      <Button onClick={handleSubmit}>
        Continue
      </Button>
    </div>
  );
};

// 3. Register block type
BlockRegistry.register('custom_block', {
  component: CustomBlock,
  name: 'Custom Block',
  description: 'Description of what this block does',
  defaultSettings: {
    customProperty: 'Default value',
    required: true
  },
  settingsSchema: {
    customProperty: { type: 'string', required: true },
    optionalSetting: { type: 'number', min: 1, max: 100 },
    required: { type: 'boolean', default: true }
  }
});
```

## AI Integration Architecture

### AI-Powered Features

**Response Analysis Pipeline**

```typescript
// AI analysis service
class AIAnalysisService {
  private openai: OpenAI;
  
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }
  
  async analyzeResponse(response: StudyResponse): Promise<AIAnalysis> {
    const { block, response_data } = response;
    
    // Different analysis based on block type
    switch (block.type) {
      case 'open_question':
        return await this.analyzeTextResponse(response_data.answer);
      case 'opinion_scale':
        return await this.analyzeRatingResponse(response_data);
      default:
        return { themes: [], sentiment: null, insights: [] };
    }
  }
  
  private async analyzeTextResponse(text: string): Promise<AIAnalysis> {
    const prompt = `
      Analyze this user research response for:
      1. Main themes and topics
      2. Sentiment (positive, neutral, negative)
      3. Key insights and pain points
      4. Suggested follow-up questions
      
      Response: "${text}"
      
      Return JSON with themes, sentiment, insights, and suggestions.
    `;
    
    const completion = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3
    });
    
    return JSON.parse(completion.choices[0].message.content);
  }
}
```

**Smart Follow-up Generation**

```typescript
// Intelligent follow-up system
class FollowUpGenerator {
  async generateFollowUp(
    originalBlock: StudyBlock,
    response: any,
    context: StudyContext
  ): Promise<StudyBlock | null> {
    
    const analysis = await aiService.analyzeResponse({
      block: originalBlock,
      response_data: response
    });
    
    // Generate follow-up based on analysis
    if (analysis.sentiment === 'negative' && analysis.themes.includes('usability')) {
      return {
        id: generateId(),
        type: 'open_question',
        order: originalBlock.order + 0.5,
        title: 'Tell us more about the usability issues',
        description: 'You mentioned some challenges. Can you describe what made it difficult to use?',
        settings: {
          maxLength: 300,
          required: false,
          aiGenerated: true
        }
      };
    }
    
    return null; // No follow-up needed
  }
}
```

## Performance Optimization

### Frontend Performance

**Code Splitting Strategy**

```typescript
// Lazy load block components for better initial load time
const OpenQuestionBlock = lazy(() => import('./blocks/OpenQuestionBlock'));
const OpinionScaleBlock = lazy(() => import('./blocks/OpinionScaleBlock'));
const MultipleChoiceBlock = lazy(() => import('./blocks/MultipleChoiceBlock'));

// Dynamic imports for study builder
const StudyBuilder = lazy(() => import('./components/StudyBuilder'));
const Analytics = lazy(() => import('./components/Analytics'));

// Route-based code splitting
const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/dashboard" element={
        <Suspense fallback={<LoadingSpinner />}>
          <Dashboard />
        </Suspense>
      } />
      <Route path="/study/:id/builder" element={
        <Suspense fallback={<LoadingSpinner />}>
          <StudyBuilder />
        </Suspense>
      } />
    </Routes>
  </BrowserRouter>
);
```

**Caching Strategy**

```typescript
// React Query configuration for optimal caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error.status >= 400 && error.status < 500) {
          return false;
        }
        return failureCount < 3;
      }
    }
  }
});

// Study data with smart caching
const useStudyQuery = (studyId: string) => {
  return useQuery({
    queryKey: ['study', studyId],
    queryFn: () => api.studies.get(studyId),
    staleTime: 2 * 60 * 1000, // 2 minutes for study data
    select: (data) => ({
      ...data,
      // Transform data for UI consumption
      blocks: data.blocks.sort((a, b) => a.order - b.order)
    })
  });
};
```

### Backend Performance

**Database Optimization**

```sql
-- Strategic indexes for common queries
CREATE INDEX CONCURRENTLY idx_studies_created_by_status 
ON studies(created_by, status);

CREATE INDEX CONCURRENTLY idx_study_blocks_study_id_order 
ON study_blocks(study_id, order_index);

CREATE INDEX CONCURRENTLY idx_study_sessions_study_status 
ON study_sessions(study_id, status);

CREATE INDEX CONCURRENTLY idx_study_responses_session_block 
ON study_responses(session_id, block_id);

-- Partial indexes for active sessions
CREATE INDEX CONCURRENTLY idx_active_sessions 
ON study_sessions(study_id, started_at) 
WHERE status = 'active';

-- JSON indexes for settings queries
CREATE INDEX CONCURRENTLY idx_studies_settings_type 
ON studies USING GIN ((settings->>'study_type'));
```

**Query Optimization**

```javascript
// Efficient data fetching with minimal queries
async function getStudyWithAnalytics(studyId, userId) {
  const query = `
    SELECT 
      s.*,
      COUNT(DISTINCT ss.id) as total_sessions,
      COUNT(DISTINCT CASE WHEN ss.status = 'completed' THEN ss.id END) as completed_sessions,
      AVG(CASE WHEN ss.status = 'completed' THEN ss.total_duration END) as avg_duration,
      json_agg(
        json_build_object(
          'id', sb.id,
          'type', sb.type,
          'order_index', sb.order_index,
          'title', sb.title,
          'settings', sb.settings
        ) ORDER BY sb.order_index
      ) as blocks
    FROM studies s
    LEFT JOIN study_sessions ss ON s.id = ss.study_id
    LEFT JOIN study_blocks sb ON s.id = sb.study_id
    WHERE s.id = $1 AND s.created_by = $2
    GROUP BY s.id
  `;
  
  const { data, error } = await supabase.rpc('execute_sql', {
    query,
    params: [studyId, userId]
  });
  
  return data[0];
}
```

## Security Architecture

### Authentication & Authorization

**Multi-Layer Security**

```typescript
// JWT token validation middleware
async function authenticateRequest(req: NextApiRequest): Promise<User> {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    throw new Error('Authentication required');
  }
  
  // Verify with Supabase
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    throw new Error('Invalid token');
  }
  
  return user;
}

// Role-based access control
async function authorizeAction(
  user: User, 
  resource: string, 
  action: string
): Promise<boolean> {
  const permissions = await getUserPermissions(user.id);
  
  return permissions.some(permission =>
    permission.resource === resource && 
    permission.actions.includes(action)
  );
}
```

**Data Privacy**

```sql
-- Automatic PII scrubbing for exported data
CREATE OR REPLACE FUNCTION scrub_pii(data JSONB)
RETURNS JSONB AS $$
BEGIN
  -- Remove common PII fields
  data := data - 'email' - 'phone' - 'address' - 'name';
  
  -- Hash identifiable text patterns
  data := jsonb_set(data, '{ip_address}', 
    to_jsonb(md5(data->>'ip_address')));
  
  RETURN data;
END;
$$ LANGUAGE plpgsql;

-- Export view with privacy controls
CREATE VIEW study_export_view AS
SELECT 
  s.id,
  s.title,
  s.description,
  s.created_at,
  scrub_pii(sr.response_data) as response_data,
  sr.submitted_at
FROM studies s
JOIN study_sessions ss ON s.id = ss.study_id
JOIN study_responses sr ON ss.id = sr.session_id
WHERE s.status = 'published';
```

## Scalability Considerations

### Horizontal Scaling

**Microservices Preparation**

```typescript
// Service interface design for future microservices
interface StudyService {
  createStudy(data: CreateStudyRequest): Promise<Study>;
  updateStudy(id: string, data: UpdateStudyRequest): Promise<Study>;
  deleteStudy(id: string): Promise<void>;
  getStudy(id: string): Promise<Study>;
  getStudies(filters: StudyFilters): Promise<PaginatedStudies>;
}

interface AnalyticsService {
  generateReport(studyId: string): Promise<StudyReport>;
  getMetrics(studyId: string, timeRange: TimeRange): Promise<Metrics>;
  exportData(studyId: string, format: ExportFormat): Promise<string>;
}

interface NotificationService {
  sendEmail(template: string, data: any): Promise<void>;
  sendSlackNotification(webhook: string, message: string): Promise<void>;
  scheduleReminder(studyId: string, delay: number): Promise<void>;
}
```

**Database Sharding Strategy**

```sql
-- Preparation for horizontal partitioning
-- Partition studies by creation date
CREATE TABLE studies_2025 PARTITION OF studies
FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');

-- Partition responses by study_id hash
CREATE TABLE study_responses_0 PARTITION OF study_responses
FOR VALUES WITH (MODULUS 4, REMAINDER 0);

CREATE TABLE study_responses_1 PARTITION OF study_responses
FOR VALUES WITH (MODULUS 4, REMAINDER 1);
```

### Caching Strategy

**Multi-Level Caching**

```typescript
// Cache hierarchy
class CacheManager {
  private redis: Redis;
  private memoryCache: Map<string, any>;
  
  async get<T>(key: string): Promise<T | null> {
    // 1. Check memory cache first (fastest)
    if (this.memoryCache.has(key)) {
      return this.memoryCache.get(key);
    }
    
    // 2. Check Redis cache (fast)
    const redisValue = await this.redis.get(key);
    if (redisValue) {
      const parsed = JSON.parse(redisValue);
      this.memoryCache.set(key, parsed);
      return parsed;
    }
    
    // 3. Not in cache, will need to fetch from database
    return null;
  }
  
  async set<T>(key: string, value: T, ttl: number): Promise<void> {
    // Store in both caches
    this.memoryCache.set(key, value);
    await this.redis.setex(key, ttl, JSON.stringify(value));
  }
}
```

## Development Workflow

### Local Development Architecture

**Hybrid Development Environment**

```javascript
// scripts/development/local-full-dev.js
// Unique approach: Import Vercel functions directly for local development
import express from 'express';
import cors from 'cors';

// Import actual Vercel functions
import authHandler from '../../api/auth-consolidated.js';
import researchHandler from '../../api/research-consolidated.js';
import templatesHandler from '../../api/templates-consolidated.js';

const app = express();

// Configure CORS for local development
app.use(cors({
  origin: 'http://localhost:5175',
  credentials: true
}));

app.use(express.json());

// Mount imported handlers
app.use('/api/auth', authHandler);
app.use('/api/research-consolidated', researchHandler);
app.use('/api/templates-consolidated', templatesHandler);

// Benefits:
// 1. Identical function behavior to production
// 2. Real Supabase database connection
// 3. Hot reload during development
// 4. No separate local database setup
// 5. Test with production data
```

### Testing Architecture

**Comprehensive Testing Strategy**

```typescript
// Test utilities for block testing
export class BlockTestHarness {
  private mockStudy: Study;
  private mockOnResponse: jest.Mock;
  
  constructor(blockType: BlockType) {
    this.mockStudy = createMockStudy(blockType);
    this.mockOnResponse = jest.fn();
  }
  
  renderBlock(props: Partial<BlockProps> = {}) {
    return render(
      <BlockRenderer
        block={this.mockStudy.blocks[0]}
        onResponse={this.mockOnResponse}
        mode="participant"
        {...props}
      />
    );
  }
  
  async submitResponse(response: any) {
    // Simulate user interaction
    const submitButton = screen.getByRole('button', { name: /continue|submit/i });
    
    // Fill in response data
    await this.fillResponse(response);
    
    // Submit
    fireEvent.click(submitButton);
    
    // Return what was submitted
    return this.mockOnResponse.mock.calls[0][0];
  }
  
  private async fillResponse(response: any) {
    // Block-specific response filling logic
    switch (this.mockStudy.blocks[0].type) {
      case 'open_question':
        const textarea = screen.getByRole('textbox');
        await userEvent.type(textarea, response.answer);
        break;
      case 'opinion_scale':
        const rating = screen.getByLabelText(`${response.rating} out of 10`);
        fireEvent.click(rating);
        break;
      // ... other block types
    }
  }
}

// Usage in tests
describe('OpenQuestionBlock', () => {
  let harness: BlockTestHarness;
  
  beforeEach(() => {
    harness = new BlockTestHarness('open_question');
  });
  
  it('should submit response with correct format', async () => {
    harness.renderBlock();
    
    const response = await harness.submitResponse({
      answer: 'This is my test response'
    });
    
    expect(response).toMatchObject({
      answer: 'This is my test response',
      metadata: expect.objectContaining({
        timeSpent: expect.any(Number)
      })
    });
  });
});
```

## Future Architecture Considerations

### Extensibility

**Plugin Architecture Design**

```typescript
// Future plugin system interface
interface ResearchHubPlugin {
  name: string;
  version: string;
  dependencies?: string[];
  
  // Lifecycle hooks
  onInstall?(): Promise<void>;
  onActivate?(): Promise<void>;
  onDeactivate?(): Promise<void>;
  
  // Extension points
  blocks?: BlockPlugin[];
  analytics?: AnalyticsPlugin[];
  integrations?: IntegrationPlugin[];
}

interface BlockPlugin {
  type: string;
  name: string;
  component: React.ComponentType<BlockProps>;
  settingsSchema: JSONSchema;
  defaultSettings: any;
}

// Plugin registration
class PluginManager {
  private plugins: Map<string, ResearchHubPlugin> = new Map();
  
  async install(plugin: ResearchHubPlugin): Promise<void> {
    // Validate plugin
    await this.validatePlugin(plugin);
    
    // Install dependencies
    if (plugin.dependencies) {
      await this.installDependencies(plugin.dependencies);
    }
    
    // Run installation hooks
    if (plugin.onInstall) {
      await plugin.onInstall();
    }
    
    // Register plugin
    this.plugins.set(plugin.name, plugin);
    
    // Register block types
    if (plugin.blocks) {
      plugin.blocks.forEach(block => {
        BlockRegistry.register(block.type, block);
      });
    }
  }
}
```

### AI Evolution

**Advanced AI Capabilities**

```typescript
// Future AI service architecture
interface AdvancedAIService {
  // Multi-modal analysis
  analyzeImageResponse(image: File, context: StudyContext): Promise<ImageAnalysis>;
  analyzeVideoResponse(video: File, context: StudyContext): Promise<VideoAnalysis>;
  analyzeAudioResponse(audio: File, context: StudyContext): Promise<AudioAnalysis>;
  
  // Real-time assistance
  suggestQuestionImprovements(question: string): Promise<string[]>;
  detectBiasInQuestion(question: string): Promise<BiasAnalysis>;
  optimizeStudyFlow(blocks: StudyBlock[]): Promise<StudyBlock[]>;
  
  // Predictive analytics
  predictCompletionRate(study: Study): Promise<number>;
  suggestOptimalTiming(study: Study): Promise<TimeRecommendation>;
  identifyDropOffRisks(study: Study): Promise<RiskAnalysis>;
}
```

## Conclusion

ResearchHub's architecture balances immediate functionality with long-term scalability. The modular design, particularly the block system, provides flexibility for researchers while maintaining technical consistency. The serverless architecture ensures cost-effective scaling, while the comprehensive caching and optimization strategies deliver excellent performance.

The platform's success lies in its user-centric design philosophy: every technical decision is evaluated based on how it improves the researcher and participant experience. This focus on user value, combined with robust technical foundations, positions ResearchHub as a leading platform for modern user research.

---

**Architecture Version**: 2.1.0  
**Last Updated**: August 19, 2025  
**Next Review**: October 2025
