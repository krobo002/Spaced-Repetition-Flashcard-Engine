
import { CardReviewData } from "../utils/spaceRepAlgorithm";

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  deckId: string;
  reviewData?: CardReviewData;
}

export interface Deck {
  id: string;
  name: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudySessionStats {
  cardsStudied: number;
  againCount: number;
  hardCount: number;
  goodCount: number;
  easyCount: number;
  timeSpent: number; // In seconds
  startTime: Date;
}

export interface DeckStats {
  totalCards: number;
  learningCount: number;
  matureCount: number;
  newCount: number;
  dueCount: number;
  lastStudied?: Date;
}

export interface UserStats {
  totalReviews: number;
  totalStudyTime: number; // In seconds
  reviewsToday: number;
  streakDays: number;
}

export type CardStatus = 'new' | 'learning' | 'review' | 'mature';
