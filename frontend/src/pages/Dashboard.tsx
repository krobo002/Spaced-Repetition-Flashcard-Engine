
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import { DeckList } from '@/components/flashcards/DeckList';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome, {user?.name || 'Student'}!</h1>
          <p className="text-muted-foreground">
            Manage your flashcards and track your learning progress.
          </p>
        </div>
        
        <DeckList />
      </main>
    </div>
  );
};

export default Dashboard;
