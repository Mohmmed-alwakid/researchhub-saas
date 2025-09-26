import React from 'react';
import { motion } from 'framer-motion';
import { JourneyPhase } from './types';

interface JourneyProgressConstellationProps {
  progress: {
    currentPhase: JourneyPhase;
    completedPhases: JourneyPhase[];
    experiencePoints: number;
  };
}

const phaseConfig = {
  [JourneyPhase.MISSION_LAUNCH]: {
    name: 'Mission Launch',
    icon: '🚀',
    position: { x: 10, y: 50 },
    color: '#FF6B6B'
  },
  [JourneyPhase.ADVENTURE_SELECTION]: {
    name: 'Adventure Selection',
    icon: '🗺️',
    position: { x: 25, y: 30 },
    color: '#4ECDC4'
  },
  [JourneyPhase.EQUIPMENT_LOCKER]: {
    name: 'Equipment Locker',
    icon: '🗂️',
    position: { x: 40, y: 60 },
    color: '#45B7D1'
  },
  [JourneyPhase.GEAR_CALIBRATION]: {
    name: 'Gear Calibration',
    icon: '⚙️',
    position: { x: 55, y: 25 },
    color: '#96CEB4'
  },
  [JourneyPhase.RALLY_COMMAND]: {
    name: 'Rally Command',
    icon: '📢',
    position: { x: 70, y: 55 },
    color: '#FFEAA7'
  },
  [JourneyPhase.HERO_REGISTRATION]: {
    name: 'Hero Registration',
    icon: '👥',
    position: { x: 85, y: 35 },
    color: '#DDA0DD'
  },
  [JourneyPhase.DISCOVERY_CELEBRATION]: {
    name: 'Discovery Celebration',
    icon: '🏆',
    position: { x: 95, y: 50 },
    color: '#FFD93D'
  }
};

export const JourneyProgressConstellation: React.FC<JourneyProgressConstellationProps> = ({
  progress
}) => {
  const phases = Object.values(JourneyPhase);

  const getPhaseStatus = (phase: JourneyPhase) => {
    if (progress.completedPhases.includes(phase)) return 'completed';
    if (progress.currentPhase === phase) return 'current';
    return 'upcoming';
  };

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-gray-900/90 backdrop-blur-md rounded-2xl px-6 py-4 border border-gray-700">
        {/* Experience Points Display */}
        <div className="text-center mb-4">
          <div className="text-2xl font-bold text-yellow-400">
            {progress.experiencePoints} XP
          </div>
          <div className="text-sm text-gray-400">Research Experience</div>
        </div>

        {/* Constellation Progress */}
        <div className="relative w-96 h-24">
          {/* Connection Lines */}
          <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
            {phases.slice(0, -1).map((phase, index) => {
              const currentConfig = phaseConfig[phase];
              const nextConfig = phaseConfig[phases[index + 1]];
              const isActive = progress.completedPhases.includes(phase) || 
                             progress.currentPhase === phase ||
                             progress.currentPhase === phases[index + 1];
              
              return (
                <motion.line
                  key={`${phase}-line`}
                  x1={`${currentConfig.position.x}%`}
                  y1={`${currentConfig.position.y}%`}
                  x2={`${nextConfig.position.x}%`}
                  y2={`${nextConfig.position.y}%`}
                  stroke={isActive ? '#4ECDC4' : '#374151'}
                  strokeWidth="2"
                  strokeDasharray={isActive ? "0" : "5,5"}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: isActive ? 1 : 0.3 }}
                  transition={{ duration: 1, delay: index * 0.2 }}
                />
              );
            })}
          </svg>

          {/* Phase Stars */}
          {phases.map((phase) => {
            const config = phaseConfig[phase];
            const status = getPhaseStatus(phase);
            
            return (
              <motion.div
                key={phase}
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${config.position.x}%`,
                  top: `${config.position.y}%`,
                  zIndex: 2
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: status === 'current' ? 1.2 : 1, 
                  opacity: 1 
                }}
                transition={{ duration: 0.5, delay: phases.indexOf(phase) * 0.1 }}
              >
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-lg
                    border-2 transition-all duration-300 cursor-pointer
                    ${status === 'completed' 
                      ? 'bg-green-500 border-green-400 shadow-lg shadow-green-500/50' 
                      : status === 'current'
                      ? 'bg-blue-500 border-blue-400 shadow-lg shadow-blue-500/50 animate-pulse'
                      : 'bg-gray-600 border-gray-500'
                    }
                  `}
                  style={{
                    boxShadow: status !== 'upcoming' 
                      ? `0 0 20px ${config.color}40` 
                      : 'none'
                  }}
                >
                  {status === 'completed' ? '✨' : config.icon}
                </div>
                
                {/* Phase Name Tooltip */}
                <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    {config.name}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
