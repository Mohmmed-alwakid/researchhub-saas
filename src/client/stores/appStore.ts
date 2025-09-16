import { create } from 'zustand';
import toast from 'react-hot-toast';
import { studiesService } from '../services/studies.service';
import { participantsService } from '../services/participants.service';
import { sessionsService } from '../services/sessions.service';
import type { 
  Study, 
  IParticipant, 
  ISession,
  StudyStatus
} from '../../shared/types';
import type { CreateStudyRequest } from '../services/studies.service';

// Helper function to extract error message from errors
const getErrorMessage = (error: unknown, defaultMessage: string): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response;
    return response?.data?.message || defaultMessage;
  }
  return defaultMessage;
};

export interface TaskInput {
  title: string;
  description: string;
  type: 'navigation' | 'interaction' | 'feedback' | 'questionnaire' | 'prototype' | 'heatmap';
  order: number;
  settings?: Record<string, unknown>;
}

export interface StudyInput {
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

interface AppState {
  // Studies
  studies: Study[];
  currentStudy: Study | null;
  studiesLoading: boolean;
    // Participants
  participants: IParticipant[];
  participantsLoading: boolean;
    // Sessions
  sessions: ISession[];
  sessionsLoading: boolean;
  
  // Actions
  fetchStudies: () => Promise<void>;
  createStudy: (studyData: StudyInput) => Promise<Study>;
  updateStudy: (studyId: string, updates: Partial<Study>) => Promise<void>;
  deleteStudy: (studyId: string) => Promise<void>;
  setCurrentStudy: (study: Study | null) => void;
  
  fetchParticipants: (studyId?: string) => Promise<void>;
  inviteParticipant: (studyId: string, participantData: { email: string; name?: string }) => Promise<void>;
  updateParticipant: (participantId: string, updates: Partial<IParticipant>) => Promise<void>;
  
  fetchSessions: (studyId?: string) => Promise<void>;
  createSession: (sessionData: Partial<ISession>) => Promise<ISession>;
  updateSession: (sessionId: string, updates: Partial<ISession>) => Promise<void>;
}

export const useAppStore = create<AppState>((set) => ({
  // Initial state
  studies: [],
  currentStudy: null,
  studiesLoading: false,
  participants: [],
  participantsLoading: false,
  sessions: [],
  sessionsLoading: false,  // Study actions
  fetchStudies: async () => {
    set({ studiesLoading: true });
    try {
      const response = await studiesService.getStudies();
      set({ studies: response.studies, studiesLoading: false });
    } catch (error: unknown) {
      set({ studiesLoading: false });
      const message = getErrorMessage(error, 'Failed to fetch studies');
      toast.error(message);
    }
  },  createStudy: async (studyData: StudyInput) => {
    try {
      const response = await studiesService.createStudy({
        title: studyData.title,
        description: studyData.description,
        type: studyData.type,
        targetParticipants: studyData.settings.maxParticipants,
        duration: studyData.settings.duration,
        compensation: studyData.settings.compensation,
        requirements: [],
        tasks: [],
        settings: {
          recordScreen: studyData.settings.recordScreen,
          recordAudio: studyData.settings.recordAudio,
          recordWebcam: false,
          trackClicks: true,
          trackHovers: true,
          trackScrolls: true,
        }
      });
      
      const newStudy = response.study as unknown as Study;
      
      set((state) => ({
        studies: [newStudy, ...state.studies]
      }));
      
      // Show success message with points information if available
      if (response.pointsDeducted) {
        toast.success(`Study created successfully! ${response.pointsDeducted} points deducted.`);
      } else {
        toast.success('Study created successfully');
      }
      
      return newStudy;
    } catch (error: unknown) {
      const message = getErrorMessage(error, 'Failed to create study');
      toast.error(message);
      throw error;
    }
  },updateStudy: async (studyId: string, updates: Partial<Study>) => {
    try {
      // Create comprehensive update data that includes all study fields
      const updateData: Partial<CreateStudyRequest> & { status?: StudyStatus } = {
        title: updates.title,
        description: updates.description,
        status: updates.status,
        type: updates.type,
        targetParticipants: updates.settings?.maxParticipants,
        duration: updates.settings?.duration,
        compensation: updates.settings?.compensation,        tasks: updates.tasks?.map(task => {
          // Handle both string and ITask types
          if (typeof task === 'string') {
            // If it's a string, we can't extract task details
            return {
              title: task,
              description: '',
              type: 'navigation' as const,
              order: 0,
              configuration: {
                instructions: '',
                heatmapTracking: false,
                clickTracking: false,
                scrollTracking: false
              },
              isRequired: true
            };
          } else {
            // It's an ITask object
            return {
              title: task.title,
              description: task.description,
              type: task.type,
              order: task.order,
              configuration: task.configuration,
              isRequired: task.isRequired,
              successCriteria: task.successCriteria,
              timeLimit: task.timeLimit
            };
          }
        }),
        settings: updates.settings ? {
          recordScreen: Boolean(updates.settings.recordScreen),
          recordAudio: Boolean(updates.settings.recordAudio),
          recordWebcam: false,
          trackClicks: true,
          trackHovers: true,
          trackScrolls: true,
        } : undefined
      };

      // Remove undefined values to avoid issues
      Object.keys(updateData).forEach(key => {
        if (updateData[key as keyof typeof updateData] === undefined) {
          delete updateData[key as keyof typeof updateData];
        }
      });

      const response = await studiesService.updateStudy(studyId, updateData);
      const updatedStudy = response.study;
      
      set((state) => ({
        studies: state.studies.map(study => 
          study._id === studyId ? updatedStudy : study
        ),
        currentStudy: state.currentStudy?._id === studyId ? updatedStudy : state.currentStudy
      }));
      
      toast.success('Study updated successfully');
    } catch (error: unknown) {
      const message = getErrorMessage(error, 'Failed to update study');
      toast.error(message);
      throw error;
    }
  },
  deleteStudy: async (studyId: string) => {
    try {
      await studiesService.deleteStudy(studyId);
      
      set((state) => ({
        studies: state.studies.filter(study => study._id !== studyId),
        currentStudy: state.currentStudy?._id === studyId ? null : state.currentStudy
      }));
      
      toast.success('Study deleted successfully');
    } catch (error: unknown) {
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
      const response = await participantsService.getParticipants(studyId ? { studyId } : {});
      set({ participants: response.participants, participantsLoading: false });
    } catch (error: unknown) {
      set({ participantsLoading: false });
      const message = getErrorMessage(error, 'Failed to fetch participants');
      toast.error(message);
    }
  },  inviteParticipant: async (studyId: string, participantData: { email: string; name?: string }) => {
    try {
      const response = await participantsService.inviteParticipant({
        studyId,
        email: participantData.email,
        firstName: participantData.name?.split(' ')[0] || '',
        lastName: participantData.name?.split(' ').slice(1).join(' ') || '',
        demographics: {}
      });
      const newParticipant = response.participant;
      
      set((state) => ({
        participants: [newParticipant, ...state.participants]
      }));
      
      toast.success('Participant invited successfully');
    } catch (error: unknown) {
      const message = getErrorMessage(error, 'Failed to invite participant');
      toast.error(message);
      throw error;
    }
  },  updateParticipant: async (participantId: string, updates: Partial<IParticipant>) => {
    try {
      const response = await participantsService.updateParticipant(participantId, {
        status: updates.status as 'invited' | 'accepted' | 'declined' | 'completed' | 'no_show' | undefined,
        firstName: updates.firstName,
        lastName: updates.lastName,
        demographics: updates.demographics,
        notes: (updates as { notes?: string }).notes
      });
      const updatedParticipant = response.participant;
      
      set((state) => ({
        participants: state.participants.map(participant => 
          participant._id === participantId ? updatedParticipant : participant
        )
      }));
      
      toast.success('Participant updated successfully');
    } catch (error: unknown) {
      const message = getErrorMessage(error, 'Failed to update participant');
      toast.error(message);
      throw error;
    }
  },
  // Session actions
  fetchSessions: async (studyId?: string) => {
    set({ sessionsLoading: true });
    try {
      const response = await sessionsService.getSessions(studyId ? { studyId } : {});
      set({ sessions: response.sessions, sessionsLoading: false });
    } catch (error: unknown) {
      set({ sessionsLoading: false });
      const message = getErrorMessage(error, 'Failed to fetch sessions');
      toast.error(message);
    }
  },

  createSession: async (sessionData: Partial<ISession>) => {    try {      // Extract studyId and participant info from sessionData
      const studyId = typeof sessionData.studyId === 'string' 
        ? sessionData.studyId 
        : sessionData.studyId?._id;
      if (!studyId) {
        throw new Error('Study ID is required to create a session');
      }
      
      const participantInfo = {
        email: (sessionData as { email?: string }).email || '',
        firstName: (sessionData as { firstName?: string }).firstName || '',
        lastName: (sessionData as { lastName?: string }).lastName || ''
      };
        const response = await sessionsService.startSession(studyId, participantInfo);
      const newSession = response.session || (response.data as ISession);
      
      if (newSession) {
        set((state) => ({
          sessions: [newSession, ...state.sessions]
        }));
      }
      
      toast.success('Session created successfully');
      return newSession as ISession;
    } catch (error: unknown) {
      const message = getErrorMessage(error, 'Failed to create session');
      toast.error(message);
      throw error;
    }
  },

  updateSession: async (sessionId: string, updates: Partial<ISession>) => {    try {
      // Cast to the expected UpdateSessionRequest format
      const updateData = {
        status: updates.status === 'no_show' ? 'abandoned' as const : updates.status,
        feedback: (updates as { feedback?: Record<string, unknown> }).feedback,
        data: (updates as { data?: Record<string, unknown> }).data,
      };
      
      const response = await sessionsService.updateSession(sessionId, updateData);
      const updatedSession = response.session || (response.data as ISession);
      
      if (updatedSession) {
        set((state) => ({
          sessions: state.sessions.map(session => 
            session._id === sessionId ? updatedSession : session
          )
        }));
      }
      
      toast.success('Session updated successfully');
    } catch (error: unknown) {
      const message = getErrorMessage(error, 'Failed to update session');
      toast.error(message);
      throw error;
    }
  },
}));
