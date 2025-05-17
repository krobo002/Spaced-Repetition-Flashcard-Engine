import { Router } from 'express';
import { registerUser, loginUser, getUserProfile } from '../controllers/authController'; // Removed .js extension
import authMiddleware from '../middleware/authMiddleware';

const router = Router();

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', registerUser);

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', loginUser);

// @route   GET api/auth/me
// @desc    Get user profile
// @access  Private
router.get('/me', authMiddleware, getUserProfile);

export default router;