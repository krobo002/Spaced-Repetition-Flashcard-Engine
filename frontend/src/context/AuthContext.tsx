import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  name: string;
  token?: string; // Add token to User interface
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

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/auth`;

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('flashcardToken');
    const savedUser = localStorage.getItem('flashcardUser');
    if (token && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser({ ...parsedUser, token });
        // Optionally, you could add a request here to verify the token with the backend
        // and fetch fresh user data e.g., fetchUserProfile(token);
      } catch (error) {
        console.error('Failed to parse saved user', error);
        localStorage.removeItem('flashcardUser');
        localStorage.removeItem('flashcardToken');
      }
    }
    setLoading(false);
  }, []);

  const signUp = async (email: string, password: string, username: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      // Check if the response is JSON before trying to parse it
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const responseText = await response.text();
        console.error('Server did not return JSON. Response text:', responseText);
        throw new Error('Server error: Did not return JSON. Check console for details.');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to sign up');
      }

      // Assuming the backend returns user and token upon successful registration
      const newUser = { id: data.user.id, email: data.user.email, name: data.user.name, token: data.token };
      setUser(newUser);
      localStorage.setItem('flashcardUser', JSON.stringify({ id: data.user.id, email: data.user.email, name: data.user.name }));
      localStorage.setItem('flashcardToken', data.token);
      toast.success('Account created successfully!');
    } catch (error: unknown) { // Changed from any to unknown
      console.error('Sign up error', error);
      if (error instanceof Error) {
        toast.error(error.message || 'Failed to create account');
      } else {
        toast.error('An unexpected error occurred during sign up');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to log in');
      }

      // Assuming the backend returns user and token
      const loggedInUser = { id: data.user.id, email: data.user.email, name: data.user.name, token: data.token }; 
      setUser(loggedInUser);
      localStorage.setItem('flashcardUser', JSON.stringify({ id: data.user.id, email: data.user.email, name: data.user.name }));
      localStorage.setItem('flashcardToken', data.token);
      toast.success('Logged in successfully!');
    } catch (error: unknown) { // Changed from any to unknown
      console.error('Login error', error);
      if (error instanceof Error) {
        toast.error(error.message || 'Failed to log in');
      } else {
        toast.error('An unexpected error occurred during login');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logOut = () => {
    setUser(null);
    localStorage.removeItem('flashcardUser');
    localStorage.removeItem('flashcardToken');
    toast.info('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, logIn, logOut }}>
      {children}
    </AuthContext.Provider>
  );
};
