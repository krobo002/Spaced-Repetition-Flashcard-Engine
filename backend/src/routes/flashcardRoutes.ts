import { Router } from 'express';
import {
  createFlashcard,
  getFlashcardsByDeck,
  getFlashcardById,
  updateFlashcard,
  deleteFlashcard,
  updateFlashcardReview,
  getDueFlashcards
} from '../controllers/flashcardController';
import protect from '../middleware/authMiddleware';

const router = Router();

// All routes are protected
router.use(protect);

// Basic CRUD operations
router.post('/', createFlashcard);
router.get('/deck/:deckId', getFlashcardsByDeck);
router.get('/due/:deckId', getDueFlashcards);
router.get('/:flashcardId', getFlashcardById);
router.put('/:flashcardId', updateFlashcard);
router.delete('/:flashcardId', deleteFlashcard);

// Spaced repetition review endpoint
router.post('/:flashcardId/review', updateFlashcardReview);

export default router;
