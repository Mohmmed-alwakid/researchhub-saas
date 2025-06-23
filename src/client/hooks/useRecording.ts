import { useState, useEffect, useCallback } from 'react';

interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  recordingDuration: number;
  recordingId?: string;
}

export const useRecording = (sessionId: string) => {
  const [state, setState] = useState<RecordingState>({
    isRecording: false,
    isPaused: false,
    recordingDuration: 0
  });

  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  // Update duration timer
  useEffect(() => {
    if (state.isRecording && !state.isPaused) {
      const id = setInterval(() => {
        setState(prev => ({
          ...prev,
          recordingDuration: prev.recordingDuration + 1
        }));
      }, 1000);
      setIntervalId(id);
    } else if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [state.isRecording, state.isPaused, intervalId]);

  const startRecording = useCallback(async () => {
    try {
      const response = await fetch('/api/recordings?action=start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          sessionId,
          recordingSettings: {
            screen: true,
            audio: false,
            quality: 'medium'
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to start recording');
      }

      const data = await response.json();
      
      setState(prev => ({
        ...prev,
        isRecording: true,
        isPaused: false,
        recordingId: data.recordingId,
        recordingDuration: 0
      }));

      console.log('Recording started:', data.recordingId);
    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    }
  }, [sessionId]);

  const stopRecording = useCallback(async () => {
    try {
      if (!state.recordingId) return;

      const response = await fetch('/api/recordings?action=stop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          recordingId: state.recordingId,
          sessionId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to stop recording');
      }

      setState(prev => ({
        ...prev,
        isRecording: false,
        isPaused: false
      }));

      console.log('Recording stopped');
    } catch (error) {
      console.error('Error stopping recording:', error);
      throw error;
    }
  }, [state.recordingId, sessionId]);

  const pauseRecording = useCallback(async () => {
    try {
      setState(prev => ({
        ...prev,
        isPaused: true
      }));
      console.log('Recording paused');
    } catch (error) {
      console.error('Error pausing recording:', error);
      throw error;
    }
  }, []);

  const resumeRecording = useCallback(async () => {
    try {
      setState(prev => ({
        ...prev,
        isPaused: false
      }));
      console.log('Recording resumed');
    } catch (error) {
      console.error('Error resuming recording:', error);
      throw error;
    }
  }, []);

  return {
    isRecording: state.isRecording,
    isPaused: state.isPaused,
    recordingDuration: state.recordingDuration,
    recordingId: state.recordingId,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording
  };
};
