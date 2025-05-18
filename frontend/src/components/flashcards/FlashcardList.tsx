import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useFlashcards } from '@/context/FlashcardContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';
import { Pencil, Trash2, Plus } from 'lucide-react';

const FlashcardList: React.FC = () => {
  const { deckId } = useParams<{ deckId: string }>();
  const { flashcards, loading, error, getFlashcardsByDeck, createFlashcard, updateFlashcard, deleteFlashcard } = useFlashcards();
  
  // Form states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [currentFlashcardId, setCurrentFlashcardId] = useState<string | null>(null);

  useEffect(() => {
    if (deckId) {
      getFlashcardsByDeck(deckId);
    }
  }, [deckId, getFlashcardsByDeck]);

  const handleAddFlashcard = async () => {
    if (!deckId || !front.trim() || !back.trim()) {
      toast.error('Front and back content are required');
      return;
    }

    const result = await createFlashcard(deckId, front, back);
    if (result) {
      toast.success('Flashcard created successfully');
      setFront('');
      setBack('');
      setIsAddDialogOpen(false);
    }
  };

  const handleEditFlashcard = async () => {
    if (!currentFlashcardId || !front.trim() || !back.trim()) {
      toast.error('Front and back content are required');
      return;
    }

    const result = await updateFlashcard(currentFlashcardId, front, back);
    if (result) {
      toast.success('Flashcard updated successfully');
      setFront('');
      setBack('');
      setCurrentFlashcardId(null);
      setIsEditDialogOpen(false);
    }
  };

  const handleDeleteFlashcard = async (flashcardId: string) => {
    if (window.confirm('Are you sure you want to delete this flashcard?')) {
      const result = await deleteFlashcard(flashcardId);
      if (result) {
        toast.success('Flashcard deleted successfully');
      }
    }
  };

  const openEditDialog = (flashcard: any) => {
    setCurrentFlashcardId(flashcard._id);
    setFront(flashcard.front);
    setBack(flashcard.back);
    setIsEditDialogOpen(true);
  };

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-end mb-6">
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus size={16} /> Add Flashcard
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Flashcard</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label htmlFor="front" className="block text-sm font-medium mb-1">
                  Front
                </label>
                <Textarea
                  id="front"
                  value={front}
                  onChange={(e) => setFront(e.target.value)}
                  placeholder="Question or term"
                  className="w-full"
                />
              </div>
              <div>
                <label htmlFor="back" className="block text-sm font-medium mb-1">
                  Back
                </label>
                <Textarea
                  id="back"
                  value={back}
                  onChange={(e) => setBack(e.target.value)}
                  placeholder="Answer or definition"
                  className="w-full"
                />
              </div>
              <Button onClick={handleAddFlashcard} className="w-full">
                Create Flashcard
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading && flashcards.length === 0 ? (
        <div className="flex justify-center p-8">
          <Spinner size="lg" />
        </div>
      ) : flashcards.length === 0 ? (
        <div className="text-center p-8 border rounded-lg bg-gray-50">
          <p className="text-gray-500 mb-4">No flashcards yet.</p>
          <Button onClick={() => setIsAddDialogOpen(true)} className="flex items-center gap-2 mx-auto">
            <Plus size={16} /> Add your first card
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {flashcards.map((flashcard) => (
            <Card key={flashcard._id} className="h-full flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg">Flashcard</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-500">Front:</h3>
                  <p className="mt-1">{flashcard.front}</p>
                </div>
                <Separator className="my-4" />
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Back:</h3>
                  <p className="mt-1">{flashcard.back}</p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => openEditDialog(flashcard)}
                >
                  <Pencil size={16} />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="text-red-500"
                  onClick={() => handleDeleteFlashcard(flashcard._id)}
                >
                  <Trash2 size={16} />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Flashcard</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label htmlFor="edit-front" className="block text-sm font-medium mb-1">
                Front
              </label>
              <Textarea
                id="edit-front"
                value={front}
                onChange={(e) => setFront(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label htmlFor="edit-back" className="block text-sm font-medium mb-1">
                Back
              </label>
              <Textarea
                id="edit-back"
                value={back}
                onChange={(e) => setBack(e.target.value)}
                className="w-full"
              />
            </div>
            <Button onClick={handleEditFlashcard} className="w-full">
              Update Flashcard
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FlashcardList;
