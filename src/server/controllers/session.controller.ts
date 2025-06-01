import type { Request, Response, NextFunction } from 'express';
import { Session } from '../../database/models/Session.model';
import { Study } from '../../database/models/Study.model';
import { Task } from '../../database/models/Task.model';
import { Recording } from '../../database/models/Recording.model';
import { APIError } from '../middleware/error.middleware';
import type { AuthRequest } from '../../shared/types/index.js';
import {
  canAccessStudy,
  isResourceOwner,
  isAdmin,
  hasSubscriptionFeature,
  PERMISSION_ERRORS
} from '../utils/permissions.util.js';

/**
 * Start a new session (for participants)
 */
export const startSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { studyId } = req.params;
    const { participantInfo } = req.body;

    // Verify study exists and is active
    const study = await Study.findById(studyId);
    if (!study) {
      return next(new APIError('Study not found', 404));
    }

    if (study.status !== 'active') {
      return next(new APIError('Study is not currently active', 400));
    }    // Check if study has reached participant limit
    if (study.settings?.maxParticipants) {
      const currentParticipants = await Session.countDocuments({ study: studyId });
      if (currentParticipants >= study.settings.maxParticipants) {
        return next(new APIError('Study has reached maximum participants', 400));
      }
    }

    // Get first task for the study
    const firstTask = await Task.findOne({ study: studyId }).sort({ order: 1 });
    
    const sessionData = {
      study: studyId,
      participant: participantInfo,
      status: 'in_progress',
      startedAt: new Date(),
      progress: {
        currentTask: firstTask?._id || null,
        completedTasks: [],
        totalTasks: await Task.countDocuments({ study: studyId })
      },
      metadata: {
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip,
        referrer: req.get('Referer')
      }
    };

    const session = new Session(sessionData);
    await session.save();

    // Populate the session with study and task info
    await session.populate('study', 'title description settings');
    await session.populate('progress.currentTask');

    res.status(201).json({
      success: true,
      data: session,
      message: 'Session started successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get session by ID (for participants)
 */
export const getSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const session = await Session.findById(id)
      .populate('study', 'title description settings')
      .populate('progress.currentTask')
      .populate('progress.completedTasks');

    if (!session) {
      return next(new APIError('Session not found', 404));
    }

    res.json({
      success: true,
      data: session
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update session progress
 */
export const updateSessionProgress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { taskId, action, data } = req.body; // action: 'complete_task', 'next_task', 'previous_task'

    const session = await Session.findById(id);    if (!session) {
      return next(new APIError('Session not found', 404));    }    
    if (session.status !== 'in_progress') {
      return next(new APIError('Session is not active', 400));
    }

    switch (action) {      case 'complete_task':
        if (taskId && session.progress && !session.progress.completedTasks.includes(taskId)) {
          session.progress.completedTasks.push(taskId);        }
        break;

      case 'next_task': {
        const nextTask = await Task.findOne({ 
          study: session.studyId,
          order: { $gt: await Task.findById(session.progress?.currentTask).then(t => t?.order || 0) }
        }).sort({ order: 1 });
        
        if (nextTask && session.progress) {
          session.progress.currentTask = nextTask._id.toString();
        } else {
          // No more tasks, complete session
          session.status = 'completed';
          session.endedAt = new Date();
        }
        break;
      }case 'previous_task': {
        const prevTask = await Task.findOne({ 
          study: session.studyId,
          order: { $lt: await Task.findById(session.progress?.currentTask).then(t => t?.order || 0) }
        }).sort({ order: -1 });
        
        if (prevTask && session.progress) {
          session.progress.currentTask = prevTask._id.toString();
        }
        break;
      }
    }

    // Add any additional data
    if (data) {
      session.data = { ...session.data, ...data };
    }

    session.updatedAt = new Date();
    await session.save();

    await session.populate('progress.currentTask');

    res.json({
      success: true,
      data: session,
      message: 'Session progress updated'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Complete session
 */
export const completeSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { feedback } = req.body;

    const session = await Session.findById(id);
    if (!session) {
      return next(new APIError('Session not found', 404));
    }

    session.status = 'completed';
    session.endedAt = new Date();
    
    if (feedback) {
      session.data = { ...session.data, finalFeedback: feedback };
    }

    await session.save();

    res.json({
      success: true,
      data: session,
      message: 'Session completed successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Pause session
 */
export const pauseSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const session = await Session.findById(id);    if (!session) {
      return next(new APIError('Session not found', 404));    }
      if (session.status !== 'in_progress') {
      return next(new APIError('Can only pause active sessions', 400));
    }

    session.status = 'cancelled';
    session.updatedAt = new Date();
    await session.save();

    res.json({
      success: true,
      data: session,
      message: 'Session paused'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Resume session
 */
export const resumeSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;    const session = await Session.findById(id);
    if (!session) {
      return next(new APIError('Session not found', 404));
    }    
    if (session.status !== 'cancelled') {
      return next(new APIError('Can only resume cancelled sessions', 400));
    }

    session.status = 'in_progress';
    session.updatedAt = new Date();
    await session.save();

    res.json({
      success: true,
      data: session,
      message: 'Session resumed'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all sessions for a study (for researchers)
 */
export const getStudySessions = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { studyId } = req.params;
    const userId = req.user?.id;
    const { page = 1, limit = 10, status } = req.query;

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
    const filter: any = { study: studyId };
    
    if (status) filter.status = status;

    const sessions = await Session.find(filter)
      .populate('progress.currentTask', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Session.countDocuments(filter);

    res.json({
      success: true,
      data: {
        sessions,
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
 * Get session details (for researchers)
 */
export const getSessionDetails = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;    const session = await Session.findById(id)
      .populate('studyId')
      .populate('progress.currentTask')
      .populate('progress.completedTasks');

    if (!session) {
      return next(new APIError('Session not found', 404));
    }

    // Check study access
    const study = session.studyId as any;
    const hasAccess = study.createdBy.toString() === userId || 
                     study.team?.includes(userId);

    if (!hasAccess) {
      return next(new APIError('Access denied', 403));
    }

    // Get associated recordings
    const recordings = await Recording.find({ session: id });

    res.json({
      success: true,
      data: {
        session,
        recordings
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete session (for researchers)
 */
export const deleteSession = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;    const session = await Session.findById(id).populate('studyId');
    if (!session) {
      return next(new APIError('Session not found', 404));
    }

    // Check study access
    const study = session.studyId as any;
    const hasAccess = study.createdBy.toString() === userId || 
                     study.team?.includes(userId);

    if (!hasAccess) {
      return next(new APIError('Access denied', 403));
    }

    // Delete associated recordings
    await Recording.deleteMany({ session: id });

    await Session.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Session deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
