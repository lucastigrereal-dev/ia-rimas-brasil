/**
 * @fileoverview Skeleton para página de perfil
 * @module components/Loading/SkeletonProfile
 */

import React from 'react';
import { Skeleton, SkeletonAvatar, SkeletonText } from './Skeleton';
import { SkeletonStatCard } from './SkeletonCard';
import { SkeletonGrid } from './SkeletonList';

/**
 * Skeleton completo para página de perfil
 */
export function SkeletonProfile({ className = '' }: { className?: string }) {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="relative">
          <SkeletonAvatar size={80} />
          <Skeleton
            width={32}
            height={32}
            circle
            className="absolute -bottom-1 -right-1"
          />
        </div>

        {/* Info */}
        <div className="flex-1">
          <Skeleton width="60%" height={24} rounded="sm" className="mb-2" />
          <Skeleton width="40%" height={16} rounded="sm" className="mb-3" />
          <div className="flex gap-4">
            <Skeleton width={60} height={20} rounded="sm" />
            <Skeleton width={50} height={20} rounded="sm" />
          </div>
        </div>

        {/* Settings button */}
        <Skeleton width={40} height={40} rounded="lg" />
      </div>

      {/* XP Progress */}
      <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
        <div className="flex justify-between mb-3">
          <Skeleton width={100} height={14} rounded="sm" />
          <Skeleton width={60} height={14} rounded="sm" />
        </div>
        <Skeleton width="100%" height={8} rounded="full" className="mb-2" />
        <Skeleton width={140} height={12} rounded="sm" className="mx-auto" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <SkeletonStatCard />
        <SkeletonStatCard />
        <SkeletonStatCard />
      </div>

      {/* Activity Calendar */}
      <div>
        <Skeleton width={100} height={20} rounded="sm" className="mb-3" />
        <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 28 }).map((_, i) => (
              <Skeleton key={i} width="100%" height={24} rounded="sm" />
            ))}
          </div>
        </div>
      </div>

      {/* Badges */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <Skeleton width={100} height={20} rounded="sm" />
          <Skeleton width={40} height={16} rounded="sm" />
        </div>
        <SkeletonGrid count={6} columns={3} />
      </div>

      {/* Action Button */}
      <Skeleton width="100%" height={48} rounded="lg" />
    </div>
  );
}

/**
 * Skeleton para página de home
 */
export function SkeletonHome({ className = '' }: { className?: string }) {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Welcome */}
      <div>
        <Skeleton width="70%" height={28} rounded="sm" className="mb-2" />
        <Skeleton width="50%" height={16} rounded="sm" />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <SkeletonStatCard />
        <SkeletonStatCard />
      </div>

      {/* Daily Challenge */}
      <Skeleton width="100%" height={100} rounded="lg" />

      {/* Suggested Drills */}
      <div>
        <div className="flex justify-between mb-3">
          <Skeleton width={140} height={20} rounded="sm" />
          <Skeleton width={70} height={16} rounded="sm" />
        </div>
        <div className="space-y-3">
          <Skeleton width="100%" height={80} rounded="lg" />
          <Skeleton width="100%" height={80} rounded="lg" />
        </div>
      </div>

      {/* Weekly Progress */}
      <div>
        <Skeleton width={100} height={20} rounded="sm" className="mb-3" />
        <Skeleton width="100%" height={120} rounded="lg" />
      </div>
    </div>
  );
}

export default SkeletonProfile;
