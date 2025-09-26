import React from 'react';
import { motion } from 'framer-motion';


interface PhaseTransitionEffectProps {
  fromPhase: string;
  toPhase: string;
}

export const PhaseTransitionEffect: React.FC<PhaseTransitionEffectProps> = ({
  toPhase
}) => {
  return (
    <motion.div
      className="fixed inset-0 z-50 pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Cosmic Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 via-blue-900/50 to-indigo-900/50" />
      
      {/* Traveling Stars */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-white rounded-full"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            scale: 0
          }}
          animate={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            scale: [0, 1, 0]
          }}
          transition={{
            duration: 2,
            delay: i * 0.1,
            ease: "easeInOut"
          }}
        />
      ))}

      {/* Central Portal Effect */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="relative"
          initial={{ scale: 0, rotate: 0 }}
          animate={{ scale: [0, 1.2, 1], rotate: 360 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        >
          {/* Outer Ring */}
          <motion.div
            className="w-32 h-32 border-4 border-blue-400 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
          
          {/* Inner Ring */}
          <motion.div
            className="absolute inset-4 border-2 border-purple-400 rounded-full"
            animate={{ rotate: -360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
          
          {/* Core */}
          <motion.div
            className="absolute inset-1/2 w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full transform -translate-x-1/2 -translate-y-1/2"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      </div>

      {/* Phase Transition Text */}
      <div className="absolute inset-0 flex items-center justify-center mt-40">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <div className="text-white text-2xl font-bold mb-2">
            Advancing to Next Phase...
          </div>
          <div className="text-gray-300 text-lg">
            Prepare for {toPhase.replace('_', ' ').toLowerCase()}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

interface MicroCelebrationProps {
  achievement: string;
  points: number;
}

export const MicroCelebration: React.FC<MicroCelebrationProps> = ({
  achievement,
  points
}) => {
  return (
    <motion.div
      className="fixed top-1/4 right-8 z-50"
      initial={{ opacity: 0, x: 100, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.8 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-4 rounded-lg shadow-lg">
        <div className="flex items-center space-x-3">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.5, repeat: 2 }}
            className="text-2xl"
          >
            🎉
          </motion.div>
          <div>
            <div className="font-bold text-lg">{achievement}</div>
            <div className="text-sm">+{points} XP</div>
          </div>
        </div>
        
        {/* Confetti particles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-yellow-300 rounded-full"
            initial={{
              x: 20,
              y: 20,
              scale: 0
            }}
            animate={{
              x: Math.random() * 100 - 50,
              y: Math.random() * 100 - 50,
              scale: [0, 1, 0]
            }}
            transition={{
              duration: 1,
              delay: i * 0.1,
              ease: "easeOut"
            }}
          />
        ))}
      </div>
    </motion.div>
  );
};
