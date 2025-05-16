
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  logIn: (email: string, password: string) => Promise<void>;
  logOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for saved user in localStorage
    const savedUser = localStorage.getItem('flashcardUser');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Failed to parse saved user', error);
        localStorage.removeItem('flashcardUser');
      }
    }
    setLoading(false);
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    // Mock sign up functionality
    setLoading(true);
    try {
      // In a real app, this would be an API call
      const newUser = { id: crypto.randomUUID(), email, name };
      setUser(newUser);
      localStorage.setItem('flashcardUser', JSON.stringify(newUser));
      toast.success('Account created successfully!');
    } catch (error) {
      console.error('Sign up error', error);
      toast.error('Failed to create account');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logIn = async (email: string, password: string) => {
    // Mock login functionality
    setLoading(true);
    try {
      // In a real app, this would be an API call
      // For demo, we'll just pretend the login worked with some basic validation
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      // Create a mock user
      const user = { 
        id: crypto.randomUUID(), 
        email,
        name: email.split('@')[0]
      };
      
      setUser(user);
      localStorage.setItem('flashcardUser', JSON.stringify(user));
      toast.success('Logged in successfully!');
    } catch (error) {
      console.error('Login error', error);
      toast.error('Failed to log in');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logOut = () => {
    setUser(null);
    localStorage.removeItem('flashcardUser');
    toast.info('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, logIn, logOut }}>
      {children}
    </AuthContext.Provider>
  );
};
