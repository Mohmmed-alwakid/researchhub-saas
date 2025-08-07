/**
 * Mock Data Service for Local Development
 * Provides realistic test data when Supabase is unavailable
 */

export const mockDataService = {
  // Dashboard data for different roles
  getDashboardData: (userRole) => {
    const baseTime = new Date().getTime();
    
    switch (userRole) {
      case 'researcher':
        return {
          totalStudies: 12,
          activeParticipants: 156,
          completionRate: 87,
          avgSessionTime: 8.5,
          recentStudies: [
            {
              id: 'study-1',
              title: 'E-commerce Checkout Flow',
              participants: 45,
              status: 'active',
              createdAt: new Date(baseTime - 86400000 * 2).toISOString(),
              completionRate: 89
            },
            {
              id: 'study-2', 
              title: 'Mobile App Navigation',
              participants: 32,
              status: 'completed',
              createdAt: new Date(baseTime - 86400000 * 5).toISOString(),
              completionRate: 94
            },
            {
              id: 'study-3',
              title: 'User Onboarding Flow',
              participants: 78,
              status: 'recruiting',
              createdAt: new Date(baseTime - 86400000 * 1).toISOString(),
              completionRate: 0
            }
          ],
          recentActivity: [
            {
              id: 'activity-1',
              message: 'Study "E-commerce Checkout Flow" reached 150 participants',
              timestamp: new Date(baseTime - 7200000).toISOString(),
              type: 'milestone'
            },
            {
              id: 'activity-2',
              message: 'New analytics report generated for "Mobile App Navigation"',
              timestamp: new Date(baseTime - 14400000).toISOString(),
              type: 'report'
            },
            {
              id: 'activity-3',
              message: 'Study "User Onboarding Flow" was completed successfully',
              timestamp: new Date(baseTime - 86400000).toISOString(),
              type: 'completion'
            }
          ]
        };
        
      case 'participant':
        return {
          applicationsSubmitted: 24,
          studiesCompleted: 18,
          totalEarnings: 456.50,
          averageRating: 4.8,
          availableStudies: [
            {
              id: 'available-1',
              title: 'Website Usability Test',
              reward: '$25',
              duration: '30 minutes',
              researcher: 'UX Research Co.',
              deadline: new Date(baseTime + 86400000 * 3).toISOString()
            },
            {
              id: 'available-2',
              title: 'Mobile App Feedback',
              reward: '$15',
              duration: '20 minutes', 
              researcher: 'Tech Startup Inc.',
              deadline: new Date(baseTime + 86400000 * 5).toISOString()
            }
          ],
          recentApplications: [
            {
              id: 'app-1',
              studyTitle: 'E-commerce User Flow',
              status: 'completed',
              reward: '$30',
              completedAt: new Date(baseTime - 86400000 * 2).toISOString()
            },
            {
              id: 'app-2',
              studyTitle: 'Social Media Navigation',
              status: 'in-progress',
              reward: '$20',
              appliedAt: new Date(baseTime - 86400000 * 1).toISOString()
            }
          ]
        };
        
      case 'admin':
        return {
          totalUsers: 2847,
          activeStudies: 89,
          monthlyRevenue: 24580,
          userGrowth: 15.2,
          platformMetrics: {
            studiesCreated: 45,
            applicationsSubmitted: 892,
            completionRate: 91,
            averageStudyDuration: 25.8
          },
          recentUsers: [
            {
              id: 'user-1',
              email: 'john.researcher@example.com',
              role: 'researcher',
              joinedAt: new Date(baseTime - 86400000).toISOString(),
              status: 'active'
            },
            {
              id: 'user-2',
              email: 'sarah.participant@example.com', 
              role: 'participant',
              joinedAt: new Date(baseTime - 86400000 * 2).toISOString(),
              status: 'active'
            }
          ],
          systemHealth: {
            uptime: '99.8%',
            responseTime: '245ms',
            errorRate: '0.1%',
            activeConnections: 1247
          }
        };
        
      default:
        return {
          message: 'Access denied',
          userRole: userRole
        };
    }
  },

  // Studies data
  getStudies: (userRole, userId) => {
    if (userRole === 'researcher') {
      return [
        {
          id: 'study-1',
          title: 'E-commerce Checkout Flow',
          description: 'Understanding user behavior during the checkout process',
          status: 'active',
          participants: 45,
          targetParticipants: 50,
          createdAt: new Date().toISOString(),
          completionRate: 89,
          type: 'usability',
          duration: 30
        },
        {
          id: 'study-2',
          title: 'Mobile App Navigation', 
          description: 'Testing intuitive navigation patterns in mobile applications',
          status: 'completed',
          participants: 32,
          targetParticipants: 30,
          createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
          completionRate: 94,
          type: 'navigation',
          duration: 25
        }
      ];
    }
    
    if (userRole === 'participant') {
      return [
        {
          id: 'available-1',
          title: 'Website Usability Test',
          description: 'Help us improve our website user experience',
          reward: '$25',
          duration: 30,
          researcher: 'UX Research Co.',
          status: 'available',
          deadline: new Date(Date.now() + 86400000 * 3).toISOString()
        }
      ];
    }
    
    return [];
  },

  // User wallet/payment data
  getWalletData: (userId) => {
    return {
      balance: 125.50,
      pendingEarnings: 45.00,
      totalEarnings: 567.25,
      transactions: [
        {
          id: 'txn-1',
          amount: 25.00,
          type: 'study_completion',
          studyTitle: 'E-commerce Flow Test',
          date: new Date(Date.now() - 86400000).toISOString(),
          status: 'completed'
        },
        {
          id: 'txn-2',
          amount: -50.00,
          type: 'withdrawal',
          description: 'PayPal withdrawal',
          date: new Date(Date.now() - 86400000 * 3).toISOString(),
          status: 'completed'
        }
      ]
    };
  }
};

// Helper function to simulate API delays
export const simulateApiDelay = (ms = 300) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};
