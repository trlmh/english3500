'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';

interface AnswerInputProps {
  mode: string;
  onSubmit: (answer: string) => void;
  disabled: boolean;
  placeholder?: string;
}

export default function AnswerInput({ mode, onSubmit, disabled, placeholder }: AnswerInputProps) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.focus();
    }
  }, [disabled]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim() || disabled) return;
    onSubmit(value.trim());
    setValue('');
  };

  const getPlaceholder = () => {
    if (placeholder) return placeholder;
    switch (mode) {
      case 'en2cn': return '输入中文释义...';
      case 'cn2en': return '输入英文单词...';
      case 'spelling': return '拼写英文单词...';
      case 'dictation': return '输入听到的单词...';
      default: return '输入答案...';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <motion.input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={getPlaceholder()}
        disabled={disabled}
        className="flex-1 px-5 py-3 rounded-xl border border-[#E5E7EB] bg-[#FFFFFF] text-[#1A1A2E] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#4F8C6C] focus:border-transparent text-base disabled:opacity-50 transition-all"
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
      />
      <Button type="submit" disabled={disabled || !value.trim()} size="md">
        确认
      </Button>
    </form>
  );
}
