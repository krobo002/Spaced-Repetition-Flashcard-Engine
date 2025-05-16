
import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { StatsOverview } from '@/components/stats/StatsOverview';

const StatsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container py-8">
        <StatsOverview />
      </main>
    </div>
  );
};

export default StatsPage;
