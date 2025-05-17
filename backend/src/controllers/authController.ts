import { Request, Response } from 'express'; // Removed NextFunction
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User, { IUser } from '../models/User';
import { AuthRequest } from '../middleware/authMiddleware';

dotenv.config();

// Register User
export const registerUser = async (req: Request, res: Response) => { // Removed next
  const { username, email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      res.status(400).json({ msg: 'User already exists' });
      return;
    }

    user = await User.findOne({ username });
    if (user) {
      res.status(400).json({ msg: 'Username already taken' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    user = new User({
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

    jwt.sign(
      payload,
      jwtSecret,
      { expiresIn: '5h' }, // Token expires in 5 hours
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Login User
export const loginUser = async (req: Request, res: Response) => { // Removed next
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ msg: 'Invalid Credentials' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
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

    jwt.sign(
      payload,
      jwtSecret,
      { expiresIn: '5h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Get User Profile
export const getUserProfile = async (req: AuthRequest, res: Response) => { // Removed next
  try {
    // req.user is assigned by the authMiddleware
    if (!req.user) {
        res.status(401).json({ msg: 'User not authenticated' });
        return;
    }
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) {
        res.status(404).json({ msg: 'User not found' });
        return;
    }
    res.json(user);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
