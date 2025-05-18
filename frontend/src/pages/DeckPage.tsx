
import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useDecks } from '@/store/flashcardStore';
import { Navbar } from '@/components/layout/Navbar';
import { DeckView } from '@/components/flashcards/DeckView';

const DeckPage: React.FC = () => {
  const { deckId } = useParams<{ deckId: string }>();
  const { user } = useAuth();
  const userId = user?.id || '';
  const { getDeck } = useDecks(userId);
  
  if (!deckId) {
    return <Navigate to="/dashboard" />;
  }
  
  const deck = getDeck(deckId);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container py-8">
        <DeckView deckId={deckId} />
      </main>
    </div>
  );
};

export default DeckPage;