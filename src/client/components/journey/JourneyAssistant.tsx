import React from 'react';
import { motion } from 'framer-motion';


interface JourneyAssistantProps {
  progress: {
    currentPhase: string;
    experiencePoints: number;
    achievements: string[];
  };
}

export const JourneyAssistant: React.FC<JourneyAssistantProps> = ({
  progress
}) => {
  const getPhaseGuidance = (phase: string) => {
    const guidance = {
      mission_launch: {
        message: "Welcome to your research mission! Let's get started by setting up your study objectives.",
        tips: ["Take your time to define clear goals", "Consider your target audience", "Think about the key questions you want to answer"]
      },
      adventure_selection: {
        message: "Choose your research adventure! Each study type has unique strengths.",
        tips: ["Match the method to your research goals", "Consider participant time commitment", "Think about the data you need to collect"]
      },
      equipment_locker: {
        message: "Select your research toolkit! Templates help you get started quickly.",
        tips: ["Browse templates by category", "Preview before applying", "You can customize any template"]
      },
      gear_calibration: {
        message: "Fine-tune your study configuration! This is where the magic happens.",
        tips: ["Test your participant flow", "Set clear instructions", "Consider accessibility needs"]
      },
      rally_command: {
        message: "Time to recruit participants! Share your study effectively.",
        tips: ["Use clear, engaging descriptions", "Choose the right channels", "Set realistic timelines"]
      },
      hero_registration: {
        message: "Participants are joining your mission! Monitor applications closely.",
        tips: ["Review applications promptly", "Communicate clearly with participants", "Keep them engaged"]
      },
      discovery_celebration: {
        message: "Congratulations! Your insights are ready. Time to celebrate your discoveries!",
        tips: ["Review all data carefully", "Look for unexpected patterns", "Share insights with stakeholders"]
      }
    };

    return guidance[phase as keyof typeof guidance] || guidance.mission_launch;
  };

  const currentGuidance = getPhaseGuidance(progress.currentPhase);

  return (
    <motion.div
      className="fixed bottom-6 right-6 z-40"
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 1 }}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 max-w-sm border border-gray-200 dark:border-gray-700">
        {/* Assistant Avatar */}
        <div className="flex items-start space-x-3 mb-3">
          <motion.div
            className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <span className="text-white text-lg">🤖</span>
          </motion.div>
          <div className="flex-1">
            <div className="font-semibold text-gray-900 dark:text-white text-sm">
              Research Assistant
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Level {Math.floor(progress.experiencePoints / 100) + 1} Helper
            </div>
          </div>
        </div>

        {/* Guidance Message */}
        <div className="mb-3">
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            {currentGuidance.message}
          </p>
        </div>

        {/* Quick Tips */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
            Quick Tips:
          </div>
          {currentGuidance.tips.map((tip, index) => (
            <motion.div
              key={index}
              className="flex items-start space-x-2 text-xs text-gray-600 dark:text-gray-400"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <span className="text-blue-500 mt-0.5">•</span>
              <span>{tip}</span>
            </motion.div>
          ))}
        </div>

        {/* Achievement Badge */}
        {progress.achievements.length > 0 && (
          <motion.div
            className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center space-x-2">
              <span className="text-yellow-500">🏆</span>
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {progress.achievements.length} achievement{progress.achievements.length !== 1 ? 's' : ''} unlocked
              </span>
            </div>
          </motion.div>
        )}

        {/* Minimize Button */}
        <motion.button
          className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <span className="text-xs text-gray-500 dark:text-gray-400">−</span>
        </motion.button>
      </div>
    </motion.div>
  );
};
