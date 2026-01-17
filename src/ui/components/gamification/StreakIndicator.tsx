import React from 'react';
import { motion } from 'framer-motion';

interface StreakIndicatorProps {
  currentStreak: number;
  bestStreak: number;
  isAtRisk: boolean;
  multiplier: number;
}

export const StreakIndicator: React.FC<StreakIndicatorProps> = ({
  currentStreak,
  bestStreak,
  isAtRisk,
  multiplier
}) => {
  return (
    <div className="flex items-center gap-4 p-3 bg-gradient-to-r from-orange-100 to-red-100 rounded-lg">
      <motion.div
        className="text-3xl"
        animate={isAtRisk ? { scale: [1, 1.1, 1] } : undefined}
        transition={isAtRisk ? { duration: 0.5, repeat: Infinity } : undefined}
      >
        🔥
      </motion.div>

      <div className="flex-1">
        <p className="font-bold text-sm">
          Streak: {currentStreak} dias
          {isAtRisk && <span className="text-red-600 ml-2">(EM RISCO!)</span>}
        </p>
        <p className="text-xs text-gray-600">
          Melhor: {bestStreak} dias • Multiplicador: {multiplier.toFixed(1)}x
        </p>
      </div>

      {currentStreak > 0 && (
        <div className="text-center">
          <p className="text-2xl font-bold text-orange-600">{currentStreak}</p>
          <p className="text-xs text-gray-600">dias</p>
        </div>
      )}
    </div>
  );
};
