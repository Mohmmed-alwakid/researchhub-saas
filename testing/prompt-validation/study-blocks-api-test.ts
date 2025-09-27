/**
 * Day 3 Real Development Test - Study Blocks API Handler
 * This API handler demonstrates prompt effectiveness for ResearchHub API development
 * Expected: Copilot should suggest action-based routing, authentication, and Supabase patterns
 */

import { createClient } from '@supabase/supabase-js';

// Test 1: Supabase Client Setup
// Expected: Copilot should understand ResearchHub Supabase patterns
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// Test 2: API Types
// Expected: Copilot should understand ResearchHub API request/response patterns
interface ApiRequest {
  method: string;
  query: Record<string, string>;
  headers: Record<string, string>;
  body?: unknown;
}

interface ApiResponse {
  status: (code: number) => ApiResponse;
  json: (data: unknown) => ApiResponse;
}

interface AuthResult {
  success: boolean;
  error?: string;
  status: number;
  user?: {
    id: string;
    role: string;
    email: string;
  };
}

interface StudyBlocksApiResponse {
  success: boolean;
  data?: unknown;
  error?: string;
  message?: string;
}

// Test 3: Authentication Helper
// Expected: Copilot should suggest ResearchHub authentication patterns
async function authenticateUser(req: ApiRequest, requiredRoles: string[] = []): Promise<AuthResult> {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        success: false,
        error: 'Missing or invalid authorization header',
        status: 401
      };
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return {
        success: false,
        error: 'Invalid token or user not found',
        status: 401
      };
    }

    const userRole = user.user_metadata?.role || 'participant';
    
    if (requiredRoles.length > 0 && !requiredRoles.includes(userRole)) {
      return {
        success: false,
        error: 'Insufficient permissions',
        status: 403
      };
    }

    return {
      success: true,
      status: 200,
      user: {
        id: user.id,
        role: userRole,
        email: user.email || ''
      }
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return {
      success: false,
      error: 'Authentication failed',
      status: 500
    };
  }
}

// Test 4: Database Operations
// Expected: Copilot should suggest RLS patterns and proper error handling
async function getStudyBlocks(studyId: string, userId: string): Promise<StudyBlocksApiResponse> {
  try {
    // Expected: Copilot should suggest RLS filtering with researcher_id
    const { data: studyData, error: studyError } = await supabase
      .from('studies')
      .select('id, researcher_id')
      .eq('id', studyId)
      .eq('researcher_id', userId)
      .single();

    if (studyError || !studyData) {
      return {
        success: false,
        error: 'Study not found or access denied'
      };
    }

    const { data: blocks, error: blocksError } = await supabase
      .from('study_blocks')
      .select(`
        id,
        type,
        order,
        title,
        description,
        settings,
        created_at,
        updated_at
      `)
      .eq('study_id', studyId)
      .order('order', { ascending: true });

    if (blocksError) {
      throw new Error(`Failed to fetch study blocks: ${blocksError.message}`);
    }

    return {
      success: true,
      data: blocks || []
    };
  } catch (error) {
    console.error('Database error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Database operation failed'
    };
  }
}

// Test 5: Block Creation with Validation
// Expected: Copilot should understand StudyBuilderBlock patterns
async function createStudyBlock(studyId: string, blockData: unknown, userId: string): Promise<StudyBlocksApiResponse> {
  try {
    // Validate study ownership
    const { data: studyData, error: studyError } = await supabase
      .from('studies')
      .select('researcher_id')
      .eq('id', studyId)
      .eq('researcher_id', userId)
      .single();

    if (studyError || !studyData) {
      return {
        success: false,
        error: 'Study not found or access denied'
      };
    }

    // Validate block data structure
    if (!blockData || typeof blockData !== 'object') {
      return {
        success: false,
        error: 'Invalid block data'
      };
    }

    const block = blockData as Record<string, unknown>;
    
    // Expected: Copilot should suggest block validation patterns
    if (!block.type || !block.title) {
      return {
        success: false,
        error: 'Block must have type and title'
      };
    }

    // Generate UUID for new block
    const blockId = crypto.randomUUID();
    
    const newBlock = {
      id: blockId,
      study_id: studyId,
      type: block.type,
      title: block.title,
      description: block.description || '',
      settings: block.settings || {},
      order: block.order || 0,
      created_at: new Date().toISOString()
    };

    const { data: createdBlock, error: createError } = await supabase
      .from('study_blocks')
      .insert([newBlock])
      .select()
      .single();

    if (createError) {
      throw new Error(`Failed to create block: ${createError.message}`);
    }

    return {
      success: true,
      data: createdBlock,
      message: 'Block created successfully'
    };
  } catch (error) {
    console.error('Block creation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Block creation failed'
    };
  }
}

// Test 6: Block Update with Ownership Validation
// Expected: Copilot should understand update patterns and RLS
async function updateStudyBlock(blockId: string, updateData: unknown, userId: string): Promise<StudyBlocksApiResponse> {
  try {
    // Verify block exists and user has access through study ownership
    const { data: blockData, error: blockError } = await supabase
      .from('study_blocks')
      .select(`
        id,
        study_id,
        studies!inner(researcher_id)
      `)
      .eq('id', blockId)
      .single();

    if (blockError || !blockData) {
      return {
        success: false,
        error: 'Block not found'
      };
    }

    // Type assertion with proper typing
    const blockWithStudy = blockData as {
      id: string;
      study_id: string;
      studies: { researcher_id: string };
    };

    if (blockWithStudy.studies.researcher_id !== userId) {
      return {
        success: false,
        error: 'Access denied'
      };
    }

    // Validate update data
    if (!updateData || typeof updateData !== 'object') {
      return {
        success: false,
        error: 'Invalid update data'
      };
    }

    const updates = {
      ...updateData as Record<string, unknown>,
      updated_at: new Date().toISOString()
    };

    const { data: updatedBlock, error: updateError } = await supabase
      .from('study_blocks')
      .update(updates)
      .eq('id', blockId)
      .select()
      .single();

    if (updateError) {
      throw new Error(`Failed to update block: ${updateError.message}`);
    }

    return {
      success: true,
      data: updatedBlock,
      message: 'Block updated successfully'
    };
  } catch (error) {
    console.error('Block update error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Block update failed'
    };
  }
}

// Test 7: Main API Handler - Action-Based Routing
// Expected: Copilot should suggest exact ResearchHub API pattern
export default async function handler(req: ApiRequest, res: ApiResponse): Promise<ApiResponse> {
  try {
    // Expected: Copilot should suggest this exact pattern
    const { action } = req.query;
    
    if (!action) {
      return res.status(400).json({
        success: false,
        error: 'Action parameter is required'
      });
    }

    // Expected: Copilot should suggest switch statement with all actions
    switch (action) {
      case 'get-blocks':
        return await handleGetBlocks(req, res);
        
      case 'create-block':
        return await handleCreateBlock(req, res);
        
      case 'update-block':
        return await handleUpdateBlock(req, res);
        
      case 'delete-block':
        return await handleDeleteBlock(req, res);
        
      case 'reorder-blocks':
        return await handleReorderBlocks(req, res);
        
      case 'validate-blocks':
        return await handleValidateBlocks(req, res);
        
      default:
        return res.status(400).json({
          success: false,
          error: `Invalid action: ${action}`
        });
    }
  } catch (error) {
    console.error('API handler error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
}

// Test 8: Action Handlers with Authentication
// Expected: Copilot should suggest researcher role requirement
async function handleGetBlocks(req: ApiRequest, res: ApiResponse): Promise<ApiResponse> {
  const auth = await authenticateUser(req, ['researcher', 'admin']);
  
  if (!auth.success) {
    return res.status(auth.status).json({
      success: false,
      error: auth.error
    });
  }

  const { studyId } = req.query;
  
  if (!studyId) {
    return res.status(400).json({
      success: false,
      error: 'Study ID is required'
    });
  }

  const result = await getStudyBlocks(studyId, auth.user!.id);
  return res.status(result.success ? 200 : 400).json(result);
}

async function handleCreateBlock(req: ApiRequest, res: ApiResponse): Promise<ApiResponse> {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  const auth = await authenticateUser(req, ['researcher']);
  
  if (!auth.success) {
    return res.status(auth.status).json({
      success: false,
      error: auth.error
    });
  }

  const { studyId } = req.query;
  
  if (!studyId || !req.body) {
    return res.status(400).json({
      success: false,
      error: 'Study ID and block data are required'
    });
  }

  const result = await createStudyBlock(studyId, req.body, auth.user!.id);
  return res.status(result.success ? 201 : 400).json(result);
}

async function handleUpdateBlock(req: ApiRequest, res: ApiResponse): Promise<ApiResponse> {
  if (req.method !== 'PUT') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  const auth = await authenticateUser(req, ['researcher']);
  
  if (!auth.success) {
    return res.status(auth.status).json({
      success: false,
      error: auth.error
    });
  }

  const { blockId } = req.query;
  
  if (!blockId || !req.body) {
    return res.status(400).json({
      success: false,
      error: 'Block ID and update data are required'
    });
  }

  const result = await updateStudyBlock(blockId, req.body, auth.user!.id);
  return res.status(result.success ? 200 : 400).json(result);
}

// Expected: Copilot should suggest similar patterns for delete and reorder
async function handleDeleteBlock(req: ApiRequest, res: ApiResponse): Promise<ApiResponse> {
  // Implementation would follow similar pattern
  return res.status(501).json({
    success: false,
    error: 'Delete block not yet implemented'
  });
}

async function handleReorderBlocks(req: ApiRequest, res: ApiResponse): Promise<ApiResponse> {
  // Implementation would follow similar pattern
  return res.status(501).json({
    success: false,
    error: 'Reorder blocks not yet implemented'
  });
}

async function handleValidateBlocks(req: ApiRequest, res: ApiResponse): Promise<ApiResponse> {
  // Implementation would follow similar pattern
  return res.status(501).json({
    success: false,
    error: 'Validate blocks not yet implemented'
  });
}

/*
Development Testing Notes:
This API handler tests prompt understanding of:

1. Action-based routing pattern (ResearchHub standard)
2. Authentication middleware with role requirements
3. Supabase client usage and RLS patterns
4. Proper error handling and response formats
5. TypeScript interfaces for API requests/responses
6. Database operations with ownership validation
7. UUID generation for new resources
8. Method validation (GET/POST/PUT restrictions)
9. Input validation and sanitization
10. Consistent API response structure

Expected Copilot Behaviors:
- Should suggest 'const { action } = req.query' when typing handler
- Should understand switch statement for action routing
- Should suggest authenticateUser() for protected routes
- Should suggest RLS patterns with .eq('researcher_id', userId)
- Should understand StudyBuilderBlock data structures
- Should suggest proper error handling try/catch blocks
- Should suggest crypto.randomUUID() for ID generation
- Should understand ResearchHub API response format
- Should suggest proper TypeScript types
- Should enforce 12-function limit constraint awareness
*/