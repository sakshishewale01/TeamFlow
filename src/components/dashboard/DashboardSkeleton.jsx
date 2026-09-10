import React from 'react';

export const DashboardSkeleton = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Top Banner Skeleton */}
      <div className="h-44 rounded-3xl bg-slate-200 dark:bg-slate-800/60" />

      {/* 4 KPI Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-2xl bg-slate-200 dark:bg-slate-800/60 p-5"
          />
        ))}
      </div>

      {/* Completion Bar Skeleton */}
      <div className="h-16 rounded-2xl bg-slate-200 dark:bg-slate-800/60" />

      {/* 2-Column Grid Skeletons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-64 rounded-2xl bg-slate-200 dark:bg-slate-800/60" />
        <div className="h-64 rounded-2xl bg-slate-200 dark:bg-slate-800/60" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-64 rounded-2xl bg-slate-200 dark:bg-slate-800/60" />
        <div className="h-64 rounded-2xl bg-slate-200 dark:bg-slate-800/60" />
      </div>
    </div>
  );
};

export default DashboardSkeleton;
