import React from 'react';
import { clsx } from 'clsx';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => {
  return (
    <div
      className={clsx(
        'animate-pulse bg-gray-800/80 rounded-xl',
        className
      )}
    />
  );
};

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-5 rounded-2xl bg-gray-900/50 border border-gray-800 space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-36" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-2xl bg-gray-900/50 border border-gray-800 h-80">
          <Skeleton className="h-6 w-48 mb-6" />
          <Skeleton className="h-56 w-full" />
        </div>
        <div className="p-6 rounded-2xl bg-gray-900/50 border border-gray-800 h-80">
          <Skeleton className="h-6 w-36 mb-6" />
          <Skeleton className="h-56 w-full rounded-full" />
        </div>
      </div>
    </div>
  );
};
