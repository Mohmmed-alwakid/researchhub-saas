import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Star,
  Heart,
  Users,
  Clock,
  Eye,
  Download,
  Plus,
  Grid3X3,
  List,
  Award,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface TemplateCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  sort_order: number;
}

interface CommunityTemplate {
  id: string;
  title: string;
  description: string;
  category_id: string;
  author_name: string;
  blocks: any[];
  estimated_duration: number;
  participant_count_estimate: number;
  tags: string[];
  research_type: string;
  target_audience: string;
  usage_count: number;
  view_count: number;
  like_count: number;
  average_rating: number;
  review_count: number;
  is_featured: boolean;
  published_at: string;
  template_categories: TemplateCategory;
}

interface TemplateMarketplaceProps {
  onSelectTemplate?: (template: CommunityTemplate) => void;
  showPublishButton?: boolean;
}

export const TemplateMarketplace: React.FC<TemplateMarketplaceProps> = ({
  onSelectTemplate,
  showPublishButton = true
}) => {
  const navigate = useNavigate();

  const [templates, setTemplates] = useState<CommunityTemplate[]>([]);
  const [categories, setCategories] = useState<TemplateCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'popular' | 'recent' | 'rating' | 'usage'>('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFeatured, setShowFeatured] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTemplates, setTotalTemplates] = useState(0);

  useEffect(() => {
    loadTemplates();
    loadCategories();
  }, []);

  useEffect(() => {
    loadTemplates();
  }, [selectedCategory, sortBy, showFeatured, currentPage]);

  const loadTemplates = async () => {
    try {
      if (currentPage === 1) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      setError(null);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        sort: sortBy
      });

      if (selectedCategory) {
        params.append('category', selectedCategory);
      }

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      if (selectedTags.length > 0) {
        selectedTags.forEach(tag => params.append('tags', tag));
      }

      if (showFeatured) {
        params.append('featured', 'true');
      }

      const response = await fetch(`/api/template-marketplace?${params}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to load templates');
      }

      setTemplates(result.data.templates);
      setTotalPages(result.data.pagination.pages);
      setTotalTemplates(result.data.pagination.total);

    } catch (err) {
      console.error('Failed to load templates:', err);
      setError(err instanceof Error ? err.message : 'Failed to load templates');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/template-marketplace?action=categories');
      const result = await response.json();

      if (result.success) {
        setCategories(result.data);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadTemplates();
  };

  const handleTemplateSelect = (template: CommunityTemplate) => {
    if (onSelectTemplate) {
      onSelectTemplate(template);
    } else {
      navigate(`/template-marketplace/${template.id}`);
    }
  };

  const handleLikeTemplate = async (templateId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem('supabase-auth-token');
      const response = await fetch(`/api/template-marketplace/${templateId}?action=like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Refresh the template list to show updated like count
        loadTemplates();
      }
    } catch (err) {
      console.error('Failed to like template:', err);
    }
  };

  const getCategoryIcon = (iconName: string) => {
    const iconMap: Record<string, React.ComponentType<any>> = {
      Monitor: () => <div className="w-5 h-5 bg-blue-500 rounded" />,
      Lightbulb: () => <div className="w-5 h-5 bg-purple-500 rounded" />,
      Sitemap: () => <div className="w-5 h-5 bg-green-500 rounded" />,
      Users: () => <Users className="w-5 h-5" />,
      GitBranch: () => <div className="w-5 h-5 bg-red-500 rounded" />,
      FileText: () => <div className="w-5 h-5 bg-indigo-500 rounded" />,
      Smartphone: () => <div className="w-5 h-5 bg-pink-500 rounded" />,
      Shield: () => <div className="w-5 h-5 bg-teal-500 rounded" />
    };
    
    const IconComponent = iconMap[iconName] || Users;
    return <IconComponent />;
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating)
            ? 'fill-yellow-400 text-yellow-400'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const renderTemplateCard = (template: CommunityTemplate) => {
    return (
      <Card
        key={template.id}
        className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
        onClick={() => handleTemplateSelect(template)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              {getCategoryIcon(template.template_categories?.icon)}
              <Badge variant="secondary" className="text-xs">
                {template.template_categories?.name}
              </Badge>
              {template.is_featured && (
                <Badge variant="warning" className="text-xs">
                  <Award className="w-3 h-3 mr-1" />
                  Featured
                </Badge>
              )}
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={(e) => handleLikeTemplate(template.id, e)}
              className="p-1"
            >
              <Heart className="w-4 h-4" />
              <span className="ml-1 text-xs">{template.like_count}</span>
            </Button>
          </div>
          
          <h3 className="text-lg font-semibold line-clamp-2">{template.title}</h3>
          <p className="text-sm text-gray-600 line-clamp-3">{template.description}</p>
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            {/* Tags */}
            {template.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {template.tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {template.tags.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{template.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{formatDuration(template.estimated_duration)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>{template.participant_count_estimate} participants</span>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Eye className="w-4 h-4" />
                  <span>{template.view_count}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Download className="w-4 h-4" />
                  <span>{template.usage_count}</span>
                </div>
              </div>

              <div className="flex items-center space-x-1">
                <div className="flex items-center">
                  {renderStars(template.average_rating)}
                </div>
                <span className="text-sm text-gray-600">
                  ({template.review_count})
                </span>
              </div>
            </div>

            {/* Author */}
            <div className="text-sm text-gray-500">
              by {template.author_name}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading && templates.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
          <p className="text-gray-600">Loading template marketplace...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center space-y-4 py-12">
        <div className="text-red-500 text-lg font-semibold">Error Loading Templates</div>
        <p className="text-gray-600">{error}</p>
        <Button onClick={loadTemplates} variant="secondary">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Template Marketplace</h1>
          <p className="text-gray-600">
            Discover and share research templates with the community
          </p>
        </div>
        {showPublishButton && (
          <Button onClick={() => navigate('/publish-template')}>
            <Plus className="w-4 h-4 mr-2" />
            Publish Template
          </Button>
        )}
      </div>

      {/* Filters and Search */}
      <Card className="p-6">
        <div className="space-y-4">
          {/* Search and Featured Toggle */}
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <Button onClick={handleSearch} variant="secondary">
              Search
            </Button>
            <Button
              variant={showFeatured ? "primary" : "secondary"}
              onClick={() => setShowFeatured(!showFeatured)}
            >
              <Award className="w-4 h-4 mr-2" />
              Featured
            </Button>
          </div>

          {/* Category and Sort Filters */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="popular">Most Popular</option>
                <option value="recent">Most Recent</option>
                <option value="rating">Highest Rated</option>
                <option value="usage">Most Used</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          {totalTemplates} templates found
          {selectedCategory && (
            <span className="ml-2">
              in {categories.find(c => c.id === selectedCategory)?.name}
            </span>
          )}
        </p>
        {refreshing && (
          <div className="flex items-center space-x-2 text-blue-600">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Updating...</span>
          </div>
        )}
      </div>

      {/* Templates Grid */}
      {templates.length > 0 ? (
        <div className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
        }>
          {templates.map(renderTemplateCard)}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No templates found</div>
          <p className="text-gray-400 mt-2">
            Try adjusting your search criteria or browse all templates
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 pt-6">
          <Button
            variant="secondary"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          
          <div className="flex items-center space-x-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1;
              return (
                <Button
                  key={page}
                  variant={currentPage === page ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              );
            })}
          </div>

          <Button
            variant="secondary"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default TemplateMarketplace;
