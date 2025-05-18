import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import Flashcard, { IFlashcard } from '../models/Flashcard';
import Deck from '../models/Deck';
import mongoose from 'mongoose';

// Create a new flashcard
export const createFlashcard = async (req: AuthRequest, res: Response) => {
  try {
    const { deckId, front, back } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is missing' });
    }

    if (!deckId || !front || !back) {
      return res.status(400).json({ message: 'Deck ID, front, and back are required' });
    }

    // Verify the deck exists and belongs to the user
    const deck = await Deck.findOne({ _id: deckId, user: userId });
    if (!deck) {
      return res.status(404).json({ message: 'Deck not found or not authorized' });
    }

    console.log('Creating flashcard:', { deckId, front, back });

    const newFlashcard = new Flashcard({
      deck: deckId,
      user: userId,
      front: front,
      back: back,
      dueDate: new Date() // Due immediately for first review
    });

    const savedFlashcard = await newFlashcard.save();
    res.status(201).json(savedFlashcard);
  } catch (error) {
    console.error('Error creating flashcard:', error);
    if (error instanceof Error && error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid ID format' });
    }
    res.status(500).json({ message: 'Server error creating flashcard' });
  }
};

// Get all flashcards for a specific deck
export const getFlashcardsByDeck = async (req: AuthRequest, res: Response) => {
  try {
    console.log("getting flashcards from deck")
    const { deckId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is missing' });
    }

    // Verify the deck exists and belongs to the user
    const deck = await Deck.findOne({ _id: deckId, user: userId });
    if (!deck) {
      return res.status(404).json({ message: 'Deck not found or not authorized' });
    }

    const flashcards = await Flashcard.find({ deck: deckId, user: userId }).sort({ createdAt: -1 });
    res.status(200).json(flashcards);
  } catch (error) {
    console.error('Error fetching flashcards:', error);
    if (error instanceof Error && error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid deck ID format' });
    }
    res.status(500).json({ message: 'Server error fetching flashcards' });
  }
};

// Get a single flashcard by ID
export const getFlashcardById = async (req: AuthRequest, res: Response) => {
  try {
    const { flashcardId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is missing' });
    }

    const flashcard = await Flashcard.findOne({ _id: flashcardId, user: userId });
    if (!flashcard) {
      return res.status(404).json({ message: 'Flashcard not found or not authorized' });
    }

    res.status(200).json(flashcard);
  } catch (error) {
    console.error('Error fetching flashcard:', error);
    if (error instanceof Error && error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid flashcard ID format' });
    }
    res.status(500).json({ message: 'Server error fetching flashcard' });
  }
};

// Update a flashcard
export const updateFlashcard = async (req: AuthRequest, res: Response) => {
  try {
    const { flashcardId } = req.params;
    const { front, back } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is missing' });
    }

    const updatedFlashcard = await Flashcard.findOneAndUpdate(
      { _id: flashcardId, user: userId },
      { front, back, updatedAt: new Date() },
      { new: true }
    );

    if (!updatedFlashcard) {
      return res.status(404).json({ message: 'Flashcard not found or not authorized' });
    }

    res.status(200).json(updatedFlashcard);
  } catch (error) {
    console.error('Error updating flashcard:', error);
    if (error instanceof Error && error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid flashcard ID format' });
    }
    res.status(500).json({ message: 'Server error updating flashcard' });
  }
};

// Delete a flashcard
export const deleteFlashcard = async (req: AuthRequest, res: Response) => {
  try {
    const { flashcardId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is missing' });
    }

    const deletedFlashcard = await Flashcard.findOneAndDelete({ _id: flashcardId, user: userId });

    if (!deletedFlashcard) {
      return res.status(404).json({ message: 'Flashcard not found or not authorized' });
    }

    res.status(200).json({ message: 'Flashcard deleted successfully' });
  } catch (error) {
    console.error('Error deleting flashcard:', error);
    if (error instanceof Error && error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid flashcard ID format' });
    }
    res.status(500).json({ message: 'Server error deleting flashcard' });
  }
};

// Update flashcard review status (for spaced repetition)
export const updateFlashcardReview = async (req: AuthRequest, res: Response) => {
  try {
    const { flashcardId } = req.params;
    const { quality } = req.body; // Quality of recall (0-5)
    const userId = req.user?.id;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is missing' });
    }

    // Validate quality score
    if (typeof quality !== 'number' || quality < 0 || quality > 5) {
      return res.status(400).json({ message: 'Quality must be a number between 0 and 5' });
    }

    const flashcard = await Flashcard.findOne({ _id: flashcardId, user: userId });
    if (!flashcard) {
      return res.status(404).json({ message: 'Flashcard not found or not authorized' });
    }

    // Apply SuperMemo SM-2 algorithm
    const { interval, repetition, efactor } = calculateNextReview(
      flashcard.interval,
      flashcard.repetition,
      flashcard.efactor,
      quality
    );

    // Calculate next due date
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + interval);

    const updatedFlashcard = await Flashcard.findByIdAndUpdate(
      flashcardId,
      {
        interval,
        repetition,
        efactor,
        dueDate,
        updatedAt: new Date()
      },
      { new: true }
    );

    res.status(200).json(updatedFlashcard);
  } catch (error) {
    console.error('Error updating flashcard review:', error);
    if (error instanceof Error && error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid flashcard ID format' });
    }
    res.status(500).json({ message: 'Server error updating flashcard review' });
  }
};

// Get due flashcards for a deck
export const getDueFlashcards = async (req: AuthRequest, res: Response) => {
  try {
    const { deckId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is missing' });
    }

    // Verify the deck exists and belongs to the user
    const deck = await Deck.findOne({ _id: deckId, user: userId });
    if (!deck) {
      return res.status(404).json({ message: 'Deck not found or not authorized' });
    }

    const now = new Date();
    const dueFlashcards = await Flashcard.find({
      deck: deckId,
      user: userId,
      dueDate: { $lte: now }
    }).sort({ dueDate: 1 });

    res.status(200).json(dueFlashcards);
  } catch (error) {
    console.error('Error fetching due flashcards:', error);
    if (error instanceof Error && error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid deck ID format' });
    }
    res.status(500).json({ message: 'Server error fetching due flashcards' });
  }
};

// Helper function for SuperMemo SM-2 algorithm
function calculateNextReview(
  currentInterval: number,
  currentRepetition: number,
  currentEFactor: number,
  quality: number
): { interval: number; repetition: number; efactor: number } {
  // SM-2 algorithm implementation
  let newEFactor = currentEFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  newEFactor = Math.max(1.3, newEFactor); // EFactor should not be less than 1.3

  let newRepetition, newInterval;

  if (quality < 3) {
    // If quality is less than 3, start over
    newRepetition = 0;
    newInterval = 1;
  } else {
    // If quality is 3 or higher, proceed with the algorithm
    newRepetition = currentRepetition + 1;

    if (newRepetition === 1) {
      newInterval = 1;
    } else if (newRepetition === 2) {
      newInterval = 6;
    } else {
      newInterval = Math.round(currentInterval * newEFactor);
    }
  }

  return {
    interval: newInterval,
    repetition: newRepetition,
    efactor: newEFactor
  };
}
