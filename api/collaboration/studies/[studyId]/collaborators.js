import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
  try {
    // Get user from auth token
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ success: false, error: 'No authorization header' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }

    // Extract study ID from URL
    const studyId = req.query.studyId;
    if (!studyId) {
      return res.status(400).json({ success: false, error: 'Study ID is required' });
    }

    // Check if user has access to this study
    const { data: accessCheck } = await supabase
      .from('study_collaborators')
      .select('role')
      .eq('study_id', studyId)
      .eq('user_id', user.id)
      .single();

    const { data: ownerCheck } = await supabase
      .from('studies')
      .select('researcher_id')
      .eq('id', studyId)
      .eq('researcher_id', user.id)
      .single();

    if (!accessCheck && !ownerCheck) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    if (req.method === 'GET') {
      // Get study collaborators
      const { data: collaborators, error: collabError } = await supabase
        .from('study_collaborators')
        .select(`
          id,
          user_id,
          role,
          permissions,
          added_at,
          users!inner (
            email,
            user_metadata
          )
        `)
        .eq('study_id', studyId);

      if (collabError) {
        console.error('Collaborators query error:', collabError);
        return res.status(500).json({ success: false, error: 'Failed to fetch collaborators' });
      }

      // Format collaborators data
      const formattedCollaborators = collaborators?.map(collab => ({
        id: collab.id,
        user_id: collab.user_id,
        role: collab.role,
        permissions: collab.permissions || {
          can_edit: false,
          can_review: false,
          can_share: false,
          can_delete: false
        },
        user_email: collab.users.email,
        user_first_name: collab.users.user_metadata?.first_name || 'Unknown',
        user_last_name: collab.users.user_metadata?.last_name || 'User',
        added_at: collab.added_at
      })) || [];

      return res.status(200).json({
        success: true,
        collaborators: formattedCollaborators
      });
    }

    if (req.method === 'POST') {
      // Add new collaborator
      const { email, role } = req.body;

      if (!email || !role) {
        return res.status(400).json({ success: false, error: 'Email and role are required' });
      }

      // Find user by email
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (userError || !userData) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      // Check if user is already a collaborator
      const { data: existingCollab } = await supabase
        .from('study_collaborators')
        .select('id')
        .eq('study_id', studyId)
        .eq('user_id', userData.id)
        .single();

      if (existingCollab) {
        return res.status(409).json({ success: false, error: 'User is already a collaborator' });
      }

      // Set permissions based on role
      let permissions = {
        can_edit: false,
        can_review: false,
        can_share: false,
        can_delete: false
      };

      switch (role) {
        case 'editor':
          permissions = {
            can_edit: true,
            can_review: true,
            can_share: true,
            can_delete: false
          };
          break;
        case 'reviewer':
          permissions = {
            can_edit: false,
            can_review: true,
            can_share: false,
            can_delete: false
          };
          break;
        case 'viewer':
          permissions = {
            can_edit: false,
            can_review: false,
            can_share: false,
            can_delete: false
          };
          break;
      }

      // Add collaborator
      const { error: insertError } = await supabase
        .from('study_collaborators')
        .insert({
          study_id: studyId,
          user_id: userData.id,
          role: role,
          permissions: permissions,
          added_by: user.id
        });

      if (insertError) {
        console.error('Insert collaborator error:', insertError);
        return res.status(500).json({ success: false, error: 'Failed to add collaborator' });
      }

      // Log activity
      await supabase
        .from('collaboration_activity')
        .insert({
          study_id: studyId,
          user_id: user.id,
          action: 'collaborator_added',
          details: `Added ${email} as ${role}`,
          target_user_id: userData.id
        });

      return res.status(201).json({ success: true, message: 'Collaborator added successfully' });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (error) {
    console.error('Study collaborators API error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
