import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Users, 
  Calendar,
  Clock,
  DollarSign
} from 'lucide-react';
// Enhanced UI components for professional appearance
import { Button, Input } from '../../components/ui';
import { Card, CardContent } from '../../components/ui/Card';
import { useAppStore } from '../../stores/appStore';
import { formatDistanceToNow } from 'date-fns';
import { IStudy } from '../../../shared/types';
import { SimplifiedStudyCreationModal } from '../../components/studies/SimplifiedStudyCreationModal';
import StudyCardActions from '../../components/studies/StudyCardActions';
import RenameStudyModal from '../../components/studies/RenameStudyModal';
import '../../styles/study-card.css';

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
  
  // Study creation modal state
  const [showStudyModal, setShowStudyModal] = useState(false);
  
  // Rename modal state
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [studyToRename, setStudyToRename] = useState<IStudy | null>(null);
  const [isRenaming, setIsRenaming] = useState(false);

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

  // Handle study creation flow - show simplified modal per requirements
  const handleCreateNewStudy = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowStudyModal(true);
  };

  const handleSelectStudyType = (type: 'unmoderated' | 'moderated') => {
    // Route based on study type selection per requirements
    if (type === 'unmoderated') {
      // Navigate to usability study builder per Step 2A requirements
      navigate('/app/study-builder', { 
        state: { 
          studyType: 'usability',
          fromModal: true 
        }
      });
    } else {
      // Navigate to interview session configuration per Step 2B requirements  
      navigate('/app/study-builder', { 
        state: { 
          studyType: 'interview',
          fromModal: true 
        }
      });
    }
  };

  const filteredStudies = (studies || []).filter(study => {
    const matchesSearch = (study.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (study.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || study.status === statusFilter;
    const matchesType = typeFilter === 'all' || study.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: string | undefined) => {
    // Handle undefined/null status with default
    const safeStatus = status || 'draft';
    
    const styles = {
      draft: 'bg-gray-100 text-gray-800 border-gray-200',
      recruiting: 'bg-blue-100 text-blue-800 border-blue-200',
      active: 'bg-green-100 text-green-800 border-green-200',
      completed: 'bg-purple-100 text-purple-800 border-purple-200',
      paused: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${styles[safeStatus as keyof typeof styles]} min-w-0 text-center`}>
        {safeStatus.charAt(0).toUpperCase() + safeStatus.slice(1)}
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

  // New action handlers for simplified study card
  const handleCardClick = (study: IStudy) => {
    // Navigate to study details/overview page
    navigate(`/app/studies/${study._id}`);
  };

  const handleEdit = (study: IStudy) => {
    setCurrentStudy(study);
    navigate(`/app/studies/${study._id}/edit`);
  };

  const handleRename = (study: IStudy) => {
    setStudyToRename(study);
    setShowRenameModal(true);
  };

  const handleRenameSubmit = async (newTitle: string) => {
    if (!studyToRename) return;
    
    setIsRenaming(true);
    try {
      await updateStudy(studyToRename._id, { title: newTitle });
      setShowRenameModal(false);
      setStudyToRename(null);
    } catch (error) {
      console.error('Failed to rename study:', error);
      alert('Failed to rename study. Please try again.');
    } finally {
      setIsRenaming(false);
    }
  };

  const handleDuplicate = async (study: IStudy) => {
    try {
      // For now, we'll create a copy with "(Copy)" suffix
      // In a real implementation, this would call a duplicate API endpoint
      const duplicatedStudy = {
        ...study,
        title: `${study.title} (Copy)`,
        status: 'draft' as const,
        participants: { enrolled: 0, target: study.participants?.target || 10 }
      };
      
      // This would be replaced with actual API call
      console.log('Duplicating study:', duplicatedStudy);
      alert('Study duplication feature is coming soon!');
    } catch (error) {
      console.error('Failed to duplicate study:', error);
      alert('Failed to duplicate study. Please try again.');
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
            onClick={handleCreateNewStudy}
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
      <div className="mt-8">
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
              className="group relative p-6 hover:shadow-xl hover:shadow-indigo-500/20 transition-all duration-300 cursor-pointer bg-gradient-to-br from-white via-white to-indigo-50/30 border border-gray-200/80 hover:border-indigo-300/60 backdrop-blur-sm hover:scale-[1.02] flex flex-col h-full"
              onClick={() => handleCardClick(study)}
            >
              {/* Header */}
              <div className="flex items-start mb-6">
                <div className="flex items-start flex-1 min-w-0">
                  <div className="flex flex-col items-center mr-3 flex-shrink-0">
                    <div className="text-3xl p-2 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 mb-2">
                      {getTypeIcon(study.type)}
                    </div>
                    {getStatusBadge(study.status)}
                  </div>
                  <div className="min-w-0 flex-1 pt-2">
                    <h3 className="study-card-title font-bold text-lg text-gray-900 group-hover:text-indigo-700 transition-colors" title={study.title}>
                      {study.title}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <p 
                  className="study-card-description text-gray-600 text-sm leading-relaxed bg-gray-50/50 p-3 rounded-lg border border-gray-100"
                  title={study.description}
                >
                  {study.description}
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-6 p-4 bg-gradient-to-r from-gray-50/80 to-indigo-50/40 rounded-xl border border-gray-100/80">
                <div className="flex items-center text-sm text-gray-700 bg-white/60 p-2 rounded-lg min-w-0">
                  <Users className="w-4 h-4 mr-2 text-blue-500 flex-shrink-0" />
                  <span className="study-card-stat font-medium">{study.participants?.enrolled || 0}/{study.participants?.target || study.settings?.maxParticipants || 10}</span>
                </div>
                <div className="flex items-center text-sm text-gray-700 bg-white/60 p-2 rounded-lg min-w-0">
                  <Clock className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" />
                  <span className="study-card-stat font-medium">{study.settings?.duration || 30}min</span>
                </div>
                <div className="flex items-center text-sm text-gray-700 bg-white/60 p-2 rounded-lg min-w-0">
                  <DollarSign className="w-4 h-4 mr-2 text-yellow-500 flex-shrink-0" />
                  <span className="study-card-stat font-medium">${study.settings?.compensation || 25}</span>
                </div>
                <div className="flex items-center text-sm text-gray-700 bg-white/60 p-2 rounded-lg min-w-0">
                  <Calendar className="w-4 h-4 mr-2 text-purple-500 flex-shrink-0" />
                  <span className="study-card-stat font-medium" title={study.createdAt ? formatDistanceToNow(new Date(study.createdAt), { addSuffix: true }) : 'Unknown date'}>
                    {study.createdAt ? formatDistanceToNow(new Date(study.createdAt), { addSuffix: true }) : 'Unknown date'}
                  </span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="mt-auto pt-4 border-t border-gray-200/60">
                <div className="flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
                  <StudyCardActions
                    study={study}
                    onEdit={handleEdit}
                    onRename={handleRename}
                    onDuplicate={handleDuplicate}
                    onDelete={(study) => handleDelete(study._id)}
                  />
                </div>
              </div>
            </Card>
            ))}
          </div>
        )}
      </div>

      {/* Study Creation Modal */}
      <SimplifiedStudyCreationModal
        isOpen={showStudyModal}
        onClose={() => setShowStudyModal(false)}
        onSelectType={handleSelectStudyType}
      />

      {/* Rename Study Modal */}
      <RenameStudyModal
        isOpen={showRenameModal}
        currentTitle={studyToRename?.title || ''}
        onClose={() => {
          setShowRenameModal(false);
          setStudyToRename(null);
        }}
        onRename={handleRenameSubmit}
        isLoading={isRenaming}
      />
    </div>
  );
};

export default StudiesPage;
