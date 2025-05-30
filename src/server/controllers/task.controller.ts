import type { Response, NextFunction } from 'express';
import { Task } from '../../database/models/Task.model';
import { Study } from '../../database/models/Study.model';
import { Session } from '../../database/models/Session.model';
import { APIError } from '../middleware/error.middleware';
import type { AuthRequest } from '../../shared/types/index.js';

/**
 * Create a new task
 */
export const createTask = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { studyId } = req.params;    // Verify study exists and user has access
    const study = await Study.findById(studyId);
    if (!study) {
      return next(new APIError('Study not found', 404));
    }

    const hasAccess = study.createdBy.toString() === userId || 
                     study.team?.includes(userId);

    if (!hasAccess) {
      return next(new APIError('Access denied', 403));
    }

    // Check if study is not active (can't add tasks to active studies)
    if (study.status === 'active') {
      return next(new APIError('Cannot add tasks to active study', 400));
    }

    const taskData = {
      ...req.body,
      study: studyId,
      createdBy: userId
    };

    const task = new Task(taskData);
    await task.save();

    res.status(201).json({
      success: true,
      data: task,
      message: 'Task created successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all tasks for a study
 */
export const getStudyTasks = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { studyId } = req.params;

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

    const tasks = await Task.find({ study: studyId })
      .populate('createdBy', 'name email')
      .sort({ order: 1, createdAt: 1 });

    res.json({
      success: true,
      data: tasks
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single task
 */
export const getTask = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const task = await Task.findById(id)      .populate('studyId')
      .populate('createdBy', 'name email');

    if (!task) {
      return next(new APIError('Task not found', 404));
    }

    // Check study access
    const study = task.studyId as any;
    const hasAccess = study.createdBy.toString() === userId || 
                     study.team?.includes(userId);

    if (!hasAccess) {
      return next(new APIError('Access denied', 403));
    }

    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a task
 */
export const updateTask = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const task = await Task.findById(id).populate('studyId');

    if (!task) {
      return next(new APIError('Task not found', 404));
    }

    // Check study access
    const study = task.studyId as any;
    const hasAccess = study.createdBy.toString() === userId || 
                     study.team?.includes(userId);

    if (!hasAccess) {
      return next(new APIError('Access denied', 403));
    }

    // Check if study is active (limited updates allowed)
    if (study.status === 'active') {
      // Only allow certain fields to be updated for active studies
      const allowedFields = ['instructions', 'timeLimit'];
      const updateFields = Object.keys(req.body);
      const hasRestrictedFields = updateFields.some(field => !allowedFields.includes(field));

      if (hasRestrictedFields) {
        return next(new APIError('Limited updates allowed for tasks in active studies', 400));
      }
    }

    Object.assign(task, req.body);
    task.updatedAt = new Date();
    await task.save();

    res.json({
      success: true,
      data: task,
      message: 'Task updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a task
 */
export const deleteTask = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const task = await Task.findById(id).populate('studyId');

    if (!task) {
      return next(new APIError('Task not found', 404));
    }

    // Check study access
    const study = task.studyId as any;
    const hasAccess = study.createdBy.toString() === userId || 
                     study.team?.includes(userId);

    if (!hasAccess) {
      return next(new APIError('Access denied', 403));
    }

    // Cannot delete tasks from active studies
    if (study.status === 'active') {
      return next(new APIError('Cannot delete tasks from active studies', 400));
    }

    await Task.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reorder tasks
 */
export const reorderTasks = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { studyId } = req.params;
    const { taskIds } = req.body; // Array of task IDs in new order
    const userId = req.user?.id;

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

    // Cannot reorder tasks in active studies
    if (study.status === 'active') {
      return next(new APIError('Cannot reorder tasks in active studies', 400));
    }

    // Update task orders
    const updatePromises = taskIds.map((taskId: string, index: number) => 
      Task.findByIdAndUpdate(taskId, { order: index + 1 })
    );

    await Promise.all(updatePromises);

    res.json({
      success: true,
      message: 'Tasks reordered successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Duplicate a task
 */
export const duplicateTask = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const originalTask = await Task.findById(id).populate('studyId');

    if (!originalTask) {
      return next(new APIError('Task not found', 404));
    }

    // Check study access
    const study = originalTask.studyId as any;
    const hasAccess = study.createdBy.toString() === userId || 
                     study.team?.includes(userId);

    if (!hasAccess) {
      return next(new APIError('Access denied', 403));
    }

    // Cannot duplicate tasks in active studies
    if (study.status === 'active') {
      return next(new APIError('Cannot duplicate tasks in active studies', 400));
    }    // Create duplicate
    const taskData = originalTask.toObject();
    delete (taskData as any)._id;
    delete (taskData as any).createdAt;
    delete (taskData as any).updatedAt;
    
    taskData.title = `${taskData.title} (Copy)`;
    taskData.createdBy = userId;    // Set order to be last
    const lastTask = await Task.findOne({ studyId: study._id }).sort({ order: -1 });
    taskData.order = lastTask ? lastTask.order + 1 : 1;

    const duplicatedTask = new Task(taskData);
    await duplicatedTask.save();

    res.status(201).json({
      success: true,
      data: duplicatedTask,
      message: 'Task duplicated successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get task analytics
 */
export const getTaskAnalytics = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const task = await Task.findById(id).populate('studyId');

    if (!task) {
      return next(new APIError('Task not found', 404));
    }

    // Check study access
    const study = task.studyId as any;
    const hasAccess = study.createdBy.toString() === userId || 
                     study.team?.includes(userId);

    if (!hasAccess) {
      return next(new APIError('Access denied', 403));
    }    // Get sessions that include this task
    const sessions = await Session.find({ 
      studyId: study._id,
      'progress.currentTask': id
    });

    const completedSessions = sessions.filter(session => 
      session.progress?.completedTasks.includes(id.toString())
    );

    const totalAttempts = sessions.length;
    const successfulCompletions = completedSessions.length;
    const completionRate = totalAttempts > 0 ? (successfulCompletions / totalAttempts) * 100 : 0;

    // Calculate average time spent on task
    let averageTimeSpent = 0;
    if (completedSessions.length > 0) {
      // This would require more detailed session tracking to implement properly
      // For now, we'll return a placeholder
      averageTimeSpent = 0;
    }

    res.json({
      success: true,
      data: {
        totalAttempts,
        successfulCompletions,
        completionRate: Math.round(completionRate * 100) / 100,
        averageTimeSpent,
        dropOffRate: Math.round((1 - completionRate / 100) * 10000) / 100
      }
    });
  } catch (error) {
    next(error);
  }
};
