import React, { useState, useEffect, useMemo } from 'react';
import { 
  Trophy, 
  Star, 
  Zap, 
  Target, 
  Award,
  Crown,
  Gift,
  TrendingUp,
  Users,
  Calendar,
  CheckCircle,
  Flame
} from 'lucide-react';

// Gamification Types
export interface ParticipantPoints {
  total: number;
  available: number;
  lifetime: number;
  thisMonth: number;
  thisWeek: number;
  rank: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
  category: 'completion' | 'quality' | 'consistency' | 'collaboration' | 'special';
}

export interface LeaderboardEntry {
  rank: number;
  participantId: string;
  name: string;
  points: number;
  avatar?: string;
  badge?: string;
  studiesCompleted: number;
  joinedAt: string;
}

export interface EngagementStreak {
  current: number;
  longest: number;
  lastActivityDate: string;
  multiplier: number;
}

export interface ChallengeEntry {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'special';
  startDate: string;
  endDate: string;
  pointReward: number;
  progress: number;
  maxProgress: number;
  completed: boolean;
  participantCount: number;
}

// Points Calculation System
export class PointsCalculator {
  private static BASE_COMPLETION_POINTS = 50;
  private static QUALITY_BONUS_MULTIPLIER = 0.5;
  private static STREAK_MULTIPLIER = 0.1;
  private static TIME_BONUS_THRESHOLD = 0.8; // Complete in 80% of estimated time
  
  static calculateStudyPoints(
    studyDuration: number,
    compensation: number,
    qualityScore: number,
    completionRate: number,
    timeEfficiency: number,
    streakMultiplier: number = 1
  ): number {
    // Base points from study compensation and duration
    const basePoints = Math.floor(compensation * 0.5) + Math.floor(studyDuration * 0.5);
    
    // Quality bonus (0-50% bonus based on quality score)
    const qualityBonus = basePoints * this.QUALITY_BONUS_MULTIPLIER * (qualityScore / 100);
    
    // Completion bonus
    const completionBonus = basePoints * 0.2 * (completionRate / 100);
    
    // Time efficiency bonus
    const timeBonus = timeEfficiency <= this.TIME_BONUS_THRESHOLD ? basePoints * 0.3 : 0;
    
    // Apply streak multiplier
    const totalPoints = (basePoints + qualityBonus + completionBonus + timeBonus) * streakMultiplier;
    
    return Math.floor(totalPoints);
  }
  
  static calculateAchievementPoints(rarity: Achievement['rarity']): number {
    const rarityMultipliers = {
      common: 25,
      rare: 75,
      epic: 200,
      legendary: 500
    };
    
    return rarityMultipliers[rarity];
  }
  
  static calculateStreakMultiplier(streakDays: number): number {
    return 1 + (streakDays * this.STREAK_MULTIPLIER);
  }
}

// Achievement System
export class AchievementSystem {
  private static achievements: Achievement[] = [
    // Completion achievements
    {
      id: 'first_study',
      title: 'First Steps',
      description: 'Complete your first study',
      icon: '🎯',
      rarity: 'common',
      points: 25,
      maxProgress: 1,
      category: 'completion'
    },
    {
      id: 'study_marathon',
      title: 'Marathon Runner',
      description: 'Complete 10 studies',
      icon: '🏃‍♀️',
      rarity: 'rare',
      points: 75,
      maxProgress: 10,
      category: 'completion'
    },
    {
      id: 'study_master',
      title: 'Study Master',
      description: 'Complete 50 studies',
      icon: '👑',
      rarity: 'epic',
      points: 200,
      maxProgress: 50,
      category: 'completion'
    },
    {
      id: 'research_legend',
      title: 'Research Legend',
      description: 'Complete 100 studies',
      icon: '🏆',
      rarity: 'legendary',
      points: 500,
      maxProgress: 100,
      category: 'completion'
    },
    
    // Quality achievements
    {
      id: 'quality_contributor',
      title: 'Quality Contributor',
      description: 'Maintain 4.5+ star rating for 5 studies',
      icon: '⭐',
      rarity: 'rare',
      points: 75,
      maxProgress: 5,
      category: 'quality'
    },
    {
      id: 'perfect_score',
      title: 'Perfect Score',
      description: 'Receive 5-star rating on a study',
      icon: '💯',
      rarity: 'epic',
      points: 200,
      maxProgress: 1,
      category: 'quality'
    },
    
    // Consistency achievements
    {
      id: 'daily_dedication',
      title: 'Daily Dedication',
      description: 'Complete studies for 7 consecutive days',
      icon: '🔥',
      rarity: 'rare',
      points: 75,
      maxProgress: 7,
      category: 'consistency'
    },
    {
      id: 'unstoppable',
      title: 'Unstoppable',
      description: 'Maintain a 30-day streak',
      icon: '⚡',
      rarity: 'epic',
      points: 200,
      maxProgress: 30,
      category: 'consistency'
    },
    
    // Special achievements
    {
      id: 'early_bird',
      title: 'Early Bird',
      description: 'Complete a study before 8 AM',
      icon: '🌅',
      rarity: 'common',
      points: 25,
      maxProgress: 1,
      category: 'special'
    },
    {
      id: 'night_owl',
      title: 'Night Owl',
      description: 'Complete a study after 10 PM',
      icon: '🦉',
      rarity: 'common',
      points: 25,
      maxProgress: 1,
      category: 'special'
    },
    {
      id: 'speed_demon',
      title: 'Speed Demon',
      description: 'Complete a study in less than 60% of estimated time',
      icon: '💨',
      rarity: 'rare',
      points: 75,
      maxProgress: 1,
      category: 'special'
    }
  ];
  
  static getAllAchievements(): Achievement[] {
    return this.achievements;
  }
  
  static checkAchievements(participantData: any): Achievement[] {
    // Mock implementation - would check against real participant data
    const unlockedAchievements: Achievement[] = [];
    
    // Simulate some unlocked achievements
    if (participantData.studiesCompleted >= 1) {
      unlockedAchievements.push({
        ...this.achievements.find(a => a.id === 'first_study')!,
        unlockedAt: new Date().toISOString(),
        progress: 1
      });
    }
    
    if (participantData.studiesCompleted >= 10) {
      unlockedAchievements.push({
        ...this.achievements.find(a => a.id === 'study_marathon')!,
        unlockedAt: new Date().toISOString(),
        progress: 10
      });
    }
    
    return unlockedAchievements;
  }
}

// Gamification API Service
class GamificationAPI {
  private baseUrl: string;
  
  constructor(baseUrl = 'http://localhost:3003/api') {
    this.baseUrl = baseUrl;
  }
  
  async getParticipantPoints(): Promise<ParticipantPoints> {
    // Mock implementation
    return {
      total: 1250,
      available: 850,
      lifetime: 2100,
      thisMonth: 450,
      thisWeek: 125,
      rank: 15
    };
  }
  
  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    // Mock implementation
    return [
      {
        rank: 1,
        participantId: 'p1',
        name: 'Sarah Chen',
        points: 2850,
        studiesCompleted: 45,
        joinedAt: '2024-12-01T00:00:00Z',
        badge: '👑'
      },
      {
        rank: 2,
        participantId: 'p2',
        name: 'Michael Johnson',
        points: 2720,
        studiesCompleted: 42,
        joinedAt: '2024-11-15T00:00:00Z',
        badge: '🥈'
      },
      {
        rank: 3,
        participantId: 'p3',
        name: 'Emily Davis',
        points: 2650,
        studiesCompleted: 38,
        joinedAt: '2024-12-10T00:00:00Z',
        badge: '🥉'
      },
      // More mock entries...
      {
        rank: 15,
        participantId: 'current',
        name: 'You',
        points: 1250,
        studiesCompleted: 12,
        joinedAt: '2025-01-01T00:00:00Z'
      }
    ];
  }
  
  async getEngagementStreak(): Promise<EngagementStreak> {
    return {
      current: 7,
      longest: 15,
      lastActivityDate: new Date().toISOString(),
      multiplier: 1.7
    };
  }
  
  async getChallenges(): Promise<ChallengeEntry[]> {
    return [
      {
        id: 'weekly_warrior',
        title: 'Weekly Warrior',
        description: 'Complete 5 studies this week',
        type: 'weekly',
        startDate: '2025-01-13T00:00:00Z',
        endDate: '2025-01-19T23:59:59Z',
        pointReward: 100,
        progress: 3,
        maxProgress: 5,
        completed: false,
        participantCount: 147
      },
      {
        id: 'quality_focus',
        title: 'Quality Focus',
        description: 'Achieve 4.5+ star rating on 3 studies',
        type: 'weekly',
        startDate: '2025-01-13T00:00:00Z',
        endDate: '2025-01-19T23:59:59Z',
        pointReward: 150,
        progress: 1,
        maxProgress: 3,
        completed: false,
        participantCount: 89
      },
      {
        id: 'daily_dedication',
        title: 'Daily Dedication',
        description: 'Complete at least one study today',
        type: 'daily',
        startDate: '2025-01-15T00:00:00Z',
        endDate: '2025-01-15T23:59:59Z',
        pointReward: 25,
        progress: 0,
        maxProgress: 1,
        completed: false,
        participantCount: 234
      }
    ];
  }
}

// Main Gamification Dashboard Component
export const GamificationDashboard: React.FC<{
  participantId: string;
  className?: string;
}> = ({ participantId, className = '' }) => {
  const [points, setPoints] = useState<ParticipantPoints | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [streak, setStreak] = useState<EngagementStreak | null>(null);
  const [challenges, setChallenges] = useState<ChallengeEntry[]>([]);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'achievements' | 'leaderboard' | 'challenges'>('overview');
  
  const api = useMemo(() => new GamificationAPI(), []);
  
  // Load gamification data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [pointsData, leaderboardData, streakData, challengesData] = await Promise.all([
          api.getParticipantPoints(),
          api.getLeaderboard(),
          api.getEngagementStreak(),
          api.getChallenges()
        ]);
        
        setPoints(pointsData);
        setLeaderboard(leaderboardData);
        setStreak(streakData);
        setChallenges(challengesData);
        
        // Get achievements
        const allAchievements = AchievementSystem.getAllAchievements();
        const unlockedAchievements = AchievementSystem.checkAchievements({ 
          studiesCompleted: 12,
          averageRating: 4.8 
        });
        
        const achievementsWithStatus = allAchievements.map(achievement => {
          const unlocked = unlockedAchievements.find(u => u.id === achievement.id);
          return unlocked || { ...achievement, progress: 0 };
        });
        
        setAchievements(achievementsWithStatus);
        
      } catch (error) {
        console.error('Failed to load gamification data:', error);
      }
    };
    
    loadData();
  }, [participantId, api]);
  
  // Get rarity color
  const getRarityColor = (rarity: Achievement['rarity']) => {
    const colors = {
      common: 'bg-gray-100 border-gray-300 text-gray-800',
      rare: 'bg-blue-100 border-blue-300 text-blue-800',
      epic: 'bg-purple-100 border-purple-300 text-purple-800',
      legendary: 'bg-yellow-100 border-yellow-300 text-yellow-800'
    };
    return colors[rarity];
  };
  
  // Get challenge type color
  const getChallengeTypeColor = (type: ChallengeEntry['type']) => {
    const colors = {
      daily: 'bg-green-100 text-green-800',
      weekly: 'bg-blue-100 text-blue-800',
      monthly: 'bg-purple-100 text-purple-800',
      special: 'bg-orange-100 text-orange-800'
    };
    return colors[type];
  };
  
  if (!points || !streak) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Gamification</h3>
        <p className="text-gray-600">Getting your points, achievements, and challenges...</p>
      </div>
    );
  }
  
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Points and Streak */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold mb-2">Your Progress</h2>
            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <Star className="w-6 h-6 mr-2" />
                <div>
                  <p className="text-lg font-semibold">{points.total.toLocaleString()} Points</p>
                  <p className="text-blue-100 text-sm">+{points.thisWeek} this week</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Flame className="w-6 h-6 mr-2" />
                <div>
                  <p className="text-lg font-semibold">{streak.current} Day Streak</p>
                  <p className="text-blue-100 text-sm">{streak.multiplier}x multiplier</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Trophy className="w-6 h-6 mr-2" />
                <div>
                  <p className="text-lg font-semibold">Rank #{points.rank}</p>
                  <p className="text-blue-100 text-sm">This month</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-4xl mb-2">🏆</div>
            <p className="text-sm text-blue-100">Keep going!</p>
          </div>
        </div>
      </div>
      
      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'overview', name: 'Overview', icon: Target },
              { id: 'achievements', name: 'Achievements', icon: Award },
              { id: 'leaderboard', name: 'Leaderboard', icon: Crown },
              { id: 'challenges', name: 'Challenges', icon: Zap }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id as any)}
                  className={`${
                    selectedTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>
        
        {/* Tab Content */}
        <div className="p-6">
          {selectedTab === 'overview' && (
            <div className="space-y-6">
              {/* Points Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">Available Points</p>
                      <p className="text-2xl font-bold text-green-900">{points.available.toLocaleString()}</p>
                    </div>
                    <Gift className="w-8 h-8 text-green-600" />
                  </div>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">This Month</p>
                      <p className="text-2xl font-bold text-blue-900">{points.thisMonth.toLocaleString()}</p>
                    </div>
                    <Calendar className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600">Lifetime Total</p>
                      <p className="text-2xl font-bold text-purple-900">{points.lifetime.toLocaleString()}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-purple-600" />
                  </div>
                </div>
              </div>
              
              {/* Recent Achievements */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Achievements</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {achievements.filter(a => a.unlockedAt).slice(0, 3).map(achievement => (
                    <div key={achievement.id} className={`border-2 rounded-lg p-4 ${getRarityColor(achievement.rarity)}`}>
                      <div className="text-center">
                        <div className="text-2xl mb-2">{achievement.icon}</div>
                        <h4 className="font-semibold text-sm">{achievement.title}</h4>
                        <p className="text-xs mt-1">{achievement.description}</p>
                        <div className="flex items-center justify-center mt-2">
                          <Star className="w-3 h-3 mr-1" />
                          <span className="text-xs font-medium">{achievement.points} pts</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Active Challenges */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Active Challenges</h3>
                <div className="space-y-3">
                  {challenges.slice(0, 3).map(challenge => (
                    <div key={challenge.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900">{challenge.title}</h4>
                          <p className="text-sm text-gray-600">{challenge.description}</p>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getChallengeTypeColor(challenge.type)}`}>
                          {challenge.type}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex-1 mr-4">
                          <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>Progress</span>
                            <span>{challenge.progress}/{challenge.maxProgress}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                              style={{ width: `${(challenge.progress / challenge.maxProgress) * 100}%` }}
                            />
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="flex items-center text-green-600">
                            <Star className="w-4 h-4 mr-1" />
                            <span className="font-medium">{challenge.pointReward}</span>
                          </div>
                          <p className="text-xs text-gray-500">{challenge.participantCount} participants</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {selectedTab === 'achievements' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.map(achievement => (
                  <div 
                    key={achievement.id} 
                    className={`border-2 rounded-lg p-4 ${
                      achievement.unlockedAt ? getRarityColor(achievement.rarity) : 'bg-gray-50 border-gray-200 text-gray-400'
                    }`}
                  >
                    <div className="text-center">
                      <div className={`text-2xl mb-2 ${!achievement.unlockedAt ? 'grayscale' : ''}`}>
                        {achievement.icon}
                      </div>
                      <h4 className="font-semibold text-sm">{achievement.title}</h4>
                      <p className="text-xs mt-1">{achievement.description}</p>
                      
                      {achievement.maxProgress && achievement.maxProgress > 1 && (
                        <div className="mt-2">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Progress</span>
                            <span>{achievement.progress || 0}/{achievement.maxProgress}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1">
                            <div 
                              className="bg-blue-600 h-1 rounded-full" 
                              style={{ width: `${((achievement.progress || 0) / achievement.maxProgress) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-center mt-2">
                        <Star className="w-3 h-3 mr-1" />
                        <span className="text-xs font-medium">{achievement.points} pts</span>
                      </div>
                      
                      {achievement.unlockedAt && (
                        <p className="text-xs text-gray-500 mt-1">
                          Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {selectedTab === 'leaderboard' && (
            <div className="space-y-4">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rank
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Participant
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Points
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Studies
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {leaderboard.map((entry) => (
                      <tr 
                        key={entry.participantId}
                        className={entry.participantId === 'current' ? 'bg-blue-50' : ''}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <span className="font-medium">#{entry.rank}</span>
                            {entry.badge && <span className="ml-2">{entry.badge}</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8">
                              <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                                <Users className="w-4 h-4 text-gray-500" />
                              </div>
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">{entry.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                          {entry.points.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {entry.studiesCompleted}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {selectedTab === 'challenges' && (
            <div className="space-y-4">
              {challenges.map(challenge => (
                <div key={challenge.id} className="border rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">{challenge.title}</h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getChallengeTypeColor(challenge.type)}`}>
                          {challenge.type}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-4">{challenge.description}</p>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center text-green-600 mb-1">
                        <Star className="w-5 h-5 mr-1" />
                        <span className="text-lg font-bold">{challenge.pointReward}</span>
                      </div>
                      <p className="text-xs text-gray-500">{challenge.participantCount} participants</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Progress</span>
                      <span>{challenge.progress}/{challenge.maxProgress}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full transition-all duration-300 ${
                          challenge.completed ? 'bg-green-600' : 'bg-blue-600'
                        }`}
                        style={{ width: `${(challenge.progress / challenge.maxProgress) * 100}%` }}
                      />
                    </div>
                    
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">
                        Ends {new Date(challenge.endDate).toLocaleDateString()}
                      </span>
                      {challenge.completed && (
                        <div className="flex items-center text-green-600">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          <span className="font-medium">Completed!</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GamificationDashboard;
