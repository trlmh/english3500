'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export default function Card({ children, className = '', hover = false, onClick }: CardProps) {
  return (
    <motion.div
      className={`bg-[#FFFFFF] rounded-2xl shadow-sm border border-[#E5E7EB] p-6 md:p-8 ${hover ? 'cursor-pointer' : ''} ${className}`}
      whileHover={hover ? { scale: 1.02, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' } : undefined}
      whileTap={hover ? { scale: 0.98 } : undefined}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}
