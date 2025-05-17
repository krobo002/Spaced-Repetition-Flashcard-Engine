"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express")); // Removed NextFunction
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const db_1 = __importDefault(require("./config/db"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
// import deckRoutes from './routes/deckRoutes';
// import flashcardRoutes from './routes/flashcardRoutes';
dotenv_1.default.config();
const app = (0, express_1.default)();
// Connect Database
(0, db_1.default)();
// Init Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get('/', (req, res) => { res.send('API Running'); }); // Changed to void return
// Define Routes
app.use('/api/auth', authRoutes_1.default);
// app.use('/api/decks', deckRoutes);
// app.use('/api/flashcards', flashcardRoutes);
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
