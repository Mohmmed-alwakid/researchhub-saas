import type { Response, NextFunction } from 'express';
import { Study } from '../../database/models/Study.model';
import { Task } from '../../database/models/Task.model';
import { Session } from '../../database/models/Session.model';
import { APIError } from '../middleware/error.middleware';
import type { AuthRequest } from '../../shared/types/index.js';
import type { ISubscriptionDocument } from '../../database/models/Subscription.model';
import {
  canAccessStudy,
  isResourceOwner,
  isAdmin,
  hasActiveSubscription,
  PERMISSION_ERRORS
} from '../utils/permissions.util.js';

/**
 * Create a new study
 */
export const createStudy = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return next(new APIError(PERMISSION_ERRORS.AUTHENTICATION_REQUIRED, 401));
    }    // Check if user has active subscription for study creation
    if (!hasActiveSubscription(req.user!)) {
      return next(new APIError(PERMISSION_ERRORS.SUBSCRIPTION_REQUIRED, 403));
    }    // Check study creation limits based on subscription
    const userStudyCount = await Study.countDocuments({ createdBy: userId });
    
    // Load user's subscription to check limits
    await req.user!.populate('subscription');
    const subscription = req.user!.subscription as ISubscriptionDocument;
    
    if (subscription?.usageLimits?.studies && subscription.usageLimits.studies !== -1) {
      if (userStudyCount >= subscription.usageLimits.studies) {
        return next(new APIError(`Study limit reached (${subscription.usageLimits.studies}). Upgrade subscription for more studies`, 403));
      }
    }

    // Transform the incoming data to match the database model
    const { title, description, type, targetParticipants, duration, compensation, settings } = req.body;

    const studyData = {
      title,
      description,
      type,
      createdBy: userId,
      researcher: userId,
      team: [userId], // Initially, creator is the only team member
      configuration: {
        duration: duration || 30,
        compensation: compensation || 0,
        maxParticipants: targetParticipants || 10,
        participantCriteria: {
          devices: ['desktop', 'mobile', 'tablet']
        },
        recordingOptions: {
          screen: settings?.recordScreen ?? true,
          audio: settings?.recordAudio ?? false,
          webcam: settings?.recordWebcam ?? false,
          clicks: settings?.trackClicks ?? true,
          scrolls: settings?.trackScrolls ?? true,
          keystrokes: false
        }
      },
      participants: {
        target: targetParticipants || 10,
        enrolled: 0,
        completed: 0,
        active: [],
        qualified: [],
        disqualified: []
      }
    };

    const study = new Study(studyData);
    await study.save();

    res.status(201).json({
      success: true,
      data: study,
      message: 'Study created successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all studies for the authenticated user
 */
export const getStudies = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return next(new APIError('User not authenticated', 401));
    }    const { page = 1, limit = 10, status, type } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Build filter
    interface StudyFilter {
      $or: Array<{ createdBy: string } | { team: string }>;
      status?: string;
      type?: string;
    }

    const filter: StudyFilter = {
      $or: [
        { createdBy: userId },
        { team: userId }
      ]
    };

    if (status) filter.status = status as string;
    if (type) filter.type = type as string;

    const studies = await Study.find(filter)
      .populate('createdBy', 'name email')
      .populate('team', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Study.countDocuments(filter);

    res.json({
      success: true,
      data: {
        studies,
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
 * Get a single study by ID
 */
export const getStudy = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return next(new APIError(PERMISSION_ERRORS.AUTHENTICATION_REQUIRED, 401));
    }

    const study = await Study.findById(id)
      .populate('createdBy', 'name email')
      .populate('team', 'name email');

    if (!study) {
      return next(new APIError(PERMISSION_ERRORS.RESOURCE_NOT_FOUND, 404));
    }    // Check if user has access to this study using utility function
    const teamMemberIds = study.team?.map((member: unknown) => {
      if (typeof member === 'string') return member;
      return (member as { _id?: string; toString(): string })._id?.toString() || (member as { toString(): string }).toString();
    }) || [];
    
    if (!canAccessStudy(req.user!, study.createdBy.toString(), teamMemberIds)) {
      return next(new APIError(PERMISSION_ERRORS.STUDY_ACCESS_DENIED, 403));
    }

    res.json({
      success: true,
      data: study
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a study
 */
export const updateStudy = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return next(new APIError(PERMISSION_ERRORS.AUTHENTICATION_REQUIRED, 401));
    }

    const study = await Study.findById(id);

    if (!study) {
      return next(new APIError(PERMISSION_ERRORS.RESOURCE_NOT_FOUND, 404));
    }

    // Check if user has permission to update using utility functions
    if (!isResourceOwner(req.user!, study.createdBy.toString()) && !isAdmin(req.user!)) {
      // Check if user is team member
      if (!study.team?.includes(userId)) {
        return next(new APIError(PERMISSION_ERRORS.OWNER_OR_ADMIN_REQUIRED, 403));
      }
    }

    // Update study
    Object.assign(study, req.body);
    study.updatedAt = new Date();
    await study.save();

    res.json({
      success: true,
      data: study,
      message: 'Study updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a study
 */
export const deleteStudy = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const study = await Study.findById(id);

    if (!study) {
      return next(new APIError('Study not found', 404));
    }

    // Only creator can delete
    if (study.createdBy.toString() !== userId) {
      return next(new APIError('Only the study creator can delete this study', 403));
    }

    // Check if study has active sessions
    const activeSessions = await Session.countDocuments({ 
      study: id, 
      status: { $in: ['active', 'paused'] }
    });

    if (activeSessions > 0) {
      return next(new APIError('Cannot delete study with active sessions', 400));
    }

    await Study.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Study deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Publish a study
 */
export const publishStudy = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const study = await Study.findById(id);

    if (!study) {
      return next(new APIError('Study not found', 404));
    }

    // Check permissions
    const hasPermission = study.createdBy.toString() === userId || 
                         study.team?.includes(userId);

    if (!hasPermission) {
      return next(new APIError('Permission denied', 403));
    }

    // Check if study has tasks
    const taskCount = await Task.countDocuments({ study: id });
    if (taskCount === 0) {
      return next(new APIError('Cannot publish study without tasks', 400));
    }

    study.status = 'active';
    study.publishedAt = new Date();
    await study.save();

    res.json({
      success: true,
      data: study,
      message: 'Study published successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Pause a study
 */
export const pauseStudy = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const study = await Study.findById(id);

    if (!study) {
      return next(new APIError('Study not found', 404));
    }

    // Check permissions
    const hasPermission = study.createdBy.toString() === userId || 
                         study.team?.includes(userId);

    if (!hasPermission) {
      return next(new APIError('Permission denied', 403));
    }

    study.status = 'paused';
    await study.save();

    res.json({
      success: true,
      data: study,
      message: 'Study paused successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get study analytics
 */
export const getStudyAnalytics = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const study = await Study.findById(id);

    if (!study) {
      return next(new APIError('Study not found', 404));
    }

    // Check access
    const hasAccess = study.createdBy.toString() === userId || 
                     study.team?.includes(userId);

    if (!hasAccess) {
      return next(new APIError('Access denied', 403));
    }

    // Get analytics data
    const totalSessions = await Session.countDocuments({ study: id });
    const completedSessions = await Session.countDocuments({ 
      study: id, 
      status: 'completed' 
    });
    const activeSessions = await Session.countDocuments({ 
      study: id, 
      status: { $in: ['active', 'paused'] }
    });

    // Get session completion rate
    const completionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

    // Get average session duration
    const sessions = await Session.find({ 
      study: id, 
      status: 'completed',
      endedAt: { $exists: true }
    });

    let averageDuration = 0;
    if (sessions.length > 0) {      const totalDuration = sessions.reduce((sum, session) => {        const endTime = session.endedAt || session.updatedAt || new Date();
        const duration = new Date(endTime).getTime() - new Date(session.startedAt || new Date()).getTime();
        return sum + duration;
      }, 0);
      averageDuration = totalDuration / sessions.length;
    }

    res.json({
      success: true,
      data: {
        totalSessions,
        completedSessions,
        activeSessions,
        completionRate: Math.round(completionRate * 100) / 100,
        averageDuration: Math.round(averageDuration / 1000), // Convert to seconds
        participantCount: await Session.distinct('participant', { study: id }).then(participants => participants.length)
      }
    });
  } catch (error) {
    next(error);
  }
};
