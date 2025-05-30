import type { Request, Response, NextFunction } from 'express';
import { Feedback } from '../../database/models/Feedback.model';
import { Session } from '../../database/models/Session.model';
import { Study } from '../../database/models/Study.model';
import { Task } from '../../database/models/Task.model';
import { APIError } from '../middleware/error.middleware';
import type { AuthRequest } from '../../shared/types/index.js';

/**
 * Submit feedback (for participants)
 */
export const submitFeedback = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sessionId, taskId } = req.params;
    const { type, content, rating, metadata } = req.body;    // Verify session exists
    const session = await Session.findById(sessionId);
    if (!session) {
      return next(new APIError('Session not found', 404));
    }

    // If taskId provided, verify it belongs to the study
    if (taskId) {
      const task = await Task.findById(taskId);
      if (!task || task.studyId.toString() !== session.studyId.toString()) {
        return next(new APIError('Task not found or does not belong to this study', 404));
      }
    }const feedbackData = {
      sessionId: sessionId,
      taskId: taskId || null,
      type,
      content,
      rating,
      metadata: {
        ...metadata,
        userAgent: req.get('User-Agent'),
        timestamp: new Date(),
        ipAddress: req.ip
      }
    };

    const feedback = new Feedback(feedbackData);
    await feedback.save();

    res.status(201).json({
      success: true,
      data: feedback,
      message: 'Feedback submitted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get feedback for a session (for researchers)
 */
export const getSessionFeedback = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user?.id;

    // Verify session access
    const session = await Session.findById(sessionId).populate('study');
    if (!session) {
      return next(new APIError('Session not found', 404));
    }    const study = await Study.findById(session.studyId);
    if (!study) {
      return next(new APIError('Study not found', 404));
    }
    
    const hasAccess = study.createdBy.toString() === userId || 
                     study.team?.includes(userId);

    if (!hasAccess) {
      return next(new APIError('Access denied', 403));
    }

    const feedback = await Feedback.find({ sessionId: sessionId })
      .populate('task', 'title order')
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      data: feedback
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get feedback for a study (for researchers)
 */
export const getStudyFeedback = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { studyId } = req.params;
    const userId = req.user?.id;
    const { page = 1, limit = 10, type, taskId, rating } = req.query;

    // Verify study access
    const study = await Study.findById(studyId);
    if (!study) {
      return next(new APIError('Study not found', 404));
    }    const hasAccess = study.createdBy.toString() === userId || 
                     study.team?.includes(userId);

    if (!hasAccess) {
      return next(new APIError('Access denied', 403));
    }

    const skip = (Number(page) - 1) * Number(limit);

    // Get sessions for this study
    const sessions = await Session.find({ study: studyId }, '_id');
    const sessionIds = sessions.map(s => s._id);

    const filter: any = { session: { $in: sessionIds } };
    if (type) filter.type = type;
    if (taskId) filter.task = taskId;
    if (rating) filter.rating = Number(rating);

    const feedback = await Feedback.find(filter)
      .populate('session', 'participant startedAt')
      .populate('task', 'title order')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Feedback.countDocuments(filter);

    res.json({
      success: true,
      data: {
        feedback,
        pagination: {
          current: Number(page),
          pages: Math.ceil(total / Number(limit)),
          total
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get feedback for a specific task (for researchers)
 */
export const getTaskFeedback = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { taskId } = req.params;
    const userId = req.user?.id;

    // Verify task access
    const task = await Task.findById(taskId).populate('study');
    if (!task) {
      return next(new APIError('Task not found', 404));
    }    const study = await Study.findById(task.studyId);
    if (!study) {
      return next(new APIError('Study not found', 404));
    }
    
    const hasAccess = study.createdBy.toString() === userId || 
                     study.team?.includes(userId);

    if (!hasAccess) {
      return next(new APIError('Access denied', 403));
    }

    const feedback = await Feedback.find({ task: taskId })
      .populate('session', 'participant startedAt')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: feedback
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get feedback by ID (for researchers)
 */
export const getFeedback = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;    const feedback = await Feedback.findById(id)
      .populate({
        path: 'sessionId',
        populate: {
          path: 'studyId',
          select: 'title createdBy team'
        }
      })
      .populate('taskId', 'title order');

    if (!feedback) {
      return next(new APIError('Feedback not found', 404));
    }

    // Check access permissions
    const session = feedback.sessionId as any;    const study = session.study;
    
    const hasAccess = study.createdBy.toString() === userId || 
                     study.team?.includes(userId);

    if (!hasAccess) {
      return next(new APIError('Access denied', 403));
    }

    res.json({
      success: true,
      data: feedback
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update feedback (for researchers - add notes/tags)
 */
export const updateFeedback = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const { notes, tags, status } = req.body;

    const feedback = await Feedback.findById(id)
      .populate({
        path: 'sessionId',
        populate: {
          path: 'studyId',
          select: 'createdBy team'
        }
      });

    if (!feedback) {
      return next(new APIError('Feedback not found', 404));
    }    // Check access permissions
    const session = feedback.sessionId as any;
    const study = session.study;
    
    const hasAccess = study.createdBy.toString() === userId || 
                     study.team?.includes(userId);

    if (!hasAccess) {
      return next(new APIError('Access denied', 403));
    }

    // Update allowed fields
    if (notes !== undefined) feedback.notes = notes;
    if (tags !== undefined) feedback.tags = tags;
    if (status !== undefined) feedback.status = status;

    feedback.updatedAt = new Date();
    await feedback.save();

    res.json({
      success: true,
      data: feedback,
      message: 'Feedback updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete feedback (for researchers)
 */
export const deleteFeedback = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const feedback = await Feedback.findById(id)
      .populate({
        path: 'sessionId',
        populate: {
          path: 'studyId',
          select: 'createdBy team'
        }
      });

    if (!feedback) {
      return next(new APIError('Feedback not found', 404));
    }    // Check access permissions
    const session = feedback.sessionId as any;
    const study = session.study;
    
    const hasAccess = study.createdBy.toString() === userId || 
                     study.team?.includes(userId);

    if (!hasAccess) {
      return next(new APIError('Access denied', 403));
    }

    await Feedback.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Feedback deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get feedback analytics for a study
 */
export const getFeedbackAnalytics = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { studyId } = req.params;
    const userId = req.user?.id;

    // Verify study access
    const study = await Study.findById(studyId);
    if (!study) {
      return next(new APIError('Study not found', 404));
    }    const hasAccess = study.createdBy.toString() === userId || 
                     study.team?.includes(userId);

    if (!hasAccess) {
      return next(new APIError('Access denied', 403));
    }

    // Get sessions for this study
    const sessions = await Session.find({ study: studyId }, '_id');
    const sessionIds = sessions.map(s => s._id);

    // Calculate analytics
    const totalFeedback = await Feedback.countDocuments({ session: { $in: sessionIds } });
    
    // Feedback by type
    const feedbackByType = await Feedback.aggregate([
      { $match: { session: { $in: sessionIds } } },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    // Average ratings
    const ratingStats = await Feedback.aggregate([
      { $match: { session: { $in: sessionIds }, rating: { $exists: true } } },
      { 
        $group: { 
          _id: null, 
          averageRating: { $avg: '$rating' },
          minRating: { $min: '$rating' },
          maxRating: { $max: '$rating' },
          totalRatings: { $sum: 1 }
        } 
      }
    ]);

    // Feedback by task
    const feedbackByTask = await Feedback.aggregate([
      { $match: { session: { $in: sessionIds }, task: { $exists: true } } },
      { $group: { _id: '$task', count: { $sum: 1 }, averageRating: { $avg: '$rating' } } },
      { $lookup: { from: 'tasks', localField: '_id', foreignField: '_id', as: 'taskInfo' } },
      { $unwind: '$taskInfo' },
      { $project: { taskId: '$_id', taskTitle: '$taskInfo.title', count: 1, averageRating: 1 } }
    ]);

    // Recent feedback
    const recentFeedback = await Feedback.find({ session: { $in: sessionIds } })
      .populate('task', 'title')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        totalFeedback,
        feedbackByType,
        ratingStats: ratingStats[0] || { averageRating: 0, minRating: 0, maxRating: 0, totalRatings: 0 },
        feedbackByTask,
        recentFeedback
      }
    });
  } catch (error) {
    next(error);
  }
};
