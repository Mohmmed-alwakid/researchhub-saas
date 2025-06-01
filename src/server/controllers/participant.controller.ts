import type { Response } from 'express';
import { Participant, Study } from '../../database/models';
import { validationResult } from 'express-validator';
import type { AuthRequest } from '../../shared/types/index.js';
import {
  canAccessStudy,
  isResourceOwner,
  isAdmin,
  hasSubscriptionFeature,
  PERMISSION_ERRORS
} from '../utils/permissions.util.js';

/**
 * Get all participants for a user
 */
export const getParticipants = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { studyId, status, page = 1, limit = 20 } = req.query;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: PERMISSION_ERRORS.AUTHENTICATION_REQUIRED
      });
      return;
    }

    // If studyId is provided, verify user has access to that study
    if (studyId) {
      const study = await Study.findById(studyId);
      if (!study) {
        res.status(404).json({
          success: false,
          message: PERMISSION_ERRORS.RESOURCE_NOT_FOUND
        });
        return;
      }

      if (!canAccessStudy(req.user!, study.createdBy.toString(), study.team?.map(id => id.toString()))) {
        res.status(403).json({
          success: false,
          message: PERMISSION_ERRORS.STUDY_ACCESS_DENIED
        });
        return;
      }
    }

    // Build filter based on user permissions
    interface ParticipantFilter {
      researcherId?: string;
      studyId?: string;
      status?: string;
    }

    const filter: ParticipantFilter = {};

    // Admin can see all participants, researchers see only their own
    if (!isAdmin(req.user!)) {
      filter.researcherId = userId;
    }

    if (studyId) filter.studyId = studyId as string;
    if (status) filter.status = status as string;

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);

    const [participants, total] = await Promise.all([
      Participant.find(filter)
        .populate('studyId', 'title')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Participant.countDocuments(filter)
    ]);

    res.json({
      success: true,
      participants,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching participants:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch participants'
    });
  }
};

/**
 * Invite a participant to a study
 */
export const inviteParticipant = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const userId = req.user?.id;
    const { studyId, email, firstName, lastName, demographics } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Check if participant already exists for this study
    const existingParticipant = await Participant.findOne({
      studyId,
      email
    });

    if (existingParticipant) {
      res.status(400).json({
        success: false,
        message: 'Participant already invited to this study'
      });
    }

    // Create new participant
    const participant = new Participant({
      studyId,
      researcherId: userId,
      email,
      firstName,
      lastName,
      demographics,
      status: 'invited',
      invitedAt: new Date()
    });

    await participant.save();

    // Populate study information
    await participant.populate('studyId', 'title');

    // TODO: Send invitation email here
    console.log(`Invitation email should be sent to ${email} for study ${studyId}`);

    res.status(201).json({
      success: true,
      participant,
      message: 'Participant invited successfully'
    });
  } catch (error) {
    console.error('Error inviting participant:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to invite participant'
    });
  }
};

/**
 * Update participant information
 */
export const updateParticipant = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const userId = req.user?.id;
    const { id } = req.params;
    const updates = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const participant = await Participant.findOneAndUpdate(
      { _id: id, researcherId: userId },
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('studyId', 'title');

    if (!participant) {
      res.status(404).json({
        success: false,
        message: 'Participant not found'
      });
    }

    res.json({
      success: true,
      participant,
      message: 'Participant updated successfully'
    });
  } catch (error) {
    console.error('Error updating participant:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update participant'
    });
  }
};

/**
 * Delete participant
 */
export const deleteParticipant = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const participant = await Participant.findOneAndDelete({
      _id: id,
      researcherId: userId
    });

    if (!participant) {
      res.status(404).json({
        success: false,
        message: 'Participant not found'
      });
    }

    res.json({
      success: true,
      message: 'Participant deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting participant:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete participant'
    });
  }
};

/**
 * Get participant by ID
 */
export const getParticipant = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const participant = await Participant.findOne({
      _id: id,
      researcherId: userId
    }).populate('studyId', 'title');

    if (!participant) {
      res.status(404).json({
        success: false,
        message: 'Participant not found'
      });
    }

    res.json({
      success: true,
      participant
    });
  } catch (error) {
    console.error('Error fetching participant:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch participant'
    });
  }
};

/**
 * Get participant statistics
 */
export const getParticipantStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const stats = await Participant.aggregate([
      { $match: { researcherId: userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const total = await Participant.countDocuments({ researcherId: userId });

    res.json({
      success: true,
      stats: {
        total,
        byStatus: stats.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {} as Record<string, number>)
      }
    });
  } catch (error) {
    console.error('Error fetching participant stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch participant statistics'
    });
  }
};
