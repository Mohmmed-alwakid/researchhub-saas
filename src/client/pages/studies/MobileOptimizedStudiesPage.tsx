/**
 * Mobile-optimized StudiesPage integration demo
 * Demonstrates how to integrate mobile components into existing pages
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Users, 
  Calendar,
  Clock,
  DollarSign,
  UserCheck,
  BarChart3
} from 'lucide-react';

// Import mobile-optimized components
import { 
  MobileButton, 
  MobileInput, 
  MobileCard, 
  MobileNav 
} from '../../components/ui/MobileOptimizedComponents';
import { useMobileViewport } from '../../hooks/mobile';

// Enhanced UI components for desktop fallback
import { Button, Input } from '../../components/ui';
import { Card, CardContent } from '../../components/ui/Card';
import { useAppStore } from '../../stores/appStore';
import { formatDistanceToNow } from 'date-fns';

const MobileOptimizedStudiesPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isMobile, isTablet } = useMobileViewport();
  
  const { 
    studies, 
    studiesLoading, 
    fetchStudies
  } = useAppStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    fetchStudies();
  }, [fetchStudies]);

  // Refresh studies when returning from study builder
  useEffect(() => {
    if (location.state?.fromStudyBuilder) {
      console.log('👀 Detected return from Study Builder, refreshing studies...');
      fetchStudies();
    }
  }, [location.state, fetchStudies]);

  const filteredStudies = studies?.filter(study => {
    const matchesSearch = study.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         study.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || study.status === statusFilter;
    const matchesType = typeFilter === 'all' || study.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  }) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'draft': return 'text-gray-600 bg-gray-100';
      case 'completed': return 'text-blue-600 bg-blue-100';
      case 'paused': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const navigateToStudyBuilder = () => {
    navigate('/app/study-builder');
  };

  const navigateToStudyDetail = (studyId: string) => {
    navigate(`/studies/${studyId}`);
  };

  // Mobile navigation items
  const navItems = [
    { label: 'Studies', href: '/studies', active: true },
    { label: 'Templates', href: '/templates', active: false },
    { label: 'Analytics', href: '/analytics', active: false },
    { label: 'Settings', href: '/settings', active: false }
  ];

  const handleNavigation = (href: string) => {
    navigate(href);
  };

  if (studiesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading studies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      {(isMobile || isTablet) && (
        <div className="bg-white border-b border-gray-200 px-4 py-3 safe-area-inset-top">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">Studies</h1>
            <MobileNav 
              items={navItems}
              onItemClick={handleNavigation}
            />
          </div>
        </div>
      )}

      {/* Desktop Header */}
      {!isMobile && !isTablet && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <h1 className="text-2xl font-bold text-gray-900">Studies</h1>
              <Button onClick={navigateToStudyBuilder}>
                <Plus className="w-4 h-4 mr-2" />
                Create Study
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className={`max-w-7xl mx-auto ${isMobile ? 'px-4 py-4' : 'px-4 sm:px-6 lg:px-8 py-8'}`}>
        {/* Mobile Create Button */}
        {(isMobile || isTablet) && (
          <div className="mb-6">
            <MobileButton
              onClick={navigateToStudyBuilder}
              variant="primary"
              size="large"
              className="w-full"
              ariaLabel="Create new study"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Study
            </MobileButton>
          </div>
        )}

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          {/* Mobile Search */}
          {(isMobile || isTablet) ? (
            <MobileInput
              label="Search studies"
              type="text"
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search by title or description..."
            />
          ) : (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search studies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          )}

          {/* Filters */}
          <div className={`grid ${isMobile ? 'grid-cols-1 gap-3' : 'grid-cols-3 gap-4'}`}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`${isMobile ? 'min-h-[48px]' : ''} border border-gray-300 rounded-lg px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className={`${isMobile ? 'min-h-[48px]' : ''} border border-gray-300 rounded-lg px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="all">All Types</option>
              <option value="user-testing">User Testing</option>
              <option value="survey">Survey</option>
              <option value="interview">Interview</option>
              <option value="card-sort">Card Sort</option>
            </select>
          </div>
        </div>

        {/* Studies Grid */}
        <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : isTablet ? 'grid-cols-2' : 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3'}`}>
          {filteredStudies.length === 0 ? (
            <div className="col-span-full">
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <BarChart3 className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No studies found</h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' 
                    ? 'Try adjusting your search or filters'
                    : 'Get started by creating your first study'
                  }
                </p>
                {(!searchTerm && statusFilter === 'all' && typeFilter === 'all') && (
                  isMobile ? (
                    <MobileButton
                      onClick={navigateToStudyBuilder}
                      variant="primary"
                      ariaLabel="Create your first study"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Study
                    </MobileButton>
                  ) : (
                    <Button onClick={navigateToStudyBuilder}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Study
                    </Button>
                  )
                )}
              </div>
            </div>
          ) : (
            filteredStudies.map((study) => (
              <React.Fragment key={study._id}>
                {/* Mobile Card */}
                {(isMobile || isTablet) ? (
                  <MobileCard
                    onClick={() => navigateToStudyDetail(study._id)}
                    className="space-y-4"
                  >
                    {/* Study Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
                          {study.title}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(study.status)}`}>
                          {study.status}
                        </span>
                      </div>
                      <button className="touch-target p-2 -mr-2 text-gray-400 hover:text-gray-600">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Study Description */}
                    {study.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {study.description}
                      </p>
                    )}

                    {/* Study Stats */}
                    <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100">
                      <div className="flex items-center text-sm text-gray-500">
                        <Users className="w-4 h-4 mr-1.5" />
                        <span>{study.participants?.enrolled || 0} participants</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-1.5" />
                        <span>{formatDistanceToNow(new Date(study.createdAt))} ago</span>
                      </div>
                    </div>

                    {/* Mobile Action Buttons */}
                    <div className="flex space-x-2 pt-3 border-t border-gray-100">
                      <MobileButton
                        onClick={() => {
                          navigate(`/studies/${study._id}/edit`);
                        }}
                        variant="secondary"
                        size="small"
                        className="flex-1"
                        ariaLabel={`Edit ${study.title}`}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </MobileButton>
                      <MobileButton
                        onClick={() => {
                          navigate(`/studies/${study._id}/results`);
                        }}
                        variant="secondary"
                        size="small"
                        className="flex-1"
                        ariaLabel={`View results for ${study.title}`}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Results
                      </MobileButton>
                    </div>
                  </MobileCard>
                ) : (
                  /* Desktop Card */
                  <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer" onClick={() => navigateToStudyDetail(study._id)}>
                    <CardContent className="p-6">
                      {/* Study Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">
                            {study.title}
                          </h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(study.status)}`}>
                            {study.status}
                          </span>
                        </div>
                        <button 
                          onClick={(e) => e.stopPropagation()}
                          className="text-gray-400 hover:text-gray-600 p-1"
                        >
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Study Description */}
                      {study.description && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {study.description}
                        </p>
                      )}

                      {/* Study Stats */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center text-sm text-gray-500">
                          <Users className="w-4 h-4 mr-2" />
                          <span>{study.participants?.enrolled || 0} participants</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="w-4 h-4 mr-2" />
                          <span>{formatDistanceToNow(new Date(study.createdAt))} ago</span>
                        </div>
                      </div>

                      {/* Desktop Action Buttons */}
                      <div className="flex space-x-2 pt-4 border-t border-gray-100">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/studies/${study._id}/edit`);
                          }}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/studies/${study._id}/results`);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Results
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </React.Fragment>
            ))
          )}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-inset-bottom">
          <div className="grid grid-cols-4 py-2">
            <button 
              onClick={() => navigate('/studies')}
              className="touch-target-comfortable flex flex-col items-center text-xs font-medium text-blue-600"
            >
              <BarChart3 className="w-6 h-6 mb-1" />
              Studies
            </button>
            <button 
              onClick={() => navigate('/templates')}
              className="touch-target-comfortable flex flex-col items-center text-xs font-medium text-gray-600"
            >
              <Calendar className="w-6 h-6 mb-1" />
              Templates
            </button>
            <button 
              onClick={() => navigate('/analytics')}
              className="touch-target-comfortable flex flex-col items-center text-xs font-medium text-gray-600"
            >
              <DollarSign className="w-6 h-6 mb-1" />
              Analytics
            </button>
            <button 
              onClick={() => navigate('/settings')}
              className="touch-target-comfortable flex flex-col items-center text-xs font-medium text-gray-600"
            >
              <UserCheck className="w-6 h-6 mb-1" />
              Settings
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileOptimizedStudiesPage;
