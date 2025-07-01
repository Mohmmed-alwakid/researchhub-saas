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

    if (req.method === 'GET') {
      // Get studies the user can collaborate on
      const { data: collaboratorStudies, error: collabError } = await supabase
        .from('study_collaborators')
        .select(`
          study_id,
          role,
          studies!inner (
            id,
            title,
            description,
            status,
            created_at,
            organization_id,
            organizations!inner (
              name
            )
          )
        `)
        .eq('user_id', user.id);

      if (collabError) {
        console.error('Collaboration query error:', collabError);
        return res.status(500).json({ success: false, error: 'Failed to fetch collaborative studies' });
      }

      // Get studies the user owns
      const { data: ownedStudies, error: ownedError } = await supabase
        .from('studies')
        .select(`
          id,
          title,
          description,
          status,
          created_at,
          organization_id,
          organizations!inner (
            name
          )
        `)
        .eq('researcher_id', user.id);

      if (ownedError) {
        console.error('Owned studies query error:', ownedError);
        return res.status(500).json({ success: false, error: 'Failed to fetch owned studies' });
      }

      // Combine and format studies
      const studies = [];

      // Add owned studies
      if (ownedStudies) {
        for (const study of ownedStudies) {
          studies.push({
            id: study.id,
            title: study.title,
            description: study.description,
            status: study.status,
            created_at: study.created_at,
            organization_id: study.organization_id,
            organization_name: study.organizations?.name || 'Unknown'
          });
        }
      }

      // Add collaborative studies
      if (collaboratorStudies) {
        for (const collab of collaboratorStudies) {
          if (collab.studies && !studies.find(s => s.id === collab.studies.id)) {
            studies.push({
              id: collab.studies.id,
              title: collab.studies.title,
              description: collab.studies.description,
              status: collab.studies.status,
              created_at: collab.studies.created_at,
              organization_id: collab.studies.organization_id,
              organization_name: collab.studies.organizations?.name || 'Unknown'
            });
          }
        }
      }

      return res.status(200).json({
        success: true,
        studies: studies.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (error) {
    console.error('Collaboration studies API error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
