import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';


interface StudyTypeData {
  selectedType: string;
  researchGoals: string[];
  estimatedDuration: string;
  [key: string]: unknown; // Index signature
}

interface JourneyProgress {
  currentPhase: string;
  completedPhases: string[];
  experiencePoints: number;
}

interface StudyTypeAdventureProps {
  onAdvance: (data: StudyTypeData) => void;
  journeyProgress: JourneyProgress;
  isTransitioning: boolean;
}

interface StudyTypeCard {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  difficulty: 'Bronze' | 'Silver' | 'Gold';
  duration: string;
  goals: string[];
  color: string;
  preview: string;
}

const studyTypes: StudyTypeCard[] = [
  {
    id: 'usability_testing',
    title: 'The User Detective Story',
    subtitle: 'Usability Testing',
    description: 'Uncover hidden usability secrets by observing how users interact with your design',
    icon: '🔍',
    difficulty: 'Silver',
    duration: '30-60 minutes',
    goals: ['Identify usability issues', 'Observe user behavior', 'Test specific features'],
    color: 'from-blue-500 to-cyan-500',
    preview: 'Watch users navigate your interface and discover pain points'
  },
  {
    id: 'survey_research',
    title: 'The Insight Collector Quest',
    subtitle: 'Survey Research',
    description: 'Gather precious feedback treasures from your target audience',
    icon: '📊',
    difficulty: 'Bronze',
    duration: '10-20 minutes',
    goals: ['Collect quantitative data', 'Measure satisfaction', 'Gather opinions'],
    color: 'from-green-500 to-emerald-500',
    preview: 'Collect structured feedback from large groups of participants'
  },
  {
    id: 'card_sorting',
    title: 'The Organization Master Challenge',
    subtitle: 'Card Sorting',
    description: 'Master the art of information architecture through strategic sorting',
    icon: '🃏',
    difficulty: 'Silver',
    duration: '20-30 minutes',
    goals: ['Improve information architecture', 'Understand mental models', 'Optimize navigation'],
    color: 'from-purple-500 to-pink-500',
    preview: 'Help users organize content the way that makes sense to them'
  },
  {
    id: 'ab_testing',
    title: 'The Experiment Laboratory',
    subtitle: 'A/B Testing',
    description: 'Discover the winning formula through controlled experiments',
    icon: '🧪',
    difficulty: 'Gold',
    duration: '15-45 minutes',
    goals: ['Compare design variants', 'Measure performance', 'Data-driven decisions'],
    color: 'from-orange-500 to-red-500',
    preview: 'Test different versions to find what works best'
  },
  {
    id: 'moderated_interview',
    title: 'The Deep Insight Expedition',
    subtitle: 'Moderated Interview',
    description: 'Embark on a journey to uncover deep user insights through conversation',
    icon: '🎤',
    difficulty: 'Gold',
    duration: '45-90 minutes',
    goals: ['Understand user motivations', 'Explore behaviors', 'Gather qualitative insights'],
    color: 'from-indigo-500 to-purple-500',
    preview: 'Have deep conversations to understand user needs and motivations'
  },
  {
    id: 'unmoderated_testing',
    title: 'The Independent Explorer Mission',
    subtitle: 'Unmoderated Testing',
    description: 'Let users explore independently while you observe their natural behavior',
    icon: '🗺️',
    difficulty: 'Bronze',
    duration: '20-40 minutes',
    goals: ['Natural user behavior', 'Scalable insights', 'Remote testing'],
    color: 'from-teal-500 to-blue-500',
    preview: 'Users complete tasks independently in their natural environment'
  }
];

export const StudyTypeAdventure: React.FC<StudyTypeAdventureProps> = ({
  onAdvance,
  isTransitioning
}) => {
  const [selectedType, setSelectedType] = useState<StudyTypeCard | null>(null);
  const [hoveredType, setHoveredType] = useState<string | null>(null);
  const [researchGoals, setResearchGoals] = useState<string[]>([]);

  const handleTypeSelect = (type: StudyTypeCard) => {
    setSelectedType(type);
    setResearchGoals(type.goals);
  };

  const handleAdvance = () => {
    if (!selectedType) return;
    
    onAdvance({
      selectedType: selectedType.id,
      researchGoals,
      estimatedDuration: selectedType.duration
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Bronze': return 'text-amber-400';
      case 'Silver': return 'text-gray-300';
      case 'Gold': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getDifficultyStars = (difficulty: string) => {
    switch (difficulty) {
      case 'Bronze': return '⭐';
      case 'Silver': return '⭐⭐';
      case 'Gold': return '⭐⭐⭐';
      default: return '⭐';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.8, 0.3]
            }}
            transition={{
              duration: Math.random() * 4 + 3,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h1 className="text-5xl font-bold text-white mb-4">
            🗺️ Choose Your Research Adventure
          </h1>
          <p className="text-xl text-gray-300 mb-2">
            Each research method is a unique quest with its own rewards
          </p>
          <div className="text-sm text-gray-400">
            Select the adventure that best matches your research goals
          </div>
        </motion.div>

        {/* Adventure Map */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {studyTypes.map((type, index) => (
            <motion.div
              key={type.id}
              className="relative"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              onHoverStart={() => setHoveredType(type.id)}
              onHoverEnd={() => setHoveredType(null)}
            >
              <motion.div
                className={`
                  relative bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20
                  cursor-pointer transition-all duration-300 h-full
                  ${selectedType?.id === type.id 
                    ? 'ring-2 ring-white shadow-lg shadow-white/25' 
                    : 'hover:bg-white/20'
                  }
                `}
                onClick={() => handleTypeSelect(type)}
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
                animate={selectedType?.id === type.id ? {
                  boxShadow: [
                    '0 0 20px rgba(255, 255, 255, 0.3)',
                    '0 0 40px rgba(255, 255, 255, 0.5)',
                    '0 0 20px rgba(255, 255, 255, 0.3)'
                  ]
                } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {/* Adventure Card Header */}
                <div className="flex items-start justify-between mb-4">
                  <motion.div
                    className="text-4xl"
                    animate={hoveredType === type.id ? {
                      scale: [1, 1.2, 1],
                      rotate: [0, 5, -5, 0]
                    } : {}}
                    transition={{ duration: 0.5 }}
                  >
                    {type.icon}
                  </motion.div>
                  <div className="text-right">
                    <div className={`text-sm font-semibold ${getDifficultyColor(type.difficulty)}`}>
                      {getDifficultyStars(type.difficulty)} {type.difficulty}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {type.duration}
                    </div>
                  </div>
                </div>

                {/* Title and Subtitle */}
                <h3 className="text-xl font-bold text-white mb-2">
                  {type.title}
                </h3>
                <h4 className="text-sm font-medium text-gray-300 mb-3">
                  {type.subtitle}
                </h4>

                {/* Description */}
                <p className="text-gray-400 text-sm leading-relaxed mb-4">
                  {type.description}
                </p>

                {/* Research Goals */}
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-gray-300 uppercase tracking-wide">
                    Quest Objectives:
                  </div>
                  {type.goals.map((goal, goalIndex) => (
                    <motion.div
                      key={goalIndex}
                      className="flex items-start space-x-2 text-xs text-gray-400"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: goalIndex * 0.1 }}
                    >
                      <span className="text-blue-400 mt-0.5">•</span>
                      <span>{goal}</span>
                    </motion.div>
                  ))}
                </div>

                {/* Selected Indicator */}
                {selectedType?.id === type.id && (
                  <motion.div
                    className="absolute top-4 right-4 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    <span className="text-white text-sm">✓</span>
                  </motion.div>
                )}
              </motion.div>

              {/* Hover Preview */}
              <AnimatePresence>
                {hoveredType === type.id && (
                  <motion.div
                    className="absolute top-full left-0 right-0 mt-2 bg-gray-800/95 backdrop-blur-md rounded-lg p-4 border border-gray-700 z-20"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="text-sm text-gray-300">
                      <span className="font-semibold text-white">Preview: </span>
                      {type.preview}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Selected Adventure Details */}
        <AnimatePresence>
          {selectedType && (
            <motion.div
              className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 mb-8"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-white">
                  Adventure Selected: {selectedType.title}
                </h3>
                <motion.div
                  className={`px-4 py-2 rounded-lg bg-gradient-to-r ${selectedType.color} text-white font-semibold`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  Ready to Begin!
                </motion.div>
              </div>
              <p className="text-gray-300 mb-4">
                {selectedType.description}
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold text-white">Duration:</span>
                  <span className="text-gray-300 ml-2">{selectedType.duration}</span>
                </div>
                <div>
                  <span className="font-semibold text-white">Difficulty:</span>
                  <span className={`ml-2 ${getDifficultyColor(selectedType.difficulty)}`}>
                    {selectedType.difficulty}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Continue Button */}
        <div className="text-center">
          <motion.button
            onClick={handleAdvance}
            disabled={!selectedType || isTransitioning}
            className={`
              px-8 py-4 rounded-lg font-bold text-xl transition-all duration-300
              ${selectedType && !isTransitioning
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }
            `}
            whileHover={selectedType ? { scale: 1.05 } : {}}
            whileTap={selectedType ? { scale: 0.95 } : {}}
            animate={selectedType ? {
              boxShadow: [
                '0 0 20px rgba(147, 51, 234, 0.3)',
                '0 0 40px rgba(219, 39, 119, 0.3)',
                '0 0 20px rgba(147, 51, 234, 0.3)'
              ]
            } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {selectedType ? '🚀 Begin Adventure' : '🗺️ Select Your Adventure First'}
          </motion.button>
        </div>
      </div>
    </div>
  );
};
