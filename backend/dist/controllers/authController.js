"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserProfile = exports.loginUser = exports.registerUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const User_1 = __importDefault(require("../models/User"));
dotenv_1.default.config();
// Register User
const registerUser = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        let user = await User_1.default.findOne({ email });
        if (user) {
            res.status(400).json({ msg: 'User already exists' });
            return;
        }
        user = await User_1.default.findOne({ username });
        if (user) {
            res.status(400).json({ msg: 'Username already taken' });
            return;
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        const passwordHash = await bcryptjs_1.default.hash(password, salt);
        user = new User_1.default({
            username,
            email,
            passwordHash,
        });
        await user.save();
        const payload = {
            user: {
                id: user.id,
            },
        };
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            throw new Error('JWT_SECRET not found in .env file');
        }
        jsonwebtoken_1.default.sign(payload, jwtSecret, { expiresIn: '5h' }, // Token expires in 5 hours
        (err, token) => {
            if (err)
                throw err;
            res.json({ token });
        });
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
exports.registerUser = registerUser;
// Login User
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User_1.default.findOne({ email });
        if (!user) {
            res.status(400).json({ msg: 'Invalid Credentials' });
            return;
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!isMatch) {
            res.status(400).json({ msg: 'Invalid Credentials' });
            return;
        }
        const payload = {
            user: {
                id: user.id,
            },
        };
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            throw new Error('JWT_SECRET not found in .env file');
        }
        jsonwebtoken_1.default.sign(payload, jwtSecret, { expiresIn: '5h' }, (err, token) => {
            if (err)
                throw err;
            res.json({ token });
        });
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
exports.loginUser = loginUser;
// Get User Profile
const getUserProfile = async (req, res) => {
    try {
        // req.user is assigned by the authMiddleware
        if (!req.user) {
            res.status(401).json({ msg: 'User not authenticated' });
            return;
        }
        const user = await User_1.default.findById(req.user.id).select('-passwordHash');
        if (!user) {
            res.status(404).json({ msg: 'User not found' });
            return;
        }
        res.json(user);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
exports.getUserProfile = getUserProfile;
