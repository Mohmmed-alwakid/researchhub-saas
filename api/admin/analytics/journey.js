// User Journey Analytics API
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { timeRange = '30d' } = req.query;

    // Mock data for user journey analytics
    const mockData = {
      overview: {
        totalJourneys: 12450,
        avgCompletionRate: 73.2,
        avgJourneyTime: 1890, // seconds
        bounceRate: 26.8
      },
      userFlows: [
        {
          id: 'onboarding',
          name: 'User Onboarding',
          totalUsers: 2340,
          completionRate: 68.5,
          steps: [
            {
              id: 'landing',
              name: 'Landing Page',
              page: '/landing',
              users: 2340,
              dropoffRate: 0,
              avgTimeSpent: 45,
              conversionRate: 100
            },
            {
              id: 'signup',
              name: 'Sign Up',
              page: '/signup',
              users: 1890,
              dropoffRate: 19.2,
              avgTimeSpent: 120,
              conversionRate: 80.8
            },
            {
              id: 'verification',
              name: 'Email Verification',
              page: '/verify',
              users: 1780,
              dropoffRate: 5.8,
              avgTimeSpent: 30,
              conversionRate: 94.2
            },
            {
              id: 'profile',
              name: 'Profile Setup',
              page: '/profile',
              users: 1650,
              dropoffRate: 7.3,
              avgTimeSpent: 180,
              conversionRate: 92.7
            },
            {
              id: 'first-study',
              name: 'Create First Study',
              page: '/studies/create',
              users: 1340,
              dropoffRate: 18.8,
              avgTimeSpent: 420,
              conversionRate: 81.2
            },
            {
              id: 'completion',
              name: 'Onboarding Complete',
              page: '/dashboard',
              users: 1160,
              dropoffRate: 13.4,
              avgTimeSpent: 90,
              conversionRate: 86.6
            }
          ]
        },
        {
          id: 'study-creation',
          name: 'Study Creation Flow',
          totalUsers: 4560,
          completionRate: 82.3,
          steps: [
            {
              id: 'template-selection',
              name: 'Template Selection',
              page: '/studies/templates',
              users: 4560,
              dropoffRate: 0,
              avgTimeSpent: 60,
              conversionRate: 100
            },
            {
              id: 'study-builder',
              name: 'Study Builder',
              page: '/studies/builder',
              users: 4120,
              dropoffRate: 9.6,
              avgTimeSpent: 480,
              conversionRate: 90.4
            },
            {
              id: 'preview',
              name: 'Study Preview',
              page: '/studies/preview',
              users: 3890,
              dropoffRate: 5.6,
              avgTimeSpent: 120,
              conversionRate: 94.4
            },
            {
              id: 'publish',
              name: 'Publish Study',
              page: '/studies/publish',
              users: 3750,
              dropoffRate: 3.6,
              avgTimeSpent: 90,
              conversionRate: 96.4
            }
          ]
        }
      ],
      funnelAnalysis: [
        { step: 'Landing Page Visit', users: 15420, percentage: 100, dropoff: 0 },
        { step: 'Sign Up Started', users: 8930, percentage: 57.9, dropoff: 6490 },
        { step: 'Email Verified', users: 7650, percentage: 49.6, dropoff: 1280 },
        { step: 'Profile Completed', users: 6890, percentage: 44.7, dropoff: 760 },
        { step: 'First Study Created', users: 5640, percentage: 36.6, dropoff: 1250 },
        { step: 'Study Published', users: 4920, percentage: 31.9, dropoff: 720 }
      ],
      topExitPages: [
        { page: '/signup', exits: 1280, exitRate: 19.2 },
        { page: '/studies/builder', exits: 890, exitRate: 15.8 },
        { page: '/verification', exits: 560, exitRate: 12.3 },
        { page: '/pricing', exits: 450, exitRate: 28.9 },
        { page: '/profile/setup', exits: 340, exitRate: 8.7 },
        { page: '/studies/templates', exits: 280, exitRate: 6.1 }
      ],
      conversionPaths: [
        { path: 'Landing → Sign Up → Dashboard', users: 2340, conversionRate: 68.5 },
        { path: 'Templates → Builder → Publish', users: 1890, conversionRate: 82.3 },
        { path: 'Dashboard → Studies → Create', users: 1560, conversionRate: 75.2 },
        { path: 'Landing → Pricing → Sign Up', users: 890, conversionRate: 45.6 },
        { path: 'Search → Templates → Builder', users: 620, conversionRate: 71.8 }
      ]
    };

    return res.status(200).json({
      success: true,
      data: mockData
    });

  } catch (error) {
    console.error('User journey analytics error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch user journey data'
    });
  }
}
