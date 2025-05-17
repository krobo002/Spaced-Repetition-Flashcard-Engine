import { Router } from 'express';
import {
  createDeck,
  getDecks,
  getDeckById,
  updateDeck,
  deleteDeck,
} from '../controllers/deckListController';
import protect from '../middleware/authMiddleware'; // Changed to default import

const router = Router();

// All routes are protected
router.use(protect);

router.post('/', createDeck);
router.get('/', getDecks);
router.get('/:deckId', getDeckById);
router.put('/:deckId', updateDeck);
router.delete('/:deckId', deleteDeck);

export default router;
