
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useCards, useStudyStats } from '@/store/flashcardStore';
import { Flashcard, StudySessionStats } from '@/types/flashcard';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { ReviewQuality } from '@/utils/spaceRepAlgorithm';
import { ArrowLeft, ArrowUp, X, Check, Star } from 'lucide-react';

interface StudySessionProps {
  deckId: string;
  deckName: string;
}

export const StudySession: React.FC<StudySessionProps> = ({ deckId, deckName }) => {
  const { user } = useAuth();
  const userId = user?.id || '';
  const navigate = useNavigate();
  const { getDueCards, updateCardReview } = useCards(userId);
  const { startStudySession, recordCardReview, completeStudySession } = useStudyStats(userId);
  
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [sessionCards, setSessionCards] = useState<Flashcard[]>([]);
  const [sessionStats, setSessionStats] = useState<StudySessionStats | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Initialize the study session
  useEffect(() => {
    const dueCards = getDueCards(deckId);
    if (dueCards.length === 0) {
      setIsCompleted(true);
      return;
    }
    
    // Shuffle the cards
    const shuffledCards = [...dueCards].sort(() => Math.random() - 0.5);
    setSessionCards(shuffledCards);
    
    // Initialize session stats
    const newSession = startStudySession(deckId);
    setSessionStats(newSession);
    setStartTime(Date.now());
    
  }, [deckId, getDueCards, startStudySession]);
  
  const currentCard = sessionCards[currentCardIndex];
  
  const handleReveal = () => {
    setIsFlipping(true);
    setTimeout(() => {
      setIsRevealed(true);
      setIsFlipping(false);
    }, 300);
  };
  
  const handleAnswer = (quality: ReviewQuality) => {
    if (!currentCard || !sessionStats) return;
    
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    
    // Update card review data in the store
    updateCardReview(currentCard.id, quality);
    
    // Update session stats
    const updatedStats = recordCardReview(deckId, sessionStats, quality, timeSpent);
    setSessionStats(updatedStats);
    
    // Reset for next card
    setIsFlipping(true);
    setTimeout(() => {
      setIsRevealed(false);
      
      if (currentCardIndex + 1 < sessionCards.length) {
        setCurrentCardIndex(prev => prev + 1);
      } else {
        // Session complete
        completeStudySession(deckId, updatedStats);
        setIsCompleted(true);
      }
      setIsFlipping(false);
      setStartTime(Date.now());
    }, 300);
  };
  
  if (isCompleted) {
    return (
      <div className="flex flex-col items-center justify-center p-8 max-w-md mx-auto animate-fade-in">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          
          <h2 className="text-2xl font-bold mb-2">Study Session Complete!</h2>
          
          {sessionStats && (
            <div className="mt-6 text-left bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-medium mb-4">Session Summary</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Cards Studied</p>
                  <p className="text-2xl font-bold">{sessionStats.cardsStudied}</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Time Spent</p>
                  <p className="text-2xl font-bold">
                    {Math.floor(sessionStats.timeSpent / 60)}m {sessionStats.timeSpent % 60}s
                  </p>
                </div>
                
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Again</span>
                    <span className="font-medium">{sessionStats.againCount}</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Hard</span>
                    <span className="font-medium">{sessionStats.hardCount}</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Good</span>
                    <span className="font-medium">{sessionStats.goodCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Easy</span>
                    <span className="font-medium">{sessionStats.easyCount}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-8 space-x-4">
            <Button onClick={() => navigate(`/deck/${deckId}`)}>
              Back to Deck
            </Button>
            <Button onClick={() => navigate('/dashboard')} variant="outline">
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  if (sessionCards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 animate-fade-in">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold mb-2">No Cards Due</h2>
          <p className="text-muted-foreground mb-6">
            There are no cards due for review in this deck right now.
          </p>
          <Button onClick={() => navigate(`/deck/${deckId}`)}>
            Back to Deck
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/deck/${deckId}`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-bold">{deckName}</h1>
        </div>
        
        <div className="text-sm text-muted-foreground">
          Card {currentCardIndex + 1} of {sessionCards.length}
        </div>
      </div>
      
      <Progress 
        value={((currentCardIndex) / sessionCards.length) * 100} 
        className="h-1 mb-8" 
      />
      
      <div className="max-w-2xl mx-auto">
        <div
          className={`relative aspect-[3/2] mb-8 perspective-1000 ${isFlipping ? 'animate-card-flip' : ''}`}
          ref={cardRef}
        >
          <Card 
            className={`flashcard ${isRevealed ? 'flipped' : ''}`}
          >
            <div className="card-face card-front">
              <div className="text-lg">{currentCard?.front}</div>
            </div>
            <div className="card-face card-back">
              <div className="text-lg">{currentCard?.back}</div>
            </div>
          </Card>
        </div>
        
        {!isRevealed ? (
          <div className="flex justify-center">
            <Button 
              onClick={handleReveal} 
              className="min-w-[200px] bg-brand-purple hover:bg-brand-purple/90"
            >
              Show Answer
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2 max-w-2xl mx-auto">
            <Button 
              onClick={() => handleAnswer('again')}
              className="flex flex-col py-6 bg-red-500 hover:bg-red-600"
            >
              <X className="h-5 w-5 mb-1" />
              <span>Again</span>
            </Button>
            <Button 
              onClick={() => handleAnswer('hard')}
              className="flex flex-col py-6 bg-yellow-500 hover:bg-yellow-600"
            >
              <ArrowUp className="h-5 w-5 mb-1" />
              <span>Hard</span>
            </Button>
            <Button 
              onClick={() => handleAnswer('good')}
              className="flex flex-col py-6 bg-green-500 hover:bg-green-600"
            >
              <Check className="h-5 w-5 mb-1" />
              <span>Good</span>
            </Button>
            <Button 
              onClick={() => handleAnswer('easy')}
              className="flex flex-col py-6 bg-blue-500 hover:bg-blue-600"
            >
              <Star className="h-5 w-5 mb-1" />
              <span>Easy</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
