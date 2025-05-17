import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Deck, Flashcard, StudySessionStats, DeckStats, UserStats } from '../types/flashcard';
import { processReview, ReviewQuality, isCardDue, CardReviewData } from '../utils/spaceRepAlgorithm';

// Storage keys
const DECKS_STORAGE_KEY = 'flashcards_decks';
const CARDS_STORAGE_KEY = 'flashcards_cards';
const STATS_STORAGE_KEY = 'flashcards_stats';
const USER_STATS_STORAGE_KEY = 'flashcards_user_stats';

// Load data from local storage
const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const storedData = localStorage.getItem(key);
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      
      // Convert string dates back to Date objects
      if (Array.isArray(parsedData)) {
        parsedData.forEach((item: Deck | Flashcard | StudySessionStats) => { // Type narrowed for item
          if ('createdAt' in item && item.createdAt) item.createdAt = new Date(item.createdAt);
          if ('updatedAt' in item && item.updatedAt) item.updatedAt = new Date(item.updatedAt);
          
          if ('reviewData' in item && item.reviewData) {
            if (item.reviewData.dueDate) {
              item.reviewData.dueDate = new Date(item.reviewData.dueDate);
            }
            if (item.reviewData.lastReviewed) {
              item.reviewData.lastReviewed = new Date(item.reviewData.lastReviewed);
            }
          }
          // For StudySessionStats, startTime is already a Date object or undefined, handled by JSON parse
        });
      }
      
      return parsedData;
    }
  } catch (error) {
    console.error(`Error loading from ${key}:`, error);
  }
  return defaultValue;
};

// Save data to local storage
const saveToStorage = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving to ${key}:`, error);
    toast.error('Failed to save data');
  }
};

// Custom hook for managing decks
export const useDecks = (userId: string) => {
  const [decks, setDecks] = useState<Deck[]>(() => {
    const allDecks = loadFromStorage<Deck[]>(DECKS_STORAGE_KEY, []);
    return allDecks.filter(deck => deck.userId === userId);
  });

  // Save decks whenever they change
  useEffect(() => {
    if (userId) {
      const allStoredDecks = loadFromStorage<Deck[]>(DECKS_STORAGE_KEY, []);
      // Filter out old decks of the current user
      const otherUsersDecks = allStoredDecks.filter(deck => deck.userId !== userId);
      // Add the updated decks of the current user
      saveToStorage(DECKS_STORAGE_KEY, [...otherUsersDecks, ...decks]);
    }
  }, [decks, userId]);

  // Create a new deck
  const createDeck = useCallback((name: string, description?: string) => { // Add description parameter
    const newDeck: Deck = {
      id: crypto.randomUUID(),
      name,
      description, // Add description
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setDecks(prev => [...prev, newDeck]);
    toast.success(`Deck "${name}" created`);
    return newDeck;
  }, [userId]); // Added userId as it's used in newDeck

  // Update a deck
  const updateDeck = useCallback((id: string, updates: Partial<Omit<Deck, 'id' | 'userId' | 'createdAt'>>) => {
    setDecks(prev => 
      prev.map(deck => 
        deck.id === id ? { 
          ...deck, 
          ...updates, 
          updatedAt: new Date() 
        } : deck
      )
    );
    toast.success(`Deck updated`);
  }, []);

  // Delete a deck
  const deleteDeck = useCallback((id: string, setAllCards: React.Dispatch<React.SetStateAction<Flashcard[]>>) => {
    // Also delete all cards in the deck
    const allCards = loadFromStorage<Flashcard[]>(CARDS_STORAGE_KEY, []);
    const remainingCards = allCards.filter(card => card.deckId !== id);
    saveToStorage(CARDS_STORAGE_KEY, remainingCards);
    // Update the allCards state in useCards hook
    setAllCards(remainingCards);

    setDecks(prev => prev.filter(deck => deck.id !== id));
    toast.success(`Deck deleted`);
  }, []);

  // Get deck by id
  const getDeck = useCallback((id: string): Deck | undefined => {
    return decks.find(deck => deck.id === id);
  }, [decks]);

  return {
    decks,
    createDeck,
    updateDeck,
    deleteDeck,
    getDeck,
  };
};

// Custom hook for managing cards
export const useCards = (userId: string) => {
  const [allCards, setAllCards] = useState<Flashcard[]>(() => 
    loadFromStorage<Flashcard[]>(CARDS_STORAGE_KEY, [])
  );

  // Save cards whenever they change
  useEffect(() => {
    if (userId) {
      saveToStorage(CARDS_STORAGE_KEY, allCards);
    }
  }, [allCards, userId]);

  // Get cards for a specific deck
  const getCardsByDeck = useCallback((deckId: string): Flashcard[] => {
    return allCards.filter(card => card.deckId === deckId);
  }, [allCards]);

  // Create a new card
  const createCard = useCallback((deckId: string, front: string, back: string): Flashcard => {
    const newCard: Flashcard = {
      id: crypto.randomUUID(),
      front,
      back,
      deckId,
    };

    setAllCards(prev => [...prev, newCard]);
    toast.success('Card created');
    return newCard;
  }, []);

  // Update a card
  const updateCard = useCallback((cardId: string, updates: Partial<Omit<Flashcard, 'id' | 'deckId'>>) => {
    setAllCards(prev => 
      prev.map(card => 
        card.id === cardId ? { 
          ...card, 
          ...updates 
        } : card
      )
    );
    toast.success('Card updated');
  }, []);

  // Delete a card
  const deleteCard = useCallback((cardId: string) => {
    setAllCards(prev => prev.filter(card => card.id !== cardId));
    toast.success('Card deleted');
  }, []);

  // Update card review data
  const updateCardReview = useCallback((cardId: string, quality: ReviewQuality): CardReviewData => {
    let updatedReviewData: CardReviewData | undefined; // Ensure it can be undefined initially

    setAllCards(prev => 
      prev.map(card => {
        if (card.id === cardId) {
          updatedReviewData = processReview(card.reviewData || null, quality);
          return {
            ...card,
            reviewData: updatedReviewData
          };
        }
        return card;
      })
    );

    if (!updatedReviewData) {
      // This case should ideally not happen if cardId is valid and map function works
      // For safety, return a default or throw an error, though processReview should always return
      console.error("updatedReviewData was not set in updateCardReview");
      // Fallback to a structure that won't break, though this indicates a logic flaw if reached
      return processReview(null, quality); 
    }
    return updatedReviewData;
  }, []);

  // Get all due cards for a deck
  const getDueCards = useCallback((deckId: string): Flashcard[] => {
    const cards = getCardsByDeck(deckId);
    return cards.filter(card => isCardDue(card.reviewData));
  }, [getCardsByDeck]);

  // Get card by ID
  const getCard = useCallback((cardId: string): Flashcard | undefined => {
    return allCards.find(card => card.id === cardId);
  }, [allCards]);

  return {
    allCards,
    getCardsByDeck,
    createCard,
    updateCard,
    deleteCard,
    updateCardReview,
    getDueCards,
    getCard,
    setAllCards // Export setAllCards
  };
};

// Custom hook for managing study sessions and stats
export const useStudyStats = (userId: string) => {
  const [studySessions, setStudySessions] = useState<Record<string, StudySessionStats[]>>(() => 
    loadFromStorage<Record<string, StudySessionStats[]>>(STATS_STORAGE_KEY, {})
  );
  
  const [userStats, setUserStats] = useState<UserStats>(() => 
    loadFromStorage<UserStats>(USER_STATS_STORAGE_KEY, {
      totalReviews: 0,
      totalStudyTime: 0,
      reviewsToday: 0,
      streakDays: 0
    })
  );

  // Save study sessions whenever they change
  useEffect(() => {
    if (userId) {
      saveToStorage(STATS_STORAGE_KEY, studySessions);
    }
  }, [studySessions, userId]);

  // Save user stats whenever they change
  useEffect(() => {
    if (userId) {
      saveToStorage(USER_STATS_STORAGE_KEY, userStats);
    }
  }, [userStats, userId]);

  // Start a new study session
  const startStudySession = useCallback((deckId: string): StudySessionStats => {
    const newSession: StudySessionStats = {
      cardsStudied: 0,
      againCount: 0,
      hardCount: 0,
      goodCount: 0,
      easyCount: 0,
      timeSpent: 0,
      startTime: new Date()
    };
    
    return newSession;
  }, []);

  // Update session on card review
  const recordCardReview = useCallback((
    deckId: string,
    session: StudySessionStats,
    quality: ReviewQuality,
    timeSpent: number
  ): StudySessionStats => {
    const updatedSession = { ...session };
    
    updatedSession.cardsStudied++;
    updatedSession.timeSpent += timeSpent;
    
    switch (quality) {
      case 'again':
        updatedSession.againCount++;
        break;
      case 'hard':
        updatedSession.hardCount++;
        break;
      case 'good':
        updatedSession.goodCount++;
        break;
      case 'easy':
        updatedSession.easyCount++;
        break;
    }

    // Update user stats
    setUserStats(prev => ({
      ...prev,
      totalReviews: prev.totalReviews + 1,
      totalStudyTime: prev.totalStudyTime + timeSpent,
      reviewsToday: prev.reviewsToday + 1 // Assuming reviewsToday is reset daily elsewhere or this is fine
    }));
    
    return updatedSession;
  }, [setUserStats]);

  // Complete a study session
  const completeStudySession = useCallback((deckId: string, session: StudySessionStats) => {
    setStudySessions(prev => {
      const deckSessions = prev[deckId] || [];
      return {
        ...prev,
        [deckId]: [...deckSessions, session]
      };
    });
    
    toast.success('Study session completed!');
  }, [setStudySessions]);

  // Calculate deck statistics
  const calculateDeckStats = useCallback((deckId: string, cards: Flashcard[]): DeckStats => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    let learningCount = 0;
    let matureCount = 0;
    let newCount = 0;
    let dueCount = 0;
    
    cards.forEach(card => {
      if (!card.reviewData) {
        newCount++;
        dueCount++;
      } else {
        const { repetitions, interval, dueDate } = card.reviewData;
        
        if (repetitions < 2) {
          learningCount++;
        } else {
          matureCount++;
        }
        
        if (dueDate <= now) {
          dueCount++;
        }
      }
    });
    
    // Find the last study session for this deck
    const deckSessions = studySessions[deckId] || [];
    const lastStudiedSession = deckSessions[deckSessions.length - 1];
    
    return {
      totalCards: cards.length,
      learningCount,
      matureCount,
      newCount,
      dueCount,
      lastStudied: lastStudiedSession?.startTime
    };
  }, [studySessions]);

  // Get cards due in the next N days
  const getUpcomingDueCards = useCallback((days: number = 7): Record<string, number> => {
    const result: Record<string, number> = {};
    const now = new Date();
    
    // Initialize all days with 0 counts
    for (let i = 0; i < days; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() + i);
      const dateString = date.toISOString().split('T')[0];
      result[dateString] = 0;
    }
    
    // Load all cards
    const allCards = loadFromStorage<Flashcard[]>(CARDS_STORAGE_KEY, []);
    
    // Count cards due on each day
    allCards.forEach(card => {
      if (card.reviewData?.dueDate) {
        const dueDate = new Date(card.reviewData.dueDate);
        const dueDateString = dueDate.toISOString().split('T')[0];
        
        if (result[dueDateString] !== undefined) {
          result[dueDateString]++;
        }
      }
    });
    
    return result;
  }, []);

  return {
    studySessions,
    userStats,
    startStudySession,
    recordCardReview,
    completeStudySession,
    calculateDeckStats,
    getUpcomingDueCards
  };
};
