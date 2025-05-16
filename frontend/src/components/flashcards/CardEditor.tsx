
import React, { useState } from 'react';
import { Flashcard } from '@/types/flashcard';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface CardEditorProps {
  card?: Flashcard;
  isOpen: boolean;
  onClose: () => void;
  onSave: (front: string, back: string) => void;
}

export const CardEditor: React.FC<CardEditorProps> = ({
  card,
  isOpen,
  onClose,
  onSave,
}) => {
  const [front, setFront] = useState(card?.front || '');
  const [back, setBack] = useState(card?.back || '');
  const [isSaving, setIsSaving] = useState(false);
  
  const isEditing = !!card;
  
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!front.trim() || !back.trim()) return;
    
    setIsSaving(true);
    onSave(front, back);
    setIsSaving(false);
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Flashcard' : 'Add New Flashcard'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the content of your flashcard.'
              : 'Create a new flashcard for your deck. Make sure the front contains the question/prompt and the back contains the answer.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSave}>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <label htmlFor="front" className="text-sm font-medium">
                Front (Question/Prompt)
              </label>
              <Textarea
                id="front"
                value={front}
                onChange={(e) => setFront(e.target.value)}
                placeholder="What's the capital of France?"
                className="min-h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="back" className="text-sm font-medium">
                Back (Answer)
              </label>
              <Textarea
                id="back"
                value={back}
                onChange={(e) => setBack(e.target.value)}
                placeholder="Paris"
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving || !front.trim() || !back.trim()}
              className="bg-brand-purple hover:bg-brand-purple/90"
            >
              {isSaving 
                ? isEditing ? 'Updating...' : 'Adding...' 
                : isEditing ? 'Update Card' : 'Add Card'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
