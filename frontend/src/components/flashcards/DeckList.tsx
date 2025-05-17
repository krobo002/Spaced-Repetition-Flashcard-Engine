import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDeckList } from '@/hooks/useDeckList'; // Updated import path
import { Deck } from '@/context/DeckListContext'; // Deck type still from context
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Plus, Edit, Trash2 } from 'lucide-react';

export const DeckList: React.FC = () => {
  // const { user } = useAuth(); // User info might still be useful for UI elements if needed
  const { 
    decks, 
    loading,
    error,
    fetchDecks, // Added fetchDecks
    createDeck, 
    updateDeck, 
    deleteDeck 
  } = useDeckList();
  
  // const { setAllCards } = useCards(user?.id || ''); // Removed useCards, card logic might need to be re-evaluated

  const [newDeckName, setNewDeckName] = useState('');
  const [newDeckDescription, setNewDeckDescription] = useState('');
  const [openCreateDialog, setOpenCreateDialog] = useState(false);

  const [editingDeck, setEditingDeck] = useState<Deck | null>(null);
  const [editDeckName, setEditDeckName] = useState('');
  const [editDeckDescription, setEditDeckDescription] = useState('');
  const [openEditDialog, setOpenEditDialog] = useState(false);

  const [deletingDeck, setDeletingDeck] = useState<Deck | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  // Fetch decks on component mount
  useEffect(() => {
    fetchDecks();
  }, [fetchDecks]);

  const handleCreateDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeckName.trim()) return;
    
    await createDeck(newDeckName, newDeckDescription);
    setNewDeckName('');
    setNewDeckDescription('');
    setOpenCreateDialog(false);
  };

  const handleOpenEditDialog = (deck: Deck) => {
    setEditingDeck(deck);
    setEditDeckName(deck.name);
    setEditDeckDescription(deck.description || '');
    setOpenEditDialog(true);
  };

  const handleUpdateDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDeck || !editDeckName.trim()) return;
    await updateDeck(editingDeck._id, { name: editDeckName, description: editDeckDescription });
    setOpenEditDialog(false);
    setEditingDeck(null);
  };

  const handleOpenDeleteDialog = (deck: Deck) => {
    setDeletingDeck(deck);
    setOpenDeleteDialog(true);
  };

  const handleDeleteDeck = async () => {
    if (!deletingDeck) return;
    await deleteDeck(deletingDeck._id);
    // deleteDeck(deletingDeck._id, setAllCards); // Removed setAllCards
    setOpenDeleteDialog(false);
    setDeletingDeck(null);
  };

  if (loading && !decks.length) {
    return <div className="text-center p-8">Loading decks...</div>;
  }

  if (error && decks.length > 0) { // MODIFIED: Only show error if decks exist
    return <div className="text-center p-8 text-red-500">Error: {error} <Button onClick={() => fetchDecks()} className="ml-2">Retry</Button></div>;
  }

  if (!loading && !decks.length) {
    return (
      <div className="flex flex-col items-center justify-center p-8 animate-fade-in">
        <div className="text-center max-w-md">
          <BookOpen className="mx-auto h-12 w-12 text-brand-purple mb-4" />
          <h2 className="text-2xl font-bold mb-2">Create your first deck</h2>
          <p className="text-muted-foreground mb-6">
            Start by creating a flashcard deck for a subject you're learning.
          </p>
          
          <Dialog open={openCreateDialog} onOpenChange={setOpenCreateDialog}>
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
                  Give your flashcard deck a name and optional description.
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
                <Textarea
                  value={newDeckDescription}
                  onChange={(e) => setNewDeckDescription(e.target.value)}
                  placeholder="Deck description (optional)"
                  className="mb-4"
                />
                <DialogFooter>
                  <Button
                    type="submit"
                    disabled={loading || !newDeckName.trim()}
                    className="bg-brand-purple hover:bg-brand-purple/90"
                  >
                    {loading ? 'Creating...' : 'Create Deck'}
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
        <Dialog open={openCreateDialog} onOpenChange={setOpenCreateDialog}>
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
                Give your flashcard deck a name and optional description.
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
              <Textarea
                value={newDeckDescription}
                onChange={(e) => setNewDeckDescription(e.target.value)}
                placeholder="Deck description (optional)"
                className="mb-4"
              />
              <DialogFooter>
                <Button
                  type="submit"
                  disabled={loading || !newDeckName.trim()}
                  className="bg-brand-purple hover:bg-brand-purple/90"
                >
                  {loading ? 'Creating...' : 'Create Deck'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && decks.length > 0 && <div className="text-red-500 bg-red-100 p-3 rounded-md">Error: {error} <Button onClick={() => fetchDecks()} variant="link" className="text-red-500 underline">Retry</Button></div>} {/* MODIFIED: Only show error if decks exist */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {decks.map((deck: Deck) => (
          <DeckCard 
            key={deck._id} // Changed to _id
            deck={deck} 
            onEdit={() => handleOpenEditDialog(deck)}
            onDelete={() => handleOpenDeleteDialog(deck)}
          />
        ))}
      </div>

      {/* Edit Deck Dialog */}
      {editingDeck && (
        <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Deck</DialogTitle>
              <DialogDescription>
                Update the name and description of your deck.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateDeck}>
              <Input
                value={editDeckName}
                onChange={(e) => setEditDeckName(e.target.value)}
                placeholder="Deck name"
                className="mb-4"
                autoFocus
              />
              <Textarea
                value={editDeckDescription}
                onChange={(e) => setEditDeckDescription(e.target.value)}
                placeholder="Deck description (optional)"
                className="mb-4"
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpenEditDialog(false)}>Cancel</Button>
                <Button type="submit" disabled={loading} className="bg-brand-purple hover:bg-brand-purple/90">
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Deck Alert Dialog */}
      {deletingDeck && (
        <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the deck "{deletingDeck?.name ?? 'this deck'}" and all its cards.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setOpenDeleteDialog(false)} disabled={loading}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteDeck}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700" // Ensure className is passed correctly if needed by the primitive
              >
                {loading ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

interface DeckCardProps {
  deck: Deck;
  onEdit: () => void;
  onDelete: () => void;
}

const DeckCard: React.FC<DeckCardProps> = ({ deck, onEdit, onDelete }) => {
  return (
    <Card className="h-full flex flex-col overflow-hidden hover:shadow-md transition-shadow duration-300 animate-scale-up">
      <Link to={`/deck/${deck._id}`} className="block flex-grow"> {/* Changed to _id */}
        <CardHeader>
          <CardTitle className="truncate">{deck.name}</CardTitle>
          {deck.description && (
            <CardDescription className="truncate text-sm text-muted-foreground mt-1">{deck.description}</CardDescription>
          )}
          <CardDescription className="text-xs text-muted-foreground mt-1">
            Created on {new Date(deck.createdAt).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <div className="h-12 flex items-center justify-center">
            <BookOpen className="h-8 w-8 text-brand-purple" />
          </div>
        </CardContent>
      </Link>
      <CardFooter className="flex justify-between items-center p-4 border-t">
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-100 px-2 py-1"
            onClick={(e) => {
              e.preventDefault(); 
              onEdit();
            }}
            aria-label={`Edit deck ${deck.name}`}
          >
            <Edit className="mr-1 h-4 w-4" /> Edit
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-red-600 hover:text-red-700 hover:bg-red-100 px-2 py-1"
            onClick={(e) => {
              e.preventDefault(); 
              onDelete();
            }}
            aria-label={`Delete deck ${deck.name}`}
          >
            <Trash2 className="mr-1 h-4 w-4" /> Delete
          </Button>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-brand-green hover:text-brand-green hover:bg-accent px-2 py-1"
          onClick={(e) => {
            e.preventDefault();
            window.location.href = `/study/${deck._id}`; // Changed to _id
          }}
          aria-label={`Study deck ${deck.name}`}
        >
          Study Now
        </Button>
      </CardFooter>
    </Card>
  );
};
