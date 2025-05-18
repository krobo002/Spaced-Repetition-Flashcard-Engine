import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useDeckList } from '@/context/DeckListContext';
import { useFlashcards, Flashcard } from '@/context/FlashcardContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Edit, Trash, Plus, Calendar, Book, ArrowRight } from 'lucide-react';

// Define DeckStats interface
interface DeckStats {
  total: number;
  new: number;
  learning: number;
  review: number;
  due: number;
}

interface DeckViewProps {
  deckId: string;
}

export const DeckView: React.FC<DeckViewProps> = ({ deckId }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { updateDeck, deleteDeck, getDeckById } = useDeckList();
  const { 
    flashcards, 
    dueFlashcards, 
    loading: flashcardsLoading, 
    error: flashcardsError, 
    getFlashcardsByDeck, 
    getDueFlashcards, 
    createFlashcard, 
    updateFlashcard, 
    deleteFlashcard 
  } = useFlashcards();
  
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [cardFront, setCardFront] = useState('');
  const [cardBack, setCardBack] = useState('');
  const [editDeckName, setEditDeckName] = useState('');
  const [isEditingDeck, setIsEditingDeck] = useState(false);
  const [cardDialogOpen, setCardDialogOpen] = useState(false);
  const [deckDialogOpen, setDeckDialogOpen] = useState(false);
  const [deck, setDeck] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DeckStats>({ total: 0, new: 0, learning: 0, review: 0, due: 0 });

  // Fetch deck data
  useEffect(() => {
    const fetchDeck = async () => {
      try {
        const deckData = await getDeckById(deckId);
        setDeck(deckData);
      } catch (err) {
        console.error('Error fetching deck:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDeck();
  }, [deckId, getDeckById]);

  // Fetch flashcards when deck is loaded
  useEffect(() => {
    if (deckId) {
      getFlashcardsByDeck(deckId);
      getDueFlashcards(deckId);
    }
  }, [deckId, getFlashcardsByDeck, getDueFlashcards]);

  // Calculate stats from flashcards
  useEffect(() => {
    if (flashcards.length > 0) {
      const now = new Date();
      const newStats: DeckStats = {
        total: flashcards.length,
        new: flashcards.filter(card => card.repetition === 0).length,
        learning: flashcards.filter(card => card.repetition > 0 && card.repetition < 4).length,
        review: flashcards.filter(card => card.repetition >= 4).length,
        due: dueFlashcards.length
      };
      setStats(newStats);
    }
  }, [flashcards, dueFlashcards]);
  
  if (!deck) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <h2 className="text-2xl font-bold mb-4">Deck not found</h2>
        <Button onClick={() => navigate('/dashboard')}>Go back to Dashboard</Button>
      </div>
    );
  }
  
  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardFront.trim() || !cardBack.trim()) return;
    
    setIsAddingCard(true);
    try {
      await createFlashcard(deckId, cardFront, cardBack);
      setCardFront('');
      setCardBack('');
      setCardDialogOpen(false);
      getFlashcardsByDeck(deckId);
      getDueFlashcards(deckId);
    } catch (err) {
      console.error('Error adding flashcard:', err);
    } finally {
      setIsAddingCard(false);
    }
  };

  const handleUpdateDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editDeckName.trim()) return;
    
    setIsEditingDeck(true);
    try {
      const updatedDeck = await updateDeck(deckId, { name: editDeckName });
      if (updatedDeck) {
        setDeck(updatedDeck);
      }
      setDeckDialogOpen(false);
    } catch (err) {
      console.error('Error updating deck:', err);
    } finally {
      setIsEditingDeck(false);
    }
  };

  const handleDeleteDeck = async () => {
    try {
      const success = await deleteDeck(deckId);
      if (success) {
        // Navigate back to dashboard after deletion
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Error deleting deck:', err);
    }
  };

  const openEditDeckDialog = () => {
    setEditDeckName(deck.name);
    setDeckDialogOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{deck.name}</h1>
          <p className="text-muted-foreground">
            {stats.total} cards • {stats.due} due today
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            onClick={openEditDeckDialog}
          >
            <Edit className="h-4 w-4" />
            Edit
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1 text-destructive hover:text-destructive"
              >
                <Trash className="h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Deck</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this deck? This will also delete all flashcards in this deck.
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteDeck}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-brand-purple">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total Cards</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-brand-purple">{stats.due}</p>
              <p className="text-sm text-muted-foreground">Due Today</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-brand-purple">{stats.new}</p>
              <p className="text-sm text-muted-foreground">New Cards</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Flashcards</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex items-center gap-1"
            onClick={() => setCardDialogOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Add Card
          </Button>
          {stats.due > 0 && (
            <Button
              className="flex items-center gap-1 bg-brand-purple hover:bg-brand-purple/90"
              onClick={() => navigate(`/study/${deckId}`)}
            >
              <Book className="h-4 w-4" />
              Study Now
            </Button>
          )}
        </div>
      </div>

      <Dialog open={cardDialogOpen} onOpenChange={setCardDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Flashcard</DialogTitle>
            <DialogDescription>
              Create a new flashcard for your deck.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddCard}>
            <div className="space-y-4 mt-2">
              <div>
                <label htmlFor="front" className="block text-sm font-medium mb-1">
                  Front
                </label>
                <Textarea
                  id="front"
                  value={cardFront}
                  onChange={(e) => setCardFront(e.target.value)}
                  placeholder="Question or term"
                  className="resize-none"
                  rows={3}
                />
              </div>
              <div>
                <label htmlFor="back" className="block text-sm font-medium mb-1">
                  Back
                </label>
                <Textarea
                  id="back"
                  value={cardBack}
                  onChange={(e) => setCardBack(e.target.value)}
                  placeholder="Answer or definition"
                  className="resize-none"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter className="mt-4">
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

      {flashcardsLoading && flashcards.length === 0 ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-purple"></div>
        </div>
      ) : (
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Cards ({flashcards.length})</TabsTrigger>
            <TabsTrigger value="due">Due Today ({dueFlashcards.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-6">
            <div className="space-y-4">
              {flashcards.length === 0 ? (
                <div className="text-center p-8 border rounded-lg bg-gray-50">
                  <p className="text-gray-500 mb-4">No flashcards yet.</p>
                  <Button onClick={() => setCardDialogOpen(true)} className="flex items-center gap-2 mx-auto">
                    <Plus size={16} /> Add your first card
                  </Button>
                </div>
              ) : (
                flashcards.map((card) => (
                  <CardItem 
                    key={card._id} 
                    card={card} 
                    onDelete={() => deleteFlashcard(card._id)} 
                  />
                ))
              )}
            </div>
          </TabsContent>
          <TabsContent value="due" className="mt-6">
            <div className="space-y-4">
              {dueFlashcards.length === 0 ? (
                <div className="text-center p-8 border rounded-lg bg-gray-50">
                  <p className="text-gray-500 mb-4">No cards due for review.</p>
                  <Button onClick={() => navigate(`/study/${deckId}`)} className="flex items-center gap-2 mx-auto">
                    <Book size={16} /> Study new cards
                  </Button>
                </div>
              ) : (
                dueFlashcards.map((card) => (
                  <CardItem 
                    key={card._id} 
                    card={card} 
                    onDelete={() => deleteFlashcard(card._id)} 
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
      
      <div className="mt-4 flex items-center text-xs text-muted-foreground">
        <Calendar className="h-3 w-3 mr-1" />
        <span>
          {card.repetition > 0
            ? `Next review: ${new Date(card.dueDate).toLocaleDateString()}`
            : 'New card'}
        </span>
      </div>
    </div>
  );
};

export default DeckView;
