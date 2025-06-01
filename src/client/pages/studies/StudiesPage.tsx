import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2, 
  Users, 
  Play, 
  Pause, 
  Calendar,
  Clock,
  DollarSign,
  UserCheck
} from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { formatDistanceToNow } from 'date-fns';

// Type for study object
interface Study {
  _id: string;
  title: string;
  description: string;
  type: 'usability' | 'interview' | 'survey' | 'prototype';
  status: 'draft' | 'recruiting' | 'active' | 'completed' | 'paused';
  createdBy: string;
  tasks: Record<string, unknown>[];
  participants: string[];
  settings: {
    maxParticipants: number;
    duration: number;
    compensation: number;
    recordScreen: boolean;
    recordAudio: boolean;
    collectHeatmaps: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

const StudiesPage: React.FC = () => {
  const { 
    studies, 
    studiesLoading, 
    fetchStudies, 
    deleteStudy,
    updateStudy,
    setCurrentStudy 
  } = useAppStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    fetchStudies();
  }, [fetchStudies]);

  const filteredStudies = studies.filter(study => {
    const matchesSearch = study.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         study.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || study.status === statusFilter;
    const matchesType = typeFilter === 'all' || study.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: string) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-800',
      recruiting: 'bg-blue-100 text-blue-800',
      active: 'bg-green-100 text-green-800',
      completed: 'bg-purple-100 text-purple-800',
      paused: 'bg-yellow-100 text-yellow-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      usability: '🖥️',
      interview: '🎤',
      survey: '📋',
      prototype: '🎨'
    };
    
    return icons[type as keyof typeof icons] || '📊';
  };  const handleStatusToggle = async (study: Study) => {
    const newStatus = study.status === 'active' ? 'paused' : 'active';
    if (study.status === 'draft') return;
    
    try {
      await updateStudy(study._id, { status: newStatus });
    } catch (error) {
      console.error('Failed to update study status:', error);
    }
  };

  const handleDelete = async (studyId: string) => {
    if (window.confirm('Are you sure you want to delete this study? This action cannot be undone.')) {
      try {
        await deleteStudy(studyId);
      } catch (error) {
        console.error('Failed to delete study:', error);
      }
    }
  };

  if (studiesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Studies</h1>
          <p className="text-gray-600 mt-1">Manage your research studies and track progress</p>
        </div>
        <Link
          to="/studies/new"
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Study
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search studies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="recruiting">Recruiting</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="paused">Paused</option>
            </select>
          </div>

          {/* Type Filter */}
          <div className="sm:w-48">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Types</option>
              <option value="usability">Usability</option>
              <option value="interview">Interview</option>
              <option value="survey">Survey</option>
              <option value="prototype">Prototype</option>
            </select>
          </div>
        </div>
      </div>

      {/* Studies Grid */}
      {filteredStudies.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
            📊
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No studies found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' 
              ? 'Try adjusting your filters' 
              : 'Get started by creating your first study'
            }
          </p>
          {!searchTerm && statusFilter === 'all' && typeFilter === 'all' && (
            <Link
              to="/studies/new"
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Study
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudies.map((study) => (
            <div key={study._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{getTypeIcon(study.type)}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900 line-clamp-1">{study.title}</h3>
                    <p className="text-sm text-gray-600 capitalize">{study.type}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(study.status)}
                  <div className="relative">
                    <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{study.description}</p>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="w-4 h-4 mr-2" />
                  {study.participants.length}/{study.settings.maxParticipants}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="w-4 h-4 mr-2" />
                  {study.settings.duration}min
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <DollarSign className="w-4 h-4 mr-2" />
                  ${study.settings.compensation}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  {formatDistanceToNow(new Date(study.createdAt), { addSuffix: true })}
                </div>
              </div>              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-2">
                  <Link
                    to={`/studies/${study._id}`}
                    onClick={() => setCurrentStudy(study)}
                    className="p-2 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                    title="View study"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                  <Link
                    to={`/studies/${study._id}/edit`}
                    onClick={() => setCurrentStudy(study)}
                    className="p-2 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                    title="Edit study"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                  <Link
                    to={`/app/studies/${study._id}/applications`}
                    className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                    title="View applications"
                  >
                    <UserCheck className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => handleDelete(study._id)}
                    className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    title="Delete study"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {study.status !== 'draft' && study.status !== 'completed' && (
                  <button
                    onClick={() => handleStatusToggle(study)}
                    className={`p-2 rounded-lg transition-colors ${
                      study.status === 'active'
                        ? 'text-yellow-600 hover:bg-yellow-50'
                        : 'text-green-600 hover:bg-green-50'
                    }`}
                    title={study.status === 'active' ? 'Pause study' : 'Resume study'}
                  >
                    {study.status === 'active' ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudiesPage;
