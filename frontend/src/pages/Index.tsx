
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { BookOpen, Brain, ArrowRight, Check, Star } from 'lucide-react';

const Index = () => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-purple-50">
      <header className="container mx-auto px-4 py-6">
        <nav className="flex justify-between items-center">
          <div className="flex items-center">
            <BookOpen className="h-8 w-8 text-brand-purple mr-2" />
            <span className="text-2xl font-bold">CardBrain</span>
          </div>
          
          <div className="space-x-4">
            {user ? (
              <Button className="bg-brand-purple hover:bg-brand-purple/90" asChild>
                <Link to="/dashboard">Go to Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/login">Log in</Link>
                </Button>
                <Button className="bg-brand-purple hover:bg-brand-purple/90" asChild>
                  <Link to="/signup">Sign up</Link>
                </Button>
              </>
            )}
          </div>
        </nav>
      </header>
      
      <main>
        <section className="container mx-auto px-4 py-20 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0 md:pr-10">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 animate-fade-in">
              Learn Smarter, Not Harder
            </h1>
            
            <p className="text-xl mb-8 text-gray-600 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              CardBrain uses spaced repetition to help you memorize anything efficiently.
              Study flashcards at optimal intervals for maximum retention.
            </p>
            
            <div className="flex flex-wrap gap-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <Button 
                size="lg" 
                className="bg-brand-purple hover:bg-brand-purple/90"
                asChild
              >
                <Link to="/signup">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              
              <Button 
                size="lg" 
                variant="outline"
                asChild
              >
                <Link to="/login">
                  Log In
                </Link>
              </Button>
            </div>
          </div>
          
          <div className="md:w-1/2 relative animate-scale-up">
            <div className="relative w-full max-w-md mx-auto">
              <div className="absolute -top-4 -right-4 w-72 h-72 bg-brand-light-purple rounded-lg transform rotate-6"></div>
              <div className="absolute -bottom-4 -left-4 w-72 h-72 bg-brand-blue/20 rounded-lg transform -rotate-3"></div>
              <div className="relative z-10 bg-white p-6 rounded-lg shadow-lg transform -rotate-2">
                <div className="text-xl font-bold mb-6">What's the capital of France?</div>
                <div className="flex justify-center mt-4">
                  <Button className="w-full">Show Answer</Button>
                </div>
              </div>
            </div>
            
            <div className="absolute -bottom-6 right-10 transform rotate-3 bg-white p-3 rounded-lg shadow-md animate-bounce-light">
              <div className="text-brand-purple font-medium">Paris</div>
            </div>
          </div>
        </section>
        
        <section className="bg-white py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center p-6 border border-gray-100 rounded-lg hover:shadow-md transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <div className="w-16 h-16 bg-brand-light-purple rounded-full flex items-center justify-center mb-4">
                  <BookOpen className="h-8 w-8 text-brand-purple" />
                </div>
                <h3 className="text-xl font-bold mb-2">Create Flashcards</h3>
                <p className="text-gray-600">
                  Create decks and add flashcards for any subject you need to learn.
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center p-6 border border-gray-100 rounded-lg hover:shadow-md transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <div className="w-16 h-16 bg-brand-blue/20 rounded-full flex items-center justify-center mb-4">
                  <Brain className="h-8 w-8 text-brand-blue" />
                </div>
                <h3 className="text-xl font-bold mb-2">Study Efficiently</h3>
                <p className="text-gray-600">
                  Our algorithm schedules your reviews at the optimal time for maximum retention.
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center p-6 border border-gray-100 rounded-lg hover:shadow-md transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.6s' }}>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">Track Progress</h3>
                <p className="text-gray-600">
                  See detailed statistics about your learning journey and progress.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        <section className="bg-gray-50 py-20">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-8">Ready to Boost Your Memory?</h2>
              <p className="text-xl text-gray-600 mb-8">
                Join thousands of students using spaced repetition to achieve better learning results.
              </p>
              <Button 
                size="lg" 
                className="bg-brand-purple hover:bg-brand-purple/90 animate-pulse-light"
                asChild
              >
                <Link to="/signup">
                  Start Learning Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <BookOpen className="h-6 w-6 text-brand-purple mr-2" />
              <span className="text-xl font-bold">CardBrain</span>
            </div>
            
            <div className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} CardBrain. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
