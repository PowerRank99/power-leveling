
import React from 'react';
import PerformanceDashboard from '@/components/performance/PerformanceDashboard';
import { ErrorBoundary } from '@/components/error-handling/ErrorBoundary';

const PerformanceDashboardPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <ErrorBoundary>
        <PerformanceDashboard />
      </ErrorBoundary>
    </div>
  );
};

export default PerformanceDashboardPage;
