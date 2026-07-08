'use client';

import { motion } from 'framer-motion';

interface ProgressProps {
  value: number;
  max?: number;
  label?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export default function Progress({
  value,
  max = 100,
  label,
  showPercentage = false,
  size = 'md',
  className = '',
}: ProgressProps) {
  const percentage = Math.min(Math.round((value / max) * 100), 100);
  const height = size === 'sm' ? 'h-1.5' : 'h-2.5';

  return (
    <div className={`w-full ${className}`}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-sm text-[#6B7280]">{label}</span>}
          {showPercentage && <span className="text-sm font-medium text-[#1A1A2E]">{percentage}%</span>}
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full ${height} overflow-hidden`}>
        <motion.div
          className={`${height} rounded-full bg-[#4F8C6C]`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
