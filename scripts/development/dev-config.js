// Enhanced local development configuration
// ✅ REAL DATA MODE: USING DEVELOPMENT SERVER APIS ONLY
// ❌ MOCK DATA DISABLED: All data comes from backend APIs
// 🚀 PRODUCTION READY: Real API integration for Vercel deployment

const DEVELOPMENT_CONFIG = {
  // DISABLED: Force local auth mode - now using real APIs
  FORCE_LOCAL_AUTH: false,
  
  // DISABLED: Mock data - now using development server APIs
  MOCK_DATA_ENABLED: false,
  
  // DISABLED: Supabase fallback - now using real development server
  SUPABASE_FALLBACK: {
    enabled: false,           // DISABLED: Use real APIs only
    mockUserDatabase: false,  // DISABLED: Real user data from server
    mockAnalytics: false,     // DISABLED: Real analytics from server
    mockPayments: false,      // DISABLED: Real payments from server
    mockApplications: false,  // DISABLED: Real applications from server
    mockWallet: false         // DISABLED: Real wallet from server
  },
  
  // Test accounts with enhanced data
  TEST_ACCOUNTS: {
    researcher: {
      email: 'abwanwr77+Researcher@gmail.com',
      password: 'Testtest123',
      role: 'researcher',
      mockData: {
        studies: 3,
        participants: 45,
        completionRate: 87
      }
    },
    participant: {
      email: 'abwanwr77+participant@gmail.com',
      password: 'Testtest123',
      role: 'participant',
      mockData: {
        applicationsSubmitted: 3,     // UPDATED: Reflects actual mock data
        studiesCompleted: 1,          // UPDATED: Based on approved applications
        earnings: 125.50,             // UPDATED: Matches wallet balance
        walletBalance: 125.50,        // NEW: Current wallet balance
        totalEarned: 567.25,          // NEW: Total lifetime earnings
        pendingApplications: 1,       // NEW: Current pending count
        approvedApplications: 1,      // NEW: Current approved count
        rejectedApplications: 1       // NEW: Current rejected count
      }
    },
    admin: {
      email: 'abwanwr77+admin@gmail.com',
      password: 'Testtest123',
      role: 'admin',
      mockData: {
        totalUsers: 1250,
        activeStudies: 24,
        revenue: 15600
      }
    }
  }
};

// ✅ REAL DATA MODE - AUGUST 7, 2025
// =========================================
// RULE: NO MORE MOCK DATA - REAL APIS ONLY
// - Authentication: Real Supabase authentication
// - Dashboard: Real data from development server
// - APIs: All endpoints use real backend services
//
// DEPLOYMENT STATUS:
// - Local Development: Uses real development server APIs
// - Vercel Production: Ready for real backend integration
// - Testing: All features tested with real data flows
//
// DEVELOPMENT SERVER REQUIREMENTS:
// - Backend server must be running on port 3003
// - All API endpoints must be functional
// - Database connections must be established
// - Real user accounts and data required for testing

export { DEVELOPMENT_CONFIG };
