import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

export interface Deck {
  _id: string;
  name: string;
  description?: string;
  user: string;
  createdAt: string;
  updatedAt: string;
}

export interface DeckListContextType {
  decks: Deck[];
  loading: boolean;
  error: string | null;
  fetchDecks: () => Promise<void>;
  createDeck: (name: string, description?: string) => Promise<Deck | null>;
  updateDeck: (deckId: string, updates: { name?: string; description?: string }) => Promise<Deck | null>;
  deleteDeck: (deckId: string) => Promise<boolean>;
  getDeckById: (deckId: string) => Promise<Deck | null>;
}

export const DeckListContext = createContext<DeckListContextType | undefined>(undefined);

// Custom hook to use the DeckList context
export const useDeckList = () => {
  const context = useContext(DeckListContext);
  if (context === undefined) {
    throw new Error('useDeckList must be used within a DeckListProvider');
  }
  return context;
};

interface DeckListProviderProps {
  children: ReactNode;
}

export const DeckListProvider: React.FC<DeckListProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

  const fetchDecks = React.useCallback(async () => {
    const token = user?.token;
    if (!user || !token) {
      setDecks([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/decks`, {
        headers: {
          'x-auth-token': token,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch decks');
      }
      const data: Deck[] = await response.json();
      setDecks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setDecks([]);
    } finally {
      setLoading(false);
    }
  }, [user, API_BASE_URL]);

  // Create a new deck
  const createDeck = async (name: string, description?: string): Promise<Deck | null> => {
    const token = user?.token;
    if (!user || !token) {
      setError("User not authenticated");
      return null;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/decks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({ name, description }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create deck');
      }
      const newDeck: Deck = await response.json();
      setDecks((prevDecks) => [newDeck, ...prevDecks]);
      return newDeck;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update an existing deck
  const updateDeck = async (deckId: string, updates: { name?: string; description?: string }): Promise<Deck | null> => {
    const token = user?.token;
    if (!user || !token) {
      setError("User not authenticated");
      return null;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/decks/${deckId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify(updates),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update deck');
      }
      const updatedDeck: Deck = await response.json();
      setDecks((prevDecks) =>
        prevDecks.map((deck) => (deck._id === deckId ? updatedDeck : deck))
      );
      return updatedDeck;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Delete a deck
  const deleteDeck = async (deckId: string): Promise<boolean> => {
    const token = user?.token;
    if (!user || !token) {
      setError("User not authenticated");
      return false;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/decks/${deckId}`, {
        method: 'DELETE',
        headers: {
          'x-auth-token': token,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete deck');
      }
      setDecks((prevDecks) => prevDecks.filter((deck) => deck._id !== deckId));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Get a single deck by ID
  const getDeckById = async (deckId: string): Promise<Deck | null> => {
    const token = user?.token;
    if (!user || !token) {
      setError("User not authenticated");
      return null;
    }
    const existingDeck = decks.find(d => d._id === deckId);
    if (existingDeck) return existingDeck;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/decks/${deckId}`, {
        headers: {
          'x-auth-token': token,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch deck');
      }
      const deck: Deck = await response.json();
      return deck;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = user?.token;
    if (user && token) {
      fetchDecks();
    } else {
      setDecks([]);
    }
  }, [user, user?.token, fetchDecks]);

  return (
    <DeckListContext.Provider
      value={{
        decks,
        loading,
        error,
        fetchDecks,
        createDeck,
        updateDeck,
        deleteDeck,
        getDeckById,
      }}
    >
      {children}
    </DeckListContext.Provider>
  );
};
