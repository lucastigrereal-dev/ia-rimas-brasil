/**
 * @fileoverview Skeleton para listas
 * @module components/Loading/SkeletonList
 */

import { SkeletonDrillCard, SkeletonLeaderboardRow, SkeletonStatCard } from './SkeletonCard';

interface SkeletonListProps {
  /** Número de items */
  count?: number;
  /** Tipo de item */
  type?: 'drill' | 'leaderboard' | 'stat' | 'generic';
  /** Classes adicionais */
  className?: string;
}

/**
 * Lista de skeletons
 */
export function SkeletonList({
  count = 3,
  type = 'generic',
  className = '',
}: SkeletonListProps) {
  const items = Array.from({ length: count });

  const renderItem = (index: number) => {
    switch (type) {
      case 'drill':
        return <SkeletonDrillCard key={index} />;
      case 'leaderboard':
        return <SkeletonLeaderboardRow key={index} />;
      case 'stat':
        return <SkeletonStatCard key={index} />;
      default:
        return (
          <div key={index} className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-800 rounded-lg animate-pulse" />
              <div className="flex-1">
                <div className="h-4 bg-gray-800 rounded w-3/4 mb-2 animate-pulse" />
                <div className="h-3 bg-gray-800 rounded w-1/2 animate-pulse" />
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {items.map((_, index) => renderItem(index))}
    </div>
  );
}

/**
 * Grid de skeleton cards
 */
export function SkeletonGrid({
  count = 6,
  columns = 2,
  className = '',
}: {
  count?: number;
  columns?: 2 | 3 | 4;
  className?: string;
}) {
  const items = Array.from({ length: count });
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-3 ${className}`}>
      {items.map((_, index) => (
        <SkeletonStatCard key={index} />
      ))}
    </div>
  );
}

export default SkeletonList;
