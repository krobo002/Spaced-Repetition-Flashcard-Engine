
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useDecks } from '@/store/flashcardStore';
import { Deck } from '@/types/flashcard';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Plus } from 'lucide-react';

export const DeckList: React.FC = () => {
  const { user } = useAuth();
  const userId = user?.id || '';
  const { decks, createDeck } = useDecks(userId);
  const [isCreating, setIsCreating] = useState(false);
  const [newDeckName, setNewDeckName] = useState('');
  const [open, setOpen] = useState(false);

  const handleCreateDeck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeckName.trim()) return;
    
    setIsCreating(true);
    createDeck(newDeckName);
    setNewDeckName('');
    setOpen(false);
    setIsCreating(false);
  };

  if (!decks.length) {
    return (
      <div className="flex flex-col items-center justify-center p-8 animate-fade-in">
        <div className="text-center max-w-md">
          <BookOpen className="mx-auto h-12 w-12 text-brand-purple mb-4" />
          <h2 className="text-2xl font-bold mb-2">Create your first deck</h2>
          <p className="text-muted-foreground mb-6">
            Start by creating a flashcard deck for a subject you're learning.
          </p>
          
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-brand-purple hover:bg-brand-purple/90">
                <Plus className="mr-2 h-4 w-4" />
                Create Deck
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a new deck</DialogTitle>
                <DialogDescription>
                  Give your flashcard deck a name that helps you identify its content.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateDeck}>
                <Input
                  value={newDeckName}
                  onChange={(e) => setNewDeckName(e.target.value)}
                  placeholder="Deck name (e.g., Spanish Vocabulary)"
                  className="mb-4"
                  autoFocus
                />
                <DialogFooter>
                  <Button
                    type="submit"
                    disabled={isCreating || !newDeckName.trim()}
                    className="bg-brand-purple hover:bg-brand-purple/90"
                  >
                    {isCreating ? 'Creating...' : 'Create Deck'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Your Decks</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-brand-purple hover:bg-brand-purple/90">
              <Plus className="mr-2 h-4 w-4" />
              New Deck
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a new deck</DialogTitle>
              <DialogDescription>
                Give your flashcard deck a name that helps you identify its content.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateDeck}>
              <Input
                value={newDeckName}
                onChange={(e) => setNewDeckName(e.target.value)}
                placeholder="Deck name (e.g., Spanish Vocabulary)"
                className="mb-4"
                autoFocus
              />
              <DialogFooter>
                <Button
                  type="submit"
                  disabled={isCreating || !newDeckName.trim()}
                  className="bg-brand-purple hover:bg-brand-purple/90"
                >
                  {isCreating ? 'Creating...' : 'Create Deck'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {decks.map((deck: Deck) => (
          <DeckCard key={deck.id} deck={deck} />
        ))}
      </div>
    </div>
  );
};

interface DeckCardProps {
  deck: Deck;
}

const DeckCard: React.FC<DeckCardProps> = ({ deck }) => {
  return (
    <Card className="h-full overflow-hidden hover:shadow-md transition-shadow duration-300 animate-scale-up">
      <Link to={`/deck/${deck.id}`} className="block h-full">
        <CardHeader>
          <CardTitle className="truncate">{deck.name}</CardTitle>
          <CardDescription>
            Created on {new Date(deck.createdAt).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-12 flex items-center justify-center">
            <BookOpen className="h-8 w-8 text-brand-purple" />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-brand-purple hover:text-brand-purple hover:bg-accent"
          >
            View Details
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-brand-green hover:text-brand-green hover:bg-accent"
            onClick={(e) => {
              e.preventDefault();
              window.location.href = `/study/${deck.id}`;
            }}
          >
            Study Now
          </Button>
        </CardFooter>
      </Link>
    </Card>
  );
};
