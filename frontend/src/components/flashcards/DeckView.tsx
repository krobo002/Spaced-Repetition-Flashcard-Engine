import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useDecks, useCards, useStudyStats } from '@/store/flashcardStore';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Edit, Trash, Plus, Calendar, Book, ArrowRight } from 'lucide-react';
import { Deck, Flashcard, DeckStats } from '@/types/flashcard';

interface DeckViewProps {
  deckId: string;
}

export const DeckView: React.FC<DeckViewProps> = ({ deckId }) => {
  const { user } = useAuth();
  const userId = user?.id || '';
  const navigate = useNavigate();
  const { decks, updateDeck, deleteDeck, getDeck } = useDecks(userId);
  const { getCardsByDeck, getDueCards, createCard, deleteCard, setAllCards } = useCards(userId); // Added setAllCards
  const { calculateDeckStats } = useStudyStats(userId);
  
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [cardFront, setCardFront] = useState('');
  const [cardBack, setCardBack] = useState('');
  const [editDeckName, setEditDeckName] = useState('');
  const [isEditingDeck, setIsEditingDeck] = useState(false);
  const [cardDialogOpen, setCardDialogOpen] = useState(false);
  const [deckDialogOpen, setDeckDialogOpen] = useState(false);

  const deck = getDeck(deckId);
  const cards = getCardsByDeck(deckId);
  const dueCards = getDueCards(deckId);
  
  if (!deck) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <h2 className="text-2xl font-bold mb-4">Deck not found</h2>
        <Button onClick={() => navigate('/dashboard')}>Go back to Dashboard</Button>
      </div>
    );
  }

  const stats: DeckStats = calculateDeckStats(deckId, cards);
  
  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardFront.trim() || !cardBack.trim()) return;
    
    setIsAddingCard(true);
    createCard(deckId, cardFront, cardBack);
    setCardFront('');
    setCardBack('');
    setCardDialogOpen(false);
    setIsAddingCard(false);
  };

  const handleUpdateDeck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editDeckName.trim()) return;
    
    setIsEditingDeck(true);
    updateDeck(deckId, { name: editDeckName });
    setDeckDialogOpen(false);
    setIsEditingDeck(false);
  };

  const handleDeleteDeck = () => {
    deleteDeck(deckId, setAllCards); // Pass setAllCards to deleteDeck
    navigate('/dashboard');
  };

  const openEditDeckDialog = () => {
    setEditDeckName(deck.name);
    setDeckDialogOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{deck.name}</h1>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={openEditDeckDialog}
            className="hover:text-brand-purple"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="icon" className="hover:text-destructive">
                <Trash className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Deck</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this deck? This action cannot be undone
                  and all cards in this deck will be permanently deleted.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteDeck} className="bg-destructive hover:bg-destructive/90">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white hover:shadow-md transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Book className="h-5 w-5 text-brand-purple" />
              <h3 className="text-lg font-medium">Total Cards</h3>
            </div>
            <p className="text-3xl font-bold mt-2">{stats.totalCards}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white hover:shadow-md transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-brand-blue" />
              <h3 className="text-lg font-medium">Due Today</h3>
            </div>
            <p className="text-3xl font-bold mt-2">{stats.dueCount}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white hover:shadow-md transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <ArrowRight className="h-5 w-5 text-brand-green" />
              <h3 className="text-lg font-medium">Learning</h3>
            </div>
            <p className="text-3xl font-bold mt-2">{stats.learningCount}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white hover:shadow-md transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="rounded-full bg-brand-light-purple p-1">
                <ArrowRight className="h-4 w-4 text-brand-purple" />
              </div>
              <h3 className="text-lg font-medium">Mature</h3>
            </div>
            <p className="text-3xl font-bold mt-2">{stats.matureCount}</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Cards</h2>
        <div className="flex items-center space-x-2">
          <Dialog open={cardDialogOpen} onOpenChange={setCardDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-brand-purple hover:bg-brand-purple/90">
                <Plus className="mr-2 h-4 w-4" />
                Add Card
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Flashcard</DialogTitle>
                <DialogDescription>
                  Create a new flashcard for your deck. Make sure the front 
                  contains the question/prompt and the back contains the answer.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddCard}>
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <label htmlFor="front" className="text-sm font-medium">Front (Question/Prompt)</label>
                    <Textarea
                      id="front"
                      value={cardFront}
                      onChange={(e) => setCardFront(e.target.value)}
                      placeholder="What's the capital of France?"
                      className="min-h-[100px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="back" className="text-sm font-medium">Back (Answer)</label>
                    <Textarea
                      id="back"
                      value={cardBack}
                      onChange={(e) => setCardBack(e.target.value)}
                      placeholder="Paris"
                      className="min-h-[100px]"
                    />
                  </div>
                </div>
                <DialogFooter className="mt-6">
                  <Button 
                    type="submit" 
                    disabled={isAddingCard || !cardFront.trim() || !cardBack.trim()}
                    className="bg-brand-purple hover:bg-brand-purple/90"
                  >
                    {isAddingCard ? 'Adding...' : 'Add Card'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          
          <Button 
            onClick={() => navigate(`/study/${deckId}`)} 
            disabled={cards.length === 0}
            className="bg-brand-green hover:bg-brand-green/90"
          >
            Study Now
          </Button>
        </div>
      </div>
      
      {cards.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg">
          <div className="text-center max-w-md animate-bounce-light">
            <Book className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">No cards yet</h3>
            <p className="text-muted-foreground mb-6">
              Start adding flashcards to this deck to begin studying.
            </p>
            <Button onClick={() => setCardDialogOpen(true)} className="bg-brand-purple hover:bg-brand-purple/90">
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Card
            </Button>
          </div>
        </div>
      ) : (
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Cards ({cards.length})</TabsTrigger>
            <TabsTrigger value="due">Due Today ({dueCards.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-6">
            <div className="space-y-4">
              {cards.map((card: Flashcard) => (
                <CardItem 
                  key={card.id} 
                  card={card} 
                  onDelete={() => deleteCard(card.id)} 
                />
              ))}
            </div>
          </TabsContent>
          <TabsContent value="due" className="mt-6">
            <div className="space-y-4">
              {dueCards.length === 0 ? (
                <p className="text-muted-foreground text-center p-8">No cards due for review today.</p>
              ) : (
                dueCards.map((card: Flashcard) => (
                  <CardItem 
                    key={card.id} 
                    card={card} 
                    onDelete={() => deleteCard(card.id)} 
                  />
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}
      
      <Dialog open={deckDialogOpen} onOpenChange={setDeckDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Deck</DialogTitle>
            <DialogDescription>
              Change the name of your flashcard deck.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateDeck}>
            <Input
              value={editDeckName}
              onChange={(e) => setEditDeckName(e.target.value)}
              placeholder="Deck name"
              className="mb-4"
            />
            <DialogFooter>
              <Button
                type="submit"
                disabled={isEditingDeck || !editDeckName.trim() || editDeckName === deck.name}
                className="bg-brand-purple hover:bg-brand-purple/90"
              >
                {isEditingDeck ? 'Updating...' : 'Update Deck'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface CardItemProps {
  card: Flashcard;
  onDelete: () => void;
}

const CardItem: React.FC<CardItemProps> = ({ card, onDelete }) => {
  const [showBack, setShowBack] = useState(false);

  return (
    <div 
      className={`p-4 border rounded-lg bg-white hover:shadow-sm transition-all cursor-pointer ${
        showBack ? 'animate-scale-up' : ''
      }`}
      onClick={() => setShowBack(!showBack)}
    >
      <div className="flex justify-between items-start">
        <div className="w-full">
          {!showBack ? (
            <p className="font-medium">{card.front}</p>
          ) : (
            <div className="text-brand-purple">
              <p className="text-sm text-gray-500 mb-1">Answer:</p>
              <p className="font-medium">{card.back}</p>
            </div>
          )}
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-gray-400 hover:text-destructive"
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => e.stopPropagation()} // Prevent click from bubbling to CardItem's onClick
            >
              <Trash className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Card</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this flashcard? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={(e: React.MouseEvent<HTMLButtonElement>) => e.stopPropagation()}>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.stopPropagation(); // Prevent click from bubbling to CardItem's onClick
                  onDelete();
                }}
                className="bg-destructive hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      
      {card.reviewData && (
        <div className="mt-4 flex items-center text-xs text-muted-foreground">
          <Calendar className="h-3 w-3 mr-1" />
          <span>
            {card.reviewData.repetitions > 0
              ? `Next review: ${card.reviewData.dueDate.toLocaleDateString()}`
              : 'New card'}
          </span>
        </div>
      )}
    </div>
  );
};
