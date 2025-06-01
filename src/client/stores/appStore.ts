import { create } from 'zustand';
import axios from 'axios';
import toast from 'react-hot-toast';

// Helper function to extract error message from axios errors
const getErrorMessage = (error: unknown, defaultMessage: string): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response;
    return response?.data?.message || defaultMessage;
  }
  return defaultMessage;
};

interface Study {
  _id: string;
  title: string;
  description: string;
  type: 'usability' | 'interview' | 'survey' | 'prototype';
  status: 'draft' | 'recruiting' | 'active' | 'completed' | 'paused';
  createdBy: string;
  tasks: Task[];
  participants: string[];
  settings: {
    maxParticipants: number;
    duration: number;
    compensation: number;
    recordScreen: boolean;
    recordAudio: boolean;
    collectHeatmaps: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

interface Task {
  _id: string;
  title: string;
  description: string;
  type: 'navigation' | 'interaction' | 'feedback' | 'questionnaire';
  order: number;
  settings: Record<string, unknown>;
}

interface TaskInput {
  title: string;
  description: string;
  type: 'navigation' | 'interaction' | 'feedback' | 'questionnaire' | 'prototype' | 'heatmap';
  order: number;
  settings?: Record<string, unknown>;
}

interface StudyInput {
  title: string;
  description: string;
  type: 'usability' | 'interview' | 'survey' | 'prototype';
  status: 'draft' | 'recruiting' | 'active' | 'completed' | 'paused';
  tasks: TaskInput[];
  settings: {
    maxParticipants: number;
    duration: number;
    compensation: number;
    recordScreen: boolean;
    recordAudio: boolean;
    collectHeatmaps: boolean;
  };
}

interface Participant {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  demographics: Record<string, unknown>;
  status: 'invited' | 'screened' | 'qualified' | 'completed' | 'disqualified';
  studyId: string;
  sessions: string[];
  compensation: number;
  createdAt: string;
}

interface Session {
  _id: string;
  studyId: string;
  participantId: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  startTime: string;
  endTime?: string;
  recordings: string[];
  feedback: Record<string, unknown>;
  analytics: {
    clicks: number;
    duration: number;
    tasksCompleted: number;
    errorRate: number;
  };
}

interface AppState {
  // Studies
  studies: Study[];
  currentStudy: Study | null;
  studiesLoading: boolean;
  
  // Participants
  participants: Participant[];
  participantsLoading: boolean;
  
  // Sessions
  sessions: Session[];
  sessionsLoading: boolean;
  
  // Actions
  fetchStudies: () => Promise<void>;
  createStudy: (studyData: StudyInput) => Promise<Study>;
  updateStudy: (studyId: string, updates: Partial<Study>) => Promise<void>;
  deleteStudy: (studyId: string) => Promise<void>;
  setCurrentStudy: (study: Study | null) => void;
  
  fetchParticipants: (studyId?: string) => Promise<void>;
  inviteParticipant: (studyId: string, participantData: { email: string; name?: string }) => Promise<void>;
  updateParticipant: (participantId: string, updates: Partial<Participant>) => Promise<void>;
  
  fetchSessions: (studyId?: string) => Promise<void>;
  createSession: (sessionData: Partial<Session>) => Promise<Session>;
  updateSession: (sessionId: string, updates: Partial<Session>) => Promise<void>;
}

export const useAppStore = create<AppState>((set) => ({
  // Initial state
  studies: [],
  currentStudy: null,
  studiesLoading: false,
  participants: [],
  participantsLoading: false,
  sessions: [],
  sessionsLoading: false,

  // Study actions
  fetchStudies: async () => {
    set({ studiesLoading: true });
    try {
      const response = await axios.get('/studies');
      set({ studies: response.data.studies, studiesLoading: false });    } catch (error: unknown) {
      set({ studiesLoading: false });
      const message = getErrorMessage(error, 'Failed to fetch studies');
      toast.error(message);
    }
  },

  createStudy: async (studyData: StudyInput) => {
    try {
      const response = await axios.post('/studies', studyData);
      const newStudy = response.data.study;
      
      set((state) => ({
        studies: [newStudy, ...state.studies]
      }));
      
      toast.success('Study created successfully');
      return newStudy;    } catch (error: unknown) {
      const message = getErrorMessage(error, 'Failed to create study');
      toast.error(message);
      throw error;
    }
  },

  updateStudy: async (studyId: string, updates: Partial<Study>) => {
    try {
      const response = await axios.put(`/studies/${studyId}`, updates);
      const updatedStudy = response.data.study;
      
      set((state) => ({
        studies: state.studies.map(study => 
          study._id === studyId ? updatedStudy : study
        ),
        currentStudy: state.currentStudy?._id === studyId ? updatedStudy : state.currentStudy
      }));
      
      toast.success('Study updated successfully');    } catch (error: unknown) {
      const message = getErrorMessage(error, 'Failed to update study');
      toast.error(message);
      throw error;
    }
  },

  deleteStudy: async (studyId: string) => {
    try {
      await axios.delete(`/studies/${studyId}`);
      
      set((state) => ({
        studies: state.studies.filter(study => study._id !== studyId),
        currentStudy: state.currentStudy?._id === studyId ? null : state.currentStudy
      }));
      
      toast.success('Study deleted successfully');    } catch (error: unknown) {
      const message = getErrorMessage(error, 'Failed to delete study');
      toast.error(message);
      throw error;
    }
  },

  setCurrentStudy: (study: Study | null) => {
    set({ currentStudy: study });
  },

  // Participant actions
  fetchParticipants: async (studyId?: string) => {
    set({ participantsLoading: true });
    try {
      const url = studyId ? `/participants?studyId=${studyId}` : '/participants';
      const response = await axios.get(url);
      set({ participants: response.data.participants, participantsLoading: false });    } catch (error: unknown) {
      set({ participantsLoading: false });
      const message = getErrorMessage(error, 'Failed to fetch participants');
      toast.error(message);
    }
  },
  inviteParticipant: async (studyId: string, participantData: { email: string; name?: string }) => {
    try {
      const response = await axios.post('/participants/invite', {
        studyId,
        ...participantData
      });
      const newParticipant = response.data.participant;
      
      set((state) => ({
        participants: [newParticipant, ...state.participants]
      }));
      
      toast.success('Participant invited successfully');    } catch (error: unknown) {
      const message = getErrorMessage(error, 'Failed to invite participant');
      toast.error(message);
      throw error;
    }
  },

  updateParticipant: async (participantId: string, updates: Partial<Participant>) => {
    try {
      const response = await axios.put(`/participants/${participantId}`, updates);
      const updatedParticipant = response.data.participant;
      
      set((state) => ({
        participants: state.participants.map(participant => 
          participant._id === participantId ? updatedParticipant : participant
        )
      }));
      
      toast.success('Participant updated successfully');    } catch (error: unknown) {
      const message = getErrorMessage(error, 'Failed to update participant');
      toast.error(message);
      throw error;
    }
  },

  // Session actions
  fetchSessions: async (studyId?: string) => {
    set({ sessionsLoading: true });
    try {
      const url = studyId ? `/sessions?studyId=${studyId}` : '/sessions';
      const response = await axios.get(url);
      set({ sessions: response.data.sessions, sessionsLoading: false });    } catch (error: unknown) {
      set({ sessionsLoading: false });
      const message = getErrorMessage(error, 'Failed to fetch sessions');
      toast.error(message);
    }
  },

  createSession: async (sessionData: Partial<Session>) => {
    try {
      const response = await axios.post('/sessions', sessionData);
      const newSession = response.data.session;
      
      set((state) => ({
        sessions: [newSession, ...state.sessions]
      }));
      
      toast.success('Session created successfully');
      return newSession;    } catch (error: unknown) {
      const message = getErrorMessage(error, 'Failed to create session');
      toast.error(message);
      throw error;
    }
  },

  updateSession: async (sessionId: string, updates: Partial<Session>) => {
    try {
      const response = await axios.put(`/sessions/${sessionId}`, updates);
      const updatedSession = response.data.session;
      
      set((state) => ({
        sessions: state.sessions.map(session => 
          session._id === sessionId ? updatedSession : session
        )
      }));
      
      toast.success('Session updated successfully');    } catch (error: unknown) {
      const message = getErrorMessage(error, 'Failed to update session');
      toast.error(message);
      throw error;
    }
  },
}));
