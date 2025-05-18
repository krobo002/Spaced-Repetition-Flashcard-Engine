import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
// Using dynamic import for axios since we couldn't install it via npm
const axios = {
  create: (config: any) => ({
    get: async (url: string) => {
      const response = await fetch(`${config.baseURL}${url}`, {
        method: 'GET',
        headers: config.headers
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return { data: await response.json() };
    },
    post: async (url: string, data: any) => {
      const response = await fetch(`${config.baseURL}${url}`, {
        method: 'POST',
        headers: config.headers,
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return { data: await response.json() };
    },
    put: async (url: string, data: any) => {
      const response = await fetch(`${config.baseURL}${url}`, {
        method: 'PUT',
        headers: config.headers,
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return { data: await response.json() };
    },
    delete: async (url: string) => {
      const response = await fetch(`${config.baseURL}${url}`, {
        method: 'DELETE',
        headers: config.headers
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return { data: await response.json() };
    }
  })
};

import { useAuth } from './AuthContext';

// Define types
export interface Flashcard {
  _id: string;
  deck: string;
  user: string;
  front: string;
  back: string;
  interval: number;
  repetition: number;
  efactor: number;
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface FlashcardContextType {
  flashcards: Flashcard[];
  dueFlashcards: Flashcard[];
  loading: boolean;
  error: string | null;
  getFlashcardsByDeck: (deckId: string) => Promise<void>;
  getDueFlashcards: (deckId: string) => Promise<void>;
  createFlashcard: (deckId: string, front: string, back: string) => Promise<Flashcard | null>;
  updateFlashcard: (flashcardId: string, front: string, back: string) => Promise<Flashcard | null>;
  deleteFlashcard: (flashcardId: string) => Promise<boolean>;
  reviewFlashcard: (flashcardId: string, quality: number) => Promise<Flashcard | null>;
}

const FlashcardContext = createContext<FlashcardContextType | undefined>(undefined);

export const useFlashcards = () => {
  const context = useContext(FlashcardContext);
  if (!context) {
    throw new Error('useFlashcards must be used within a FlashcardProvider');
  }
  return context;
};

interface FlashcardProviderProps {
  children: ReactNode;
}

// Helper function to transform raw flashcard data (e.g., convert date strings to Date objects)
const transformFlashcardData = (data: any): Flashcard => {
  if (!data) {
    // Or throw an error, or return a default Flashcard structure
    // For now, returning as is if data is falsy to avoid crashing on .dueDate access
    // but this might need more robust handling depending on API guarantees.
    console.warn("transformFlashcardData received falsy data", data);
    // @ts-ignore - to allow returning data if it's not a full flashcard object
    return data; 
  }
  return {
    ...data,
    dueDate: data.dueDate ? new Date(data.dueDate) : new Date(), // Default to now if null/undefined
    createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
    updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date(),
  };
};

export const FlashcardProvider: React.FC<FlashcardProviderProps> = ({ children }) => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [dueFlashcards, setDueFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const token = user?.token;

  // API base URL
  const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';
  // console.log('Using API URL:', API_URL); // Reduced logging frequency
  
  // Helper function for API calls with auth
  const fetchWithAuth = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    if (!token) {
      throw new Error('No authentication token available');
    }
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token
      }
    };
    
    // Make sure endpoint starts with a slash
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${API_URL}${normalizedEndpoint}`;
    // console.log('Fetching from URL:', url, 'with method:', options.method || 'GET'); // Reduced logging frequency

    try {
      const response = await fetch(url, {
        ...defaultOptions,
        ...options,
        headers: {
          ...defaultOptions.headers,
          ...options.headers
        }
      });

      if (!response.ok) {
        let errorData: any = { message: `API error: ${response.status}` };
        try {
          errorData = await response.json();
        } catch (e) {
          errorData.message = response.statusText || errorData.message;
        }
        console.error('API Error Response from fetchWithAuth:', errorData, 'for URL:', url);
        throw new Error(errorData.message || `API error: ${response.status}`);
      }

      if (response.status === 204) { // No Content
        return null;
      }
      return response.json(); // Return raw JSON data

    } catch (error: any) {
      console.error("Error in fetchWithAuth:", error);
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error(`Network error: Could not connect to the server at ${url}. Please check if the backend server is running.`);
      }
      throw error; // Re-throw other errors (including the one thrown above for !response.ok)
    }
  }, [token, API_URL]);

  // Get all flashcards for a specific deck
  const getFlashcardsByDeck = useCallback(async (deckId: string) => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching flashcards for deck:', deckId);
      const rawDataArray = await fetchWithAuth(`/flashcards/deck/${deckId}`);
      if (Array.isArray(rawDataArray)) {
        const fetchedFlashcards = rawDataArray.map(transformFlashcardData);
        setFlashcards(fetchedFlashcards);
        console.log('Processed and set flashcards for deck:', deckId, fetchedFlashcards);
      } else {
        console.warn('getFlashcardsByDeck received non-array data:', rawDataArray, 'for deck:', deckId);
        setFlashcards([]); // Reset or handle appropriately
      }
    } catch (err: any) {
      console.error('Error fetching flashcards by deck:', deckId, err);
      setError(err.message || 'Failed to fetch flashcards for deck');
    } finally {
      setLoading(false);
    }
  }, [fetchWithAuth, transformFlashcardData]);

  // Get due flashcards for a specific deck
  const getDueFlashcards = useCallback(async (deckId: string) => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching due flashcards for deck:', deckId);
      const rawDataArray = await fetchWithAuth(`/flashcards/due/${deckId}`);
      if (Array.isArray(rawDataArray)) {
        const fetchedDueFlashcards = rawDataArray.map(transformFlashcardData);
        setDueFlashcards(fetchedDueFlashcards);
        console.log('Processed and set due flashcards for deck:', deckId, fetchedDueFlashcards);
      } else {
        console.warn('getDueFlashcards received non-array data:', rawDataArray, 'for deck:', deckId);
        setDueFlashcards([]); // Reset or handle appropriately
      }
    } catch (err: any) {
      console.error('Error fetching due flashcards for deck:', deckId, err);
      setError(err.message || 'Failed to fetch due flashcards');
    } finally {
      setLoading(false);
    }
  }, [fetchWithAuth, transformFlashcardData]);

  // Create a new flashcard
  const createFlashcard = useCallback(async (deckId: string, front: string, back: string) => {
    setLoading(true);
    setError(null);
    try {
      console.log('Attempting to create flashcard:', { deckId, front, back });
      const rawData = await fetchWithAuth('/flashcards', {
        method: 'POST',
        body: JSON.stringify({ deckId, front, back })
      });
      const newFlashcard = transformFlashcardData(rawData);
      setFlashcards((prevFlashcards) => [...prevFlashcards, newFlashcard]);
      console.log('Successfully created and processed flashcard:', newFlashcard);
      return newFlashcard;
    } catch (err: any) {
      console.error('Error creating flashcard:', { deckId, front, back }, err);
      setError(err.message || 'Failed to create flashcard');
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchWithAuth, transformFlashcardData]);

  // Update a flashcard
  const updateFlashcard = useCallback(async (flashcardId: string, front: string, back: string) => {
    setLoading(true);
    setError(null);
    try {
      console.log('Attempting to update flashcard:', { flashcardId, front, back });
      const rawData = await fetchWithAuth(`/flashcards/${flashcardId}`, {
        method: 'PUT',
        body: JSON.stringify({ front, back })
      });
      const updatedFlashcard = transformFlashcardData(rawData);
      setFlashcards((prevFlashcards) =>
        prevFlashcards.map((card) => (card._id === flashcardId ? updatedFlashcard : card))
      );
      // Also update dueFlashcards if the card is present there
      setDueFlashcards((prevDueCards) => 
        prevDueCards.map((card) => (card._id === flashcardId ? updatedFlashcard : card))
      );
      console.log('Successfully updated and processed flashcard:', updatedFlashcard);
      return updatedFlashcard;
    } catch (err: any) {
      console.error('Error updating flashcard:', { flashcardId, front, back }, err);
      setError(err.message || 'Failed to update flashcard');
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchWithAuth, transformFlashcardData]);

  // Delete a flashcard
  const deleteFlashcard = useCallback(async (flashcardId: string) => {
    setLoading(true);
    setError(null);
    try {
      console.log('Attempting to delete flashcard:', flashcardId);
      await fetchWithAuth(`/flashcards/${flashcardId}`, {
        method: 'DELETE'
      });
      setFlashcards((prevFlashcards) => prevFlashcards.filter((card) => card._id !== flashcardId));
      setDueFlashcards((prevDueCards) => prevDueCards.filter((card) => card._id !== flashcardId));
      console.log('Successfully deleted flashcard:', flashcardId);
      return true;
    } catch (err: any) {
      console.error('Error deleting flashcard:', flashcardId, err);
      setError(err.message || 'Failed to delete flashcard');
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchWithAuth, transformFlashcardData]);

  // Review a flashcard (update spaced repetition data)
  const reviewFlashcard = useCallback(async (flashcardId: string, quality: number) => {
    setLoading(true);
    setError(null);
    try {
      console.log('Attempting to review flashcard:', { flashcardId, quality });
      const rawData = await fetchWithAuth(`/flashcards/${flashcardId}/review`, {
        method: 'POST',
        body: JSON.stringify({ quality })
      });
      const updatedFlashcard = transformFlashcardData(rawData);
      console.log('Flashcard review response processed:', updatedFlashcard);

      // Update flashcards list
      setFlashcards((prevFlashcards) =>
        prevFlashcards.map((card) => (card._id === flashcardId ? updatedFlashcard : card))
      );
      
      // Update or remove from dueFlashcards list
      const now = new Date();
      // Ensure dueDate is a Date object for comparison
      const dueDate = updatedFlashcard.dueDate instanceof Date ? updatedFlashcard.dueDate : new Date(updatedFlashcard.dueDate);

      if (dueDate > now) {
        setDueFlashcards((prevDueCards) => 
          prevDueCards.filter((card) => card._id !== flashcardId)
        );
      } else {
        // If still due (e.g. quality was low, interval is 0 or 1 day), update it in due list
        setDueFlashcards((prevDueCards) =>
          prevDueCards.map((card) => (card._id === flashcardId ? updatedFlashcard : card))
        );
      }
      
      return updatedFlashcard;
    } catch (err: any) {
      console.error('Error reviewing flashcard:', { flashcardId, quality }, err);
      setError(err.message || 'Failed to review flashcard');
      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchWithAuth, transformFlashcardData]);

  // Reset state when token changes
  useEffect(() => {
    setFlashcards([]);
    setDueFlashcards([]);
    setError(null);
  }, [token]);

  const value = {
    flashcards,
    dueFlashcards,
    loading,
    error,
    getFlashcardsByDeck,
    getDueFlashcards,
    createFlashcard,
    updateFlashcard,
    deleteFlashcard,
    reviewFlashcard,
  };

  return <FlashcardContext.Provider value={value}>{children}</FlashcardContext.Provider>;
};
