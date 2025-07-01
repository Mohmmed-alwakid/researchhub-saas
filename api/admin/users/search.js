// API endpoint for advanced user search and filtering

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { 
      page = '1', 
      search = '', 
      sort = 'created_at:desc',
      role,
      status,
      dateRange,
      subscription,
      engagement 
    } = req.query;

    const currentPage = parseInt(page);
    const pageSize = 20;
    const [sortField, sortDirection] = sort.split(':');

    // Mock user data - in production, this would query the actual database
    const allUsers = [
      {
        id: '1',
        email: 'admin@researchhub.com',
        first_name: 'Admin',
        last_name: 'User',
        role: 'admin',
        status: 'active',
        created_at: '2024-01-15T10:00:00Z',
        last_login: '2025-06-29T08:30:00Z',
        study_count: 0,
        engagement_score: 95,
        subscription_status: 'active',
        tags: ['system', 'admin']
      },
      {
        id: '2',
        email: 'researcher1@example.com',
        first_name: 'Sarah',
        last_name: 'Johnson',
        role: 'researcher',
        status: 'active',
        created_at: '2024-03-20T14:30:00Z',
        last_login: '2025-06-28T16:45:00Z',
        study_count: 12,
        engagement_score: 88,
        subscription_status: 'active',
        tags: ['ux-research', 'enterprise']
      },
      {
        id: '3',
        email: 'participant1@example.com',
        first_name: 'Mike',
        last_name: 'Chen',
        role: 'participant',
        status: 'active',
        created_at: '2024-05-10T09:15:00Z',
        last_login: '2025-06-27T12:20:00Z',
        study_count: 8,
        engagement_score: 76,
        subscription_status: null,
        tags: ['frequent-participant']
      },
      {
        id: '4',
        email: 'researcher2@company.com',
        first_name: 'Emma',
        last_name: 'Williams',
        role: 'researcher',
        status: 'active',
        created_at: '2024-02-08T11:45:00Z',
        last_login: '2025-06-29T09:10:00Z',
        study_count: 25,
        engagement_score: 92,
        subscription_status: 'active',
        tags: ['product-research', 'premium']
      },
      {
        id: '5',
        email: 'participant2@example.com',
        first_name: 'David',
        last_name: 'Brown',
        role: 'participant',
        status: 'inactive',
        created_at: '2024-04-12T16:20:00Z',
        last_login: '2025-05-15T14:30:00Z',
        study_count: 3,
        engagement_score: 45,
        subscription_status: null,
        tags: ['low-engagement']
      },
      {
        id: '6',
        email: 'researcher3@startup.com',
        first_name: 'Lisa',
        last_name: 'Garcia',
        role: 'researcher',
        status: 'active',
        created_at: '2024-06-01T08:00:00Z',
        last_login: '2025-06-29T10:15:00Z',
        study_count: 5,
        engagement_score: 82,
        subscription_status: 'active',
        tags: ['new-user', 'startup']
      },
      {
        id: '7',
        email: 'participant3@domain.com',
        first_name: 'Alex',
        last_name: 'Taylor',
        role: 'participant',
        status: 'suspended',
        created_at: '2024-01-30T13:45:00Z',
        last_login: '2025-06-20T11:00:00Z',
        study_count: 15,
        engagement_score: 65,
        subscription_status: null,
        tags: ['policy-violation']
      },
      {
        id: '8',
        email: 'admin2@researchhub.com',
        first_name: 'Tom',
        last_name: 'Wilson',
        role: 'admin',
        status: 'active',
        created_at: '2024-01-20T12:00:00Z',
        last_login: '2025-06-29T07:45:00Z',
        study_count: 2,
        engagement_score: 90,
        subscription_status: 'active',
        tags: ['super-admin', 'system']
      }
    ];

    // Apply filters
    let filteredUsers = allUsers.filter(user => {
      // Search filter
      if (search) {
        const searchLower = search.toLowerCase();
        const matchesSearch = 
          user.email.toLowerCase().includes(searchLower) ||
          user.first_name?.toLowerCase().includes(searchLower) ||
          user.last_name?.toLowerCase().includes(searchLower) ||
          user.role.toLowerCase().includes(searchLower);
        
        if (!matchesSearch) return false;
      }

      // Role filter
      if (role && role !== 'all' && user.role !== role) {
        return false;
      }

      // Status filter
      if (status && status !== 'all' && user.status !== status) {
        return false;
      }

      // Subscription filter
      if (subscription && subscription !== 'all') {
        if (subscription === 'active' && user.subscription_status !== 'active') return false;
        if (subscription === 'cancelled' && user.subscription_status !== 'cancelled') return false;
        if (subscription === 'expired' && user.subscription_status !== 'expired') return false;
      }

      // Engagement filter
      if (engagement && engagement !== 'all') {
        if (engagement === 'high' && user.engagement_score < 80) return false;
        if (engagement === 'medium' && (user.engagement_score < 60 || user.engagement_score >= 80)) return false;
        if (engagement === 'low' && user.engagement_score >= 60) return false;
      }

      // Date range filter
      if (dateRange && dateRange !== 'all') {
        const createdDate = new Date(user.created_at);
        const now = new Date();
        const daysDiff = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));

        if (dateRange === 'week' && daysDiff > 7) return false;
        if (dateRange === 'month' && daysDiff > 30) return false;
        if (dateRange === 'quarter' && daysDiff > 90) return false;
      }

      return true;
    });

    // Apply sorting
    filteredUsers.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Handle date fields
      if (sortField === 'created_at' || sortField === 'last_login') {
        aValue = new Date(aValue || 0).getTime();
        bValue = new Date(bValue || 0).getTime();
      }

      // Handle string fields
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortDirection === 'desc') {
        return bValue > aValue ? 1 : -1;
      } else {
        return aValue > bValue ? 1 : -1;
      }
    });

    // Apply pagination
    const totalUsers = filteredUsers.length;
    const totalPages = Math.ceil(totalUsers / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedUsers = filteredUsers.slice(startIndex, startIndex + pageSize);

    return res.status(200).json({
      success: true,
      data: {
        users: paginatedUsers,
        pagination: {
          currentPage,
          totalPages,
          totalUsers,
          pageSize
        }
      }
    });

  } catch (error) {
    console.error('Error searching users:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to search users'
    });
  }
}
