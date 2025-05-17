import express, { Request, Response } from 'express'; // Removed NextFunction
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db';
import authRoutes from './routes/authRoutes';
import deckListRoutes from './routes/deckListRoutes'; // Added import for deckListRoutes

dotenv.config();

const app = express();

// Connect Database
connectDB();

// Init Middleware
app.use(cors());
app.use(express.json());

app.get('/', (req: Request, res: Response) => { res.send('API Running'); }); // Changed to void return

// Define Routes
app.use('/api/auth', authRoutes);
app.use('/api/decks', deckListRoutes); // Added route for decks

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));