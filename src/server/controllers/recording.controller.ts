import type { Request, Response, NextFunction } from 'express';
import { Recording } from '../../database/models/Recording.model';
import { Session } from '../../database/models/Session.model';
import { Study } from '../../database/models/Study.model';
import { APIError } from '../middleware/error.middleware';
import type { AuthRequest } from '../../shared/types/index.js';

/**
 * Start recording for a session
 */
export const startRecording = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sessionId } = req.params;
    const { type = 'screen', metadata } = req.body;

    // Verify session exists and is active
    const session = await Session.findById(sessionId);
    if (!session) {
      return next(new APIError('Session not found', 404));
    }    if (session.status !== 'in_progress') {
      return next(new APIError('Can only record active sessions', 400));
    }// Check if recording already exists for this session and type
    const existingRecording = await Recording.findOne({ 
      sessionId: sessionId, 
      type,
      status: { $in: ['recording', 'paused'] }
    });

    if (existingRecording) {
      return next(new APIError('Recording already in progress for this session', 400));
    }    const recordingData = {
      sessionId: sessionId,
      type,
      status: 'processing',
      startTime: new Date(),
      metadata: {
        ...metadata,
        userAgent: req.get('User-Agent'),
        screenResolution: metadata?.screenResolution,
        browser: metadata?.browser
      }
    };

    const recording = new Recording(recordingData);
    await recording.save();

    res.status(201).json({
      success: true,
      data: recording,
      message: 'Recording started successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Stop recording
 */
export const stopRecording = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { fileUrl, fileSize, duration } = req.body;

    const recording = await Recording.findById(id);
    if (!recording) {
      return next(new APIError('Recording not found', 404));
    }

    if (recording.status === 'completed') {
      return next(new APIError('Recording already completed', 400));
    }

    recording.status = 'completed';
    recording.endTime = new Date();
    recording.fileUrl = fileUrl;
    recording.fileSize = fileSize;
    recording.duration = duration;
    
    await recording.save();

    res.json({
      success: true,
      data: recording,
      message: 'Recording stopped successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Pause recording
 */
export const pauseRecording = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const recording = await Recording.findById(id);
    if (!recording) {
      return next(new APIError('Recording not found', 404));
    }

    if (recording.status !== 'recording') {
      return next(new APIError('Can only pause active recordings', 400));
    }

    recording.status = 'processing';
    await recording.save();

    res.json({
      success: true,
      data: recording,
      message: 'Recording paused'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Resume recording
 */
export const resumeRecording = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const recording = await Recording.findById(id);
    if (!recording) {
      return next(new APIError('Recording not found', 404));
    }

    if (recording.status !== 'processing') {
      return next(new APIError('Can only resume paused recordings', 400));
    }

    recording.status = 'recording';
    await recording.save();

    res.json({
      success: true,
      data: recording,
      message: 'Recording resumed'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get recording by ID
 */
export const getRecording = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;    const recording = await Recording.findById(id)
      .populate({
        path: 'sessionId',
        populate: {
          path: 'studyId',
          select: 'title createdBy team'
        }
      });

    if (!recording) {
      return next(new APIError('Recording not found', 404));
    }    // Check access permissions
    const session = recording.sessionId as unknown as { studyId: { createdBy: string; team?: string[] } };
    const study = session.studyId;
    
    const hasAccess = study.createdBy.toString() === userId ||
                     study.team?.includes(userId);

    if (!hasAccess) {
      return next(new APIError('Access denied', 403));
    }

    res.json({
      success: true,
      data: recording
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all recordings for a session
 */
export const getSessionRecordings = async (req: AuthRequest, res: Response, next: NextFunction) => {  try {
    const { sessionId } = req.params;
    const userId = req.user?.id;

    // Verify session access
    const session = await Session.findById(sessionId).populate('studyId');
    if (!session) {
      return next(new APIError('Session not found', 404));
    }

    const study = session.studyId as unknown as { createdBy: { toString(): string }; team?: string[] };
    const hasAccess = study.createdBy.toString() === userId || 
                     study.team?.includes(userId);

    if (!hasAccess) {
      return next(new APIError('Access denied', 403));
    }    const recordings = await Recording.find({ sessionId: sessionId })
      .sort({ startTime: 1 });

    res.json({
      success: true,
      data: recordings
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all recordings for a study
 */
export const getStudyRecordings = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { studyId } = req.params;
    const userId = req.user?.id;
    const { page = 1, limit = 10, type, status } = req.query;

    // Verify study access
    const study = await Study.findById(studyId);
    if (!study) {
      return next(new APIError('Study not found', 404));
    }

    const hasAccess = study.createdBy.toString() === userId || 
                     study.team?.includes(userId);

    if (!hasAccess) {
      return next(new APIError('Access denied', 403));
    }

    const skip = (Number(page) - 1) * Number(limit);    // Get sessions for this study first
    const sessions = await Session.find({ studyId: studyId }, '_id');
    const sessionIds = sessions.map(s => s._id);    const filter: Record<string, unknown> = { sessionId: { $in: sessionIds } };
    if (type) filter.type = type;
    if (status) filter.status = status;const recordings = await Recording.find(filter)
      .populate('sessionId', 'participant startedAt')
      .sort({ startTime: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Recording.countDocuments(filter);

    res.json({
      success: true,
      data: {
        recordings,
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
 * Update recording metadata
 */
export const updateRecording = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const { notes, tags, metadata } = req.body;

    const recording = await Recording.findById(id)
      .populate({
        path: 'sessionId',        populate: {
          path: 'studyId',
          select: 'createdBy team'
        }
      });

    if (!recording) {
      return next(new APIError('Recording not found', 404));
    }    // Check access permissions
    const session = recording.sessionId as unknown as { studyId: { createdBy: { toString(): string }; team?: string[] } };
    const study = session.studyId;
    
    const hasAccess = study.createdBy.toString() === userId || 
                     study.team?.includes(userId);

    if (!hasAccess) {
      return next(new APIError('Access denied', 403));
    }

    // Update allowed fields
    if (notes !== undefined) recording.notes = notes;
    if (tags !== undefined) recording.tags = tags;
    if (metadata !== undefined) {
      recording.metadata = { ...recording.metadata, ...metadata };
    }

    await recording.save();

    res.json({
      success: true,
      data: recording,
      message: 'Recording updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete recording
 */
export const deleteRecording = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const recording = await Recording.findById(id)
      .populate({
        path: 'sessionId',
        populate: {
          path: 'studyId',
          select: 'createdBy team'
        }
      });

    if (!recording) {    return next(new APIError('Recording not found', 404));
    }    // Check access permissions
    const session = recording.sessionId as unknown as { studyId: { createdBy: { toString(): string }; team?: string[] } };
    const study = session.studyId;
    
    const hasAccess = study.createdBy.toString() === userId || 
                     study.team?.includes(userId);

    if (!hasAccess) {
      return next(new APIError('Access denied', 403));
    }

    // TODO: Delete file from cloud storage (AWS S3)
    // This would involve calling AWS SDK to delete the file

    await Recording.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Recording deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate signed URL for recording access
 */
export const getRecordingUrl = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const recording = await Recording.findById(id)
      .populate({
        path: 'session',
        populate: {
          path: 'study',
          select: 'createdBy team'
        }
      });    if (!recording) {
      return next(new APIError('Recording not found', 404));
    }    // Check access permissions
    const session = recording.sessionId as unknown as { studyId: { createdBy: string; team?: string[] } };
    const study = session.studyId;
      const hasAccess = study.createdBy.toString() === userId || 
                     study.team?.includes(userId);

    if (!hasAccess) {
      return next(new APIError('Access denied', 403));
    }

    if (!recording.fileUrl) {
      return next(new APIError('Recording file not available', 404));
    }

    // TODO: Generate signed URL for secure access
    // This would involve AWS S3 presigned URLs for temporary access
    const signedUrl = recording.fileUrl; // Placeholder

    res.json({
      success: true,
      data: {
        url: signedUrl,
        expiresIn: 3600 // 1 hour
      }
    });
  } catch (error) {
    next(error);
  }
};
