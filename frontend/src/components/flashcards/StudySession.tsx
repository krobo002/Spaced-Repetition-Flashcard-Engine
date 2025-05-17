import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useCards, useStudyStats } from '@/store/flashcardStore';
import { Flashcard, StudySessionStats } from '@/types/flashcard';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { ReviewQuality } from '@/utils/spaceRepAlgorithm';
import { ArrowLeft, ArrowUp, X, Check, Star, Zap } from 'lucide-react'; // Added Zap for potential future use

interface StudySessionProps {
  deckId: string;
  deckName: string;
}

const CARDS_PER_PAGE = 5; // Number of cards to display per page

export const StudySession: React.FC<StudySessionProps> = ({ deckId, deckName }) => {
  const { user } = useAuth();
  const userId = user?.id || '';
  const navigate = useNavigate();
  const { getDueCards, updateCardReview } = useCards(userId);
  const { startStudySession, recordCardReview, completeStudySession } = useStudyStats(userId);
  
  const [currentCardIndex, setCurrentCardIndex] = useState(-1); // Initialize to -1 (no card selected)
  const [isRevealed, setIsRevealed] = useState(false);
  const [sessionCards, setSessionCards] = useState<Flashcard[]>([]);
  const [sessionStats, setSessionStats] = useState<StudySessionStats | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  // const [isFlipping, setIsFlipping] = useState(false); // Replaced by CSS transition
  const cardRef = useRef<HTMLDivElement>(null);
  const [selectedCardPulse, setSelectedCardPulse] = useState<string | null>(null);


  const [currentPage, setCurrentPage] = useState(1);
  
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
    setCurrentCardIndex(0); // Select the first card by default
    setCurrentPage(1); 
    
    const newSession = startStudySession(deckId);
    setSessionStats(newSession);
    setStartTime(Date.now());
    
  }, [deckId, getDueCards, startStudySession, userId]); // Added userId to dependencies
  
  // const currentCard = sessionCards[currentCardIndex]; // This line can be removed if not directly used elsewhere
  
  // Pagination calculations
  const totalPages = sessionCards.length > 0 ? Math.ceil(sessionCards.length / CARDS_PER_PAGE) : 0;
  const startIndex = (currentPage - 1) * CARDS_PER_PAGE;
  const endIndex = Math.min(startIndex + CARDS_PER_PAGE, sessionCards.length);
  const cardsOnCurrentPage = sessionCards.slice(startIndex, endIndex);
  const cardIndicesOnCurrentPage = Array.from({ length: cardsOnCurrentPage.length }, (_, i) => startIndex + i);

  const handleCardSelect = (globalIndex: number) => {
    if (currentCardIndex !== globalIndex) {
      setIsRevealed(false);
    }
    setCurrentCardIndex(globalIndex);
    setStartTime(Date.now());
    setSelectedCardPulse(sessionCards[globalIndex]?.id); // For animation
    setTimeout(() => setSelectedCardPulse(null), 700); // Duration of pulse animation
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      const firstCardIndexOfNewPage = (newPage - 1) * CARDS_PER_PAGE;
      if (sessionCards.length > 0 && firstCardIndexOfNewPage < sessionCards.length) {
         // If current card is not on the new page, or no card is selected, select the first card of the new page
        if (currentCardIndex < 0 || currentCardIndex < firstCardIndexOfNewPage || currentCardIndex >= firstCardIndexOfNewPage + CARDS_PER_PAGE) {
            handleCardSelect(firstCardIndexOfNewPage);
        }
      } else if (currentCardIndex !== -1) { // If new page is empty but a card was selected
        setCurrentCardIndex(-1); // Deselect card
      }
    }
  };
  
  const handleReveal = () => {
    if (currentCardIndex < 0 || currentCardIndex >= sessionCards.length) return;
    setIsRevealed(true);
    // Flip animation is handled by CSS transition on 'flipped' class
  };
  
  const handleAnswer = (quality: ReviewQuality) => {
    if (currentCardIndex < 0 || currentCardIndex >= sessionCards.length || !sessionCards[currentCardIndex] || !sessionStats) return;
    
    const cardToUpdate = sessionCards[currentCardIndex];
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    
    updateCardReview(cardToUpdate.id, quality);
    
    const updatedStats = recordCardReview(deckId, sessionStats, quality, timeSpent);
    setSessionStats(updatedStats);
    
    // setIsFlipping(true); // Not needed with CSS transition approach
    // setTimeout(() => { // Delay for flip back animation
      setIsRevealed(false); // This will trigger the card to flip back if 'flipped' class is removed
      
      // Check if all cards in the session have been studied
      if (updatedStats.cardsStudied >= sessionCards.length) {
        completeStudySession(deckId, updatedStats);
        setIsCompleted(true);
      } else {
        // Session is not yet complete, try to advance to the next card in sequence
        const nextCardGlobalIndex = currentCardIndex + 1;
        if (nextCardGlobalIndex < sessionCards.length) {
          handleCardSelect(nextCardGlobalIndex); // Use handleCardSelect to also manage page changes
          
          const newPageForNextCard = Math.floor(nextCardGlobalIndex / CARDS_PER_PAGE) + 1;
          if (newPageForNextCard !== currentPage) {
            setCurrentPage(newPageForNextCard);
          }
          // setStartTime(Date.now()); // Moved to handleCardSelect
        } else {
          // Reached the end of the sequential list, but not all cards are studied.
          // Clear current selection to prompt user to pick another card from the list.
          setCurrentCardIndex(-1);
        }
      }
      // setIsFlipping(false); // Not needed
    // }, 300); // Adjust timing if needed for flip back animation before content change
  };
  
  if (isCompleted) {
    return (
      <div className="flex flex-col items-center justify-center p-8 max-w-md mx-auto animate-fade-in">
        <div className="text-center">
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-confetti-burst">
            <Check className="h-10 w-10 text-green-600" />
          </div>
          
          <h2 className="text-3xl font-bold mb-4 animate-slide-up-fade-in" style={{ animationDelay: '0.2s' }}>Study Session Complete!</h2>
          
          {sessionStats && (
            <div className="mt-8 text-left bg-white p-6 rounded-lg shadow-xl border animate-slide-up-fade-in" style={{ animationDelay: '0.4s' }}>
              <h3 className="text-xl font-semibold mb-6 text-center">Session Summary</h3>
              
              <div className="space-y-3">
                <div className="summary-item flex justify-between items-center" style={{ animationDelay: '0.6s' }}>
                  <p className="text-md text-muted-foreground">Cards Studied</p>
                  <p className="text-2xl font-bold">{sessionStats.cardsStudied}</p>
                </div>
                
                <div className="summary-item flex justify-between items-center" style={{ animationDelay: '0.7s' }}>
                  <p className="text-md text-muted-foreground">Time Spent</p>
                  <p className="text-2xl font-bold">
                    {Math.floor(sessionStats.timeSpent / 60)}m {sessionStats.timeSpent % 60}s
                  </p>
                </div>
                
                <div className="pt-4 mt-4 border-t">
                  <div className="summary-item flex items-center justify-between mb-2" style={{ animationDelay: '0.8s' }}>
                    <span className="text-md">Again</span>
                    <span className="font-semibold text-red-500">{sessionStats.againCount}</span>
                  </div>
                  <div className="summary-item flex items-center justify-between mb-2" style={{ animationDelay: '0.9s' }}>
                    <span className="text-md">Hard</span>
                    <span className="font-semibold text-yellow-500">{sessionStats.hardCount}</span>
                  </div>
                  <div className="summary-item flex items-center justify-between mb-2" style={{ animationDelay: '1.0s' }}>
                    <span className="text-md">Good</span>
                    <span className="font-semibold text-green-500">{sessionStats.goodCount}</span>
                  </div>
                  <div className="summary-item flex items-center justify-between" style={{ animationDelay: '1.1s' }}>
                    <span className="text-md">Easy</span>
                    <span className="font-semibold text-blue-500">{sessionStats.easyCount}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-10 space-x-4">
            <Button onClick={() => navigate(`/deck/${deckId}`)} className="interactive-button animate-slide-up-fade-in" style={{ animationDelay: '1.2s' }}>
              Back to Deck
            </Button>
            <Button onClick={() => navigate('/dashboard')} variant="outline" className="interactive-button animate-slide-up-fade-in" style={{ animationDelay: '1.3s' }}>
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  if (sessionCards.length === 0 && !isCompleted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] p-8 animate-fade-in">
        <div className="text-center max-w-md">
          <Zap className="h-16 w-16 text-yellow-400 mx-auto mb-6 animate-pulse" />
          <h2 className="text-2xl font-bold mb-2">No Cards Due!</h2>
          <p className="text-muted-foreground mb-6">
            Great job! There are no cards due for review in this deck right now.
          </p>
          <Button onClick={() => navigate(`/deck/${deckId}`)} className="interactive-button">
            Back to Deck
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="animate-fade-in p-4 md:p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/deck/${deckId}`)} className="interactive-button">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">{deckName}</h1>
        </div>
        
        <div className="text-sm font-medium text-muted-foreground bg-slate-100 px-3 py-1 rounded-full">
          Card {currentCardIndex >= 0 ? currentCardIndex + 1 : '-'} of {sessionCards.length}
        </div>
      </div>
      
      <Progress 
        value={sessionCards.length > 0 && currentCardIndex >=0 ? ((currentCardIndex +1) / sessionCards.length) * 100 : 0} 
        className="h-2 mb-8 transition-all duration-500 ease-in-out" // Animated progress
      />
      
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6"> {/* Changed md:grid-cols-3 to md:grid-cols-5 */}
        {/* Card List Column */}
        <div className="md:col-span-2"> {/* Changed md:col-span-1 to md:col-span-2 */}
          {totalPages > 0 && (
            <>
              <h3 className="text-lg font-semibold mb-3">
                Review Queue ({cardsOnCurrentPage.length} on this page)
              </h3>
              <div className="space-y-2 max-h-[calc(100vh-250px)] overflow-y-auto px-4"> {/* Changed max-h and pr-2 to px-4 */}
                {cardsOnCurrentPage.map((card, pageLocalIndex) => {
                  const globalIndex = cardIndicesOnCurrentPage[pageLocalIndex];
                  const isSelected = currentCardIndex === globalIndex;
                  return (
                    <Card
                      key={card.id}
                      onClick={() => handleCardSelect(globalIndex)}
                      className={`p-3 cursor-pointer transition-all duration-200 ease-in-out transform hover:scale-[1.03] hover:shadow-lg
                        ${isSelected ? 'ring-2 ring-brand-purple shadow-xl bg-brand-purple/5' : 'border hover:border-gray-300 bg-white'}
                        ${selectedCardPulse === card.id ? 'animate-card-select-pulse' : ''}
                      `}
                    >
                      <div className={`truncate font-medium text-sm ${isSelected ? 'text-brand-purple' : ''}`}>{card.front}</div>
                      {/* Optional: Add a small visual cue if card is revealed or its state */}
                    </Card>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-between items-center space-x-2 mt-6">
                  <Button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} variant="outline" className="interactive-button">
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">Page {currentPage} / {totalPages}</span>
                  <Button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} variant="outline" className="interactive-button">
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Study Card Column */}
        <div className="md:col-span-3"> {/* Changed md:col-span-2 to md:col-span-3 */}
          {currentCardIndex >= 0 && currentCardIndex < sessionCards.length && sessionCards[currentCardIndex] ? (
            <div className="mt-0"> {/* Adjusted margin */}
              <h3 className="text-xl font-semibold mb-4 text-center md:text-left">
                Studying Card #{currentCardIndex + 1}
              </h3>
              <div
                className="relative aspect-[16/10] mb-6 perspective-1000" // Adjusted aspect ratio
                ref={cardRef}
                onClick={!isRevealed ? handleReveal : undefined} // Allow clicking card to reveal
              >
                <Card 
                  className={`flashcard ${isRevealed ? 'flipped' : ''} w-full h-full rounded-xl shadow-2xl`}
                >
                  <div className="card-face card-front flex items-center justify-center p-6 text-center">
                    <p className="text-2xl md:text-3xl font-semibold">{sessionCards[currentCardIndex]?.front}</p>
                  </div>
                  <div className="card-face card-back flex items-center justify-center p-6 text-center">
                    <p className="text-xl md:text-2xl">{sessionCards[currentCardIndex]?.back}</p>
                  </div>
                </Card>
              </div>
              
              {!isRevealed ? (
                <div className="flex justify-center mt-4">
                  <Button 
                    onClick={handleReveal} 
                    className="min-w-[240px] interactive-button bg-brand-purple hover:bg-brand-purple/90 py-3 text-lg rounded-lg shadow-md"
                    disabled={currentCardIndex < 0 || currentCardIndex >= sessionCards.length}
                  >
                    Show Answer
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 max-w-2xl mx-auto">
                  <Button 
                    onClick={() => handleAnswer('again')}
                    className="interactive-button flex flex-col items-center justify-center py-3 sm:py-4 text-sm sm:text-base bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-md h-auto"
                  >
                    <X className="h-5 w-5 mb-1" />
                    <span>Again</span>
                  </Button>
                  <Button 
                    onClick={() => handleAnswer('hard')}
                    className="interactive-button flex flex-col items-center justify-center py-3 sm:py-4 text-sm sm:text-base bg-orange-500 hover:bg-orange-600 text-white rounded-lg shadow-md h-auto" // Changed yellow to orange for better contrast
                  >
                    <ArrowUp className="h-5 w-5 mb-1" />
                    <span>Hard</span>
                  </Button>
                  <Button 
                    onClick={() => handleAnswer('good')}
                    className="interactive-button flex flex-col items-center justify-center py-3 sm:py-4 text-sm sm:text-base bg-green-500 hover:bg-green-600 text-white rounded-lg shadow-md h-auto"
                  >
                    <Check className="h-5 w-5 mb-1" />
                    <span>Good</span>
                  </Button>
                  <Button 
                    onClick={() => handleAnswer('easy')}
                    className="interactive-button flex flex-col items-center justify-center py-3 sm:py-4 text-sm sm:text-base bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-md h-auto"
                  >
                    <Star className="h-5 w-5 mb-1" />
                    <span>Easy</span>
                  </Button>
                </div>
              )}
            </div>
          ) : (
            sessionCards.length > 0 && (
              <div className="text-center py-12 text-muted-foreground flex flex-col items-center justify-center h-full">
                <Zap size={48} className="mb-4 text-gray-400" />
                <p className="text-lg">Select a card from the list on the left to begin.</p>
                <p className="text-sm">Or, if you've finished all cards on this page, navigate to the next.</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};
