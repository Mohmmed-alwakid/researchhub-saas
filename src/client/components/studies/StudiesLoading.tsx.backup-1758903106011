import React from 'react';
import { Card, CardContent } from '../ui/Card';
import Skeleton from '../ui/Skeleton';

interface StudiesLoadingProps {
  count?: number;
}

const StudiesLoading: React.FC<StudiesLoadingProps> = ({ count = 6 }) => {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header Skeleton */}
      <div className="mb-6">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Search and Filters Skeleton */}
      <div className="mb-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex space-x-4">
            <Skeleton className="h-10 w-80" /> {/* Search bar */}
            <Skeleton className="h-10 w-32" /> {/* Status filter */}
            <Skeleton className="h-10 w-32" /> {/* Type filter */}
          </div>
          <Skeleton className="h-10 w-40" /> {/* Create button */}
        </div>
      </div>

      {/* Studies Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: count }).map((_, index) => (
          <Card key={index} className="p-6 border border-gray-200 hover:border-gray-300 transition-colors">
            <CardContent className="p-0">
              {/* Study Icon & Title */}
              <div className="flex items-start space-x-3 mb-4">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="flex-1">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>

              {/* Status and Metrics */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-20 rounded-full" /> {/* Status badge */}
                  <Skeleton className="h-4 w-16" /> {/* Date */}
                </div>

                {/* Metrics Row */}
                <div className="flex space-x-4">
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-8" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between pt-3 border-t border-gray-100">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination Skeleton */}
      <div className="mt-8 flex justify-center">
        <div className="flex space-x-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-8 w-8 rounded" />
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudiesLoading;
