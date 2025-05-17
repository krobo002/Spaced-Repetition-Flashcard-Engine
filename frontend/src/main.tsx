import React from 'react'; // Add React import
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from './context/AuthContext';
import { DeckListProvider } from './context/DeckListContext'; // Import DeckListProvider

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <DeckListProvider>
        <App />
      </DeckListProvider>
    </AuthProvider>
  </React.StrictMode>
);
