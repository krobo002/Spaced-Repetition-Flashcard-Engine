import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFlashcards } from '@/context/FlashcardContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { Flashcard } from '@/context/FlashcardContext';

const StudyDeck: React.FC = () => {
  const { deckId } = useParams<{ deckId: string }>();
  const navigate = useNavigate();
  const { flashcards, loading, error, getFlashcardsByDeck, reviewFlashcard } = useFlashcards();
  const [studyCards, setStudyCards] = useState<Flashcard[]>([]);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [progress, setProgress] = useState(0);
  const [studyComplete, setStudyComplete] = useState(false);

  useEffect(() => {
    if (deckId) {
      getFlashcardsByDeck(deckId);
    }
  }, [deckId, getFlashcardsByDeck]);

  // Shuffle flashcards when they're loaded
  useEffect(() => {
    if (flashcards.length > 0) {
      // Create a shuffled copy of the flashcards
      const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
      setStudyCards(shuffled);
    }
  }, [flashcards]);

  useEffect(() => {
    if (studyCards.length > 0) {
      setProgress((currentIndex / studyCards.length) * 100);
    }
  }, [currentIndex, studyCards.length]);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleRating = async (quality: number) => {
    if (!studyCards[currentIndex]) return;
    
    await reviewFlashcard(studyCards[currentIndex]._id, quality);
    
    if (currentIndex < studyCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    } else {
      setStudyComplete(true);
    }
  };

  const restartStudy = () => {
    if (flashcards.length > 0) {
      // Reshuffle the cards
      const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
      setStudyCards(shuffled);
      setCurrentIndex(0);
      setIsFlipped(false);
      setStudyComplete(false);
    }
  };

  const goBack = () => {
    navigate(`/deck/${deckId}`);
  };

  if (loading && studyCards.length === 0) {
    return <div className="flex justify-center p-8">Loading flashcards...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  if (studyCards.length === 0 && !loading) {
    return (
      <div className="container mx-auto p-4 max-w-3xl">
        <div className="flex justify-between items-center mb-6">
          <Button variant="outline" onClick={goBack} className="flex items-center gap-2">
            <ArrowLeft size={16} /> Back to Deck
          </Button>
        </div>
        <Card className="text-center p-8">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold mb-4">No flashcards to study!</h2>
            <p className="text-gray-500 mb-6">
              This deck doesn't have any flashcards yet. Add some flashcards to start studying.
            </p>
            <Button onClick={goBack}>Return to Deck</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (studyComplete) {
    return (
      <div className="container mx-auto p-4 max-w-3xl">
        <div className="flex justify-between items-center mb-6">
          <Button variant="outline" onClick={goBack} className="flex items-center gap-2">
            <ArrowLeft size={16} /> Back to Deck
          </Button>
        </div>
        <Card className="text-center p-8">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold mb-4">Study Session Complete!</h2>
            <p className="text-gray-500 mb-6">
              You've reviewed all {studyCards.length} cards in this deck.
            </p>
            <div className="flex justify-center gap-4">
              <Button variant="outline" onClick={restartStudy} className="flex items-center gap-2">
                <RotateCcw size={16} /> Study Again
              </Button>
              <Button onClick={goBack}>Return to Deck</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentCard = studyCards[currentIndex];

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <div className="flex justify-between items-center mb-6">
        <Button variant="outline" onClick={goBack} className="flex items-center gap-2">
          <ArrowLeft size={16} /> Back to Deck
        </Button>
        <div className="text-sm text-gray-500">
          Card {currentIndex + 1} of {studyCards.length}
        </div>
      </div>

      <Progress value={progress} className="mb-6" />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-center">
            {isFlipped ? 'Answer' : 'Question'}
          </CardTitle>
        </CardHeader>
        <CardContent 
          className="min-h-[200px] flex items-center justify-center cursor-pointer"
          onClick={handleFlip}
        >
          <div className="text-center text-lg">
            {isFlipped ? currentCard.back : currentCard.front}
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="outline" onClick={handleFlip}>
            {isFlipped ? 'Show Question' : 'Show Answer'}
          </Button>
        </CardFooter>
      </Card>

      {isFlipped && (
        <div className="space-y-4">
          <h3 className="text-center font-medium">How well did you know this?</h3>
          <div className="grid grid-cols-3 gap-2">
            <Button 
              variant="destructive" 
              onClick={() => handleRating(0)}
              className="col-span-1"
            >
              Didn't Know
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleRating(3)}
              className="col-span-1"
            >
              Hard
            </Button>
            <Button 
              variant="default" 
              onClick={() => handleRating(5)}
              className="col-span-1"
            >
              Easy
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyDeck;
