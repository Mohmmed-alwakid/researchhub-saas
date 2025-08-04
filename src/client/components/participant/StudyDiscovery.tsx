/**
 * PHASE 5.1: PARTICIPANT EXPERIENCE - STUDY DISCOVERY
 * Comprehensive study discovery and browsing interface for participants
 * Requirements Source: docs/requirements/05-PARTICIPANT_EXPERIENCE.md
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../../stores/authStore';

// Type definitions for study discovery
interface PublicStudy {
  id: string;
  title: string;
  description: string;
  type: 'unmoderated' | 'moderated';
  duration: number; // in minutes
  compensation: number; // in dollars
  participantsNeeded: number;
  participantsEnrolled: number;
  status: 'recruiting' | 'active' | 'draft' | 'in_progress' | 'completed' | 'paused';
  eligibilityCriteria: string[];
  tags: string[];
  researcherName: string;
  researcherOrganization: string;
  estimatedCompletion: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  createdAt: string;
  applicationDeadline?: string;
  isApplied?: boolean;
  applicationStatus?: 'pending' | 'approved' | 'rejected' | 'completed';
}

interface StudyFilters {
  category: string;
  type: string;
  duration: string;
  compensation: string;
  difficulty: string;
  status: string;
  search: string;
  sortBy: 'newest' | 'compensation' | 'duration' | 'participants';
  sortOrder: 'asc' | 'desc';
}

interface ApplicationData {
  studyId: string;
  responses: Record<string, any>;
  eligibilityConfirmed: boolean;
}

// Study Discovery API Client
class StudyDiscoveryAPI {
  private baseUrl: string;
  private authClient: any; // TODO: Type this properly

  constructor(authClient: any, baseUrl = 'http://localhost:3003/api') {
    this.baseUrl = baseUrl;
    this.authClient = authClient;
  }

  private async makeRequest<T = unknown>(endpoint: string, options: RequestInit = {}): Promise<{
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
  }> {
    const token = this.authClient.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();
      
      return {
        success: response.ok,
        data: data.data || data,
        error: data.error,
        message: data.message
      };
    } catch (error) {
      console.error('Study Discovery API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Request failed'
      };
    }
  }

  async getPublicStudies(filters: StudyFilters, page = 1, limit = 12): Promise<{
    studies: PublicStudy[];
    total: number;
    pages: number;
  }> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        category: filters.category,
        type: filters.type,
        duration: filters.duration,
        compensation: filters.compensation,
        difficulty: filters.difficulty,
        status: filters.status,
        search: filters.search,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder
      });

      const response = await this.makeRequest<{
        studies: PublicStudy[];
        total: number;
        pages: number;
      }>(`/research-consolidated?action=get-studies&${params}`);

      // If API succeeds and returns data, use it
      if (response.success && response.data) {
        return response.data;
      }
      
      // If API fails, fallback to mock data
      console.log('🔄 API failed, using mock data:', response.error);
      return this.getMockStudies(filters, page, limit);
      
    } catch (error) {
      console.log('🔄 API error, using mock data:', error);
      return this.getMockStudies(filters, page, limit);
    }
  }

  async getStudyDetails(studyId: string): Promise<PublicStudy | null> {
    const response = await this.makeRequest<PublicStudy>(`/studies/${studyId}/details`);
    return response.data || this.getMockStudyDetails(studyId);
  }

  async applyForStudy(applicationData: ApplicationData): Promise<boolean> {
    const response = await this.makeRequest(`/studies/${applicationData.studyId}/apply`, {
      method: 'POST',
      body: JSON.stringify(applicationData)
    });
    return response.success;
  }

  async getMyApplications(): Promise<PublicStudy[]> {
    const response = await this.makeRequest<PublicStudy[]>('/applications/my');
    return response.data || this.getMockApplications();
  }

  // Mock data for development
  private getMockStudies(filters: StudyFilters, page: number, limit: number): {
    studies: PublicStudy[];
    total: number;
    pages: number;
  } {
    const allStudies: PublicStudy[] = [
      {
        id: 'study-1',
        title: 'Mobile App Usability Testing',
        description: 'Help us improve our mobile application by testing new features and providing feedback on user experience.',
        type: 'unmoderated',
        duration: 30,
        compensation: 25,
        participantsNeeded: 50,
        participantsEnrolled: 32,
        status: 'recruiting',
        eligibilityCriteria: ['Age 18-65', 'Smartphone user', 'English proficiency'],
        tags: ['Mobile', 'UX', 'Usability'],
        researcherName: 'Dr. Sarah Johnson',
        researcherOrganization: 'TechCorp Research',
        estimatedCompletion: '2025-07-25',
        difficulty: 'beginner',
        category: 'Technology',
        createdAt: '2025-07-10T10:00:00Z',
        applicationDeadline: '2025-07-20T23:59:59Z'
      },
      {
        id: 'study-2',
        title: 'Online Shopping Behavior Study',
        description: 'Participate in a comprehensive study about online shopping preferences and decision-making processes.',
        type: 'moderated',
        duration: 60,
        compensation: 75,
        participantsNeeded: 20,
        participantsEnrolled: 15,
        status: 'recruiting',
        eligibilityCriteria: ['Age 25-45', 'Regular online shopper', 'Available for video call'],
        tags: ['E-commerce', 'Consumer Behavior', 'Interview'],
        researcherName: 'Prof. Michael Chen',
        researcherOrganization: 'University of Commerce',
        estimatedCompletion: '2025-08-01',
        difficulty: 'intermediate',
        category: 'Business',
        createdAt: '2025-07-09T14:30:00Z',
        applicationDeadline: '2025-07-18T23:59:59Z'
      },
      {
        id: 'study-3',
        title: 'Educational Platform Feedback',
        description: 'Test our new educational platform and provide insights on learning experience and interface design.',
        type: 'unmoderated',
        duration: 45,
        compensation: 40,
        participantsNeeded: 30,
        participantsEnrolled: 28,
        status: 'recruiting',
        eligibilityCriteria: ['Students or educators', 'Experience with online learning', 'Age 18+'],
        tags: ['Education', 'E-learning', 'Interface Design'],
        researcherName: 'Dr. Emma Davis',
        researcherOrganization: 'EduTech Solutions',
        estimatedCompletion: '2025-07-30',
        difficulty: 'beginner',
        category: 'Education',
        createdAt: '2025-07-08T09:15:00Z',
        isApplied: true,
        applicationStatus: 'pending'
      },
      {
        id: 'study-4',
        title: 'Health App Navigation Study',
        description: 'Help improve healthcare app navigation through user testing and feedback sessions.',
        type: 'moderated',
        duration: 90,
        compensation: 100,
        participantsNeeded: 15,
        participantsEnrolled: 8,
        status: 'recruiting',
        eligibilityCriteria: ['Age 30-60', 'Uses health apps', 'Available for remote interview'],
        tags: ['Healthcare', 'Mobile App', 'Navigation'],
        researcherName: 'Dr. James Wilson',
        researcherOrganization: 'HealthTech Research',
        estimatedCompletion: '2025-08-05',
        difficulty: 'advanced',
        category: 'Healthcare',
        createdAt: '2025-07-07T16:45:00Z'
      },
      {
        id: 'study-5',
        title: 'Social Media Usage Patterns',
        description: 'Research study examining social media consumption habits and their impact on daily routines.',
        type: 'unmoderated',
        duration: 20,
        compensation: 15,
        participantsNeeded: 100,
        participantsEnrolled: 73,
        status: 'recruiting',
        eligibilityCriteria: ['Age 16-35', 'Active social media user', 'English speaking'],
        tags: ['Social Media', 'Behavior', 'Survey'],
        researcherName: 'Dr. Lisa Park',
        researcherOrganization: 'Digital Behavior Lab',
        estimatedCompletion: '2025-07-22',
        difficulty: 'beginner',
        category: 'Social Science',
        createdAt: '2025-07-06T11:20:00Z'
      },
      {
        id: 'study-6',
        title: 'Financial App Security Perceptions',
        description: 'Study participant perceptions of security features in financial applications.',
        type: 'moderated',
        duration: 75,
        compensation: 85,
        participantsNeeded: 25,
        participantsEnrolled: 25,
        status: 'in_progress',
        eligibilityCriteria: ['Age 25-55', 'Uses mobile banking', 'Security conscious'],
        tags: ['Finance', 'Security', 'Mobile Banking'],
        researcherName: 'Dr. Robert Kim',
        researcherOrganization: 'FinSec Research',
        estimatedCompletion: '2025-08-10',
        difficulty: 'intermediate',
        category: 'Finance',
        createdAt: '2025-07-05T13:00:00Z',
        isApplied: true,
        applicationStatus: 'approved'
      }
    ];

    // Apply filters
    let filteredStudies = allStudies.filter(study => {
      // Participants should only see active and recruiting studies (not draft)
      const isPublicStudy = study.status === 'recruiting' || study.status === 'active';
      
      const matchesSearch = !filters.search || 
        study.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        study.description.toLowerCase().includes(filters.search.toLowerCase()) ||
        (study.tags && study.tags.some(tag => tag.toLowerCase().includes(filters.search.toLowerCase())));
      
      const matchesCategory = !filters.category || study.category === filters.category;
      const matchesType = !filters.type || study.type === filters.type;
      const matchesDifficulty = !filters.difficulty || study.difficulty === filters.difficulty;
      const matchesStatus = !filters.status || study.status === filters.status;
      
      // Duration filter
      const matchesDuration = !filters.duration || (() => {
        switch (filters.duration) {
          case 'short': return study.duration <= 30;
          case 'medium': return study.duration > 30 && study.duration <= 60;
          case 'long': return study.duration > 60;
          default: return true;
        }
      })();

      // Compensation filter
      const matchesCompensation = !filters.compensation || (() => {
        switch (filters.compensation) {
          case 'low': return study.compensation < 30;
          case 'medium': return study.compensation >= 30 && study.compensation < 70;
          case 'high': return study.compensation >= 70;
          default: return true;
        }
      })();

      return isPublicStudy && matchesSearch && matchesCategory && matchesType && matchesDifficulty && 
             matchesStatus && matchesDuration && matchesCompensation;
    });

    // Apply sorting
    filteredStudies.sort((a, b) => {
      let comparison = 0;
      
      switch (filters.sortBy) {
        case 'newest':
          comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          break;
        case 'compensation':
          comparison = a.compensation - b.compensation;
          break;
        case 'duration':
          comparison = a.duration - b.duration;
          break;
        case 'participants':
          comparison = (a.participantsNeeded - a.participantsEnrolled) - (b.participantsNeeded - b.participantsEnrolled);
          break;
      }

      return filters.sortOrder === 'desc' ? -comparison : comparison;
    });

    // Apply pagination
    const total = filteredStudies.length;
    const pages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const studies = filteredStudies.slice(startIndex, startIndex + limit);

    return { studies, total, pages };
  }

  private getMockStudyDetails(studyId: string): PublicStudy | null {
    const studies = this.getMockStudies({
      category: '', type: '', duration: '', compensation: '', difficulty: '', 
      status: '', search: '', sortBy: 'newest', sortOrder: 'desc'
    }, 1, 100);
    
    return studies.studies.find(study => study.id === studyId) || null;
  }

  private getMockApplications(): PublicStudy[] {
    const allStudies = this.getMockStudies({
      category: '', type: '', duration: '', compensation: '', difficulty: '', 
      status: '', search: '', sortBy: 'newest', sortOrder: 'desc'
    }, 1, 100);
    
    return allStudies.studies.filter(study => study.isApplied);
  }
}

// Main Study Discovery Component
interface StudyDiscoveryProps {
  className?: string;
}

export const StudyDiscovery: React.FC<StudyDiscoveryProps> = ({ className = '' }) => {
  // Use the real auth store instead of temporary placeholders
  const { user, token, isAuthenticated } = useAuthStore();
  
  // Create auth client that provides the token properly
  const authClient = {
    getToken: () => token,
    isAuthenticated: () => isAuthenticated,
    user: user
  };
  
  const [studyAPI] = useState(() => new StudyDiscoveryAPI(authClient));

  // State management
  const [studies, setStudies] = useState<PublicStudy[]>([
    {
      id: 'mock-study-1',
      title: 'Test Study - Mock Data',
      description: 'This is mock data to test the interface while we fix the backend.',
      type: 'unmoderated',
      duration: 30,
      compensation: 25,
      participantsNeeded: 10,
      participantsEnrolled: 3,
      status: 'recruiting',
      eligibilityCriteria: ['Age 18+', 'English speaker'],
      tags: ['Test', 'Mock'],
      researcherName: 'Test Researcher',
      researcherOrganization: 'Test Org',
      estimatedCompletion: '2025-08-01',
      difficulty: 'beginner',
      category: 'Technology',
      createdAt: '2025-07-18T10:00:00Z'
    }
  ]);
  const [totalStudies, setTotalStudies] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStudy, setSelectedStudy] = useState<PublicStudy | null>(null);
  const [showStudyModal, setShowStudyModal] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);

  // Filter state
  const [filters, setFilters] = useState<StudyFilters>({
    category: '',
    type: '',
    duration: '',
    compensation: '',
    difficulty: '',
    status: 'recruiting',
    search: '',
    sortBy: 'newest',
    sortOrder: 'desc'
  });

  // Load studies data
  const loadStudies = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔍 LoadStudies Debug:', { filters, currentPage, studyAPI });
      
      const result = await studyAPI.getPublicStudies(filters, currentPage, 12);
      
      console.log('🔍 LoadStudies Result:', { result, studies: result?.studies });
      
      setStudies(result?.studies || []);
      setTotalStudies(result?.total || 0);
      setTotalPages(result?.pages || 0);
    } catch (err) {
      console.error('LoadStudies Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load studies');
      setStudies([]); // Ensure studies is always an array
    } finally {
      setIsLoading(false);
    }
  }, [studyAPI, filters, currentPage]);

  // Initialize component
  useEffect(() => {
    loadStudies();
  }, [loadStudies]);

  // Handle filter changes
  const handleFilterChange = (key: keyof StudyFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Handle study application
  const handleApplyForStudy = async (studyId: string, responses: Record<string, any>) => {
    try {
      const success = await studyAPI.applyForStudy({
        studyId,
        responses,
        eligibilityConfirmed: true
      });

      if (success) {
        await loadStudies(); // Refresh the list
        setShowApplicationModal(false);
        setSelectedStudy(null);
      } else {
        setError('Failed to submit application');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit application');
    }
  };

  // Authentication check for participants
  if (!isAuthenticated) {
    return (
      <div className={`min-h-screen bg-gray-50 flex items-center justify-center ${className}`}>
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-lg text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Discover Research Studies</h2>
          <p className="text-gray-600 mb-6">
            Join research studies and earn compensation for your participation.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-sm">
              <strong>Sign in to get started!</strong><br />
              Participant Test Account:<br />
              Email: abwanwr77+participant@gmail.com<br />
              Password: Testtest123
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Discover Studies</h1>
              <p className="text-gray-600 mt-1">
                Find and participate in research studies that match your interests
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                {totalStudies} studies available
              </div>
              {user?.role === 'participant' && (
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                  Participant
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="text-red-600 mr-3">⚠️</div>
              <div className="text-red-700">{error}</div>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-600 hover:text-red-800"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Studies
                </label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Search by title, description, or tags..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Categories</option>
                  <option value="Technology">Technology</option>
                  <option value="Business">Business</option>
                  <option value="Education">Education</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Social Science">Social Science</option>
                  <option value="Finance">Finance</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Study Type
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Types</option>
                  <option value="unmoderated">Unmoderated</option>
                  <option value="moderated">Moderated Interview</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration
                </label>
                <select
                  value={filters.duration}
                  onChange={(e) => handleFilterChange('duration', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Any Duration</option>
                  <option value="short">Short (&le;30 min)</option>
                  <option value="medium">Medium (31-60 min)</option>
                  <option value="long">Long (&gt;60 min)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Compensation
                </label>
                <select
                  value={filters.compensation}
                  onChange={(e) => handleFilterChange('compensation', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Any Amount</option>
                  <option value="low">Low (&lt;$30)</option>
                  <option value="medium">Medium ($30-$70)</option>
                  <option value="high">High (&gt;$70)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty
                </label>
                <select
                  value={filters.difficulty}
                  onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Any Level</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="newest">Newest</option>
                  <option value="compensation">Compensation</option>
                  <option value="duration">Duration</option>
                  <option value="participants">Spots Available</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={loadStudies}
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isLoading ? 'Loading...' : 'Refresh'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Studies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {isLoading ? (
            // Loading skeleton
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))
          ) : (
            (studies || []).map((study) => (
              <StudyCard
                key={study.id}
                study={study}
                onViewDetails={() => {
                  setSelectedStudy(study);
                  setShowStudyModal(true);
                }}
                onApply={() => {
                  setSelectedStudy(study);
                  setShowApplicationModal(true);
                }}
              />
            ))
          )}
        </div>

        {/* Empty State */}
        {!isLoading && studies.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No studies found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your filters or search terms to find more studies.
            </p>
            <button
              onClick={() => {
                setFilters({
                  category: '', type: '', duration: '', compensation: '', 
                  difficulty: '', status: 'recruiting', search: '', 
                  sortBy: 'newest', sortOrder: 'desc'
                });
                setCurrentPage(1);
              }}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center">
            <div className="flex space-x-1">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
              >
                Previous
              </button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                if (pageNum > totalPages) return null;
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-2 border rounded-lg text-sm ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Study Details Modal */}
        {showStudyModal && selectedStudy && (
          <StudyDetailsModal
            study={selectedStudy}
            onClose={() => {
              setShowStudyModal(false);
              setSelectedStudy(null);
            }}
            onApply={() => {
              setShowStudyModal(false);
              setShowApplicationModal(true);
            }}
          />
        )}

        {/* Study Application Modal */}
        {showApplicationModal && selectedStudy && (
          <StudyApplicationModal
            study={selectedStudy}
            onClose={() => {
              setShowApplicationModal(false);
              setSelectedStudy(null);
            }}
            onSubmit={(responses) => handleApplyForStudy(selectedStudy.id, responses)}
          />
        )}
      </div>
    </div>
  );
};

// Study Card Component
const StudyCard: React.FC<{
  study: PublicStudy;
  onViewDetails: () => void;
  onApply: () => void;
}> = ({ study, onViewDetails, onApply }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'recruiting': return 'bg-green-100 text-green-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getApplicationStatusColor = (status?: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const spotsRemaining = study.participantsNeeded - study.participantsEnrolled;
  const progressPercentage = (study.participantsEnrolled / study.participantsNeeded) * 100;

  return (
    <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{study.title}</h3>
            <div className="flex items-center space-x-2 mb-2">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(study.status)}`}>
                {study.status.replace('_', ' ')}
              </span>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(study.difficulty)}`}>
                {study.difficulty}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-green-600">${study.compensation}</div>
            <div className="text-xs text-gray-500">{study.duration} min</div>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{study.description}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-4">
          {study.tags && study.tags.slice(0, 3).map((tag, index) => (
            <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 text-xs rounded">
              {tag}
            </span>
          ))}
          {study.tags && study.tags.length > 3 && (
            <span className="bg-gray-100 text-gray-700 px-2 py-1 text-xs rounded">
              +{study.tags.length - 3} more
            </span>
          )}
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-600">Participants</span>
            <span className="text-xs text-gray-600">
              {study.participantsEnrolled}/{study.participantsNeeded}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {spotsRemaining > 0 ? `${spotsRemaining} spots remaining` : 'Fully enrolled'}
          </div>
        </div>

        {/* Researcher Info */}
        <div className="text-xs text-gray-500 mb-4">
          By {study.researcherName} • {study.researcherOrganization}
        </div>

        {/* Application Status or Actions */}
        {study.isApplied ? (
          <div className="flex items-center justify-between">
            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getApplicationStatusColor(study.applicationStatus)}`}>
              {study.applicationStatus?.replace('_', ' ') || 'Applied'}
            </span>
            <button
              onClick={onViewDetails}
              className="text-blue-600 text-sm hover:text-blue-800"
            >
              View Details
            </button>
          </div>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={onViewDetails}
              className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200"
            >
              View Details
            </button>
            <button
              onClick={onApply}
              disabled={spotsRemaining <= 0 || (study.status !== 'recruiting' && study.status !== 'active')}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Apply Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Study Details Modal Component
const StudyDetailsModal: React.FC<{
  study: PublicStudy;
  onClose: () => void;
  onApply: () => void;
}> = ({ study, onClose, onApply }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-900">{study.title}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Study Overview */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-3">Study Overview</h4>
            <p className="text-gray-600 mb-4">{study.description}</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Type:</span>
                <div className="font-medium capitalize">{study.type.replace('_', ' ')}</div>
              </div>
              <div>
                <span className="text-gray-500">Duration:</span>
                <div className="font-medium">{study.duration} minutes</div>
              </div>
              <div>
                <span className="text-gray-500">Compensation:</span>
                <div className="font-medium text-green-600">${study.compensation}</div>
              </div>
              <div>
                <span className="text-gray-500">Difficulty:</span>
                <div className="font-medium capitalize">{study.difficulty}</div>
              </div>
            </div>
          </div>

          {/* Eligibility Criteria */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-3">Eligibility Requirements</h4>
            <ul className="space-y-2">
              {study.eligibilityCriteria && study.eligibilityCriteria.map((criteria, index) => (
                <li key={index} className="flex items-center text-gray-600">
                  <span className="text-green-600 mr-2">✓</span>
                  {criteria}
                </li>
              ))}
            </ul>
          </div>

          {/* Study Details */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-3">Study Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Researcher:</span>
                <div className="font-medium">{study.researcherName}</div>
              </div>
              <div>
                <span className="text-gray-500">Organization:</span>
                <div className="font-medium">{study.researcherOrganization}</div>
              </div>
              <div>
                <span className="text-gray-500">Category:</span>
                <div className="font-medium">{study.category}</div>
              </div>
              <div>
                <span className="text-gray-500">Estimated Completion:</span>
                <div className="font-medium">{new Date(study.estimatedCompletion).toLocaleDateString()}</div>
              </div>
            </div>
          </div>

          {/* Participation Progress */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-3">Participation Status</h4>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Enrolled Participants</span>
              <span className="text-sm text-gray-600">
                {study.participantsEnrolled} of {study.participantsNeeded}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-blue-600 h-3 rounded-full"
                style={{ width: `${(study.participantsEnrolled / study.participantsNeeded) * 100}%` }}
              ></div>
            </div>
            <div className="text-sm text-gray-500 mt-2">
              {study.participantsNeeded - study.participantsEnrolled} spots remaining
            </div>
          </div>

          {/* Tags */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-3">Tags</h4>
            <div className="flex flex-wrap gap-2">
              {study.tags && study.tags.map((tag, index) => (
                <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 text-sm rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t bg-gray-50">
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
            >
              Close
            </button>
            {!study.isApplied && (study.status === 'recruiting' || study.status === 'active') && 
             study.participantsEnrolled < study.participantsNeeded && (
              <button
                onClick={onApply}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Apply for This Study
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Study Application Modal Component
const StudyApplicationModal: React.FC<{
  study: PublicStudy;
  onClose: () => void;
  onSubmit: (responses: Record<string, any>) => void;
}> = ({ study, onClose, onSubmit }) => {
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [eligibilityConfirmed, setEligibilityConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eligibilityConfirmed) return;

    setIsSubmitting(true);
    await onSubmit(responses);
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-900">Apply for Study</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Study Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">{study.title}</h4>
            <div className="text-sm text-blue-800">
              <div>Duration: {study.duration} minutes</div>
              <div>Compensation: ${study.compensation}</div>
              <div>Type: {study.type.replace('_', ' ')}</div>
            </div>
          </div>

          {/* Eligibility Confirmation */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-3">Eligibility Confirmation</h4>
            <p className="text-gray-600 mb-4">
              Please confirm that you meet all the following requirements:
            </p>
            <div className="space-y-2 mb-4">
              {study.eligibilityCriteria && study.eligibilityCriteria.map((criteria, index) => (
                <div key={index} className="flex items-center text-gray-600">
                  <span className="text-green-600 mr-2">✓</span>
                  {criteria}
                </div>
              ))}
            </div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={eligibilityConfirmed}
                onChange={(e) => setEligibilityConfirmed(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                required
              />
              <span className="text-sm text-gray-700">
                I confirm that I meet all the eligibility requirements listed above
              </span>
            </label>
          </div>

          {/* Additional Questions */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-3">Screening Questions</h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Why are you interested in this study? *
                </label>
                <textarea
                  value={responses.interest || ''}
                  onChange={(e) => setResponses(prev => ({ ...prev, interest: e.target.value }))}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Tell us about your interest in this research..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Relevant experience or background *
                </label>
                <textarea
                  value={responses.experience || ''}
                  onChange={(e) => setResponses(prev => ({ ...prev, experience: e.target.value }))}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe any relevant experience..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What is your age range? *
                </label>
                <select
                  value={responses.ageRange || ''}
                  onChange={(e) => setResponses(prev => ({ ...prev, ageRange: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select your age range</option>
                  <option value="18-24">18-24</option>
                  <option value="25-34">25-34</option>
                  <option value="35-44">35-44</option>
                  <option value="45-54">45-54</option>
                  <option value="55-64">55-64</option>
                  <option value="65+">65+</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How often do you use technology/digital devices? *
                </label>
                <select
                  value={responses.techExperience || ''}
                  onChange={(e) => setResponses(prev => ({ ...prev, techExperience: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select your experience level</option>
                  <option value="daily">Daily user</option>
                  <option value="weekly">Weekly user</option>
                  <option value="monthly">Monthly user</option>
                  <option value="rarely">Rarely use</option>
                </select>
              </div>

              {study.type === 'moderated' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred interview time (for moderated studies)
                  </label>
                  <select
                    value={responses.preferredTime || ''}
                    onChange={(e) => setResponses(prev => ({ ...prev, preferredTime: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select preferred time</option>
                    <option value="morning">Morning (9 AM - 12 PM)</option>
                    <option value="afternoon">Afternoon (12 PM - 5 PM)</option>
                    <option value="evening">Evening (5 PM - 8 PM)</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!eligibilityConfirmed || isSubmitting}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudyDiscovery;
