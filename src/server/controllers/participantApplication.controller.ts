import type { Response, NextFunction } from 'express';
import { ParticipantApplication } from '../../database/models/ParticipantApplication.model.js';
import { Study } from '../../database/models/Study.model.js';
import { User } from '../../database/models/User.model.js';
import { APIError } from '../middleware/error.middleware.js';
import type { AuthRequest } from '../../shared/types/index.js';
import {
  isParticipant,
  isResearcher,
  canAccessStudy,
  PERMISSION_ERRORS
} from '../utils/permissions.util.js';

/**
 * Get public studies available for application
 */
export const getPublicStudies = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 12, type, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Build filter for public studies that are recruiting
    interface StudyFilter {
      visibility: string;
      recruitmentStatus: string;
      status: string;
      type?: string;
      $or?: Array<{ title: RegExp } | { description: RegExp }>;
    }

    const filter: StudyFilter = {
      visibility: 'public',
      recruitmentStatus: 'recruiting',
      status: 'active'
    };

    if (type) filter.type = type as string;
    
    if (search) {
      filter.$or = [
        { title: new RegExp(search as string, 'i') },
        { description: new RegExp(search as string, 'i') }
      ];
    }

    const [studies, total] = await Promise.all([
      Study.find(filter)
        .populate('researcher', 'name')
        .select('title description type configuration.duration configuration.compensation configuration.maxParticipants participants.enrolled createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Study.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        studies,
        pagination: {
          current: Number(page),
          pages: Math.ceil(total / Number(limit)),
          total,
          hasNext: Number(page) < Math.ceil(total / Number(limit)),
          hasPrev: Number(page) > 1
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Apply to a study
 */
export const applyToStudy = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { studyId } = req.params;
    const { screeningResponses } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return next(new APIError(PERMISSION_ERRORS.AUTHENTICATION_REQUIRED, 401));
    }

    // Only participants can apply
    if (!isParticipant(req.user!)) {
      return next(new APIError('Only participants can apply to studies', 403));
    }

    // Check if study exists and is recruiting
    const study = await Study.findById(studyId);
    if (!study) {
      return next(new APIError(PERMISSION_ERRORS.RESOURCE_NOT_FOUND, 404));
    }

    if (study.visibility !== 'public' || study.recruitmentStatus !== 'recruiting') {
      return next(new APIError('This study is not accepting applications', 400));
    }

    // Check if study is full
    if (study.participants.enrolled >= study.configuration.maxParticipants) {
      return next(new APIError('This study has reached maximum participants', 400));
    }

    // Check if user already applied
    const existingApplication = await ParticipantApplication.findOne({
      studyId,
      participantId: userId
    });

    if (existingApplication) {
      return next(new APIError('You have already applied to this study', 400));
    }

    // Create application
    const application = new ParticipantApplication({
      studyId,
      participantId: userId,
      screeningResponses: screeningResponses || []
    });

    await application.save();

    res.status(201).json({
      success: true,
      data: application,
      message: 'Application submitted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get participant's applications
 */
export const getMyApplications = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { page = 1, limit = 10, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    if (!userId) {
      return next(new APIError(PERMISSION_ERRORS.AUTHENTICATION_REQUIRED, 401));
    }

    interface ApplicationFilter {
      participantId: string;
      status?: string;
    }

    const filter: ApplicationFilter = { participantId: userId };
    if (status) filter.status = status as string;

    const [applications, total] = await Promise.all([
      ParticipantApplication.find(filter)
        .populate({
          path: 'studyId',
          select: 'title description type configuration.duration configuration.compensation status'
        })
        .sort({ appliedAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      ParticipantApplication.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        applications,
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
 * Withdraw application
 */
export const withdrawApplication = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { applicationId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return next(new APIError(PERMISSION_ERRORS.AUTHENTICATION_REQUIRED, 401));
    }

    const application = await ParticipantApplication.findById(applicationId);
    if (!application) {
      return next(new APIError('Application not found', 404));
    }

    // Check if user owns this application
    if (application.participantId.toString() !== userId) {
      return next(new APIError('Access denied', 403));
    }

    // Can only withdraw pending applications
    if (application.status !== 'pending') {
      return next(new APIError('Can only withdraw pending applications', 400));
    }

    application.status = 'withdrawn';
    await application.save();

    res.json({
      success: true,
      message: 'Application withdrawn successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get applications for a study (researcher only)
 */
export const getStudyApplications = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { studyId } = req.params;
    const { page = 1, limit = 10, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const userId = req.user?.id;

    if (!userId) {
      return next(new APIError(PERMISSION_ERRORS.AUTHENTICATION_REQUIRED, 401));
    }

    // Check if user can access this study
    const study = await Study.findById(studyId);
    if (!study) {
      return next(new APIError(PERMISSION_ERRORS.RESOURCE_NOT_FOUND, 404));
    }

    if (!canAccessStudy(req.user!, study.createdBy.toString(), study.team?.map(id => id.toString()))) {
      return next(new APIError(PERMISSION_ERRORS.STUDY_ACCESS_DENIED, 403));
    }

    interface ApplicationFilter {
      studyId: string;
      status?: string;
    }

    const filter: ApplicationFilter = { studyId };
    if (status) filter.status = status as string;

    const [applications, total] = await Promise.all([
      ParticipantApplication.find(filter)
        .populate({
          path: 'participantId',
          select: 'name email profile.demographics'
        })
        .sort({ appliedAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      ParticipantApplication.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        applications,
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
 * Review application (approve/reject)
 */
export const reviewApplication = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { applicationId } = req.params;
    const { action, rejectionReason, notes } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return next(new APIError(PERMISSION_ERRORS.AUTHENTICATION_REQUIRED, 401));
    }

    if (!['approve', 'reject'].includes(action)) {
      return next(new APIError('Invalid action. Must be "approve" or "reject"', 400));
    }

    const application = await ParticipantApplication.findById(applicationId)
      .populate('studyId');

    if (!application) {
      return next(new APIError('Application not found', 404));
    }

    const study = application.studyId as any;

    // Check if user can access this study
    if (!canAccessStudy(req.user!, study.createdBy.toString(), study.team?.map((id: any) => id.toString()))) {
      return next(new APIError(PERMISSION_ERRORS.STUDY_ACCESS_DENIED, 403));
    }

    // Can only review pending applications
    if (application.status !== 'pending') {
      return next(new APIError('Can only review pending applications', 400));
    }

    // Update application
    application.status = action === 'approve' ? 'approved' : 'rejected';
    application.reviewedAt = new Date();
    application.reviewedBy = userId;
    if (rejectionReason) application.rejectionReason = rejectionReason;
    if (notes) application.notes = notes;

    await application.save();

    // If approved, increment study enrollment
    if (action === 'approve') {
      await Study.findByIdAndUpdate(study._id, {
        $inc: { 'participants.enrolled': 1 },
        $push: { 'participants.active': application.participantId }
      });
    }

    res.json({
      success: true,
      data: application,
      message: `Application ${action}d successfully`
    });
  } catch (error) {
    next(error);
  }
};
