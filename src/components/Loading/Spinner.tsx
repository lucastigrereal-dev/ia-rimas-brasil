/**
 * @fileoverview Componente Spinner de Loading
 * @module components/Loading/Spinner
 */

import React from 'react';

type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl';
type SpinnerColor = 'primary' | 'white' | 'gray';

interface SpinnerProps {
  /** Tamanho do spinner */
  size?: SpinnerSize;
  /** Cor do spinner */
  color?: SpinnerColor;
  /** Texto abaixo do spinner */
  text?: string;
  /** Classes adicionais */
  className?: string;
}

const sizeClasses: Record<SpinnerSize, string> = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-3',
  lg: 'w-12 h-12 border-4',
  xl: 'w-16 h-16 border-4',
};

const colorClasses: Record<SpinnerColor, string> = {
  primary: 'border-purple-500 border-t-transparent',
  white: 'border-white border-t-transparent',
  gray: 'border-gray-400 border-t-transparent',
};

/**
 * Spinner de Loading
 */
export function Spinner({
  size = 'md',
  color = 'primary',
  text,
  className = '',
}: SpinnerProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div
        className={`
          rounded-full animate-spin
          ${sizeClasses[size]}
          ${colorClasses[color]}
        `}
        role="status"
        aria-label="Carregando"
      />
      {text && (
        <p className="text-sm text-gray-400">{text}</p>
      )}
    </div>
  );
}

export default Spinner;
