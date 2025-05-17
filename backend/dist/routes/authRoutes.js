"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_js_1 = require("../controllers/authController.js"); // Added .js extension
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const router = (0, express_1.Router)();
// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', authController_js_1.registerUser);
// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', authController_js_1.loginUser);
// @route   GET api/auth/me
// @desc    Get user profile
// @access  Private
router.get('/me', authMiddleware_1.default, authController_js_1.getUserProfile);
exports.default = router;
