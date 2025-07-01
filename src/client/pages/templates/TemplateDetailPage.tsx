import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Star,
  Heart,
  Users,
  Clock,
  Eye,
  Download,
  Tag,
  User,
  MessageSquare,
  ThumbsUp,
  Share2,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

interface TemplateBlock {
  id: string;
  type: string;
  title: string;
  order: number;
  settings: Record<string, unknown>;
}

interface CommunityTemplate {
  id: string;
  title: string;
  description: string;
  category_id: string;
  author_name: string;
  blocks: TemplateBlock[];
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
  template_categories: {
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
  };
}

interface TemplateReview {
  id: string;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
  is_helpful: boolean;
  helpful_count: number;
}

const TemplateDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [template, setTemplate] = useState<CommunityTemplate | null>(null);
  const [reviews, setReviews] = useState<TemplateReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [userReview, setUserReview] = useState({
    rating: 5,
    comment: ''
  });

  const loadTemplate = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/template-marketplace/${id}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to load template');
      }

      setTemplate(result.data);
    } catch (err) {
      console.error('Failed to load template:', err);
      setError(err instanceof Error ? err.message : 'Failed to load template');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const loadReviews = useCallback(async () => {
    try {
      setReviewsLoading(true);
      const response = await fetch(`/api/template-marketplace/${id}/reviews`);
      const result = await response.json();

      if (result.success) {
        setReviews(result.data);
      }
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setReviewsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      loadTemplate();
      loadReviews();
    }
  }, [id, loadTemplate, loadReviews]);

  const handleLike = async () => {
    try {
      const token = localStorage.getItem('supabase-auth-token');
      const response = await fetch(`/api/template-marketplace/${id}?action=like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setLiked(!liked);
        if (template) {
          setTemplate({
            ...template,
            like_count: liked ? template.like_count - 1 : template.like_count + 1
          });
        }
      }
    } catch (err) {
      console.error('Failed to like template:', err);
    }
  };

  const handleUseTemplate = async () => {
    try {
      const token = localStorage.getItem('supabase-auth-token');
      const response = await fetch(`/api/template-marketplace/${id}?action=use`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data.study_id) {
          navigate(`/app/study-builder?template=${id}&study=${result.data.study_id}`);
        }
      }
    } catch (err) {
      console.error('Failed to use template:', err);
    }
  };

  const handleSubmitReview = async () => {
    try {
      const token = localStorage.getItem('supabase-auth-token');
      const response = await fetch(`/api/template-marketplace/${id}/reviews`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userReview)
      });

      if (response.ok) {
        setShowReviewForm(false);
        setUserReview({ rating: 5, comment: '' });
        loadReviews();
        loadTemplate(); // Refresh template to update rating
      }
    } catch (err) {
      console.error('Failed to submit review:', err);
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'w-3 h-3',
      md: 'w-4 h-4',
      lg: 'w-5 h-5'
    };

    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`${sizeClasses[size]} ${
          i < Math.floor(rating)
            ? 'fill-yellow-400 text-yellow-400'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
          <p className="text-gray-600">Loading template...</p>
        </div>
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="text-center space-y-4 py-12">
        <div className="text-red-500 text-lg font-semibold">Error Loading Template</div>
        <p className="text-gray-600">{error || 'Template not found'}</p>
        <Button onClick={() => navigate('/app/template-marketplace')} variant="secondary">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Marketplace
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="secondary"
          onClick={() => navigate('/app/template-marketplace')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Marketplace
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Template Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">
                      {template.template_categories?.name}
                    </Badge>
                    {template.is_featured && (
                      <Badge variant="warning">
                        Featured
                      </Badge>
                    )}
                  </div>
                  <h1 className="text-3xl font-bold">{template.title}</h1>
                  <p className="text-gray-600">{template.description}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant={liked ? "primary" : "secondary"}
                    onClick={handleLike}
                  >
                    <Heart className={`w-4 h-4 mr-1 ${liked ? 'fill-current' : ''}`} />
                    {template.like_count}
                  </Button>
                  <Button variant="secondary">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Template Stats */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Eye className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold">{template.view_count}</div>
                  <div className="text-sm text-gray-600">Views</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Download className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold">{template.usage_count}</div>
                  <div className="text-sm text-gray-600">Uses</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Star className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div className="text-2xl font-bold">{template.average_rating.toFixed(1)}</div>
                  <div className="text-sm text-gray-600">Rating</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <MessageSquare className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="text-2xl font-bold">{template.review_count}</div>
                  <div className="text-sm text-gray-600">Reviews</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Template Details */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Template Details</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-600" />
                  <span className="text-sm">
                    Estimated Duration: {formatDuration(template.estimated_duration)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-gray-600" />
                  <span className="text-sm">
                    Target Participants: {template.participant_count_estimate}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Tag className="w-4 h-4 text-gray-600" />
                  <span className="text-sm">
                    Research Type: {template.research_type}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-gray-600" />
                  <span className="text-sm">
                    Target Audience: {template.target_audience}
                  </span>
                </div>
              </div>

              {/* Tags */}
              {template.tags.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {template.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Study Blocks */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Study Blocks ({template.blocks.length})
                </h3>
                <div className="space-y-2">
                  {template.blocks.map((block, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </div>
                      <span className="font-medium">{block.type}</span>
                      <span className="text-gray-600">- {block.title || 'Untitled Block'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reviews Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Reviews & Ratings</h2>
                <Button onClick={() => setShowReviewForm(true)}>
                  Write Review
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {reviewsLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600" />
                </div>
              ) : reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b pb-4 last:border-b-0">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{review.user_name}</span>
                            <div className="flex items-center">
                              {renderStars(review.rating, 'sm')}
                            </div>
                            <span className="text-sm text-gray-500">
                              {new Date(review.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-gray-700">{review.comment}</p>
                        </div>
                        <Button variant="secondary" size="sm">
                          <ThumbsUp className="w-3 h-3 mr-1" />
                          {review.helpful_count}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No reviews yet. Be the first to review this template!
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Action Card */}
          <Card>
            <CardContent className="pt-6">
              <Button 
                className="w-full mb-4" 
                onClick={handleUseTemplate}
              >
                <Download className="w-4 h-4 mr-2" />
                Use This Template
              </Button>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Rating</span>
                  <div className="flex items-center space-x-1">
                    {renderStars(template.average_rating, 'sm')}
                    <span className="text-gray-700">
                      {template.average_rating.toFixed(1)} ({template.review_count})
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Views</span>
                  <span className="text-gray-700">{template.view_count}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Uses</span>
                  <span className="text-gray-700">{template.usage_count}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Published</span>
                  <span className="text-gray-700">
                    {new Date(template.published_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Author Card */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Created by</h3>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium">{template.author_name}</div>
                  <div className="text-sm text-gray-600">Template Author</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Review Form Modal */}
      {showReviewForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <h3 className="text-lg font-semibold">Write a Review</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating
                </label>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: 5 }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setUserReview({ ...userReview, rating: i + 1 })}
                    >
                      <Star
                        className={`w-6 h-6 cursor-pointer ${
                          i < userReview.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300 hover:text-yellow-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comment
                </label>
                <textarea
                  value={userReview.comment}
                  onChange={(e) => setUserReview({ ...userReview, comment: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Share your experience with this template..."
                />
              </div>
              
              <div className="flex space-x-3">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setShowReviewForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleSubmitReview}
                  disabled={!userReview.comment.trim()}
                >
                  Submit Review
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default TemplateDetailPage;
