import React from "react";

interface SkeletonProps {
  className?: string;
  lines?: number;
  avatar?: boolean;
}

const SkeletonLine: React.FC<{ width?: string }> = ({ width = "100%" }) => (
  <div
    className="h-4 bg-grey-200 rounded-sm animate-pulse"
    style={{ width }}
  />
);

export const Skeleton: React.FC<SkeletonProps> = ({ className = "", lines = 3, avatar = false }) => (
  <div className={`space-y-3 ${className}`}>
    {avatar && (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-grey-200 rounded-full animate-pulse" />
        <div className="flex-1 space-y-2">
          <SkeletonLine width="60%" />
          <SkeletonLine width="40%" />
        </div>
      </div>
    )}
    {!avatar && Array.from({ length: lines }).map((_, i) => (
      <SkeletonLine key={i} width={i === lines - 1 ? "70%" : "100%"} />
    ))}
  </div>
);

export const SkeletonCard: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`bg-white rounded-lg p-5 shadow-sm border border-grey-200 ${className}`}>
    <Skeleton lines={2} />
    <div className="mt-4 flex gap-2">
      <div className="h-8 w-20 bg-grey-200 rounded-md animate-pulse" />
      <div className="h-8 w-20 bg-grey-200 rounded-md animate-pulse" />
    </div>
  </div>
);

export const SkeletonList: React.FC<{ count?: number; className?: string }> = ({ count = 3, className = "" }) => (
  <div className={`space-y-4 ${className}`}>
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

export default Skeleton;
