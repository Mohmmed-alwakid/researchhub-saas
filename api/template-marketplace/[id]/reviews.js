/**
 * Template Reviews API - ResearchHub Template Marketplace
 * 
 * Handles template reviews and ratings
 * 
 * Endpoints:
 * - GET /api/template-marketplace/[id]/reviews - Get reviews for a template
 * - POST /api/template-marketplace/[id]/reviews - Add review to template
 * - PUT /api/template-marketplace/[id]/reviews/[reviewId] - Update review
 * - DELETE /api/template-marketplace/[id]/reviews/[reviewId] - Delete review
 * 
 * Created: June 29, 2025
 * Status: Week 2 Template Marketplace Implementation
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4cHd4emRnZHZpbmxidG5iZ2RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTk1ODAsImV4cCI6MjA2NTc3NTU4MH0.YMai9p4VQMbdqmc_9uWGeJ6nONHwuM9XT2FDTFy0aGk';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Extract template ID from the URL path
    const pathSegments = req.url.split('/').filter(Boolean);
    const templateMarketplaceIndex = pathSegments.indexOf('template-marketplace');
    const templateId = pathSegments[templateMarketplaceIndex + 1];
    const reviewId = pathSegments[templateMarketplaceIndex + 3]; // For individual review operations

    if (!templateId) {
      return res.status(400).json({
        success: false,
        error: 'Template ID is required'
      });
    }

    // Authentication for write operations
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');
    let user = null;

    if (token) {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token);
      if (authError) {
        console.error('Auth error:', authError);
      } else {
        user = authUser;
      }
    }

    // Route to appropriate handler
    switch (req.method) {
      case 'GET':
        return await getReviews(req, res, supabase, templateId);

      case 'POST':
        if (!user) {
          return res.status(401).json({ success: false, error: 'Authentication required' });
        }
        return await addReview(req, res, supabase, user, templateId);

      case 'PUT':
        if (!user) {
          return res.status(401).json({ success: false, error: 'Authentication required' });
        }
        if (!reviewId) {
          return res.status(400).json({ success: false, error: 'Review ID is required' });
        }
        return await updateReview(req, res, supabase, user, templateId, reviewId);

      case 'DELETE':
        if (!user) {
          return res.status(401).json({ success: false, error: 'Authentication required' });
        }
        if (!reviewId) {
          return res.status(400).json({ success: false, error: 'Review ID is required' });
        }
        return await deleteReview(req, res, supabase, user, templateId, reviewId);

      default:
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Template reviews API error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}

/**
 * Get reviews for a template
 */
async function getReviews(req, res, supabase, templateId) {
  try {
    const {
      page = 1,
      limit = 10,
      sort = 'recent' // recent, helpful, rating_high, rating_low
    } = req.query;

    let query = supabase
      .from('template_reviews')
      .select(`
        id,
        reviewer_name,
        rating,
        title,
        comment,
        usage_context,
        organization_size,
        helpful_count,
        is_helpful,
        created_at,
        updated_at
      `)
      .eq('template_id', templateId)
      .eq('is_approved', true);

    // Apply sorting
    switch (sort) {
      case 'helpful':
        query = query.order('helpful_count', { ascending: false });
        break;
      case 'rating_high':
        query = query.order('rating', { ascending: false });
        break;
      case 'rating_low':
        query = query.order('rating', { ascending: true });
        break;
      case 'recent':
      default:
        query = query.order('created_at', { ascending: false });
        break;
    }

    // Apply pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query = query.range(offset, offset + parseInt(limit) - 1);

    const { data: reviews, error } = await query;

    if (error) {
      throw error;
    }

    // Get total count for pagination
    const { count, error: countError } = await supabase
      .from('template_reviews')
      .select('*', { count: 'exact', head: true })
      .eq('template_id', templateId)
      .eq('is_approved', true);

    if (countError) {
      throw countError;
    }

    // Get rating summary
    const { data: ratingSummary, error: summaryError } = await supabase
      .from('template_reviews')
      .select('rating')
      .eq('template_id', templateId)
      .eq('is_approved', true);

    if (summaryError) {
      throw summaryError;
    }

    // Calculate rating distribution
    const ratingDistribution = [1, 2, 3, 4, 5].map(rating => ({
      rating,
      count: ratingSummary.filter(r => r.rating === rating).length
    }));

    const averageRating = ratingSummary.length > 0
      ? ratingSummary.reduce((sum, r) => sum + r.rating, 0) / ratingSummary.length
      : 0;

    return res.status(200).json({
      success: true,
      data: reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / parseInt(limit))
      },
      summary: {
        total_reviews: count,
        average_rating: Math.round(averageRating * 10) / 10,
        rating_distribution: ratingDistribution
      }
    });

  } catch (error) {
    console.error('Get reviews error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get reviews'
    });
  }
}

/**
 * Add review to template
 */
async function addReview(req, res, supabase, user, templateId) {
  try {
    const {
      rating,
      title = '',
      comment,
      usage_context = '',
      organization_size = ''
    } = req.body;

    // Validation
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: 'Rating must be between 1 and 5'
      });
    }

    if (!comment || comment.trim().length < 10) {
      return res.status(400).json({
        success: false,
        error: 'Comment must be at least 10 characters long'
      });
    }

    // Check if user has already reviewed this template
    const { data: existingReview } = await supabase
      .from('template_reviews')
      .select('id')
      .eq('template_id', templateId)
      .eq('reviewer_id', user.id)
      .single();

    if (existingReview) {
      return res.status(400).json({
        success: false,
        error: 'You have already reviewed this template'
      });
    }

    // Get user profile for reviewer name
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('first_name, last_name')
      .eq('user_id', user.id)
      .single();

    const reviewerName = profile 
      ? `${profile.first_name} ${profile.last_name}`.trim()
      : user.email.split('@')[0];

    // Create review
    const { data: review, error } = await supabase
      .from('template_reviews')
      .insert({
        template_id: templateId,
        reviewer_id: user.id,
        reviewer_name: reviewerName,
        rating,
        title: title.trim(),
        comment: comment.trim(),
        usage_context: usage_context.trim(),
        organization_size: organization_size.trim(),
        is_approved: true // Auto-approve for now, can add moderation later
      })
      .select(`
        id,
        reviewer_name,
        rating,
        title,
        comment,
        usage_context,
        organization_size,
        helpful_count,
        is_helpful,
        created_at,
        updated_at
      `)
      .single();

    if (error) {
      throw error;
    }

    // Update template rating statistics (could be done with database triggers)
    updateTemplateRatingStats(supabase, templateId);

    return res.status(201).json({
      success: true,
      data: review
    });

  } catch (error) {
    console.error('Add review error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to add review'
    });
  }
}

/**
 * Update review (reviewer only)
 */
async function updateReview(req, res, supabase, user, templateId, reviewId) {
  try {
    const updateData = req.body;
    
    // Verify ownership
    const { data: review, error: fetchError } = await supabase
      .from('template_reviews')
      .select('reviewer_id')
      .eq('id', reviewId)
      .eq('template_id', templateId)
      .single();

    if (fetchError || !review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }

    if (review.reviewer_id !== user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this review'
      });
    }

    // Update review
    const { data: updatedReview, error } = await supabase
      .from('template_reviews')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', reviewId)
      .select(`
        id,
        reviewer_name,
        rating,
        title,
        comment,
        usage_context,
        organization_size,
        helpful_count,
        is_helpful,
        created_at,
        updated_at
      `)
      .single();

    if (error) {
      throw error;
    }

    // Update template rating statistics
    updateTemplateRatingStats(supabase, templateId);

    return res.status(200).json({
      success: true,
      data: updatedReview
    });

  } catch (error) {
    console.error('Update review error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update review'
    });
  }
}

/**
 * Delete review (reviewer only)
 */
async function deleteReview(req, res, supabase, user, templateId, reviewId) {
  try {
    // Verify ownership
    const { data: review, error: fetchError } = await supabase
      .from('template_reviews')
      .select('reviewer_id')
      .eq('id', reviewId)
      .eq('template_id', templateId)
      .single();

    if (fetchError || !review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }

    if (review.reviewer_id !== user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this review'
      });
    }

    // Delete review
    const { error } = await supabase
      .from('template_reviews')
      .delete()
      .eq('id', reviewId);

    if (error) {
      throw error;
    }

    // Update template rating statistics
    updateTemplateRatingStats(supabase, templateId);

    return res.status(200).json({
      success: true,
      data: { deleted: true }
    });

  } catch (error) {
    console.error('Delete review error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete review'
    });
  }
}

/**
 * Update template rating statistics
 * This should ideally be done with database triggers, but for simplicity we'll do it here
 */
async function updateTemplateRatingStats(supabase, templateId) {
  try {
    // Get all approved reviews for this template
    const { data: reviews } = await supabase
      .from('template_reviews')
      .select('rating')
      .eq('template_id', templateId)
      .eq('is_approved', true);

    if (reviews && reviews.length > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / reviews.length;
      const reviewCount = reviews.length;

      // Update template with new stats
      await supabase
        .from('community_templates')
        .update({
          average_rating: Math.round(averageRating * 10) / 10,
          review_count: reviewCount
        })
        .eq('id', templateId);
    } else {
      // No reviews, reset stats
      await supabase
        .from('community_templates')
        .update({
          average_rating: 0,
          review_count: 0
        })
        .eq('id', templateId);
    }
  } catch (error) {
    console.error('Error updating template rating stats:', error);
    // Don't throw error as this is a background operation
  }
}
