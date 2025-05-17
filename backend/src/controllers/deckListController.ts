import { Request, Response } from 'express'; // Removed NextFunction
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User, { IUser } from '../models/User';
import { AuthRequest } from '../middleware/authMiddleware';
import Deck, { IDeck } from '../models/Deck';

export const createDeck = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description } = req.body;
    const userId = req.user?.id; // Changed from _id to id

    if (!name) {
      return res.status(400).json({ message: 'Deck name is required' });
    }

    if (!userId) {
      return res.status(400).json({ message: 'User ID is missing' });
    }

    const newDeck = new Deck({
      user: userId,
      name,
      description,
    });

    const savedDeck = await newDeck.save();
    res.status(201).json(savedDeck);
  } catch (error) {
    console.error('Error creating deck:', error);
    res.status(500).json({ message: 'Server error creating deck' });
  }
};

export const getDecks = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id; // Changed from _id to id
    if (!userId) {
      return res.status(400).json({ message: 'User ID is missing' });
    }
    const decks = await Deck.find({ user: userId }).sort({ createdAt: -1 });
    res.status(200).json(decks);
  } catch (error) {
    console.error('Error fetching decks:', error);
    res.status(500).json({ message: 'Server error fetching decks' });
  }
};

export const getDeckById = async (req: AuthRequest, res: Response) => {
  try {
    const { deckId } = req.params;
    const userId = req.user?.id; // Changed from _id to id

    if (!userId) {
      return res.status(400).json({ message: 'User ID is missing' });
    }

    const deck = await Deck.findOne({ _id: deckId, user: userId });

    if (!deck) {
      return res.status(404).json({ message: 'Deck not found' });
    }

    res.status(200).json(deck);
  } catch (error) {
    console.error('Error fetching deck by ID:', error);
    if (error instanceof Error && error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid deck ID format' });
    }
    res.status(500).json({ message: 'Server error fetching deck' });
  }
};

export const updateDeck = async (req: AuthRequest, res: Response) => {
  try {
    const { deckId } = req.params;
    const { name, description } = req.body;
    const userId = req.user?.id; // Changed from _id to id

    if (!userId) {
      return res.status(400).json({ message: 'User ID is missing' });
    }

    const updatedDeck = await Deck.findOneAndUpdate(
      { _id: deckId, user: userId },
      { name, description, updatedAt: new Date() },
      { new: true }
    );

    if (!updatedDeck) {
      return res.status(404).json({ message: 'Deck not found or user not authorized' });
    }

    res.status(200).json(updatedDeck);
  } catch (error) {
    console.error('Error updating deck:', error);
    if (error instanceof Error && error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid deck ID format' });
    }
    res.status(500).json({ message: 'Server error updating deck' });
  }
};

export const deleteDeck = async (req: AuthRequest, res: Response) => {
  try {
    const { deckId } = req.params;
    const userId = req.user?.id; // Changed from _id to id

    if (!userId) {
      return res.status(400).json({ message: 'User ID is missing' });
    }

    const deletedDeck = await Deck.findOneAndDelete({ _id: deckId, user: userId });

    if (!deletedDeck) {
      return res.status(404).json({ message: 'Deck not found or user not authorized' });
    }

    res.status(200).json({ message: 'Deck deleted successfully' });
  } catch (error) {
    console.error('Error deleting deck:', error);
    if (error instanceof Error && error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid deck ID format' });
    }
    res.status(500).json({ message: 'Server error deleting deck' });
  }
};

