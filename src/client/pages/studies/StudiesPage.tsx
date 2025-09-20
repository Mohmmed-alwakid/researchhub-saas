import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Users, 
  Calendar,
  Clock,
  DollarSign,
  RefreshCw
} from 'lucide-react';
// Enhanced UI components for professional appearance
import { Button, Input } from '../../components/ui';
import { Card, CardContent } from '../../components/ui/Card';
import { useAppStore } from '../../stores/appStore';
import { formatDistanceToNow } from 'date-fns';
import { IStudy } from '../../../shared/types';
import StudyCardActions from '../../components/studies/StudyCardActions';
import RenameStudyModal from '../../components/studies/RenameStudyModal';
import StudiesLoading from '../../components/studies/StudiesLoading';
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
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Rename modal state
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [studyToRename, setStudyToRename] = useState<IStudy | null>(null);
  const [isRenaming, setIsRenaming] = useState(false);

  useEffect(() => {
    fetchStudies();
    
    // Check for newly created study data in localStorage
    const newlyCreatedStudy = localStorage.getItem('newly-created-study');
    if (newlyCreatedStudy) {
      try {
        const studyData = JSON.parse(newlyCreatedStudy);
        console.log('🆕 Found newly created study in localStorage:', studyData.title);
        // Clear the localStorage item since we've retrieved it
        localStorage.removeItem('newly-created-study');
      } catch (error) {
        console.error('❌ Error parsing newly created study data:', error);
        localStorage.removeItem('newly-created-study');
      }
    }
  }, [fetchStudies]);

  // Refresh studies when returning from study builder
  useEffect(() => {
    // If user is coming from study builder, refresh the studies list
    if (location.state?.fromStudyBuilder) {
      console.log('👀 Detected return from Study Builder, refreshing studies...');
      
      // If there's newly created study data, add it temporarily to avoid waiting for API
      if (location.state?.newlyCreated && location.state?.studyData) {
        console.log('🆕 Adding newly created study to immediate display...');
        // This will be updated when fetchStudies completes
      }
      
      // Always fetch fresh data, with retries if needed
      const fetchWithRetry = async (retries = 3) => {
        for (let i = 0; i < retries; i++) {
          try {
            await fetchStudies();
            // Check if the new study appears
            const newlyCreatedId = location.state?.studyData?.id;
            if (newlyCreatedId && studies.some(s => s.id === newlyCreatedId)) {
              console.log('✅ Newly created study found in list!');
              break;
            } else if (i < retries - 1) {
              console.log(`🔄 Study not yet visible, retrying... (${i + 1}/${retries})`);
              await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
            }
          } catch (error) {
            console.error(`❌ Fetch attempt ${i + 1} failed:`, error);
            if (i === retries - 1) throw error;
          }
        }
      };
      
      fetchWithRetry().catch(error => {
        console.error('❌ All fetch attempts failed:', error);
      });
    }
  }, [location.state, fetchStudies, studies]);

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
  const handleRefresh = async () => {
    console.log('🔄 Manual refresh triggered');
    setIsRefreshing(true);
    try {
      await fetchStudies();
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle study creation flow - go directly to study builder
  const handleCreateNewStudy = (e: React.MouseEvent) => {
    e.preventDefault();
    // Skip the redundant modal and go directly to Study Builder
    navigate('/app/study-builder');
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
        // Refresh the studies list to reflect the deletion
        await fetchStudies();
        // Show success feedback (we'll add proper toast later)
        alert('Study deleted successfully!');
      } catch (error) {
        console.error('Failed to delete study:', error);
        alert('Failed to delete study. Please try again.');
      }
    }
  };

  // New action handlers for simplified study card
  const handleCardClick = (study: IStudy) => {
    console.log('🖱️ StudiesPage: Card clicked for study:', study);
    
    // Validate study object and ID
    if (!study) {
      console.error('❌ StudiesPage: Study object is null/undefined');
      return;
    }
    
    // Get the most reliable ID - prefer numeric id from enhanced API, fallback to _id
    const studyId = study.id || study._id;
    console.log('🔍 StudiesPage: Study ID for navigation:', studyId);
    
    if (!studyId || studyId === 'undefined' || studyId === 'null') {
      console.error('❌ StudiesPage: Invalid study ID:', studyId, 'Study:', study);
      alert('Unable to navigate to study - invalid study ID');
      return;
    }
    
    // Navigate to study details/overview page
    const navigationPath = `/app/studies/${studyId}`;
    console.log('🧭 StudiesPage: Navigating to:', navigationPath);
    navigate(navigationPath);
  };

  const handleEdit = (study: IStudy) => {
    setCurrentStudy(study);
    navigate(`/app/studies/${study.id || study._id}/edit`);
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
      alert('Study renamed successfully!');
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

  const handleLaunch = async (study: IStudy) => {
    try {
      console.log('🚀 Launching study:', study.id || study._id);
      
      // Update study status to active
      const updatedStudy = {
        ...study,
        status: 'active' as const,
        recruitmentStatus: 'recruiting' as const
      };
      
      await updateStudy(String(study.id || study._id), updatedStudy);
      
      // Refresh studies to show updated status
      await fetchStudies();
      
      alert(`Study "${study.title}" is now live and accepting participants!`);
    } catch (error) {
      console.error('Failed to launch study:', error);
      alert('Failed to launch study. Please try again.');
    }
  };

  const handlePause = async (study: IStudy) => {
    try {
      console.log('⏸️ Pausing study:', study.id || study._id);
      
      // Update study status to paused
      const updatedStudy = {
        ...study,
        status: 'paused' as const,
        recruitmentStatus: 'recruitment_closed' as const
      };
      
      await updateStudy(String(study.id || study._id), updatedStudy);
      
      // Refresh studies to show updated status
      await fetchStudies();
      
      alert(`Study "${study.title}" has been paused.`);
    } catch (error) {
      console.error('Failed to pause study:', error);
      alert('Failed to pause study. Please try again.');
    }
  };

  const handleViewResults = (study: IStudy) => {
    console.log('📊 Viewing results for study:', study.id || study._id);
    // Navigate to results page
    setCurrentStudy(study);
    navigate(`/results/${study.id || study._id}`);
  };

  if (studiesLoading) {
    return <StudiesLoading count={6} />;
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
            disabled={isRefreshing}
            title="Refresh studies list"
            leftIcon={
              isRefreshing ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )
            }
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button
            onClick={handleCreateNewStudy}
            variant="primary"
            size="md"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Create Study
          </Button>
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
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
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
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">No studies found</h3>
              <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                No studies match your current filters. Try adjusting your search criteria to see more results.
              </p>
              <Button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setTypeFilter('all');
                }}
                variant="outline"
                size="sm"
              >
                Clear Filters
              </Button>
            </div>          ) : (
            // Show empty state when no studies exist
            <div className="text-center py-20">
              <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-full flex items-center justify-center">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <Plus className="w-12 h-12 text-blue-500" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Welcome to Research Hub</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
                You haven't created any studies yet. Get started by creating your first research study and begin collecting valuable insights.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={handleCreateNewStudy}
                  variant="primary"
                  size="lg"
                  leftIcon={<Plus className="w-5 h-5" />}
                >
                  Create Your First Study
                </Button>
                <Button
                  onClick={() => window.open('/docs/getting-started', '_blank')}
                  variant="outline"
                  size="lg"
                >
                  View Documentation
                </Button>
              </div>
            </div>
          )}
        </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStudies.map((study) => (
            <Card 
              key={study.id || study._id} 
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
                    onDelete={(study) => handleDelete(String(study.id || study._id))}
                    onLaunch={handleLaunch}
                    onPause={handlePause}
                    onViewResults={handleViewResults}
                  />
                </div>
              </div>
            </Card>
            ))}
          </div>
        )}
      </div>

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
