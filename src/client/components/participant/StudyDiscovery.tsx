import React, { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../../stores/authStore';


/**
 * PHASE 5.1: PARTICIPANT EXPERIENCE - STUDY DISCOVERY
 * Comprehensive study discovery and browsing interface for participants
 * Requirements Source: docs/requirements/05-PARTICIPANT_EXPERIENCE.md
 */

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
  responses: ApplicationResponses;
  eligibilityConfirmed: boolean;
}

// Application responses interface for type safety
interface ApplicationResponses {
  interest?: string;
  experience?: string;
  ageRange?: string;
  techExperience?: string;
  preferredTime?: string;
  [key: string]: string | undefined;
}

// Auth client interface for type safety
interface AuthClient {
  getToken: () => string | null;
  isAuthenticated: () => boolean;
  user: {
    id: string;
    email: string;
    role: string;
    demographics?: {
      ageRange?: string;
      gender?: string;
      country?: string;
      phoneNumber?: string;
      specialization?: string;
      occupation?: string;
      educationLevel?: string;
      techExperience?: string;
    };
  } | null;
}

// Study Discovery API Client
class StudyDiscoveryAPI {
  private baseUrl: string;
  private authClient: AuthClient;

  constructor(authClient: AuthClient, baseUrl = '/api') {
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
      // Get user demographics for automatic filtering
      const userDemographics = this.authClient.user?.demographics;
      
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

      // Add demographic filters if available
      if (userDemographics) {
        if (userDemographics.ageRange) {
          params.append('participant_age_range', userDemographics.ageRange);
        }
        if (userDemographics.country) {
          params.append('participant_country', userDemographics.country);
        }
        if (userDemographics.specialization) {
          params.append('participant_specialization', userDemographics.specialization);
        }
        if (userDemographics.gender) {
          params.append('participant_gender', userDemographics.gender);
        }
      }

      const response = await this.makeRequest<{
        success: boolean;
        studies: PublicStudy[];
        pagination: {
          totalStudies: number;
          totalPages: number;
        };
      }>(`/research-consolidated?action=get-studies&role=participant&${params}`);

      // If API succeeds and returns data, use it
      if (response.success && response.data && response.data.studies) {
        return {
          studies: response.data.studies,
          total: response.data.pagination.totalStudies,
          pages: response.data.pagination.totalPages
        };
      }
      
      // If API fails, fallback to mock data with demographic filtering
      console.log('🔄 API failed, using mock data with demographic filtering:', response.error);
      const mockData = this.getMockStudiesWithDemographicFiltering(filters, page, limit, userDemographics);
      // Mark studies as mock data for clear identification
      mockData.studies = mockData.studies.map(study => ({
        ...study,
        title: `[DEMO] ${study.title}`,
        description: `⚠️ This is demo data. ${study.description}`
      }));
      return mockData;
      
    } catch (error) {
      console.log('🔄 API error, using mock data with demographic filtering:', error);
      const mockData = this.getMockStudiesWithDemographicFiltering(filters, page, limit, this.authClient.user?.demographics);
      // Mark studies as mock data for clear identification
      mockData.studies = mockData.studies.map(study => ({
        ...study,
        title: `[DEMO] ${study.title}`,
        description: `⚠️ This is demo data. ${study.description}`
      }));
      return mockData;
    }
  }

  async getStudyDetails(studyId: string): Promise<PublicStudy | null> {
    const response = await this.makeRequest<PublicStudy>(`/research-consolidated?action=get-study-details&study_id=${studyId}`);
    return response.data || this.getMockStudyDetails(studyId);
  }

  async applyForStudy(applicationData: ApplicationData): Promise<boolean> {
    const token = this.authClient.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}/applications`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        action: 'submit',
        studyId: applicationData.studyId,
        screeningResponses: applicationData.responses,
        eligibilityConfirmed: applicationData.eligibilityConfirmed
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      return true; // Success
    } else {
      // Handle specific error cases
      if (response.status === 409 && data.code === 'DUPLICATE_APPLICATION') {
        // This is expected - user already applied, should be handled by the UI
        throw new Error('You have already applied to this study');
      } else {
        // Generic error
        throw new Error(data.error || 'Failed to submit application');
      }
    }
  }

  async getMyApplications(): Promise<PublicStudy[]> {
    const response = await this.makeRequest<PublicStudy[]>('/research-consolidated?action=get-applications');
    return response.data || this.getMockApplications();
  }

  // Mock data for development with real study structure
  private getMockStudies(filters: StudyFilters, page: number, limit: number): {
    studies: PublicStudy[];
    total: number;
    pages: number;
  } {
    const allStudies: PublicStudy[] = [
      {
        id: 'study-001',
        title: 'Mobile App Usability Study',
        description: 'Help us improve our mobile application by testing new features and providing feedback on user experience. This comprehensive study will involve testing various aspects of our app including navigation, feature discovery, and overall user satisfaction.',
        type: 'unmoderated',
        duration: 30,
        compensation: 25,
        participantsNeeded: 50,
        participantsEnrolled: 32,
        status: 'recruiting',
        eligibilityCriteria: ['Age 18-65', 'Smartphone user', 'Arabic or English proficiency', 'Resident in Saudi Arabia'],
        tags: ['Mobile', 'UX', 'Usability'],
        researcherName: 'Dr. Ahmed Al-Rashid',
        researcherOrganization: 'King Saud University',
        estimatedCompletion: '2025-08-25',
        difficulty: 'beginner',
        category: 'Technology',
        createdAt: '2025-08-01T10:00:00Z',
        applicationDeadline: '2025-08-20T23:59:59Z'
      },
      {
        id: 'study-002',
        title: 'E-commerce Shopping Behavior in Saudi Arabia',
        description: 'Participate in a comprehensive study about online shopping preferences and decision-making processes specifically within the Saudi Arabian market. We aim to understand local consumer behavior patterns.',
        type: 'moderated',
        duration: 60,
        compensation: 75,
        participantsNeeded: 20,
        participantsEnrolled: 15,
        status: 'recruiting',
        eligibilityCriteria: ['Age 25-45', 'Regular online shopper', 'Available for video call', 'Saudi resident'],
        tags: ['E-commerce', 'Consumer Behavior', 'Interview'],
        researcherName: 'Dr. Fatima Al-Zahra',
        researcherOrganization: 'Riyadh Business School',
        estimatedCompletion: '2025-09-01',
        difficulty: 'intermediate',
        category: 'Business',
        createdAt: '2025-08-02T14:30:00Z',
        applicationDeadline: '2025-08-18T23:59:59Z'
      },
      {
        id: 'study-003',
        title: 'Educational Platform for Arabic Learners',
        description: 'Test our new educational platform designed specifically for Arabic language learning and provide insights on learning experience and interface design. Help us make education more accessible.',
        type: 'unmoderated',
        duration: 45,
        compensation: 40,
        participantsNeeded: 30,
        participantsEnrolled: 28,
        status: 'recruiting',
        eligibilityCriteria: ['Students or educators', 'Experience with online learning', 'Age 18+', 'Arabic speaker'],
        tags: ['Education', 'E-learning', 'Arabic', 'Interface Design'],
        researcherName: 'Prof. Omar Al-Mahmoud',
        researcherOrganization: 'Saudi Education Tech Institute',
        estimatedCompletion: '2025-08-30',
        difficulty: 'beginner',
        category: 'Education',
        createdAt: '2025-08-03T09:15:00Z',
        isApplied: true,
        applicationStatus: 'approved'
      },
      {
        id: 'study-004',
        title: 'Healthcare App Navigation Study',
        description: 'Help improve healthcare app navigation specifically designed for the Saudi healthcare system. Your feedback will help make healthcare technology more user-friendly for all citizens.',
        type: 'moderated',
        duration: 90,
        compensation: 100,
        participantsNeeded: 15,
        participantsEnrolled: 8,
        status: 'recruiting',
        eligibilityCriteria: ['Age 30-60', 'Uses health apps', 'Available for remote interview', 'Saudi healthcare experience'],
        tags: ['Healthcare', 'Mobile App', 'Navigation'],
        researcherName: 'Dr. Khalid Al-Fahad',
        researcherOrganization: 'Saudi Health Technology Research',
        estimatedCompletion: '2025-09-05',
        difficulty: 'advanced',
        category: 'Healthcare',
        createdAt: '2025-08-04T16:45:00Z'
      },
      {
        id: 'study-005',
        title: 'Social Media Usage Patterns in KSA',
        description: 'Research study examining social media consumption habits and their impact on daily routines among Saudi youth and professionals. Understanding digital behavior in the Kingdom.',
        type: 'unmoderated',
        duration: 20,
        compensation: 15,
        participantsNeeded: 100,
        participantsEnrolled: 73,
        status: 'recruiting',
        eligibilityCriteria: ['Age 16-35', 'Active social media user', 'Arabic or English speaking', 'Saudi resident'],
        tags: ['Social Media', 'Behavior', 'Survey', 'Youth'],
        researcherName: 'Dr. Nora Al-Ghamdi',
        researcherOrganization: 'Digital Behavior Research Lab - KAUST',
        estimatedCompletion: '2025-08-22',
        difficulty: 'beginner',
        category: 'Social Science',
        createdAt: '2025-08-05T11:20:00Z'
      },
      {
        id: 'study-006',
        title: 'Islamic Banking App Security Perceptions',
        description: 'Study participant perceptions of security features in Islamic banking applications. Help us understand how to better design secure and Sharia-compliant financial technology.',
        type: 'moderated',
        duration: 75,
        compensation: 85,
        participantsNeeded: 25,
        participantsEnrolled: 25,
        status: 'in_progress',
        eligibilityCriteria: ['Age 25-55', 'Uses mobile banking', 'Islamic banking experience', 'Security conscious'],
        tags: ['Finance', 'Security', 'Islamic Banking', 'Mobile Banking'],
        researcherName: 'Dr. Abdullah Al-Mutairi',
        researcherOrganization: 'Islamic FinTech Research Center',
        estimatedCompletion: '2025-09-10',
        difficulty: 'intermediate',
        category: 'Finance',
        createdAt: '2025-08-06T13:00:00Z',
        isApplied: true,
        applicationStatus: 'pending'
      },
      {
        id: 'simple-study-1754786519414',
        title: 'Test - 1',
        description: 'NSNSNSNNSLKJASDLKFJSAFLFODSj',
        type: 'unmoderated',
        duration: 30,
        compensation: 25,
        participantsNeeded: 1,
        participantsEnrolled: 0,
        status: 'recruiting',
        eligibilityCriteria: ['Age 18+', 'Basic computer skills'],
        tags: ['Testing', 'Usability'],
        researcherName: 'Test Researcher',
        researcherOrganization: 'Test Organization',
        estimatedCompletion: '2025-08-25',
        difficulty: 'beginner',
        category: 'Technology',
        createdAt: '2025-08-10T00:41:59.414Z',
        settings: JSON.stringify({
          "duration": 30,
          "payment": 25,
          "screeningQuestions": [
            {
              "id": "sq_test_question_1",
              "question": "What is your experience with usability testing?",
              "type": "text",
              "required": true
            }
          ]
        })
      } as PublicStudy & { settings?: string }
    ];

    // Apply filters
    const filteredStudies = allStudies.filter(study => {
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

  // Enhanced mock data with demographic filtering
  private getMockStudiesWithDemographicFiltering(
    filters: StudyFilters, 
    page: number, 
    limit: number, 
    demographics?: {
      ageRange?: string;
      gender?: string;
      country?: string;
      phoneNumber?: string;
      specialization?: string;
      occupation?: string;
      educationLevel?: string;
      techExperience?: string;
    }
  ): {
    studies: PublicStudy[];
    total: number;
    pages: number;
  } {
    // Get base studies
    const baseResult = this.getMockStudies(filters, 1, 1000); // Get all for filtering
    let studies = baseResult.studies;

    // Apply demographic filtering if demographics are available
    if (demographics) {
      studies = studies.filter(study => {
        // Age-based filtering
        if (demographics.ageRange) {
          const ageEligible = this.checkAgeEligibility(study.eligibilityCriteria, demographics.ageRange);
          if (!ageEligible) return false;
        }

        // Country-based filtering
        if (demographics.country) {
          const countryEligible = this.checkCountryEligibility();
          if (!countryEligible) return false;
        }

        // Specialization-based filtering (match with study category)
        if (demographics.specialization) {
          const specializationMatch = this.checkSpecializationMatch(study, demographics.specialization);
          if (!specializationMatch) return false;
        }

        return true;
      });

      // Sort by relevance to demographics
      studies = this.sortByDemographicRelevance(studies, demographics);
    }

    // Apply pagination to filtered results
    const total = studies.length;
    const pages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const paginatedStudies = studies.slice(startIndex, startIndex + limit);

    return { studies: paginatedStudies, total, pages };
  }

  private checkAgeEligibility(eligibilityCriteria: string[], userAgeRange: string): boolean {
    // Extract user age range bounds
    const [userMinStr, userMaxStr] = userAgeRange.includes('+') 
      ? [userAgeRange.replace('+', ''), '100']
      : userAgeRange.split('-');
    const userMin = parseInt(userMinStr);
    const userMax = userMaxStr ? parseInt(userMaxStr) : 100;

    // Check if any eligibility criteria mentions age
    for (const criterion of eligibilityCriteria) {
      const ageCriterion = criterion.toLowerCase();
      if (ageCriterion.includes('age')) {
        // Extract age ranges from criteria like "Age 18-65", "Age 25+", etc.
        const ageMatch = ageCriterion.match(/(\d+)[-–](\d+)|(\d+)\+|(\d+)/g);
        if (ageMatch) {
          for (const match of ageMatch) {
            if (match.includes('-') || match.includes('–')) {
              const [minStr, maxStr] = match.split(/[-–]/);
              const criteriaMin = parseInt(minStr);
              const criteriaMax = parseInt(maxStr);
              
              // Check if user age range overlaps with criteria
              if (userMin <= criteriaMax && userMax >= criteriaMin) {
                return true;
              }
            } else if (match.includes('+')) {
              const criteriaMin = parseInt(match.replace('+', ''));
              if (userMax >= criteriaMin) {
                return true;
              }
            }
          }
        }
      }
    }

    // If no age criteria specified, assume eligible
    return true;
  }

  private checkCountryEligibility(): boolean {
    // For now, assume all studies accept participants from any country
    // In real implementation, this would check study.targetCountries or similar
    return true;
  }

  private checkSpecializationMatch(study: PublicStudy, userSpecialization: string): boolean {
    // Map specializations to study categories for better matching
    const specializationCategoryMap: Record<string, string[]> = {
      'Technology & Software': ['Technology', 'Software', 'Development'],
      'Design & User Experience': ['Technology', 'Design', 'UX'],
      'Marketing & Advertising': ['Business', 'Marketing'],
      'Healthcare & Medical': ['Healthcare', 'Medical'],
      'Education & Training': ['Education'],
      'Finance & Banking': ['Finance', 'Banking'],
      'Retail & E-commerce': ['Business', 'E-commerce'],
      'Student': ['Education', 'Technology', 'Social Science']
    };

    const relevantCategories = specializationCategoryMap[userSpecialization] || [];
    
    // Check if study category matches user specialization
    if (relevantCategories.some(cat => 
      study.category.toLowerCase().includes(cat.toLowerCase()) ||
      study.tags.some(tag => tag.toLowerCase().includes(cat.toLowerCase()))
    )) {
      return true;
    }

    // Also consider if the study title or description mentions the specialization area
    const searchTerms = userSpecialization.toLowerCase().split(/[&\s]+/);
    const studyText = (study.title + ' ' + study.description + ' ' + study.tags.join(' ')).toLowerCase();
    
    return searchTerms.some(term => studyText.includes(term));
  }

  private sortByDemographicRelevance(
    studies: PublicStudy[], 
    demographics: NonNullable<AuthClient['user']>['demographics']
  ): PublicStudy[] {
    if (!demographics) return studies;

    return studies.sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;

      // Higher score for studies matching specialization
      if (demographics.specialization) {
        if (this.checkSpecializationMatch(a, demographics.specialization)) scoreA += 10;
        if (this.checkSpecializationMatch(b, demographics.specialization)) scoreB += 10;
      }

      // Higher score for studies with appropriate duration for experience level
      if (demographics.techExperience) {
        const experienceBonus: Record<string, number> = {
          'Beginner': a.difficulty === 'beginner' ? 5 : 0,
          'Intermediate': a.difficulty === 'intermediate' ? 5 : 0,
          'Advanced': a.difficulty === 'advanced' ? 5 : 0,
          'Expert': a.difficulty === 'advanced' ? 3 : 0
        };
        scoreA += experienceBonus[demographics.techExperience] || 0;
        
        const experienceBonusB: Record<string, number> = {
          'Beginner': b.difficulty === 'beginner' ? 5 : 0,
          'Intermediate': b.difficulty === 'intermediate' ? 5 : 0,
          'Advanced': b.difficulty === 'advanced' ? 5 : 0,
          'Expert': b.difficulty === 'advanced' ? 3 : 0
        };
        scoreB += experienceBonusB[demographics.techExperience] || 0;
      }

      return scoreB - scoreA; // Higher score first
    });
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
  const [studies, setStudies] = useState<PublicStudy[]>([]);
  const [totalStudies, setTotalStudies] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStudy, setSelectedStudy] = useState<StudyWithSettings | null>(null);
  const [showStudyModal, setShowStudyModal] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [applicationSuccess, setApplicationSuccess] = useState(false);
  const [applicationSuccessStudy, setApplicationSuccessStudy] = useState<string | null>(null);

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
  const handleApplyForStudy = async (studyId: string, responses: ApplicationResponses) => {
    try {
      const success = await studyAPI.applyForStudy({
        studyId,
        responses,
        eligibilityConfirmed: true
      });

      if (success) {
        // Show success message
        setApplicationSuccess(true);
        setApplicationSuccessStudy(studyId);
        
        // Update the study in the list to show it's applied
        setStudies(prevStudies => 
          prevStudies.map(study => 
            study.id === studyId 
              ? { ...study, isApplied: true, applicationStatus: 'pending' as const }
              : study
          )
        );
        
        // Close modals
        setShowApplicationModal(false);
        setSelectedStudy(null);
        
        // Auto-hide success message after 5 seconds
        setTimeout(() => {
          setApplicationSuccess(false);
          setApplicationSuccessStudy(null);
        }, 5000);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit application';
      
      // Handle duplicate application specifically
      if (errorMessage.includes('already applied')) {
        // Update the study to show it's already applied
        setStudies(prevStudies => 
          prevStudies.map(study => 
            study.id === studyId 
              ? { ...study, isApplied: true, applicationStatus: 'pending' as const }
              : study
          )
        );
        
        // Close the modal since user already applied
        setShowApplicationModal(false);
        setSelectedStudy(null);
        
        // Show a more specific message for duplicate applications
        setError('You have already applied to this study. Check your applications dashboard for status updates.');
      } else {
        // Generic error handling
        setError(errorMessage);
      }
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
        {/* Application Success Notification */}
        {applicationSuccess && applicationSuccessStudy && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="text-green-600 mr-3">✅</div>
              <div className="flex-1">
                <h4 className="text-green-800 font-medium">Application Submitted Successfully!</h4>
                <p className="text-green-700 text-sm mt-1">
                  Your application has been sent to the researcher. You will receive a notification once it's reviewed.
                  You can track your application status in the "My Applications" section.
                </p>
              </div>
              <button
                onClick={() => {
                  setApplicationSuccess(false);
                  setApplicationSuccessStudy(null);
                }}
                className="text-green-600 hover:text-green-800 ml-4"
              >
                ✕
              </button>
            </div>
          </div>
        )}

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
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getApplicationStatusColor(study.applicationStatus)}`}>
                {study.applicationStatus === 'pending' && '⏳ Application Pending'}
                {study.applicationStatus === 'approved' && '✅ Application Approved'}
                {study.applicationStatus === 'rejected' && '❌ Application Rejected'}
                {study.applicationStatus === 'completed' && '🎉 Study Completed'}
                {!study.applicationStatus && '📨 Applied'}
              </span>
              <button
                onClick={onViewDetails}
                className="text-blue-600 text-sm hover:text-blue-800"
              >
                View Details
              </button>
            </div>
            {study.applicationStatus === 'pending' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-blue-800 text-xs">
                  <strong>Application Status:</strong> Your application is being reviewed by the researcher. 
                  You will receive a notification once there's an update.
                </p>
              </div>
            )}
            {study.applicationStatus === 'approved' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-green-800 text-xs">
                  <strong>Congratulations!</strong> Your application has been approved. 
                  Check your email for next steps and study instructions.
                </p>
              </div>
            )}
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
              {spotsRemaining <= 0 ? 'Full' : 'Apply Now'}
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
type ScreeningQuestion = {
  id: string;
  question: string;
  type: 'text' | 'multiple-choice' | 'boolean' | 'number';
  options?: string[];
  required: boolean;
};

// Extended study type to include settings field
type StudyWithSettings = PublicStudy & { settings?: string };

// Settings interface for parsed JSON
interface ParsedStudySettings {
  duration?: number;
  payment?: number;
  compensation?: number;
  screeningQuestions?: ScreeningQuestion[];
  [key: string]: unknown;
}

const StudyApplicationModal: React.FC<{
  study: StudyWithSettings;
  onClose: () => void;
  onSubmit: (responses: ApplicationResponses) => void;
}> = ({ study, onClose, onSubmit }) => {
  // Debug logging to see the study data structure
  console.log('🔍 StudyApplicationModal - Study Data:', study);
  console.log('🔍 StudyApplicationModal - Study Settings Raw:', study.settings);
  
  // Parse settings if it's a JSON string
  let parsedSettings: ParsedStudySettings = {};
  try {
    if (typeof study.settings === 'string') {
      parsedSettings = JSON.parse(study.settings);
    } else if (study.settings) {
      parsedSettings = study.settings as unknown as ParsedStudySettings;
    }
  } catch {
    parsedSettings = {};
  }
  
  console.log('🔍 StudyApplicationModal - Parsed Settings:', parsedSettings);
  console.log('🔍 StudyApplicationModal - Screening Questions:', parsedSettings?.screeningQuestions);
  
  const [responses, setResponses] = useState<ApplicationResponses>({});
  const [eligibilityConfirmed, setEligibilityConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eligibilityConfirmed) return;

    // Validate required screening questions from the parsed settings
    const screeningQuestions = parsedSettings?.screeningQuestions || [];
    
    if (screeningQuestions.length > 0) {
      const requiredQuestions = screeningQuestions.filter((q: ScreeningQuestion) => q.required);
      const unansweredRequired = requiredQuestions.filter((q: ScreeningQuestion) => !responses[q.id]);
      
      if (unansweredRequired.length > 0) {
        alert('Please answer all required screening questions');
        return;
      }
    }

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
              <div>Duration: {study.duration || parsedSettings?.duration || 'N/A'} minutes</div>
              <div>Compensation: ${study.compensation || parsedSettings?.payment || parsedSettings?.compensation || 'N/A'}</div>
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

          {/* Screening Questions */}
          {(() => {
            // Get screening questions from the parsed settings
            const screeningQuestions = parsedSettings?.screeningQuestions || [];
            
            return screeningQuestions.length > 0 ? (
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-3">Screening Questions</h4>
                <div className="space-y-4">
                  {screeningQuestions.map((question: ScreeningQuestion) => (
                    <div key={question.id}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {question.question}
                        {question.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      
                      {question.type === 'text' && (
                        <textarea
                          value={responses[question.id] || ''}
                          onChange={(e) => setResponses(prev => ({ ...prev, [question.id]: e.target.value }))}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter your response..."
                          required={question.required}
                        />
                      )}
                      
                      {question.type === 'multiple-choice' && question.options && (
                        <div className="space-y-2">
                          {question.options.map((option: string) => (
                            <label key={option} className="flex items-center">
                              <input
                                type="radio"
                                name={question.id}
                                value={option}
                                checked={responses[question.id] === option}
                                onChange={(e) => setResponses(prev => ({ ...prev, [question.id]: e.target.value }))}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                required={question.required}
                              />
                              <span className="ml-3 text-sm text-gray-700">{option}</span>
                            </label>
                          ))}
                        </div>
                      )}
                      
                      {question.type === 'boolean' && (
                        <div className="space-y-2">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name={question.id}
                              value="yes"
                              checked={responses[question.id] === 'yes'}
                              onChange={(e) => setResponses(prev => ({ ...prev, [question.id]: e.target.value }))}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                              required={question.required}
                            />
                            <span className="ml-3 text-sm text-gray-700">Yes</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name={question.id}
                              value="no"
                              checked={responses[question.id] === 'no'}
                              onChange={(e) => setResponses(prev => ({ ...prev, [question.id]: e.target.value }))}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <span className="ml-3 text-sm text-gray-700">No</span>
                          </label>
                        </div>
                      )}
                      
                      {question.type === 'number' && (
                        <input
                          type="number"
                          value={responses[question.id] || ''}
                          onChange={(e) => setResponses(prev => ({ ...prev, [question.id]: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter a number..."
                          required={question.required}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-3">No Additional Questions</h4>
                <p className="text-gray-600">No screening questions are required for this study.</p>
              </div>
            );
          })()}

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
