
import React from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import { SignUpForm, LogInForm } from '@/components/auth/AuthForms';
import { BookOpen } from 'lucide-react';

const Auth: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const isLogin = location.pathname === '/login';
  
  // Redirect if already logged in
  if (user) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container py-12">
        <div className="max-w-md mx-auto mb-8 text-center">
          <div className="mb-6 flex justify-center">
            <div className="w-16 h-16 bg-brand-light-purple rounded-full flex items-center justify-center animate-bounce-light">
              <BookOpen className="h-8 w-8 text-brand-purple" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2">
            {isLogin ? 'Welcome Back to CardBrain' : 'Join CardBrain'}
          </h1>
          <p className="text-muted-foreground">
            {isLogin 
              ? 'Log in to your account to continue your learning journey' 
              : 'Create an account to start improving your memory with spaced repetition'}
          </p>
        </div>
        
        {isLogin ? <LogInForm /> : <SignUpForm />}
      </main>
    </div>
  );
};

export default Auth;
