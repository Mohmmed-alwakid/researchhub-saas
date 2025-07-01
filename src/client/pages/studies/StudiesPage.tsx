import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
  UserCheck,
  BarChart3
} from 'lucide-react';
// Enhanced UI components for professional appearance
import { Button, Input } from '../../components/ui';
import { Card, CardContent } from '../../components/ui/Card';
import { useAppStore } from '../../stores/appStore';
import { formatDistanceToNow } from 'date-fns';
import { IStudy } from '../../../shared/types';

const StudiesPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
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

  // Refresh studies when returning from study builder
  useEffect(() => {
    // If user is coming from study builder, refresh the studies list
    if (location.state?.fromStudyBuilder) {
      console.log('👀 Detected return from Study Builder, refreshing studies...');
      fetchStudies();
    }
  }, [location.state, fetchStudies]);

  // Also refresh when window regains focus (user returns from another tab/app)
  useEffect(() => {
    const handleFocus = () => {
      console.log('🔍 Window focused, refreshing studies...');
      fetchStudies();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchStudies]);

  // Handle manual refresh
  const handleRefresh = () => {
    console.log('🔄 Manual refresh triggered');
    fetchStudies();
  };

  // Handle study creation flow - direct to new Study Builder
  const handleCreateNewStudy = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/app/study-builder');
  };

  const filteredStudies = (studies || []).filter(study => {
    const matchesSearch = (study.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (study.description || '').toLowerCase().includes(searchTerm.toLowerCase());
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
  };  const handleStatusToggle = async (study: IStudy) => {
    const newStatus = study.status === 'active' ? 'paused' : 'active';
    if (study.status === 'draft') return;
    
    try {
      await updateStudy(study._id, { status: newStatus });
    } catch (error) {
      console.error('Failed to update study status:', error);
    }
  };

  const handlePublishStudy = async (study: IStudy) => {
    try {
      // Update study to active status and make it public
      await updateStudy(study._id, { 
        status: 'active',
        visibility: 'public' 
      });
      
      // Show success message
      alert('Ready to go!\n\nLooking good! Is it time to put this in front of testers and start collecting insights?');
    } catch (error) {
      console.error('Failed to publish study:', error);
      alert('Failed to publish study. Please try again.');
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
        <div className="flex space-x-3">
          <Button
            onClick={handleRefresh}
            variant="secondary"
            size="md"
            title="Refresh studies list"
            leftIcon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            }
          >
            Refresh
          </Button>
          <Button
            onClick={() => navigate('/app/study-builder')}
            variant="primary"
            size="md"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Create Study
          </Button>
          <button
            onClick={handleCreateNewStudy}
            className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors border border-gray-300"
          >
            <Plus className="w-4 h-4 mr-2" />
            Quick Study
          </button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search studies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
              variant="default"
              size="md"
            />
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
        </CardContent>
      </Card>

      {/* Studies Grid */}
      {filteredStudies.length === 0 ? (
        <div>
          {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' ? (
            // Show basic empty state when filters are applied
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
                📊
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No studies found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your filters to see more results
              </p>
            </div>          ) : (
            // Show empty state when no studies exist
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Plus className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No studies yet</h3>
              <p className="text-gray-600 mb-6">
                Get started by creating your first research study
              </p>
              <button
                onClick={handleCreateNewStudy}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Study
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudies.map((study) => (
            <Card 
              key={study._id} 
              className="p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/app/studies/${study._id}/results`)}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{getTypeIcon(study.type)}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900 line-clamp-1">{study.title}</h3>
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
              <div className="grid grid-cols-2 gap-4 mb-4">                <div className="flex items-center text-sm text-gray-600">
                  <Users className="w-4 h-4 mr-2" />
                  {study.participants?.enrolled || 0}/{study.participants?.target || study.settings?.maxParticipants || 10}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="w-4 h-4 mr-2" />
                  {study.settings?.duration || 30}min
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <DollarSign className="w-4 h-4 mr-2" />
                  ${study.settings?.compensation || 25}
                </div>                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  {study.createdAt ? formatDistanceToNow(new Date(study.createdAt), { addSuffix: true }) : 'Unknown date'}
                </div>
              </div>              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                  <Link
                    to={`/studies/${study._id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentStudy(study);
                    }}
                    className="p-2 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                    title="View study"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>                  <Link
                    to={`/app/studies/${study._id}/edit`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentStudy(study);
                    }}
                    className="p-2 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                    title="Edit study"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                  <Link
                    to={`/app/studies/${study._id}/applications`}
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                    title="View applications"
                  >
                    <UserCheck className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(study._id);
                    }}
                    className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    title="Delete study"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Action buttons based on study status */}
                <div className="flex items-center space-x-2">
                  {/* Draft studies: Start Testing button */}
                  {study.status === 'draft' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePublishStudy(study);
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                      title="Publish study and make it available to participants"
                    >
                      Start Testing
                    </button>
                  )}

                  {/* Active/Paused studies: Management buttons */}
                  {(study.status === 'active' || study.status === 'paused') && (
                    <>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/app/studies/${study._id}/applications`);
                        }}
                        variant="primary"
                        size="sm"
                        leftIcon={<UserCheck className="w-4 h-4" />}
                        title="Manage participant applications"
                      >
                        Applications
                      </Button>
                      
                      <Link
                        to={`/app/studies/${study._id}/results`}
                        className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium inline-flex items-center gap-2"
                        title="View study results and analytics"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <BarChart3 className="w-4 h-4" />
                        Results
                      </Link>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusToggle(study);
                        }}
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
                    </>
                  )}

                  {/* Completed studies: View Results only */}
                  {study.status === 'completed' && (
                    <Link
                      to={`/app/studies/${study._id}/results`}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium inline-flex items-center gap-2"
                      title="View final study results"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <BarChart3 className="w-4 h-4" />
                      View Results
                    </Link>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudiesPage;
