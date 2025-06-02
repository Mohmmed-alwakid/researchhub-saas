import React, { useState, useEffect, useCallback } from 'react';
import { 
  Database,
  Play,
  Pause,
  AlertCircle,
  CheckCircle,
  Clock
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

const StudyOversight: React.FC = () => {
  const [studies, setStudies] = useState<Study[]>([]);
  const [filteredStudies, setFilteredStudies] = useState<Study[]>([]);

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
        }
      ];
      
      setStudies(mockStudies);
      setFilteredStudies(mockStudies);
    } catch (error) {
      console.error('Failed to fetch studies:', error);
    }
  };

  const getStatusBadge = useCallback((status: string) => {
    const statusConfig = {
      draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800', icon: Clock },
      active: { label: 'Active', color: 'bg-green-100 text-green-800', icon: Play },
      paused: { label: 'Paused', color: 'bg-yellow-100 text-yellow-800', icon: Pause },
      completed: { label: 'Completed', color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
      archived: { label: 'Archived', color: 'bg-red-100 text-red-800', icon: AlertCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    );
  }, []);

  const getTypeLabel = useCallback((type: string) => {
    const typeLabels = {
      usability: 'Usability Test',
      survey: 'Survey',
      interview: 'Interview',
      a_b_test: 'A/B Test',
      card_sorting: 'Card Sorting'
    };
    return typeLabels[type as keyof typeof typeLabels] || type;
  }, []);

  useEffect(() => {
    fetchStudies();
  }, []);

  const totalStudies = studies.length;
  const activeStudies = studies.filter(s => s.status === 'active').length;
  const totalParticipants = studies.reduce((sum, study) => sum + study.participantCount, 0);
  const totalDataSize = studies.reduce((sum, study) => sum + study.dataSize, 0);

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Study Oversight</h1>
        <p className="text-gray-600">Monitor and manage all studies across the platform</p>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Database className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Studies</p>
              <p className="text-2xl font-bold text-gray-900">{totalStudies}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Play className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Studies</p>
              <p className="text-2xl font-bold text-gray-900">{activeStudies}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Participants</p>
              <p className="text-2xl font-bold text-gray-900">{totalParticipants.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Data Size</p>
              <p className="text-2xl font-bold text-gray-900">{(totalDataSize / 1024).toFixed(1)}GB</p>
            </div>
          </div>
        </div>
      </div>

      {/* Studies Table */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">All Studies</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Study
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Creator
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Participants
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Completion
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudies.map((study) => (
                <tr key={study.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{study.title}</div>
                      <div className="text-sm text-gray-500">{study.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{study.creatorName}</div>
                      <div className="text-sm text-gray-500">{study.creatorEmail}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(study.status)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {getTypeLabel(study.type)}
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredStudies.length === 0 && (
          <div className="text-center py-12">
            <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No studies found</h3>
            <p className="text-gray-600">No studies available to display.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyOversight;
