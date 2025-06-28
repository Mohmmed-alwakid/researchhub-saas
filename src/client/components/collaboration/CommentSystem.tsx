import React, { useState, useRef } from 'react';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { 
  IStudyComment,
  CommentReaction,
  CollaboratorPresence
} from '../../../shared/types';

interface CommentSystemProps {
  /** Study or entity ID for comments */
  entityId: string;
  /** Type of entity being commented on */
  entityType: 'study' | 'block' | 'template' | 'workspace';
  /** Specific block ID if commenting on a block */
  blockId?: string;
  /** Current user information */
  currentUser: {
    id: string;
    name: string;
    avatar?: string;
    role?: string;
  };
  /** Existing comments */
  comments: IStudyComment[];
  /** Available team members for mentions */
  teamMembers: CollaboratorPresence[];
  /** Whether comments are read-only */
  readOnly?: boolean;
  /** Callback when new comment is added */
  onAddComment: (comment: Omit<IStudyComment, '_id' | 'createdAt' | 'updatedAt'>) => void;
  /** Callback when comment is updated */
  onUpdateComment: (commentId: string, updates: Partial<IStudyComment>) => void;
  /** Callback when comment is deleted */
  onDeleteComment: (commentId: string) => void;
  /** Callback when reaction is added */
  onAddReaction: (commentId: string, emoji: string) => void;
  /** Callback when reaction is removed */
  onRemoveReaction: (commentId: string, emoji: string) => void;
  className?: string;
}

export const CommentSystem: React.FC<CommentSystemProps> = ({
  entityId,
  entityType,
  blockId,
  currentUser,
  comments = [],
  teamMembers = [],
  readOnly = false,
  onAddComment,
  onUpdateComment,
  onDeleteComment,
  onAddReaction,
  onRemoveReaction,
  className = ''
}) => {
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionStartIndex, setMentionStartIndex] = useState(-1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Common emoji reactions
  const commonReactions = ['👍', '👎', '❤️', '😊', '🎉', '🤔', '👀', '🚀'];

  // Group comments by thread
  const groupedComments = comments.reduce((acc, comment) => {
    if (!comment.parentCommentId) {
      acc[comment._id] = {
        comment,
        replies: comments.filter(c => c.parentCommentId === comment._id)
      };
    }
    return acc;
  }, {} as Record<string, { comment: IStudyComment; replies: IStudyComment[] }>);

  // Format time since comment
  const formatTimeSince = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(date).toLocaleDateString();
  };

  // Handle mention detection
  const handleInputChange = (value: string) => {
    setNewComment(value);
    
    // Detect @ mentions
    const lastAtIndex = value.lastIndexOf('@');
    if (lastAtIndex !== -1) {
      const afterAt = value.substring(lastAtIndex + 1);
      if (!afterAt.includes(' ') && afterAt.length <= 20) {
        setMentionQuery(afterAt);
        setMentionStartIndex(lastAtIndex);
        setShowMentions(true);
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  };

  // Handle mention selection
  const selectMention = (member: CollaboratorPresence) => {
    if (mentionStartIndex !== -1) {
      const beforeMention = newComment.substring(0, mentionStartIndex);
      const afterMention = newComment.substring(mentionStartIndex + mentionQuery.length + 1);
      setNewComment(`${beforeMention}@${member.name}${afterMention} `);
    }
    setShowMentions(false);
    setMentionQuery('');
    setMentionStartIndex(-1);
  };

  // Filter team members for mentions
  const filteredMembers = teamMembers.filter(member =>
    member.name.toLowerCase().includes(mentionQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(mentionQuery.toLowerCase())
  );

  // Submit new comment
  const handleSubmitComment = (parentId?: string) => {
    const content = parentId ? (replyingTo === parentId ? newComment : '') : newComment;
    if (!content.trim()) return;

    const mentions = extractMentions(content);
    
    onAddComment({
      studyId: entityId,
      blockId,
      parentCommentId: parentId,
      authorId: currentUser.id,
      content: content.trim(),
      type: 'comment',
      status: 'open',
      mentions,
      attachments: [],
      reactions: [],
      metadata: {
        entityType,
        userAgent: navigator.userAgent
      }
    });

    setNewComment('');
    setReplyingTo(null);
  };

  // Extract mentions from content
  const extractMentions = (content: string): string[] => {
    const mentionRegex = /@(\w+(?:\s+\w+)*)/g;
    const mentions: string[] = [];
    let match;
    
    while ((match = mentionRegex.exec(content)) !== null) {
      const mentionedName = match[1];
      const member = teamMembers.find(m => m.name === mentionedName);
      if (member) {
        mentions.push(member.id);
      }
    }
    
    return mentions;
  };

  // Handle comment editing
  const startEditing = (comment: IStudyComment) => {
    setEditingComment(comment._id);
    setEditContent(comment.content);
  };

  const saveEdit = () => {
    if (editingComment && editContent.trim()) {
      onUpdateComment(editingComment, {
        content: editContent.trim(),
        mentions: extractMentions(editContent)
      });
      setEditingComment(null);
      setEditContent('');
    }
  };

  const cancelEdit = () => {
    setEditingComment(null);
    setEditContent('');
  };

  // Render comment component
  const renderComment = (comment: IStudyComment, isReply = false) => {
    const isEditing = editingComment === comment._id;
    const canEdit = comment.authorId === currentUser.id;
    
    return (
      <div key={comment._id} className={`comment ${isReply ? 'ml-12' : ''}`}>
        <div className="flex space-x-3">
          <Avatar
            src={comment.authorId === currentUser.id ? currentUser.avatar : undefined}
            alt={comment.authorId === currentUser.id ? currentUser.name : `User ${comment.authorId}`}
            size="sm"
          />
          
          <div className="flex-1 min-w-0">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
                    {comment.authorId === currentUser.id ? currentUser.name : `User ${comment.authorId}`}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatTimeSince(comment.createdAt)}
                  </span>
                  {comment.type !== 'comment' && (
                    <Badge variant="info" size="sm">
                      {comment.type}
                    </Badge>
                  )}
                </div>
                
                {canEdit && !readOnly && (
                  <div className="flex items-center space-x-1">
                    {!isEditing && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEditing(comment)}
                          className="text-xs p-1"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteComment(comment._id)}
                          className="text-xs p-1 text-red-600 hover:text-red-700"
                        >
                          Delete
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </div>
              
              {isEditing ? (
                <div className="space-y-2">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    rows={3}
                    placeholder="Edit your comment..."
                  />
                  <div className="flex items-center space-x-2">
                    <Button onClick={saveEdit} size="sm">
                      Save
                    </Button>
                    <Button onClick={cancelEdit} variant="ghost" size="sm">
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {comment.content}
                </div>
              )}
            </div>
            
            {/* Reactions */}
            {comment.reactions && comment.reactions.length > 0 && (
              <div className="flex items-center space-x-1 mt-1 ml-3">
                {Object.entries(
                  comment.reactions.reduce((acc: Record<string, number>, reaction) => {
                    acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
                    return acc;
                  }, {})
                ).map(([emoji, count]) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      const hasReacted = comment.reactions?.some((r: CommentReaction) => 
                        r.emoji === emoji && r.userId === currentUser.id
                      );
                      if (hasReacted) {
                        onRemoveReaction(comment._id, emoji);
                      } else {
                        onAddReaction(comment._id, emoji);
                      }
                    }}
                    className="flex items-center space-x-1 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <span>{emoji}</span>
                    <span className="text-gray-600 dark:text-gray-400">{count as number}</span>
                  </button>
                ))}
              </div>
            )}
            
            {/* Actions */}
            {!readOnly && (
              <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                <button
                  onClick={() => setReplyingTo(comment._id)}
                  className="hover:text-gray-700 dark:hover:text-gray-300"
                >
                  Reply
                </button>
                
                <div className="flex items-center space-x-1">
                  {commonReactions.slice(0, 3).map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => onAddReaction(comment._id, emoji)}
                      className="hover:scale-110 transition-transform"
                      title={`React with ${emoji}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`comment-system space-y-4 ${className}`}>
      {/* Comment List */}
      <div className="space-y-4">
        {Object.values(groupedComments).map(({ comment, replies }: { comment: IStudyComment; replies: IStudyComment[] }) => (
          <div key={comment._id} className="space-y-3">
            {renderComment(comment)}
            
            {/* Replies */}
            {replies.map((reply: IStudyComment) => renderComment(reply, true))}
            
            {/* Reply Input */}
            {replyingTo === comment._id && !readOnly && (
              <div className="ml-12 space-y-2">
                <div className="relative">
                  <textarea
                    ref={textareaRef}
                    value={newComment}
                    onChange={(e) => handleInputChange(e.target.value)}
                    placeholder="Write a reply..."
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    rows={3}
                  />
                  
                  {/* Mention Dropdown */}
                  {showMentions && filteredMembers.length > 0 && (
                    <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                      {filteredMembers.map(member => (
                        <button
                          key={member.id}
                          onClick={() => selectMention(member)}
                          className="w-full flex items-center space-x-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <Avatar src={member.avatar} alt={member.name} size="xs" />
                          <div className="text-left">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {member.name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {member.email}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Type @ to mention someone
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => setReplyingTo(null)}
                      variant="ghost"
                      size="sm"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => handleSubmitComment(comment._id)}
                      size="sm"
                      disabled={!newComment.trim()}
                    >
                      Reply
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* New Comment Input */}
      {!readOnly && !replyingTo && (
        <Card className="p-4">
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <Avatar
                src={currentUser.avatar}
                alt={currentUser.name}
                size="sm"
              />
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={newComment}
                  onChange={(e) => handleInputChange(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  rows={3}
                />
                
                {/* Mention Dropdown */}
                {showMentions && filteredMembers.length > 0 && (
                  <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                    {filteredMembers.map(member => (
                      <button
                        key={member.id}
                        onClick={() => selectMention(member)}
                        className="w-full flex items-center space-x-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Avatar src={member.avatar} alt={member.name} size="xs" />
                        <div className="text-left">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {member.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {member.email}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                <span>Type @ to mention someone</span>
                {newComment.length > 0 && (
                  <span>• {newComment.length} characters</span>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  {commonReactions.slice(0, 5).map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => setNewComment(prev => `${prev} ${emoji}`)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                      title={`Add ${emoji}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                
                <Button
                  onClick={() => handleSubmitComment()}
                  disabled={!newComment.trim()}
                >
                  Comment
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Empty State */}
      {comments.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <div className="text-4xl mb-2">💬</div>
          <div className="text-lg font-medium mb-1">No comments yet</div>
          <div className="text-sm">Be the first to start the conversation!</div>
        </div>
      )}
    </div>
  );
};

export default CommentSystem;
