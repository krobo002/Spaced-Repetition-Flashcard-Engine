
import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useDeckList } from '@/context/DeckListContext';
import { Navbar } from '@/components/layout/Navbar';
import StudyDeck from '@/components/flashcards/StudyDeck';
import { Spinner } from '@/components/ui/spinner';

const StudyPage: React.FC = () => {
  const { deckId } = useParams<{ deckId: string }>();
  const { user } = useAuth();
  const { getDeckById, loading, error } = useDeckList();
  const [isLoading, setIsLoading] = useState(true);
  const [deckExists, setDeckExists] = useState(false);
  
  useEffect(() => {
    const fetchDeck = async () => {
      if (!deckId || !user) return;
      
      try {
        setIsLoading(true);
        const deck = await getDeckById(deckId);
        setDeckExists(!!deck);
      } catch (err) {
        console.error('Error fetching deck:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDeck();
  }, [deckId, user, getDeckById]);
  
  if (!deckId) {
    return <Navigate to="/dashboard" />;
  }
  
  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }
  
  if (!deckExists) {
    return <Navigate to="/dashboard" />;
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container py-8">
        <StudyDeck />
      </main>
    </div>
  );
};

export default StudyPage;
