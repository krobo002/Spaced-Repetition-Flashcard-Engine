import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export interface AuthRequest extends Request {
  user?: { id: string };
}

const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
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
    const decoded = jwt.verify(token, jwtSecret) as { user: { id: string } };
    req.user = decoded.user;
    next();
  } catch (err) {
    // Send response and return
    res.status(401).json({ msg: 'Token is not valid' });
    return;
  }
};

export default authMiddleware;