
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useDecks, useCards, useStudyStats } from '@/store/flashcardStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CalendarDays, BookOpen, ArrowRight, Star, Calendar, Smile } from 'lucide-react';

export const StatsOverview: React.FC = () => {
  const { user } = useAuth();
  const userId = user?.id || '';
  const { decks } = useDecks(userId);
  const { allCards } = useCards(userId);
  const { userStats, getUpcomingDueCards } = useStudyStats(userId);
  
  const upcomingReviews = getUpcomingDueCards(7);
  const upcomingReviewsData = Object.keys(upcomingReviews).map(date => ({
    date: new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
    cards: upcomingReviews[date]
  }));
  
  // Calculate total stats across all decks
  const totalCards = allCards.length;
  const totalNewCards = allCards.filter(card => !card.reviewData).length;
  const totalLearningCards = allCards.filter(card => 
    card.reviewData && card.reviewData.repetitions < 2
  ).length;
  const totalMatureCards = allCards.filter(card => 
    card.reviewData && card.reviewData.repetitions >= 2
  ).length;
  
  // Mock learning data for the chart
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const today = new Date().getDay(); // 0 is Sunday, 1 is Monday, etc.
  const startDayIndex = (today + 6) % 7; // Adjust to make it start from 7 days ago
  
  const mockLearningProgress = Array(7).fill(0).map((_, i) => {
    const dayIndex = (startDayIndex + i) % 7;
    // Generate more realistic random data
    const cardsReviewed = i === 6 ? userStats.reviewsToday : Math.floor(Math.random() * 20);
    return {
      day: weekDays[dayIndex],
      cards: cardsReviewed,
    };
  });
  
  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold mb-6">Your Learning Stats</h1>
      
      {totalCards === 0 ? (
        <div className="p-8 bg-gray-50 rounded-lg text-center">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">No Stats Yet</h2>
          <p className="text-muted-foreground mb-6">
            Start creating flashcards and studying to see your stats here.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-white hover:shadow-md transition-all duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Cards</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <BookOpen className="h-5 w-5 text-brand-purple mr-2" />
                  <div className="text-3xl font-bold">{totalCards}</div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white hover:shadow-md transition-all duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Cards Reviewed Today</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <CalendarDays className="h-5 w-5 text-brand-blue mr-2" />
                  <div className="text-3xl font-bold">{userStats.reviewsToday}</div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white hover:shadow-md transition-all duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Learning Cards</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <ArrowRight className="h-5 w-5 text-brand-orange mr-2" />
                  <div className="text-3xl font-bold">{totalLearningCards}</div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white hover:shadow-md transition-all duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Mature Cards</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-brand-green mr-2" />
                  <div className="text-3xl font-bold">{totalMatureCards}</div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Smile className="h-5 w-5 text-brand-purple mr-2" />
                  Review Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={mockLearningProgress}
                      margin={{
                        top: 10,
                        right: 20,
                        left: 0,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value) => [`${value} cards`, 'Reviewed']}
                        labelFormatter={(label) => label}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="cards" 
                        stroke="#8B5CF6" 
                        fill="#D6BCFA" 
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 text-brand-blue mr-2" />
                  Upcoming Reviews
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={upcomingReviewsData}
                      margin={{
                        top: 10,
                        right: 20,
                        left: 0,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="date" />
                      <YAxis allowDecimals={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value) => [`${value} cards`, 'Due']}
                        labelFormatter={(label) => label}
                      />
                      <Bar 
                        dataKey="cards" 
                        fill="#33C3F0" 
                        radius={[4, 4, 0, 0]}
                        barSize={36}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};
