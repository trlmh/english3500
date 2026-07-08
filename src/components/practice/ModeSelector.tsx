'use client';

import { motion } from 'framer-motion';
import { PracticeMode, PracticeModeInfo } from '@/types';
import { BookOpen, PencilLine, Keyboard, ListChecks, Headphones } from '@phosphor-icons/react';

const modes: PracticeModeInfo[] = [
  { id: 'en2cn', name: '英译中', description: '看到英文单词，选择或输入中文释义', icon: 'BookOpen' },
  { id: 'cn2en', name: '中译英', description: '看到中文释义，拼写出英文单词', icon: 'PencilLine' },
  { id: 'spelling', name: '拼写练习', description: '听发音看释义，正确拼写单词', icon: 'Keyboard' },
  { id: 'choice', name: '选择题', description: '四选一，选出正确的中文或英文', icon: 'ListChecks' },
  { id: 'dictation', name: '听写模式', description: '听单词发音，写出对应英文', icon: 'Headphones' },
];

const iconMap: Record<string, React.ReactNode> = {
  BookOpen: <BookOpen size={28} weight="duotone" />,
  PencilLine: <PencilLine size={28} weight="duotone" />,
  Keyboard: <Keyboard size={28} weight="duotone" />,
  ListChecks: <ListChecks size={28} weight="duotone" />,
  Headphones: <Headphones size={28} weight="duotone" />,
};

interface ModeSelectorProps {
  onSelect: (mode: PracticeMode) => void;
}

export default function ModeSelector({ onSelect }: ModeSelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {modes.map((mode, index) => (
        <motion.button
          key={mode.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.08, duration: 0.3 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onSelect(mode.id)}
          className="group relative bg-[#FFFFFF] rounded-2xl p-6 text-left border border-[#E5E7EB] hover:border-[#4F8C6C] hover:shadow-md transition-all duration-200"
        >
          <div className="w-12 h-12 rounded-xl bg-[#4F8C6C]/10 flex items-center justify-center text-[#4F8C6C] mb-4 group-hover:bg-[#4F8C6C] group-hover:text-white transition-colors duration-200">
            {iconMap[mode.icon]}
          </div>
          <h3 className="text-lg font-semibold text-[#1A1A2E] mb-1.5">{mode.name}</h3>
          <p className="text-sm text-[#6B7280] leading-relaxed">{mode.description}</p>
        </motion.button>
      ))}
    </div>
  );
}
