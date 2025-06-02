import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  MoreVertical,
  Users,
  Play,
  Pause,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
  Download
} from 'lucide-react';

interface Study {
  id: string;
  title: string;
  description: string;
  creatorId: string;
  creatorName: string;
  creatorEmail: string;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'archived';
  type: 'usability' | 'survey' | 'interview' | 'a_b_test' | 'card_sorting';
  participantCount: number;
  targetParticipants: number;
  createdAt: Date;
  updatedAt: Date;
  completionRate: number;
  averageRating: number;
  recordingsGenerated: number;
  dataSize: number; // in MB
  tags: string[];
  isPublic: boolean;
  requiresModeration: boolean;
}

interface StudyFilters {
  status: string;
  type: string;
  creator: string;
  searchQuery: string;
  dateRange: string;
}

const StudyOversight: React.FC = () => {
  const [studies, setStudies] = useState<Study[]>([]);
  const [filteredStudies, setFilteredStudies] = useState<Study[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudies, setSelectedStudies] = useState<string[]>([]);
  const [filters, setFilters] = useState<StudyFilters>({
    status: 'all',
    type: 'all',
    creator: 'all',
    searchQuery: '',
    dateRange: 'all'
  });

  useEffect(() => {
    fetchStudies();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [studies, filters]);

  const fetchStudies = async () => {
    try {
      // Mock data - replace with actual API call
      const mockStudies: Study[] = [
        {
          id: 'study_1',
          title: 'Mobile App Usability Test',
          description: 'Testing the user experience of our new mobile application interface',
          creatorId: 'user_1',
          creatorName: 'John Doe',
          creatorEmail: 'john@example.com',
          status: 'active',
          type: 'usability',
          participantCount: 45,
          targetParticipants: 100,
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-20'),
          completionRate: 78.5,
          averageRating: 4.2,
          recordingsGenerated: 42,
          dataSize: 1250,
          tags: ['mobile', 'UX', 'interface'],
          isPublic: false,
          requiresModeration: false
        },
        {
          id: 'study_2',
          title: 'E-commerce Checkout Flow',
          description: 'Understanding user behavior during the checkout process',
          creatorId: 'user_2',
          creatorName: 'Sarah Wilson',
          creatorEmail: 'sarah@example.com',
          status: 'completed',
          type: 'usability',
          participantCount: 87,
          targetParticipants: 80,
          createdAt: new Date('2023-12-10'),
          updatedAt: new Date('2024-01-05'),
          completionRate: 92.1,
          averageRating: 4.7,
          recordingsGenerated: 85,
          dataSize: 2100,
          tags: ['ecommerce', 'checkout', 'conversion'],
          isPublic: true,
          requiresModeration: true
        },
        {
          id: 'study_3',
          title: 'Product Feature Survey',
          description: 'Gathering feedback on proposed new features',
          creatorId: 'user_3',
          creatorName: 'Mike Johnson',
          creatorEmail: 'mike@example.com',
          status: 'paused',
          type: 'survey',
          participantCount: 156,
          targetParticipants: 200,
          createdAt: new Date('2024-01-08'),
          updatedAt: new Date('2024-01-18'),
          completionRate: 65.3,
          averageRating: 3.9,
          recordingsGenerated: 0,
          dataSize: 85,
          tags: ['survey', 'features', 'feedback'],
          isPublic: false,
          requiresModeration: false
        }
      ];
      setStudies(mockStudies);
    } catch (error) {
      console.error('Failed to fetch studies:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = studies;

    // Search filter
    if (filters.searchQuery) {
      filtered = filtered.filter(study =>
        study.title.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        study.description.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        study.creatorName.toLowerCase().includes(filters.searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(study => study.status === filters.status);
    }

    // Type filter
    if (filters.type !== 'all') {
      filtered = filtered.filter(study => study.type === filters.type);
    }

    setFilteredStudies(filtered);
  };

  const handleStudyAction = async (action: string, studyId: string) => {
    try {
      switch (action) {
        case 'pause':
          setStudies(studies.map(study => 
            study.id === studyId ? { ...study, status: 'paused' as const } : study
          ));
          break;
        case 'resume':
          setStudies(studies.map(study => 
            study.id === studyId ? { ...study, status: 'active' as const } : study
          ));
          break;
        case 'archive':
          setStudies(studies.map(study => 
            study.id === studyId ? { ...study, status: 'archived' as const } : study
          ));
          break;
        case 'delete':
          if (confirm('Are you sure you want to delete this study?')) {
            setStudies(studies.filter(study => study.id !== studyId));
          }
          break;
      }
    } catch (error) {
      console.error('Failed to perform study action:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'archived':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Play className="w-3 h-3" />;
      case 'paused':
        return <Pause className="w-3 h-3" />;
      case 'completed':
        return <CheckCircle className="w-3 h-3" />;
      case 'draft':
        return <Clock className="w-3 h-3" />;
      case 'archived':
        return <Database className="w-3 h-3" />;
      default:
        return <AlertCircle className="w-3 h-3" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'usability':
        return 'Usability Test';
      case 'survey':
        return 'Survey';
      case 'interview':
        return 'Interview';
      case 'a_b_test':
        return 'A/B Test';
      case 'card_sorting':
        return 'Card Sorting';
      default:
        return type;
    }
  };

  const totalStudies = studies.length;
  const activeStudies = studies.filter(s => s.status === 'active').length;
  const totalParticipants = studies.reduce((sum, study) => sum + study.participantCount, 0);
  const totalDataSize = studies.reduce((sum, study) => sum + study.dataSize, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Study Oversight</h1>
          <p className="text-gray-600">Monitor and manage all platform studies</p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </button>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics Report
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-lg bg-blue-50">
              <Database className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-gray-900">{totalStudies}</div>
            <div className="text-sm text-gray-600">Total Studies</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-lg bg-green-50">
              <Play className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-gray-900">{activeStudies}</div>
            <div className="text-sm text-gray-600">Active Studies</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-lg bg-purple-50">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-gray-900">{totalParticipants.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Participants</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-lg bg-orange-50">
              <BarChart3 className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-gray-900">{(totalDataSize / 1024).toFixed(1)}GB</div>
            <div className="text-sm text-gray-600">Data Generated</div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search studies..."
              value={filters.searchQuery}
              onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>

          {/* Type Filter */}
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="usability">Usability Test</option>
            <option value="survey">Survey</option>
            <option value="interview">Interview</option>
            <option value="a_b_test">A/B Test</option>
            <option value="card_sorting">Card Sorting</option>
          </select>

          {/* Date Range Filter */}
          <select
            value={filters.dateRange}
            onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
          </select>

          {/* Bulk Actions */}
          {selectedStudies.length > 0 && (
            <div className="flex space-x-2">
              <button className="px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm">
                Pause
              </button>
              <button className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm">
                Archive
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Studies Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="w-12 px-6 py-3">
                  <input
                    type="checkbox"
                    checked={selectedStudies.length === filteredStudies.length && filteredStudies.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedStudies(filteredStudies.map(study => study.id));
                      } else {
                        setSelectedStudies([]);
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Study
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Creator
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Participants
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Updated
                </th>
                <th className="w-12 px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredStudies.map((study) => (
                <tr key={study.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedStudies.includes(study.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedStudies([...selectedStudies, study.id]);
                        } else {
                          setSelectedStudies(selectedStudies.filter(id => id !== study.id));
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{study.title}</div>
                      <div className="text-sm text-gray-600 truncate max-w-xs">
                        {study.description}
                      </div>
                      <div className="flex space-x-1 mt-1">
                        {study.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{study.creatorName}</div>
                      <div className="text-sm text-gray-600">{study.creatorEmail}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-gray-900">
                      {getTypeLabel(study.type)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {getStatusIcon(study.status)}
                      <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(study.status)}`}>
                        {study.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {study.participantCount} / {study.targetParticipants}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                        <div 
                          className="bg-blue-600 h-1.5 rounded-full" 
                          style={{ width: `${Math.min((study.participantCount / study.targetParticipants) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {study.completionRate.toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-600">
                        ★ {study.averageRating.toFixed(1)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {study.updatedAt.toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="relative">
                      <button className="p-2 hover:bg-gray-100 rounded-lg">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredStudies.length === 0 && (
          <div className="text-center py-12">
            <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No studies found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyOversight;
