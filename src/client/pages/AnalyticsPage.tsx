import React from 'react';
import { PerformanceAnalyticsDashboard } from '../components/analytics/PerformanceAnalyticsDashboard';

/**
 * Analytics Route Component
 * 
 * Route handler for the Performance Analytics Dashboard
 * Provides comprehensive platform monitoring and insights
 */
export const AnalyticsPage: React.FC = () => {
  return (
    <div className="analytics-page">
      <PerformanceAnalyticsDashboard />
    </div>
  );
};