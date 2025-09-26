import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { JourneyAssistant } from './JourneyAssistant';
import { JourneyPhase, JourneyProgress } from './types';
import { JourneyProgressConstellation } from './JourneyProgressConstellation';
import { MissionLaunchPad } from './phases/MissionLaunchPad';
import { PhaseTransitionEffect, MicroCelebration } from './JourneyEffects';
import { StudyTypeAdventure } from './phases/StudyTypeAdventure';


// Placeholder components for remaining phases
interface PlaceholderProps {
  onAdvance?: (data: Record<string, unknown>) => void;
  journeyProgress?: JourneyProgress;
  isTransitioning?: boolean;
}

const TemplateEquipmentLocker: React.FC<PlaceholderProps> = ({ onAdvance }) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 to-indigo-900">
    <div className="text-center text-white">
      <h1 className="text-4xl font-bold mb-4">🗂️ Equipment Locker</h1>
      <p className="mb-8">Coming Soon - Template Selection Phase</p>
      <button 
        onClick={() => onAdvance?.({})}
        className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg"
      >
        Continue to Next Phase
      </button>
    </div>
  </div>
);

const ConfigurationLaboratory: React.FC<PlaceholderProps> = ({ onAdvance }) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-900 to-blue-900">
    <div className="text-center text-white">
      <h1 className="text-4xl font-bold mb-4">⚙️ Configuration Laboratory</h1>
      <p className="mb-8">Coming Soon - Study Configuration Phase</p>
      <button 
        onClick={() => onAdvance?.({})}
        className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg"
      >
        Continue to Next Phase
      </button>
    </div>
  </div>
);

const StudyBroadcastCenter: React.FC<PlaceholderProps> = ({ onAdvance }) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-900 to-red-900">
    <div className="text-center text-white">
      <h1 className="text-4xl font-bold mb-4">📢 Broadcast Center</h1>
      <p className="mb-8">Coming Soon - Study Sharing Phase</p>
      <button 
        onClick={() => onAdvance?.({})}
        className="px-6 py-3 bg-orange-600 hover:bg-orange-700 rounded-lg"
      >
        Continue to Next Phase
      </button>
    </div>
  </div>
);

const ParticipantAdventurePortal: React.FC<PlaceholderProps> = ({ onAdvance }) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-900 to-purple-900">
    <div className="text-center text-white">
      <h1 className="text-4xl font-bold mb-4">👥 Adventure Portal</h1>
      <p className="mb-8">Coming Soon - Participant Registration Phase</p>
      <button 
        onClick={() => onAdvance?.({})}
        className="px-6 py-3 bg-pink-600 hover:bg-pink-700 rounded-lg"
      >
        Continue to Next Phase
      </button>
    </div>
  </div>
);

const ResultsObservatory: React.FC<PlaceholderProps> = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-900 to-orange-900">
    <div className="text-center text-white">
      <h1 className="text-4xl font-bold mb-4">🏆 Results Observatory</h1>
      <p className="mb-8">Congratulations! Your research journey is complete!</p>
      <button 
        onClick={() => window.location.href = '/app/dashboard'}
        className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 rounded-lg"
      >
        Return to Dashboard
      </button>
    </div>
  </div>
);

// Creative Research Journey Orchestrator
export const ResearchJourneyOrchestrator: React.FC = () => {
  const [journeyProgress, setJourneyProgress] = useState<JourneyProgress>({
    currentPhase: JourneyPhase.MISSION_LAUNCH,
    completedPhases: [],
    studyData: {},
    researcherProfile: {},
    achievements: [],
    experiencePoints: 0
  });
  
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // Phase Navigation Handler
  const advanceToNextPhase = (phaseData: Record<string, unknown>) => {
    setIsTransitioning(true);
    
    // Add achievement points
    const pointsEarned = calculatePhasePoints(journeyProgress.currentPhase);
    
    // Update progress
    setJourneyProgress(prev => ({
      ...prev,
      completedPhases: [...prev.completedPhases, prev.currentPhase],
      currentPhase: getNextPhase(prev.currentPhase),
      studyData: { ...prev.studyData, ...phaseData },
      experiencePoints: prev.experiencePoints + pointsEarned
    }));

    // Show micro-celebration
    setShowCelebration(true);
    setTimeout(() => {
      setShowCelebration(false);
      setIsTransitioning(false);
    }, 2000);
  };

  // Phase Component Mapping
  const renderCurrentPhase = () => {
    const phaseProps = {
      onAdvance: advanceToNextPhase,
      journeyProgress,
      isTransitioning
    };

    switch (journeyProgress.currentPhase) {
      case JourneyPhase.MISSION_LAUNCH:
        return <MissionLaunchPad {...phaseProps} />;
      case JourneyPhase.ADVENTURE_SELECTION:
        return <StudyTypeAdventure {...phaseProps} />;
      case JourneyPhase.EQUIPMENT_LOCKER:
        return <TemplateEquipmentLocker {...phaseProps} />;
      case JourneyPhase.GEAR_CALIBRATION:
        return <ConfigurationLaboratory {...phaseProps} />;
      case JourneyPhase.RALLY_COMMAND:
        return <StudyBroadcastCenter {...phaseProps} />;
      case JourneyPhase.HERO_REGISTRATION:
        return <ParticipantAdventurePortal {...phaseProps} />;
      case JourneyPhase.DISCOVERY_CELEBRATION:
        return <ResultsObservatory {...phaseProps} />;
      default:
        return <MissionLaunchPad {...phaseProps} />;
    }
  };

  return (
    <div className="research-journey-container">
      {/* Journey Progress Constellation */}
      <JourneyProgressConstellation progress={journeyProgress} />
      
      {/* Phase Transition Effects */}
      <AnimatePresence mode="wait">
        {isTransitioning && (
          <PhaseTransitionEffect 
            fromPhase={journeyProgress.currentPhase}
            toPhase={getNextPhase(journeyProgress.currentPhase)}
          />
        )}
      </AnimatePresence>

      {/* Achievement Celebration */}
      <AnimatePresence>
        {showCelebration && (
          <MicroCelebration 
            achievement="Phase Completed!"
            points={calculatePhasePoints(journeyProgress.currentPhase)}
          />
        )}
      </AnimatePresence>

      {/* Main Phase Content */}
      <motion.div
        key={journeyProgress.currentPhase}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="phase-content"
      >
        {renderCurrentPhase()}
      </motion.div>

      {/* Journey Assistant */}
      <JourneyAssistant progress={journeyProgress} />
    </div>
  );
};

// Helper Functions
const getNextPhase = (currentPhase: JourneyPhase): JourneyPhase => {
  const phases = Object.values(JourneyPhase);
  const currentIndex = phases.indexOf(currentPhase);
  return phases[currentIndex + 1] || JourneyPhase.DISCOVERY_CELEBRATION;
};

const calculatePhasePoints = (phase: JourneyPhase): number => {
  const pointMap = {
    [JourneyPhase.MISSION_LAUNCH]: 100,
    [JourneyPhase.ADVENTURE_SELECTION]: 150,
    [JourneyPhase.EQUIPMENT_LOCKER]: 200,
    [JourneyPhase.GEAR_CALIBRATION]: 300,
    [JourneyPhase.RALLY_COMMAND]: 250,
    [JourneyPhase.HERO_REGISTRATION]: 400,
    [JourneyPhase.DISCOVERY_CELEBRATION]: 500
  };
  return pointMap[phase] || 0;
};
