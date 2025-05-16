
import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useDecks } from '@/store/flashcardStore';
import { Navbar } from '@/components/layout/Navbar';
import { StudySession } from '@/components/flashcards/StudySession';

const StudyPage: React.FC = () => {
  const { deckId } = useParams<{ deckId: string }>();
  const { user } = useAuth();
  const userId = user?.id || '';
  const { getDeck } = useDecks(userId);
  
  if (!deckId) {
    return <Navigate to="/dashboard" />;
  }
  
  const deck = getDeck(deckId);
  
  if (!deck) {
    return <Navigate to="/dashboard" />;
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container py-8">
        <StudySession deckId={deckId} deckName={deck.name} />
      </main>
    </div>
  );
};

export default StudyPage;
