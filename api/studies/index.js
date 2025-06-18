// Studies API endpoint using Supabase (ES modules)
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk1ODAsImV4cCI6MjA2NTc3NTU4MH0.YMai9p4VQMbdqmc_9uWGeJ6nONHwuM9XT2FDTFy0aGk';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  try {
    if (req.method === 'GET') {
      // Fetch studies from Supabase
      const { data: studies, error } = await supabase
        .from('studies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching studies:', error);
        // Return sample data if no studies table exists yet
        const sampleStudies = [
          {
            id: '1',
            title: 'Website Navigation Study',
            status: 'active',
            participants: 15,
            completionRate: 87,
            createdAt: new Date().toISOString()
          },
          {
            id: '2', 
            title: 'Mobile App Usability Test',
            status: 'draft',
            participants: 0,
            completionRate: 0,
            createdAt: new Date().toISOString()
          }
        ];

        res.status(200).json({
          success: true,
          studies: sampleStudies,
          total: sampleStudies.length,
          message: 'Sample studies retrieved (studies table not yet created)'
        });
        return;
      }

      res.status(200).json({
        success: true,
        studies: studies || [],
        total: studies?.length || 0,
        message: 'Studies retrieved successfully'
      });    } else if (req.method === 'POST') {
      // Handle study creation
      const { title, description, type } = req.body;

      if (!title) {
        return res.status(400).json({
          success: false,
          error: 'Title is required'
        });
      }      // Insert study into Supabase
      const { data: newStudy, error } = await supabase
        .from('studies')
        .insert([
          {
            title,
            description: description || '',
            settings: { type: type || 'usability' },
            status: 'draft',
            target_participants: 10,
            researcher_id: null // For now, we'll set this to null since auth isn't fully integrated
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating study:', error);
        return res.status(500).json({
          success: false,
          error: 'Failed to create study'
        });
      }

      res.status(201).json({
        success: true,
        study: newStudy,
        message: 'Study created successfully'
      });
    } else {
      res.status(405).json({
        success: false,
        error: 'Method not allowed'
      });
    }
  } catch (error) {
    console.error('Studies API error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}
