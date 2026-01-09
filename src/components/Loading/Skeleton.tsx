/**
 * @fileoverview Componente base de Skeleton
 * @module components/Loading/Skeleton
 */

import React from 'react';

interface SkeletonProps {
  /** Largura (px, %, rem, etc) */
  width?: string | number;
  /** Altura (px, %, rem, etc) */
  height?: string | number;
  /** Bordas arredondadas */
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  /** Circular */
  circle?: boolean;
  /** Classes adicionais */
  className?: string;
}

const roundedClasses = {
  none: 'rounded-none',
  sm: 'rounded',
  md: 'rounded-lg',
  lg: 'rounded-xl',
  full: 'rounded-full',
};

/**
 * Componente base de Skeleton com pulse animation
 */
export function Skeleton({
  width,
  height,
  rounded = 'md',
  circle = false,
  className = '',
}: SkeletonProps) {
  const style: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  return (
    <div
      className={`
        bg-gray-800 animate-pulse
        ${circle ? 'rounded-full' : roundedClasses[rounded]}
        ${className}
      `}
      style={style}
    />
  );
}

/**
 * Skeleton para texto (linha)
 */
export function SkeletonText({
  lines = 1,
  className = '',
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height={16}
          width={i === lines - 1 && lines > 1 ? '75%' : '100%'}
          rounded="sm"
        />
      ))}
    </div>
  );
}

/**
 * Skeleton para avatar
 */
export function SkeletonAvatar({
  size = 40,
  className = '',
}: {
  size?: number;
  className?: string;
}) {
  return (
    <Skeleton
      width={size}
      height={size}
      circle
      className={className}
    />
  );
}

/**
 * Skeleton para botão
 */
export function SkeletonButton({
  width = 100,
  height = 40,
  className = '',
}: {
  width?: number | string;
  height?: number;
  className?: string;
}) {
  return (
    <Skeleton
      width={width}
      height={height}
      rounded="lg"
      className={className}
    />
  );
}

export default Skeleton;
