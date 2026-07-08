'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Word } from '@/types';
import { SpeakerHigh } from '@phosphor-icons/react';

interface WordCardProps {
  word: Word;
  mode: string;
  showAnswer: boolean;
  isCorrect?: boolean | null;
  questionNumber: number;
  totalQuestions: number;
}

export default function WordCard({ word, mode, showAnswer, isCorrect, questionNumber, totalQuestions }: WordCardProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  const isDictation = mode === 'dictation';

  // 朗读单词
  const speak = () => {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word.word);
    utterance.lang = 'en-US';
    utterance.rate = 0.85;
    utterance.pitch = 1;

    // 尝试选英文语音
    const voices = window.speechSynthesis.getVoices();
    const enVoice = voices.find(v => v.lang.startsWith('en'));
    if (enVoice) utterance.voice = enVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // 听写模式自动朗读
  useEffect(() => {
    if (isDictation) {
      // 等待 voices 加载
      const loadVoices = () => {
        window.speechSynthesis.getVoices();
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;

      // 延迟一下确保 voices 已加载
      const timer = setTimeout(() => speak(), 400);
      return () => {
        clearTimeout(timer);
        window.speechSynthesis.cancel();
      };
    }
  }, [word.id, isDictation]);

  const getPrompt = () => {
    switch (mode) {
      case 'en2cn':
        return { text: word.word, sub: word.phonetic, hint: word.part_of_speech };
      case 'cn2en':
        return { text: word.translation, sub: word.phonetic, hint: word.part_of_speech };
      case 'spelling':
        return { text: word.translation, sub: word.phonetic, hint: `词性: ${word.part_of_speech}` };
      case 'choice':
        return { text: word.word, sub: word.phonetic, hint: word.part_of_speech };
      case 'dictation':
        return { text: '', sub: '', hint: word.part_of_speech };
      default:
        return { text: word.word, sub: '', hint: '' };
    }
  };

  const prompt = getPrompt();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${word.id}-${questionNumber}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.2 }}
        className="bg-[#FFFFFF] rounded-2xl shadow-sm border border-[#E5E7EB] p-8 md:p-10 text-center"
      >
        <div className="text-sm text-[#6B7280] mb-6">
          {questionNumber} / {totalQuestions}
        </div>

        {/* 听写模式：播放按钮 */}
        {isDictation ? (
          <div className="mb-6">
            {prompt.hint && (
              <span className="inline-block px-3 py-1 rounded-full bg-gray-100 text-xs text-[#6B7280] mb-6">
                {prompt.hint}
              </span>
            )}
            <button
              onClick={speak}
              disabled={isSpeaking}
              className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto transition-all duration-150 ${
                isSpeaking
                  ? 'bg-[#4F8C6C] text-white scale-110'
                  : 'bg-[#4F8C6C]/10 text-[#4F8C6C] hover:bg-[#4F8C6C]/20 hover:scale-105'
              }`}
            >
              <SpeakerHigh size={40} weight="fill" />
            </button>
            <p className="text-sm text-[#6B7280] mt-4">
              {isSpeaking ? '正在朗读...' : '点击播放 / 听发音写出单词'}
            </p>
          </div>
        ) : (
          <div className="mb-6">
            {prompt.hint && (
              <span className="inline-block px-3 py-1 rounded-full bg-gray-100 text-xs text-[#6B7280] mb-4">
                {prompt.hint}
              </span>
            )}
            <h2 className="text-3xl md:text-5xl tracking-tight font-bold text-[#1A1A2E] mb-2">
              {prompt.text}
            </h2>
            {prompt.sub && (
              <p className="text-sm text-[#6B7280]">{prompt.sub}</p>
            )}
          </div>
        )}

        {/* 反馈 */}
        {showAnswer && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className={`p-4 rounded-xl ${
              isCorrect
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            <p className="font-semibold text-lg mb-1">
              {isCorrect ? '✓ 正确！' : '✗ 错误'}
            </p>
            <p className="text-sm opacity-80">
              正确答案：<span className="font-medium">{word.word}</span>（{word.translation}）
            </p>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
