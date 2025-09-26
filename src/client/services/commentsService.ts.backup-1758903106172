/**
 * Comments Service
 * Client-side service for comment system management
 */

import type { IStudyComment } from '../../shared/types';

interface CommentReaction {
  id: string;
  commentId: string;
  userId: string;
  emoji: string;
  reactionType: string;
  addedAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  createdAt: Date;
}

interface CommentWithReactions extends Omit<IStudyComment, 'reactions'> {
  reactions: CommentReaction[];
  replies?: CommentWithReactions[];
}

interface CommentFilter {
  includeResolved?: boolean;
  authorId?: string;
  limit?: number;
  offset?: number;
}

interface CommentMention {
  id: string;
  commentId: string;
  content: string;
  author: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  entityType: string;
  entityId: string;
  createdAt: Date;
  isRead?: boolean;
}

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  count?: number;
}

class CommentsService {
  private baseUrl: string;
  private authToken: string | null = null;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || (typeof window !== 'undefined' 
      ? window.location.origin 
      : 'http://localhost:3003');
  }

  /**
   * Set authentication token
   */
  setAuthToken(token: string): void {
    this.authToken = token;
  }

  /**
   * Get comments for an entity
   */
  async getComments(
    entityType: string,
    entityId: string,
    workspaceId?: string,
    filters: CommentFilter = {}
  ): Promise<{
    comments: CommentWithReactions[];
    count: number;
  }> {
    const params = new URLSearchParams({
      action: 'get_comments',
      entityType,
      entityId
    });

    if (workspaceId) params.append('workspaceId', workspaceId);
    if (filters.includeResolved !== undefined) {
      params.append('includeResolved', filters.includeResolved.toString());
    }

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && key !== 'includeResolved') {
        params.append(key, value.toString());
      }
    });

    const response = await this.apiCall<{
      comments: CommentWithReactions[];
      count: number;
    }>(`/api/comments?${params}`);

    if (!response.success) {
      throw new Error(response.error || 'Failed to get comments');
    }

    return {
      comments: response.data?.comments || [],
      count: response.data?.count || 0
    };
  }

  /**
   * Add a new comment
   */
  async addComment(
    entityType: string,
    entityId: string,
    content: string,
    workspaceId?: string,
    parentId?: string,
    mentions: string[] = [],
    metadata: Record<string, unknown> = {}
  ): Promise<CommentWithReactions> {
    const response = await this.apiCall<CommentWithReactions>('/api/comments?action=add_comment', {
      method: 'POST',
      body: JSON.stringify({
        entityType,
        entityId,
        content,
        workspaceId,
        parentId,
        mentions,
        metadata
      })
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to add comment');
    }

    return response.data!;
  }

  /**
   * Update an existing comment
   */
  async updateComment(
    commentId: string,
    content: string,
    mentions: string[] = []
  ): Promise<CommentWithReactions> {
    const response = await this.apiCall<CommentWithReactions>('/api/comments?action=update_comment', {
      method: 'POST',
      body: JSON.stringify({
        commentId,
        content,
        mentions
      })
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to update comment');
    }

    return response.data!;
  }

  /**
   * Delete a comment
   */
  async deleteComment(commentId: string): Promise<void> {
    const response = await this.apiCall('/api/comments?action=delete_comment', {
      method: 'POST',
      body: JSON.stringify({
        commentId
      })
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to delete comment');
    }
  }

  /**
   * Add a reaction to a comment
   */
  async addReaction(
    commentId: string,
    reactionType: string
  ): Promise<CommentReaction> {
    const response = await this.apiCall<CommentReaction>('/api/comments?action=add_reaction', {
      method: 'POST',
      body: JSON.stringify({
        commentId,
        reactionType
      })
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to add reaction');
    }

    return response.data!;
  }

  /**
   * Remove a reaction from a comment
   */
  async removeReaction(
    commentId: string,
    reactionType: string
  ): Promise<void> {
    const response = await this.apiCall('/api/comments?action=remove_reaction', {
      method: 'POST',
      body: JSON.stringify({
        commentId,
        reactionType
      })
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to remove reaction');
    }
  }

  /**
   * Mark a comment thread as resolved/unresolved
   */
  async markResolved(
    commentId: string,
    isResolved = true
  ): Promise<CommentWithReactions> {
    const response = await this.apiCall<CommentWithReactions>('/api/comments?action=mark_resolved', {
      method: 'POST',
      body: JSON.stringify({
        commentId,
        isResolved
      })
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to update comment resolution');
    }

    return response.data!;
  }

  /**
   * Get mentions for the current user
   */
  async getMentions(
    workspaceId?: string,
    unreadOnly = false,
    limit = 20,
    offset = 0
  ): Promise<{
    mentions: CommentMention[];
    count: number;
  }> {
    const params = new URLSearchParams({
      action: 'get_mentions',
      unreadOnly: unreadOnly.toString(),
      limit: limit.toString(),
      offset: offset.toString()
    });

    if (workspaceId) params.append('workspaceId', workspaceId);

    const response = await this.apiCall<{
      mentions: CommentMention[];
      count: number;
    }>(`/api/comments?${params}`);

    if (!response.success) {
      throw new Error(response.error || 'Failed to get mentions');
    }

    return {
      mentions: response.data?.mentions || [],
      count: response.data?.count || 0
    };
  }

  /**
   * Reply to a comment
   */
  async replyToComment(
    parentCommentId: string,
    entityType: string,
    entityId: string,
    content: string,
    workspaceId?: string,
    mentions: string[] = []
  ): Promise<CommentWithReactions> {
    return this.addComment(
      entityType,
      entityId,
      content,
      workspaceId,
      parentCommentId,
      mentions
    );
  }

  /**
   * Toggle reaction on a comment
   */
  async toggleReaction(
    commentId: string,
    reactionType: string
  ): Promise<{ added: boolean; reaction?: CommentReaction }> {
    try {
      const reaction = await this.addReaction(commentId, reactionType);
      return { added: true, reaction };
    } catch (error) {
      // If adding failed, try removing (assuming it already exists)
      try {
        await this.removeReaction(commentId, reactionType);
        return { added: false };
      } catch {
        throw error; // Re-throw the original error
      }
    }
  }

  /**
   * Batch operations for comments
   */
  async batchDeleteComments(commentIds: string[]): Promise<void> {
    const deletePromises = commentIds.map(id => this.deleteComment(id));
    await Promise.all(deletePromises);
  }

  async batchResolveComments(commentIds: string[], isResolved = true): Promise<CommentWithReactions[]> {
    const resolvePromises = commentIds.map(id => this.markResolved(id, isResolved));
    return Promise.all(resolvePromises);
  }

  /**
   * API call utility
   */
  private async apiCall<T = unknown>(url: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    if (!this.authToken) {
      throw new Error('Authentication token not set');
    }

    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authToken}`
      }
    };

    const response = await fetch(this.baseUrl + url, {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
}

// Export singleton instance
export const commentsService = new CommentsService();
export default CommentsService;
