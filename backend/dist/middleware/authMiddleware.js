"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const authMiddleware = (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) {
        // Send response and return to stop further execution in this middleware
        res.status(401).json({ msg: 'No token, authorization denied' });
        return;
    }
    try {
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            // Log the error and send a generic server error to the client
            console.error('JWT_SECRET not found in .env file');
            res.status(500).json({ msg: 'Server configuration error' });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
        req.user = decoded.user;
        next();
    }
    catch (err) {
        // Send response and return
        res.status(401).json({ msg: 'Token is not valid' });
        return;
    }
};
exports.default = authMiddleware;
