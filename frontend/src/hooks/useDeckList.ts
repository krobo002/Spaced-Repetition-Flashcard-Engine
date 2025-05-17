import { useContext } from 'react';
import { DeckListContext, DeckListContextType } from '@/context/DeckListContext'; // Adjusted path

export const useDeckList = (): DeckListContextType => {
  const context = useContext(DeckListContext);
  if (!context) {
    throw new Error('useDeckList must be used within a DeckListProvider');
  }
  return context;
};
