import { Router } from 'express';
import { uploadAvatar, uploadRecording, uploadFile } from '../middleware/upload.middleware';
import { authenticateToken } from '../middleware/auth.middleware';
import { uploadAvatarController, uploadRecordingController, uploadFileController } from '../controllers/upload.controller';

const router = Router();

// All upload routes require authentication
router.use(authenticateToken);

/**
 * @desc    Upload avatar image
 * @route   POST /api/upload/avatar
 * @access  Private
 */
router.post('/avatar', uploadAvatar, uploadAvatarController);

/**
 * @desc    Upload recording file
 * @route   POST /api/upload/recording
 * @access  Private
 */
router.post('/recording', uploadRecording, uploadRecordingController);

/**
 * @desc    Upload general file
 * @route   POST /api/upload/file
 * @access  Private
 */
router.post('/file', uploadFile, uploadFileController);

export default router;
