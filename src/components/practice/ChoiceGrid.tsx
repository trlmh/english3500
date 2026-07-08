'use client';

import { motion } from 'framer-motion';
import { Word } from '@/types';

interface ChoiceGridProps {
  options: Word[];
  correctWordId: number;
  mode: string;
  onSelect: (wordId: number) => void;
  disabled: boolean;
  selectedId?: number | null;
  showResult?: boolean;
}

export default function ChoiceGrid({
  options,
  correctWordId,
  mode,
  onSelect,
  disabled,
  selectedId,
  showResult,
}: ChoiceGridProps) {
  const getOptionText = (word: Word) => {
    // 选择题模式：题目是英文单词，选项显示中文释义
    return word.translation;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {options.map((word, index) => {
        const isSelected = selectedId === word.id;
        const isCorrectOption = word.id === correctWordId;
        let borderColor = 'border-[#E5E7EB]';
        let bgColor = 'bg-[#FFFFFF]';

        if (showResult) {
          if (isCorrectOption) {
            borderColor = 'border-green-400';
            bgColor = 'bg-green-50';
          } else if (isSelected && !isCorrectOption) {
            borderColor = 'border-red-400';
            bgColor = 'bg-red-50';
          }
        } else if (isSelected) {
          borderColor = 'border-[#4F8C6C]';
          bgColor = 'bg-[#4F8C6C]/5';
        }

        return (
          <motion.button
            key={word.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.2 }}
            whileHover={!disabled ? { scale: 1.02 } : undefined}
            whileTap={!disabled ? { scale: 0.98 } : undefined}
            onClick={() => !disabled && onSelect(word.id)}
            disabled={disabled}
            className={`p-4 rounded-xl border-2 ${borderColor} ${bgColor} text-left transition-colors duration-200 disabled:cursor-default`}
          >
            <span className="text-base font-medium text-[#1A1A2E]">
              {String.fromCharCode(65 + index)}. {getOptionText(word)}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
