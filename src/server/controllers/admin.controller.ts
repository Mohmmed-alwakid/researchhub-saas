import type { Response } from 'express';
import { User } from '../../database/models/index.js';
import { Study } from '../../database/models/index.js';
import { Session } from '../../database/models/index.js';
import type { AuthRequest } from '../../shared/types/index.js';

// Types for filters and updates
interface UserFilter {
  role?: string;
  isActive?: boolean;
  $or?: Array<{ name?: { $regex: string; $options: string } } | { email?: { $regex: string; $options: string } }>;
}

interface StudyFilter {
  status?: string;
  $or?: Array<{ title?: { $regex: string; $options: string } } | { description?: { $regex: string; $options: string } }>;
}

interface UserUpdateData {
  role?: string;
  isActive?: boolean;
  name?: string;
  email?: string;
}

interface BulkUpdateData {
  isActive?: boolean;
  role?: string;
}

// Get platform overview statistics
export const getPlatformOverview = async (_req: AuthRequest, res: Response) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Get total counts
    const [totalUsers, totalStudies, totalSessions, activeStudies] = await Promise.all([
      User.countDocuments(),
      Study.countDocuments(),
      Session.countDocuments(),
      Study.countDocuments({ status: 'active' })
    ]);

    // Get monthly growth
    const [newUsersThisMonth, newStudiesThisMonth] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Study.countDocuments({ createdAt: { $gte: startOfMonth } })
    ]);

    const [newUsersLastMonth, newStudiesLastMonth] = await Promise.all([
      User.countDocuments({ 
        createdAt: { 
          $gte: startOfLastMonth, 
          $lt: startOfMonth 
        } 
      }),
      Study.countDocuments({ 
        createdAt: { 
          $gte: startOfLastMonth, 
          $lt: startOfMonth 
        } 
      })
    ]);

    // Calculate growth percentages
    const userGrowth = newUsersLastMonth > 0 
      ? ((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100 
      : newUsersThisMonth > 0 ? 100 : 0;

    const studyGrowth = newStudiesLastMonth > 0 
      ? ((newStudiesThisMonth - newStudiesLastMonth) / newStudiesLastMonth) * 100 
      : newStudiesThisMonth > 0 ? 100 : 0;

    // Get user distribution by role
    const usersByRole = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalStudies,
        totalSessions,
        activeStudies,
        userGrowth: Math.round(userGrowth * 100) / 100,
        studyGrowth: Math.round(studyGrowth * 100) / 100,
        usersByRole: usersByRole.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {} as Record<string, number>)
      }
    });
  } catch (error) {
    console.error('Error fetching platform overview:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch platform overview'
    });
  }
};

// Get all users with filtering and pagination
export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const {
      page = 1,
      limit = 20,
      role,
      status,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);    const sort: { [key: string]: 1 | -1 } = { [sortBy as string]: sortOrder === 'desc' ? -1 : 1 };

    // Build filter query
    const filter: UserFilter = {};
      if (role && role !== 'all' && typeof role === 'string') {
      filter.role = role;
    }
    
    if (status && status !== 'all') {
      filter.isActive = status === 'active';
    }
      if (search && typeof search === 'string') {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password -refreshToken')
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      User.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          current: Number(page),
          total: Math.ceil(total / Number(limit)),
          hasNext: skip + Number(limit) < total,
          hasPrev: Number(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users'
    });
  }
};

// Update user status or role
export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { role, isActive, name, email } = req.body;

    const updateData: UserUpdateData = {};
    if (role !== undefined) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -refreshToken');    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      });
      return;
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user'
    });
  }
};

// Get system analytics
export const getSystemAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const { timeframe = '30d' } = req.query;
    
    let startDate: Date;
    const now = new Date();
    
    switch (timeframe) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // User registration trends
    const userTrends = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt"
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Study creation trends
    const studyTrends = await Study.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt"
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Session activity trends
    const sessionTrends = await Session.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt"
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.json({
      success: true,
      data: {
        userTrends,
        studyTrends,
        sessionTrends,
        timeframe
      }
    });
  } catch (error) {
    console.error('Error fetching system analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch system analytics'
    });
  }
};

// Get all studies for admin oversight
export const getAllStudies = async (req: AuthRequest, res: Response) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const sort: { [key: string]: 1 | -1 } = { [sortBy as string]: sortOrder === 'desc' ? -1 : 1 };    // Build filter query
    const filter: StudyFilter = {};
      if (status && status !== 'all' && typeof status === 'string') {
      filter.status = status;
    }
    
    if (search && typeof search === 'string') {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const [studies, total] = await Promise.all([
      Study.find(filter)
        .populate('researcher', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Study.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        studies,
        pagination: {
          current: Number(page),
          total: Math.ceil(total / Number(limit)),
          hasNext: skip + Number(limit) < total,
          hasPrev: Number(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching studies:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch studies'
    });
  }
};

// Update study status (admin override)
export const updateStudyStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { studyId } = req.params;
    const { status, reason } = req.body;

    const study = await Study.findByIdAndUpdate(
      studyId,
      { 
        status,
        ...(reason && { moderationReason: reason })
      },
      { new: true, runValidators: true }
    ).populate('researcher', 'name email');    if (!study) {
      res.status(404).json({
        success: false,
        error: 'Study not found'
      });
      return;
    }

    res.json({
      success: true,
      data: { study }
    });
  } catch (error) {
    console.error('Error updating study status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update study status'
    });
  }
};

// Bulk operations for users
export const bulkUpdateUsers = async (req: AuthRequest, res: Response) => {
  try {
    const { userIds, action, value } = req.body;    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      res.status(400).json({
        success: false,
        error: 'User IDs array is required'
      });
      return;
    }

    const updateData: BulkUpdateData = {};
    
    switch (action) {
      case 'activate':
        updateData.isActive = true;
        break;
      case 'deactivate':
        updateData.isActive = false;
        break;
      case 'changeRole':        if (!value) {
          res.status(400).json({
            success: false,
            error: 'Role value is required for changeRole action'
          });
          return;
        }
        updateData.role = value;
        break;      default:
        res.status(400).json({
          success: false,
          error: 'Invalid action'
        });
        return;
    }

    const result = await User.updateMany(
      { _id: { $in: userIds } },
      updateData
    );

    res.json({
      success: true,
      data: {
        modifiedCount: result.modifiedCount,
        matchedCount: result.matchedCount
      }
    });
  } catch (error) {
    console.error('Error performing bulk user update:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to perform bulk user update'
    });
  }
};
