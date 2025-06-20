// Recordings API endpoint using Supabase (ES modules)
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk1ODAsImV4cCI6MjA2NTc3NTU4MH0.YMai9p4VQMbdqmc_9uWGeJ6nONHwuM9XT2FDTFy0aGk';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    if (req.method === 'POST') {
      const { action } = req.query;

      if (action === 'upload') {
        return await handleRecordingUpload(req, res, supabase);
      } else if (action === 'create') {
        return await createRecordingSession(req, res, supabase);
      } else if (action === 'complete') {
        return await completeRecording(req, res, supabase);
      }
    }

    if (req.method === 'GET') {
      const { sessionId, studyId } = req.query;
      
      if (sessionId) {
        return await getRecordingBySession(req, res, supabase, sessionId);
      } else if (studyId) {
        return await getRecordingsByStudy(req, res, supabase, studyId);
      } else {
        return await getAllRecordings(req, res, supabase);
      }
    }

    if (req.method === 'PUT') {
      return await updateRecording(req, res, supabase);
    }

    if (req.method === 'DELETE') {
      return await deleteRecording(req, res, supabase);
    }

    res.status(405).json({ success: false, error: 'Method not allowed' });

  } catch (error) {
    console.error('Recordings API error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error',
      details: error.message 
    });
  }
}

// Handle recording upload (for now, we'll store as base64 temporarily)
async function handleRecordingUpload(req, res, supabase) {
  try {
    const { sessionId, recordingData, mimeType, duration } = req.body;

    if (!sessionId || !recordingData) {
      return res.status(400).json({
        success: false,
        error: 'Session ID and recording data are required'
      });
    }

    // For now, we'll store the recording data as a large text field
    // In production, this should be uploaded to cloud storage (AWS S3, etc.)
    const recordingId = `rec_${sessionId}_${Date.now()}`;
    
    const { data: recording, error } = await supabase
      .from('recordings')
      .insert({
        id: recordingId,
        session_id: sessionId,
        recording_data: recordingData, // Base64 encoded for now
        mime_type: mimeType || 'video/webm',
        duration: duration || 0,
        status: 'completed',
        file_size: recordingData.length,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving recording:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to save recording',
        details: error.message
      });
    }

    res.status(200).json({
      success: true,
      recording: {
        id: recording.id,
        sessionId: recording.session_id,
        recordingUrl: `/api/recordings?action=download&id=${recording.id}`,
        duration: recording.duration,
        status: recording.status,
        createdAt: recording.created_at
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload recording',
      details: error.message
    });
  }
}

// Create a new recording session
async function createRecordingSession(req, res, supabase) {
  try {
    const { sessionId, studyId, participantId, recordingOptions } = req.body;

    const recordingId = `rec_${sessionId}_${Date.now()}`;

    const { data: recording, error } = await supabase
      .from('recordings')
      .insert({
        id: recordingId,
        session_id: sessionId,
        study_id: studyId,
        participant_id: participantId,
        status: 'recording',
        recording_options: recordingOptions,
        started_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.status(200).json({
      success: true,
      recording: {
        id: recording.id,
        sessionId: recording.session_id,
        status: recording.status,
        startedAt: recording.started_at
      }
    });

  } catch (error) {
    console.error('Error creating recording session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create recording session',
      details: error.message
    });
  }
}

// Complete a recording session
async function completeRecording(req, res, supabase) {
  try {
    const { recordingId, duration, fileSize } = req.body;

    const { data: recording, error } = await supabase
      .from('recordings')
      .update({
        status: 'completed',
        duration: duration,
        file_size: fileSize,
        ended_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', recordingId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.status(200).json({
      success: true,
      recording: {
        id: recording.id,
        status: recording.status,
        duration: recording.duration,
        endedAt: recording.ended_at
      }
    });

  } catch (error) {
    console.error('Error completing recording:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to complete recording',
      details: error.message
    });
  }
}

// Get recording by session ID
async function getRecordingBySession(req, res, supabase, sessionId) {
  try {
    const { data: recordings, error } = await supabase
      .from('recordings')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // If no recordings found, return empty array
    if (!recordings || recordings.length === 0) {
      return res.status(200).json({
        success: true,
        recordings: [],
        total: 0
      });
    }

    const formattedRecordings = recordings.map(recording => ({
      id: recording.id,
      sessionId: recording.session_id,
      studyId: recording.study_id,
      participantId: recording.participant_id,
      status: recording.status,
      duration: recording.duration,
      fileSize: recording.file_size,
      recordingUrl: recording.recording_data ? 
        `data:${recording.mime_type || 'video/webm'};base64,${recording.recording_data}` : 
        null,
      startedAt: recording.started_at,
      endedAt: recording.ended_at,
      createdAt: recording.created_at
    }));

    res.status(200).json({
      success: true,
      recordings: formattedRecordings,
      total: recordings.length
    });

  } catch (error) {
    console.error('Error fetching recordings by session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recordings',
      details: error.message
    });
  }
}

// Get recordings by study ID
async function getRecordingsByStudy(req, res, supabase, studyId) {
  try {
    const { data: recordings, error } = await supabase
      .from('recordings')
      .select('*')
      .eq('study_id', studyId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    const formattedRecordings = (recordings || []).map(recording => ({
      id: recording.id,
      sessionId: recording.session_id,
      studyId: recording.study_id,
      participantId: recording.participant_id,
      status: recording.status,
      duration: recording.duration,
      fileSize: recording.file_size,
      startedAt: recording.started_at,
      endedAt: recording.ended_at,
      createdAt: recording.created_at
    }));

    res.status(200).json({
      success: true,
      recordings: formattedRecordings,
      total: recordings.length
    });

  } catch (error) {
    console.error('Error fetching recordings by study:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recordings',
      details: error.message
    });
  }
}

// Get all recordings
async function getAllRecordings(req, res, supabase) {
  try {
    const { data: recordings, error } = await supabase
      .from('recordings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50); // Limit to prevent large responses

    if (error) {
      throw error;
    }

    const formattedRecordings = (recordings || []).map(recording => ({
      id: recording.id,
      sessionId: recording.session_id,
      studyId: recording.study_id,
      participantId: recording.participant_id,
      status: recording.status,
      duration: recording.duration,
      fileSize: recording.file_size,
      startedAt: recording.started_at,
      endedAt: recording.ended_at,
      createdAt: recording.created_at
    }));

    res.status(200).json({
      success: true,
      recordings: formattedRecordings,
      total: recordings.length
    });

  } catch (error) {
    console.error('Error fetching all recordings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recordings',
      details: error.message
    });
  }
}

// Update recording
async function updateRecording(req, res, supabase) {
  try {
    const { id, ...updateData } = req.body;

    const { data: recording, error } = await supabase
      .from('recordings')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.status(200).json({
      success: true,
      recording: {
        id: recording.id,
        sessionId: recording.session_id,
        status: recording.status,
        updatedAt: recording.updated_at
      }
    });

  } catch (error) {
    console.error('Error updating recording:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update recording',
      details: error.message
    });
  }
}

// Delete recording
async function deleteRecording(req, res, supabase) {
  try {
    const { id } = req.query;

    const { error } = await supabase
      .from('recordings')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    res.status(200).json({
      success: true,
      message: 'Recording deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting recording:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete recording',
      details: error.message
    });
  }
}
