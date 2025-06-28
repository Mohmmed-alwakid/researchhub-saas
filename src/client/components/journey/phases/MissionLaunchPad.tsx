import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MissionData {
  missionName: string;
  missionObjective: string;
  launchTime: string;
  [key: string]: unknown; // Index signature
}

interface JourneyProgress {
  currentPhase: string;
  completedPhases: string[];
  experiencePoints: number;
}

interface MissionLaunchPadProps {
  onAdvance: (data: MissionData) => void;
  journeyProgress: JourneyProgress;
  isTransitioning: boolean;
}

export const MissionLaunchPad: React.FC<MissionLaunchPadProps> = ({
  onAdvance,
  isTransitioning
}) => {
  const [countdown, setCountdown] = useState(5);
  const [isLaunching, setIsLaunching] = useState(false);
  const [missionName, setMissionName] = useState('');
  const [missionObjective, setMissionObjective] = useState('');
  const [allSystemsGo, setAllSystemsGo] = useState(false);

  // Mission name suggestions
  const missionNameSuggestions = [
    'Operation Insight Discovery',
    'Project User Experience',
    'Mission Feedback Quest',
    'Operation Data Explorer',
    'Project User Journey',
    'Mission Research Frontier'
  ];

  // Checklist items
  const [checklist, setChecklist] = useState([
    { id: 'objective', label: 'Define mission objective', completed: false },
    { id: 'name', label: 'Name your mission', completed: false },
    { id: 'readiness', label: 'Confirm mission readiness', completed: false }
  ]);

  // Update checklist based on form completion
  useEffect(() => {
    setChecklist(prev => prev.map(item => {
      if (item.id === 'objective') return { ...item, completed: missionObjective.length > 10 };
      if (item.id === 'name') return { ...item, completed: missionName.length > 3 };
      if (item.id === 'readiness') return { ...item, completed: missionObjective.length > 10 && missionName.length > 3 };
      return item;
    }));
  }, [missionName, missionObjective]);

  // Check if all systems are go
  useEffect(() => {
    setAllSystemsGo(checklist.every(item => item.completed));
  }, [checklist]);

  const handleLaunch = () => {
    if (!allSystemsGo) return;
    
    setIsLaunching(true);
    
    // Start countdown
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          // Advance to next phase
          onAdvance({
            missionName,
            missionObjective,
            launchTime: new Date().toISOString()
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const suggestMissionName = () => {
    const randomName = missionNameSuggestions[Math.floor(Math.random() * missionNameSuggestions.length)];
    setMissionName(randomName);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated Background Stars */}
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-70"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.3, 1, 0.3],
              scale: [1, 1.5, 1]
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          />
        ))}
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-8">
        <div className="max-w-4xl w-full">
          {/* Mission Control Header */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <h1 className="text-6xl font-bold text-white mb-4">
              🚀 MISSION CONTROL
            </h1>
            <p className="text-xl text-gray-300">
              Welcome to your Research Command Center
            </p>
            <div className="mt-4 text-sm text-gray-400">
              Preparing for research mission launch sequence...
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Mission Configuration Panel */}
            <motion.div
              className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 border border-gray-700"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <span className="mr-2">⚙️</span>
                Mission Configuration
              </h2>

              {/* Mission Name Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Mission Name
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={missionName}
                    onChange={(e) => setMissionName(e.target.value)}
                    placeholder="Enter your research mission name..."
                    className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <motion.button
                    onClick={suggestMissionName}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    🎲
                  </motion.button>
                </div>
              </div>

              {/* Mission Objective */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Mission Objective
                </label>
                <textarea
                  value={missionObjective}
                  onChange={(e) => setMissionObjective(e.target.value)}
                  placeholder="Describe what you want to discover through this research..."
                  rows={4}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Pre-flight Checklist */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <span className="mr-2">📋</span>
                  Pre-flight Checklist
                </h3>
                <div className="space-y-3">
                  {checklist.map((item, index) => (
                    <motion.div
                      key={item.id}
                      className="flex items-center space-x-3"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <motion.div
                        className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          item.completed 
                            ? 'bg-green-500 text-white' 
                            : 'bg-gray-600 text-gray-400'
                        }`}
                        animate={item.completed ? { scale: [1, 1.2, 1] } : {}}
                        transition={{ duration: 0.3 }}
                      >
                        {item.completed ? '✓' : '○'}
                      </motion.div>
                      <span className={`${
                        item.completed ? 'text-green-400' : 'text-gray-400'
                      }`}>
                        {item.label}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Launch Control Panel */}
            <motion.div
              className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 border border-gray-700"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
            >
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <span className="mr-2">🎯</span>
                Launch Control
              </h2>

              {/* Rocket Animation */}
              <div className="flex justify-center mb-8">
                <motion.div
                  className="text-8xl"
                  animate={isLaunching ? {
                    y: [-10, -100, -200],
                    rotate: [0, 0, 15],
                    scale: [1, 1.2, 0.5]
                  } : {
                    y: [0, -10, 0]
                  }}
                  transition={isLaunching ? {
                    duration: 3,
                    ease: "easeOut"
                  } : {
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  🚀
                </motion.div>
              </div>

              {/* System Status */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-300">System Status:</span>
                  <span className={`font-semibold ${
                    allSystemsGo ? 'text-green-400' : 'text-yellow-400'
                  }`}>
                    {allSystemsGo ? 'ALL SYSTEMS GO' : 'PREPARING...'}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <motion.div
                    className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ 
                      width: `${(checklist.filter(item => item.completed).length / checklist.length) * 100}%` 
                    }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              {/* Countdown Display */}
              <AnimatePresence>
                {isLaunching && (
                  <motion.div
                    className="text-center mb-6"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                  >
                    <div className="text-6xl font-bold text-yellow-400 mb-2">
                      {countdown}
                    </div>
                    <div className="text-lg text-gray-300">
                      LAUNCHING IN...
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Launch Button */}
              <motion.button
                onClick={handleLaunch}
                disabled={!allSystemsGo || isTransitioning}
                className={`w-full py-4 rounded-lg font-bold text-xl transition-all duration-300 ${
                  allSystemsGo && !isTransitioning
                    ? 'bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
                whileHover={allSystemsGo ? { scale: 1.02 } : {}}
                whileTap={allSystemsGo ? { scale: 0.98 } : {}}
                animate={allSystemsGo ? {
                  boxShadow: [
                    '0 0 20px rgba(34, 197, 94, 0.3)',
                    '0 0 40px rgba(59, 130, 246, 0.3)',
                    '0 0 20px rgba(34, 197, 94, 0.3)'
                  ]
                } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {isLaunching ? '🚀 LAUNCHING...' : 
                 allSystemsGo ? '🚀 INITIATE LAUNCH SEQUENCE' : 
                 '⏳ COMPLETE CHECKLIST TO LAUNCH'}
              </motion.button>

              {/* Voice Over Simulation */}
              {allSystemsGo && !isLaunching && (
                <motion.div
                  className="mt-4 text-center text-sm text-green-400"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <span className="animate-pulse">
                    🎧 "Mission Control to Researcher, all systems go for launch"
                  </span>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};
