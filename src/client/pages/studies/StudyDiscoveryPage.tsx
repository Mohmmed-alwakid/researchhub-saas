import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Clock, 
  DollarSign, 
  Users, 
  Calendar,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { participantApplicationsService, type PublicStudy } from '../../services/participantApplications.service';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';

const StudyDiscoveryPage: React.FC = () => {
  const [studies, setStudies] = useState<PublicStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
    hasNext: false,
    hasPrev: false
  });

  const studyTypes = [
    { value: '', label: 'All Types' },
    { value: 'usability', label: 'Usability Test' },
    { value: 'survey', label: 'Survey' },
    { value: 'interview', label: 'Interview' },
    { value: 'card-sorting', label: 'Card Sorting' },
    { value: 'a-b-testing', label: 'A/B Testing' }
  ];
  const fetchStudies = useCallback(async () => {
    try {
      setLoading(true);
      const response = await participantApplicationsService.getPublicStudies({
        page: currentPage,
        limit: 12,
        search: searchTerm || undefined,
        type: typeFilter || undefined
      });

      setStudies(response.data.studies);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Failed to fetch studies:', error);
      toast.error('Failed to load studies');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, typeFilter]);
  useEffect(() => {
    fetchStudies();
  }, [currentPage, searchTerm, typeFilter, fetchStudies]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchStudies();
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      usability: '🖥️',
      interview: '🎤',
      survey: '📋',
      'card-sorting': '🗂️',
      'a-b-testing': '🔬'
    };
    return icons[type as keyof typeof icons] || '📊';
  };

  const getTypeColor = (type: string) => {
    const colors = {
      usability: 'bg-blue-100 text-blue-800',
      interview: 'bg-green-100 text-green-800',
      survey: 'bg-purple-100 text-purple-800',
      'card-sorting': 'bg-orange-100 text-orange-800',
      'a-b-testing': 'bg-red-100 text-red-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading && studies.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Discover Research Studies</h1>
          <p className="text-gray-600 mt-2">
            Find and apply to research studies that match your interests and earn compensation
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search studies by title or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {studyTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </form>
        </div>

        {/* Results */}
        {studies.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No studies found</h3>
            <p className="text-gray-600">
              Try adjusting your search criteria or check back later for new studies
            </p>
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div className="mb-6">
              <p className="text-gray-600">
                Showing {studies.length} of {pagination.total} studies
              </p>
            </div>

            {/* Study Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {studies.map((study) => (
                <Card key={study._id} variant="elevated" className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-2xl">{getTypeIcon(study.type)}</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(study.type)}`}>
                        {study.type.replace('-', ' ')}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                      {study.title}
                    </h3>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {study.description}
                    </p>

                    {/* Study Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>{study.configuration.duration} minutes</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <DollarSign className="w-4 h-4 mr-2" />
                        <span>${study.configuration.compensation}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="w-4 h-4 mr-2" />
                        <span>
                          {study.participants.enrolled}/{study.configuration.maxParticipants} participants
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>
                          {new Date(study.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Researcher */}
                    <div className="border-t pt-3 mb-4">
                      <p className="text-xs text-gray-500">Researcher</p>
                      <p className="text-sm font-medium text-gray-900">
                        {study.researcher.name}
                      </p>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Participants</span>
                        <span>
                          {Math.round((study.participants.enrolled / study.configuration.maxParticipants) * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-indigo-600 h-2 rounded-full"
                          style={{
                            width: `${Math.min((study.participants.enrolled / study.configuration.maxParticipants) * 100, 100)}%`
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Apply Button */}
                    <Link
                      to={`/app/studies/${study._id}/apply`}
                      className="w-full inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                    >
                      Apply to Study
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Page {pagination.current} of {pagination.pages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={!pagination.hasPrev}
                    className="flex items-center"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={!pagination.hasNext}
                    className="flex items-center"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default StudyDiscoveryPage;
