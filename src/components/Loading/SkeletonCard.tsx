/**
 * @fileoverview Skeleton para cards (DrillCard, etc)
 * @module components/Loading/SkeletonCard
 */

import React from 'react';
import { Skeleton, SkeletonText, SkeletonAvatar } from './Skeleton';

/**
 * Skeleton para DrillCard
 */
export function SkeletonDrillCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-gray-900 rounded-xl p-4 border border-gray-800 ${className}`}>
      <div className="flex items-start gap-3">
        {/* Icon */}
        <Skeleton width={48} height={48} rounded="lg" />

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <Skeleton width="60%" height={20} rounded="sm" className="mb-2" />

          {/* Description */}
          <Skeleton width="80%" height={14} rounded="sm" className="mb-3" />

          {/* Tags */}
          <div className="flex gap-2">
            <Skeleton width={60} height={20} rounded="full" />
            <Skeleton width={50} height={20} rounded="full" />
          </div>
        </div>

        {/* Arrow */}
        <Skeleton width={24} height={24} rounded="sm" />
      </div>
    </div>
  );
}

/**
 * Skeleton para card genérico
 */
export function SkeletonCard({
  className = '',
  showImage = false,
}: {
  className?: string;
  showImage?: boolean;
}) {
  return (
    <div className={`bg-gray-900 rounded-xl border border-gray-800 overflow-hidden ${className}`}>
      {/* Image */}
      {showImage && (
        <Skeleton width="100%" height={160} rounded="none" />
      )}

      {/* Content */}
      <div className="p-4">
        <Skeleton width="70%" height={20} rounded="sm" className="mb-2" />
        <SkeletonText lines={2} className="mb-4" />

        <div className="flex justify-between items-center">
          <Skeleton width={80} height={24} rounded="full" />
          <Skeleton width={60} height={32} rounded="lg" />
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton para stat card
 */
export function SkeletonStatCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-gray-900 rounded-xl p-4 border border-gray-800 ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <Skeleton width={20} height={20} rounded="sm" />
        <Skeleton width={60} height={14} rounded="sm" />
      </div>
      <Skeleton width={80} height={32} rounded="sm" />
    </div>
  );
}

/**
 * Skeleton para LeaderboardRow
 */
export function SkeletonLeaderboardRow({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 p-3 bg-gray-900 rounded-xl ${className}`}>
      {/* Rank */}
      <Skeleton width={32} height={32} rounded="full" />

      {/* Avatar */}
      <SkeletonAvatar size={40} />

      {/* Info */}
      <div className="flex-1">
        <Skeleton width="50%" height={16} rounded="sm" className="mb-1" />
        <Skeleton width="30%" height={12} rounded="sm" />
      </div>

      {/* XP */}
      <Skeleton width={60} height={20} rounded="sm" />
    </div>
  );
}

export default SkeletonCard;
