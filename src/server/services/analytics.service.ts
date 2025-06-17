import { Study } from '../../database/models/Study.model';
import { User } from '../../database/models/User.model';
import { Participant } from '../../database/models/Participant.model';
import { Recording } from '../../database/models/Recording.model';

interface AnalyticsData {
  totalUsers: number;
  totalStudies: number;
  totalParticipants: number;
  totalRecordings: number;
  studiesThisMonth: number;
  participantsThisMonth: number;
  recordingsThisMonth: number;
  userGrowth: number;
  studyCompletionRate: number;
  averageStudyDuration: number;
  topStudyCategories: Array<{ category: string; count: number }>;
  userEngagement: {
    dailyActiveUsers: number;
    weeklyActiveUsers: number;
    monthlyActiveUsers: number;
  };
  studyAnalytics: {
    pending: number;
    active: number;
    completed: number;
    cancelled: number;
  };
  recentActivity: Array<{
    type: 'study_created' | 'participant_joined' | 'recording_completed' | 'user_registered';
    description: string;
    timestamp: Date;
    userId?: string;
    studyId?: string;
  }>;
}

interface StudyAnalytics {
  studyId: string;
  title: string;
  totalParticipants: number;
  completedSessions: number;
  averageCompletionTime: number;
  completionRate: number;
  totalRecordings: number;
  participantDemographics: {
    ageGroups: Array<{ range: string; count: number }>;
    genders: Array<{ gender: string; count: number }>;
    locations: Array<{ country: string; count: number }>;
  };
  engagementMetrics: {
    averageSessionDuration: number;
    dropOffPoints: Array<{ taskIndex: number; dropOffRate: number }>;
    userFeedback: {
      averageRating: number;
      totalFeedback: number;
    };
  };
  performanceMetrics: {
    taskCompletionRates: Array<{ taskName: string; completionRate: number }>;
    averageTaskDuration: Array<{ taskName: string; avgDuration: number }>;
    errorRates: Array<{ taskName: string; errorRate: number }>;
  };
}

interface UserAnalytics {
  userId: string;
  totalStudiesCreated: number;
  totalParticipants: number;
  totalRecordings: number;
  studyCategories: string[];
  lastActiveDate: Date;
  averageStudyDuration: number;
  studyCompletionRate: number;
  participantRetentionRate: number;
}

class AnalyticsService {
  /**
   * Get comprehensive platform analytics
   */
  async getPlatformAnalytics(): Promise<AnalyticsData> {
    try {
      const now = new Date();
      const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const firstOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

      // Basic counts
      const [
        totalUsers,
        totalStudies,
        totalParticipants,
        totalRecordings,
        studiesThisMonth,
        participantsThisMonth,
        recordingsThisMonth,
        usersLastMonth,
        studiesLastMonth
      ] = await Promise.all([
        User.countDocuments({}),
        Study.countDocuments({}),
        Participant.countDocuments({}),
        Recording.countDocuments({}),
        Study.countDocuments({ createdAt: { $gte: firstOfMonth } }),
        Participant.countDocuments({ createdAt: { $gte: firstOfMonth } }),
        Recording.countDocuments({ createdAt: { $gte: firstOfMonth } }),
        User.countDocuments({ 
          createdAt: { $gte: firstOfLastMonth, $lte: lastOfLastMonth } 
        }),
        Study.countDocuments({ 
          createdAt: { $gte: firstOfLastMonth, $lte: lastOfLastMonth } 
        })
      ]);

      // Calculate growth rates
      const userGrowth = usersLastMonth > 0 ? 
        ((totalUsers - usersLastMonth) / usersLastMonth) * 100 : 0;

      // Study completion rate
      const completedStudies = await Study.countDocuments({ status: 'completed' });
      const studyCompletionRate = totalStudies > 0 ? 
        (completedStudies / totalStudies) * 100 : 0;

      // Average study duration
      const studyDurations = await Study.aggregate([
        { $match: { status: 'completed', endDate: { $exists: true } } },
        { 
          $project: { 
            duration: { 
              $divide: [
                { $subtract: ['$endDate', '$startDate'] },
                1000 * 60 * 60 * 24 // Convert to days
              ]
            }
          }
        },
        { 
          $group: { 
            _id: null, 
            avgDuration: { $avg: '$duration' } 
          }
        }
      ]);

      const averageStudyDuration = studyDurations[0]?.avgDuration || 0;

      // Top study categories
      const topCategories = await Study.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        { 
          $project: { 
            category: '$_id', 
            count: 1, 
            _id: 0 
          }
        }
      ]);

      // User engagement (simplified - in real app, track login activity)
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const [dailyActive, weeklyActive, monthlyActive] = await Promise.all([
        User.countDocuments({ lastLoginDate: { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) } }),
        User.countDocuments({ lastLoginDate: { $gte: sevenDaysAgo } }),
        User.countDocuments({ lastLoginDate: { $gte: thirtyDaysAgo } })
      ]);

      // Study status analytics
      const studyStatusCounts = await Study.aggregate([
        { 
          $group: { 
            _id: '$status', 
            count: { $sum: 1 } 
          }
        }
      ]);

      const studyAnalytics = {
        pending: studyStatusCounts.find(s => s._id === 'draft')?.count || 0,
        active: studyStatusCounts.find(s => s._id === 'active')?.count || 0,
        completed: studyStatusCounts.find(s => s._id === 'completed')?.count || 0,
        cancelled: studyStatusCounts.find(s => s._id === 'cancelled')?.count || 0
      };

      // Recent activity
      const recentActivity = await this.getRecentActivity(20);

      return {
        totalUsers,
        totalStudies,
        totalParticipants,
        totalRecordings,
        studiesThisMonth,
        participantsThisMonth,
        recordingsThisMonth,
        userGrowth,
        studyCompletionRate,
        averageStudyDuration,
        topStudyCategories: topCategories,
        userEngagement: {
          dailyActiveUsers: dailyActive,
          weeklyActiveUsers: weeklyActive,
          monthlyActiveUsers: monthlyActive
        },
        studyAnalytics,
        recentActivity
      };

    } catch (error) {
      console.error('Error getting platform analytics:', error);
      throw new Error('Failed to fetch platform analytics');
    }
  }

  /**
   * Get detailed analytics for a specific study
   */
  async getStudyAnalytics(studyId: string): Promise<StudyAnalytics> {
    try {
      const study = await Study.findById(studyId);
      if (!study) {
        throw new Error('Study not found');
      }

      // Basic metrics
      const totalParticipants = await Participant.countDocuments({ studyId });
      const completedSessions = await Participant.countDocuments({ 
        studyId, 
        status: 'completed' 
      });
      const totalRecordings = await Recording.countDocuments({ 
        sessionId: { 
          $in: await Participant.find({ studyId }).distinct('_id') 
        }
      });

      const completionRate = totalParticipants > 0 ? 
        (completedSessions / totalParticipants) * 100 : 0;

      // Demographics analysis
      const participants = await Participant.find({ studyId, demographics: { $exists: true } });
      
      const demographics = {
        ageGroups: this.analyzeAgeGroups(participants),
        genders: this.analyzeGenders(participants),
        locations: this.analyzeLocations(participants)
      };

      // Average completion time
      const completionTimes = await Participant.aggregate([
        { $match: { studyId: studyId, status: 'completed', completedAt: { $exists: true } } },
        { 
          $project: { 
            duration: { 
              $divide: [
                { $subtract: ['$completedAt', '$startedAt'] },
                1000 * 60 // Convert to minutes
              ]
            }
          }
        },
        { 
          $group: { 
            _id: null, 
            avgDuration: { $avg: '$duration' } 
          }
        }
      ]);

      const averageCompletionTime = completionTimes[0]?.avgDuration || 0;

      return {
        studyId,
        title: study.title,
        totalParticipants,
        completedSessions,
        averageCompletionTime,
        completionRate,
        totalRecordings,
        participantDemographics: demographics,
        engagementMetrics: {
          averageSessionDuration: averageCompletionTime,
          dropOffPoints: [], // Would need session tracking data
          userFeedback: {
            averageRating: 0, // Would need feedback system
            totalFeedback: 0
          }
        },
        performanceMetrics: {
          taskCompletionRates: [], // Would need task-level tracking
          averageTaskDuration: [],
          errorRates: []
        }
      };

    } catch (error) {
      console.error('Error getting study analytics:', error);
      throw new Error('Failed to fetch study analytics');
    }
  }

  /**
   * Get analytics for a specific user
   */
  async getUserAnalytics(userId: string): Promise<UserAnalytics> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const [
        totalStudiesCreated,
        totalParticipants,
        totalRecordings,
        userStudies
      ] = await Promise.all([
        Study.countDocuments({ createdBy: userId }),
        Participant.countDocuments({ researcherId: userId }),
        Recording.countDocuments({
          sessionId: {
            $in: await Participant.find({ researcherId: userId }).distinct('_id')
          }
        }),
        Study.find({ createdBy: userId }, 'category endDate startDate status')
      ]);

      // Study categories
      const studyCategories = [...new Set(userStudies.map(s => s.category).filter(Boolean))];

      // Average study duration
      const completedStudies = userStudies.filter(s => s.status === 'completed' && s.endDate && s.startDate);
      const avgDuration = completedStudies.length > 0 ?
        completedStudies.reduce((sum, study) => {
          const duration = (study.endDate!.getTime() - study.startDate!.getTime()) / (1000 * 60 * 60 * 24);
          return sum + duration;
        }, 0) / completedStudies.length : 0;

      // Study completion rate
      const studyCompletionRate = userStudies.length > 0 ?
        (completedStudies.length / userStudies.length) * 100 : 0;

      return {
        userId,
        totalStudiesCreated,
        totalParticipants,
        totalRecordings,
        studyCategories,
        lastActiveDate: user.lastLoginDate || user.updatedAt,
        averageStudyDuration: avgDuration,
        studyCompletionRate,
        participantRetentionRate: 0 // Would need session tracking
      };

    } catch (error) {
      console.error('Error getting user analytics:', error);
      throw new Error('Failed to fetch user analytics');
    }
  }

  /**
   * Get recent platform activity
   */
  private async getRecentActivity(limit: number = 20) {
    const activities = [];

    // Recent studies
    const recentStudies = await Study.find({})
      .sort({ createdAt: -1 })
      .limit(limit / 4)
      .select('title createdBy createdAt');

    // Recent participants
    const recentParticipants = await Participant.find({})
      .sort({ createdAt: -1 })
      .limit(limit / 4)
      .populate('studyId', 'title');

    // Recent recordings
    const recentRecordings = await Recording.find({})
      .sort({ createdAt: -1 })
      .limit(limit / 4);

    // Recent users
    const recentUsers = await User.find({})
      .sort({ createdAt: -1 })
      .limit(limit / 4)
      .select('firstName lastName createdAt');

    // Combine and sort all activities
    recentStudies.forEach(study => {
      activities.push({
        type: 'study_created' as const,
        description: `New study created: ${study.title}`,
        timestamp: study.createdAt,
        userId: study.createdBy.toString(),
        studyId: study._id.toString()
      });
    });

    recentParticipants.forEach(participant => {
      const studyTitle = (participant.studyId as any)?.title || 'Unknown Study';
      activities.push({
        type: 'participant_joined' as const,
        description: `Participant joined: ${studyTitle}`,
        timestamp: participant.createdAt,
        studyId: participant.studyId.toString()
      });
    });

    recentRecordings.forEach(recording => {
      activities.push({
        type: 'recording_completed' as const,
        description: `Recording completed (${recording.type})`,
        timestamp: recording.createdAt
      });
    });

    recentUsers.forEach(user => {
      const name = `${user.firstName} ${user.lastName}`.trim() || 'New User';
      activities.push({
        type: 'user_registered' as const,
        description: `${name} registered`,
        timestamp: user.createdAt,
        userId: user._id.toString()
      });
    });

    return activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Analyze age groups from participants
   */
  private analyzeAgeGroups(participants: any[]) {
    const ageGroups = { '18-24': 0, '25-34': 0, '35-44': 0, '45-54': 0, '55+': 0 };
    
    participants.forEach(p => {
      const age = p.demographics?.age;
      if (age) {
        if (age >= 18 && age <= 24) ageGroups['18-24']++;
        else if (age >= 25 && age <= 34) ageGroups['25-34']++;
        else if (age >= 35 && age <= 44) ageGroups['35-44']++;
        else if (age >= 45 && age <= 54) ageGroups['45-54']++;
        else if (age >= 55) ageGroups['55+']++;
      }
    });

    return Object.entries(ageGroups).map(([range, count]) => ({ range, count }));
  }

  /**
   * Analyze gender distribution
   */
  private analyzeGenders(participants: any[]) {
    const genders: Record<string, number> = {};
    
    participants.forEach(p => {
      const gender = p.demographics?.gender;
      if (gender) {
        genders[gender] = (genders[gender] || 0) + 1;
      }
    });

    return Object.entries(genders).map(([gender, count]) => ({ gender, count }));
  }

  /**
   * Analyze location distribution
   */
  private analyzeLocations(participants: any[]) {
    const locations: Record<string, number> = {};
    
    participants.forEach(p => {
      const country = p.demographics?.location?.country;
      if (country) {
        locations[country] = (locations[country] || 0) + 1;
      }
    });

    return Object.entries(locations)
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 countries
  }

  /**
   * Export analytics data as CSV
   */
  async exportAnalyticsCSV(type: 'platform' | 'study' | 'user', id?: string): Promise<string> {
    try {
      let data;
      let headers;

      switch (type) {
        case 'platform':
          data = await this.getPlatformAnalytics();
          headers = 'Metric,Value\n';
          return headers + Object.entries(data)
            .filter(([, value]) => typeof value === 'number')
            .map(([key, value]) => `${key},${value}`)
            .join('\n');

        case 'study':
          if (!id) throw new Error('Study ID required');
          data = await this.getStudyAnalytics(id);
          headers = 'Metric,Value\n';
          return headers + [
            `Study Title,${data.title}`,
            `Total Participants,${data.totalParticipants}`,
            `Completed Sessions,${data.completedSessions}`,
            `Completion Rate,${data.completionRate.toFixed(2)}%`,
            `Average Completion Time,${data.averageCompletionTime.toFixed(2)} minutes`,
            `Total Recordings,${data.totalRecordings}`
          ].join('\n');

        case 'user':
          if (!id) throw new Error('User ID required');
          data = await this.getUserAnalytics(id);
          headers = 'Metric,Value\n';
          return headers + [
            `Total Studies Created,${data.totalStudiesCreated}`,
            `Total Participants,${data.totalParticipants}`,
            `Total Recordings,${data.totalRecordings}`,
            `Study Completion Rate,${data.studyCompletionRate.toFixed(2)}%`,
            `Average Study Duration,${data.averageStudyDuration.toFixed(2)} days`
          ].join('\n');

        default:
          throw new Error('Invalid export type');
      }
    } catch (error) {
      console.error('Error exporting analytics CSV:', error);
      throw new Error('Failed to export analytics data');
    }
  }
}

export const analyticsService = new AnalyticsService();
export default AnalyticsService;
