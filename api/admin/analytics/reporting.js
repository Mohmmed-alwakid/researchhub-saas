// Executive Reporting Analytics API
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { period = 'current' } = req.query;

    // Mock data for executive reporting
    const mockData = {
      summary: {
        period: getPeriodLabel(period),
        highlights: [
          {
            title: 'Total Revenue',
            value: '$234.5K',
            trend: 'up',
            icon: 'dollar-sign'
          },
          {
            title: 'Active Users',
            value: '8,930',
            trend: 'up',
            icon: 'users'
          },
          {
            title: 'Study Completion',
            value: '73.2%',
            trend: 'stable',
            icon: 'target'
          },
          {
            title: 'Customer Satisfaction',
            value: '8.7/10',
            trend: 'up',
            icon: 'heart'
          }
        ],
        kpis: [
          {
            metric: 'Revenue Growth',
            current: 24.5,
            target: 25.0,
            progress: 98.0,
            status: 'on-track'
          },
          {
            metric: 'User Acquisition',
            current: 1890,
            target: 2000,
            progress: 94.5,
            status: 'on-track'
          },
          {
            metric: 'Churn Rate',
            current: 5.2,
            target: 5.0,
            progress: 96.2,
            status: 'at-risk'
          },
          {
            metric: 'Feature Adoption',
            current: 67.8,
            target: 75.0,
            progress: 90.4,
            status: 'behind'
          }
        ],
        insights: [
          'Revenue growth exceeded expectations by 24.5%, driven primarily by enterprise customer expansion',
          'User engagement improved significantly with new study builder features showing 82% adoption rate',
          'Churn rate remains stable but requires attention in the SMB segment',
          'Geographic expansion into European markets showing promising early results'
        ],
        recommendations: [
          'Increase investment in customer success team to address churn in SMB segment',
          'Accelerate development of advanced analytics features based on user feedback',
          'Consider strategic partnerships to expand into Asian markets',
          'Implement proactive user onboarding to improve feature adoption rates'
        ]
      },
      reports: [
        {
          id: 'report-001',
          title: 'Q4 2024 Executive Summary',
          type: 'quarterly',
          period: 'Q4 2024',
          status: 'sent',
          createdAt: '2024-12-15T00:00:00Z',
          lastModified: '2024-12-20T00:00:00Z',
          recipients: ['ceo@company.com', 'cfo@company.com', 'board@company.com']
        },
        {
          id: 'report-002',
          title: 'November 2024 Monthly Report',
          type: 'monthly',
          period: 'November 2024',
          status: 'ready',
          createdAt: '2024-11-30T00:00:00Z',
          lastModified: '2024-12-01T00:00:00Z',
          recipients: ['leadership@company.com']
        },
        {
          id: 'report-003',
          title: 'Product Performance Analysis',
          type: 'custom',
          period: 'October-November 2024',
          status: 'draft',
          createdAt: '2024-11-15T00:00:00Z',
          lastModified: '2024-11-28T00:00:00Z',
          recipients: ['product@company.com', 'engineering@company.com']
        },
        {
          id: 'report-004',
          title: 'Customer Success Metrics',
          type: 'monthly',
          period: 'October 2024',
          status: 'sent',
          createdAt: '2024-10-31T00:00:00Z',
          lastModified: '2024-11-05T00:00:00Z',
          recipients: ['cs@company.com', 'sales@company.com']
        }
      ],
      templates: [
        {
          id: 'template-001',
          name: 'Monthly Executive Summary',
          description: 'Comprehensive monthly overview including key metrics, highlights, and strategic insights',
          frequency: 'Monthly'
        },
        {
          id: 'template-002',
          name: 'Quarterly Board Report',
          description: 'Detailed quarterly report for board meetings with financial and operational metrics',
          frequency: 'Quarterly'
        },
        {
          id: 'template-003',
          name: 'Product Performance Review',
          description: 'Product-focused analysis including user engagement, feature adoption, and roadmap progress',
          frequency: 'Monthly'
        },
        {
          id: 'template-004',
          name: 'Customer Health Dashboard',
          description: 'Customer success metrics including satisfaction, churn, and expansion opportunities',
          frequency: 'Weekly'
        },
        {
          id: 'template-005',
          name: 'Financial Performance Summary',
          description: 'Revenue, growth, and financial health overview for stakeholders',
          frequency: 'Monthly'
        }
      ],
      recipients: [
        {
          id: 'recipient-001',
          name: 'John Smith',
          email: 'ceo@company.com',
          role: 'CEO',
          active: true
        },
        {
          id: 'recipient-002',
          name: 'Sarah Johnson',
          email: 'cfo@company.com',
          role: 'CFO',
          active: true
        },
        {
          id: 'recipient-003',
          name: 'Board of Directors',
          email: 'board@company.com',
          role: 'Board',
          active: true
        },
        {
          id: 'recipient-004',
          name: 'Leadership Team',
          email: 'leadership@company.com',
          role: 'Leadership',
          active: true
        },
        {
          id: 'recipient-005',
          name: 'Product Team',
          email: 'product@company.com',
          role: 'Product',
          active: true
        }
      ]
    };

    return res.status(200).json({
      success: true,
      data: mockData
    });

  } catch (error) {
    console.error('Executive reporting analytics error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch executive reporting data'
    });
  }
}

function getPeriodLabel(period) {
  switch (period) {
    case 'current': return 'Current Period (December 2024)';
    case 'last': return 'Last Period (November 2024)';
    case 'ytd': return 'Year to Date (2024)';
    default: return 'Current Period';
  }
}
