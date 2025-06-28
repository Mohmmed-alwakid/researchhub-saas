// Journey Phases
export enum JourneyPhase {
  MISSION_LAUNCH = 'mission_launch',
  ADVENTURE_SELECTION = 'adventure_selection',
  EQUIPMENT_LOCKER = 'equipment_locker',
  GEAR_CALIBRATION = 'gear_calibration',
  RALLY_COMMAND = 'rally_command',
  HERO_REGISTRATION = 'hero_registration',
  DISCOVERY_CELEBRATION = 'discovery_celebration'
}

// Study Data Types
export interface StudyData {
  missionName?: string;
  missionObjective?: string;
  selectedType?: string;
  researchGoals?: string[];
  templateId?: string;
  configuration?: Record<string, unknown>;
  shareSettings?: Record<string, unknown>;
  participantData?: Record<string, unknown>;
  results?: Record<string, unknown>;
}

// Researcher Profile
export interface ResearcherProfile {
  name?: string;
  experience?: string;
  preferences?: Record<string, unknown>;
  achievements?: string[];
}

// Journey Progress State
export interface JourneyProgress {
  currentPhase: JourneyPhase;
  completedPhases: JourneyPhase[];
  studyData: StudyData;
  researcherProfile: ResearcherProfile;
  achievements: string[];
  experiencePoints: number;
}

// Phase Component Props
export interface PhaseComponentProps {
  onAdvance: (data: Record<string, unknown>) => void;
  journeyProgress: JourneyProgress;
  isTransitioning: boolean;
}
