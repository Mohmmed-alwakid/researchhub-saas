// Simplified Analytics Service for basic metrics
interface BasicAnalytics {
  totalUsers: number;
  totalStudies: number;
  totalParticipants: number;
  usersThisMonth: number;
  studiesThisMonth: number;
  participantsThisMonth: number;
  platformGrowth: {
    userGrowth: number;
    studyGrowth: number;
  };
  studyStatusBreakdown: {
    draft: number;
    active: number;
    completed: number;
    paused: number;
  };
}

class SimpleAnalyticsService {
  /**
   * Get basic platform analytics
   */
  async getBasicAnalytics(): Promise<BasicAnalytics> {
    try {
      // Import models dynamically to avoid circular dependencies
      const { User } = await import('../../database/models/User.model');
      const { Study } = await import('../../database/models/Study.model');
      const { Participant } = await import('../../database/models/Participant.model');

      const now = new Date();
      const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const firstOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

      // Get basic counts
      const [
        totalUsers,
        totalStudies,
        totalParticipants,
        usersThisMonth,
        studiesThisMonth,
        participantsThisMonth,
        usersLastMonth,
        studiesLastMonth
      ] = await Promise.all([
        User.countDocuments({}),
        Study.countDocuments({}),
        Participant.countDocuments({}),
        User.countDocuments({ createdAt: { $gte: firstOfMonth } }),
        Study.countDocuments({ createdAt: { $gte: firstOfMonth } }),
        Participant.countDocuments({ createdAt: { $gte: firstOfMonth } }),
        User.countDocuments({ 
          createdAt: { $gte: firstOfLastMonth, $lte: lastOfLastMonth } 
        }),
        Study.countDocuments({ 
          createdAt: { $gte: firstOfLastMonth, $lte: lastOfLastMonth } 
        })
      ]);

      // Calculate growth rates
      const userGrowth = usersLastMonth > 0 ? 
        ((usersThisMonth - usersLastMonth) / usersLastMonth) * 100 : 0;
      const studyGrowth = studiesLastMonth > 0 ? 
        ((studiesThisMonth - studiesLastMonth) / studiesLastMonth) * 100 : 0;

      // Get study status breakdown
      const studyStatuses = await Study.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      const statusBreakdown = {
        draft: 0,
        active: 0,
        completed: 0,
        paused: 0
      };      studyStatuses.forEach((status: { _id: string; count: number }) => {
        if (status._id in statusBreakdown) {
          statusBreakdown[status._id as keyof typeof statusBreakdown] = status.count;
        }
      });

      return {
        totalUsers,
        totalStudies,
        totalParticipants,
        usersThisMonth,
        studiesThisMonth,
        participantsThisMonth,
        platformGrowth: {
          userGrowth,
          studyGrowth
        },
        studyStatusBreakdown: statusBreakdown
      };

    } catch (error) {
      console.error('Error getting basic analytics:', error);
      throw new Error('Failed to fetch analytics data');
    }
  }

  /**
   * Get study-specific analytics
   */
  async getStudyMetrics(studyId: string) {
    try {
      const { Study } = await import('../../database/models/Study.model');
      const { Participant } = await import('../../database/models/Participant.model');

      const study = await Study.findById(studyId);
      if (!study) {
        throw new Error('Study not found');
      }

      const [
        totalParticipants,
        completedParticipants,
        activeParticipants,
        pendingParticipants
      ] = await Promise.all([
        Participant.countDocuments({ studyId }),
        Participant.countDocuments({ studyId, status: 'completed' }),
        Participant.countDocuments({ studyId, status: 'active' }),
        Participant.countDocuments({ studyId, status: 'invited' })
      ]);

      const completionRate = totalParticipants > 0 ? 
        (completedParticipants / totalParticipants) * 100 : 0;

      return {
        studyId,
        title: study.title,
        status: study.status,
        totalParticipants,
        completedParticipants,
        activeParticipants,
        pendingParticipants,
        completionRate,
        createdAt: study.createdAt,
        updatedAt: study.updatedAt
      };

    } catch (error) {
      console.error('Error getting study metrics:', error);
      throw new Error('Failed to fetch study metrics');
    }
  }

  /**
   * Get user-specific analytics
   */
  async getUserMetrics(userId: string) {
    try {
      const { User } = await import('../../database/models/User.model');
      const { Study } = await import('../../database/models/Study.model');
      const { Participant } = await import('../../database/models/Participant.model');

      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const [
        studiesCreated,
        participantsManaged,
        activeStudies,
        completedStudies
      ] = await Promise.all([
        Study.countDocuments({ createdBy: userId }),
        Participant.countDocuments({ researcherId: userId }),
        Study.countDocuments({ createdBy: userId, status: 'active' }),
        Study.countDocuments({ createdBy: userId, status: 'completed' })
      ]);

      const studyCompletionRate = studiesCreated > 0 ? 
        (completedStudies / studiesCreated) * 100 : 0;

      return {
        userId,
        userName: `${user.firstName} ${user.lastName}`.trim() || user.email,
        userRole: user.role,
        studiesCreated,
        participantsManaged,
        activeStudies,
        completedStudies,
        studyCompletionRate,
        joinedAt: user.createdAt,
        lastActive: user.lastLoginAt || user.updatedAt
      };

    } catch (error) {
      console.error('Error getting user metrics:', error);
      throw new Error('Failed to fetch user metrics');
    }
  }

  /**
   * Get recent activity summary
   */
  async getRecentActivity(limit: number = 10) {
    try {
      const { User } = await import('../../database/models/User.model');
      const { Study } = await import('../../database/models/Study.model');
      const { Participant } = await import('../../database/models/Participant.model');

      const [recentUsers, recentStudies, recentParticipants] = await Promise.all([
        User.find({}).sort({ createdAt: -1 }).limit(limit).select('firstName lastName createdAt'),
        Study.find({}).sort({ createdAt: -1 }).limit(limit).select('title createdAt status'),
        Participant.find({}).sort({ createdAt: -1 }).limit(limit).select('email createdAt status')
      ]);

      const activities = [
        ...recentUsers.map(user => ({
          type: 'user_registered',
          description: `${user.firstName} ${user.lastName} joined`.trim(),
          timestamp: user.createdAt
        })),
        ...recentStudies.map(study => ({
          type: 'study_created',
          description: `Study created: ${study.title}`,
          timestamp: study.createdAt
        })),
        ...recentParticipants.map(participant => ({
          type: 'participant_joined',
          description: `New participant: ${participant.email}`,
          timestamp: participant.createdAt
        }))
      ];

      return activities
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, limit);

    } catch (error) {
      console.error('Error getting recent activity:', error);
      return [];
    }
  }

  /**
   * Export basic analytics as CSV
   */
  exportBasicAnalyticsCSV(analytics: BasicAnalytics): string {
    const rows = [
      'Metric,Value',
      `Total Users,${analytics.totalUsers}`,
      `Total Studies,${analytics.totalStudies}`,
      `Total Participants,${analytics.totalParticipants}`,
      `Users This Month,${analytics.usersThisMonth}`,
      `Studies This Month,${analytics.studiesThisMonth}`,
      `Participants This Month,${analytics.participantsThisMonth}`,
      `User Growth,${analytics.platformGrowth.userGrowth.toFixed(2)}%`,
      `Study Growth,${analytics.platformGrowth.studyGrowth.toFixed(2)}%`,
      `Draft Studies,${analytics.studyStatusBreakdown.draft}`,
      `Active Studies,${analytics.studyStatusBreakdown.active}`,
      `Completed Studies,${analytics.studyStatusBreakdown.completed}`,
      `Paused Studies,${analytics.studyStatusBreakdown.paused}`
    ];

    return rows.join('\n');
  }
}

export const simpleAnalyticsService = new SimpleAnalyticsService();
export default SimpleAnalyticsService;
