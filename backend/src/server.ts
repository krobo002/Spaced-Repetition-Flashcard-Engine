import express, { Request, Response } from 'express'; // Removed NextFunction
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db';
import authRoutes from './routes/authRoutes';
import deckListRoutes from './routes/deckListRoutes';
import flashcardRoutes from './routes/flashcardRoutes';

dotenv.config();

const app = express();

// Connect Database
connectDB();

// Init Middleware
app.use(cors());
app.use(express.json());

app.get('/', (req: Request, res: Response) => { res.send('API Running'); }); // Changed to void return

// API info endpoint
app.get('/api', (req: Request, res: Response) => {
  res.json({
    message: 'Welcome to the Flashcard API',
    endpoints: {
      auth: '/api/auth',
      decks: '/api/decks',
      flashcards: '/api/flashcards'
    },
    version: '1.0.0'
  });
});

// Define Routes
app.use('/api/auth', authRoutes);
app.use('/api/decks', deckListRoutes);
app.use('/api/flashcards', flashcardRoutes);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));