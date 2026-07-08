'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import ModeSelector from '@/components/practice/ModeSelector';
import Progress from '@/components/ui/Progress';
import Button from '@/components/ui/Button';
import { PracticeMode } from '@/types';
import { getLocalProgress } from '@/lib/utils';
import { BookOpen, Fire, Target, Trophy, ListBullets } from '@phosphor-icons/react';

export default function HomePage() {
  const router = useRouter();
  const [progress, setProgress] = useState(getLocalProgress());

  useEffect(() => {
    setProgress(getLocalProgress());
  }, []);

  const handleModeSelect = (mode: PracticeMode) => {
    router.push(`/practice/${mode}`);
  };

  const stats = [
    {
      icon: <BookOpen size={22} weight="duotone" />,
      label: '已练习',
      value: `${progress.practiceCount} 次`,
      clickable: false,
    },
    {
      icon: <Fire size={22} weight="duotone" />,
      label: '连续打卡',
      value: `${progress.dailyStreak} 天`,
      clickable: false,
    },
    {
      icon: <Trophy size={22} weight="duotone" />,
      label: '已掌握',
      value: `${progress.masteredIds.length} 词`,
      clickable: true,
      href: '/words?type=mastered',
    },
    {
      icon: <Target size={22} weight="duotone" />,
      label: '待加强',
      value: `${progress.weakIds.length} 词`,
      clickable: true,
      href: '/words?type=weak',
    },
  ];

  return (
    <main className="min-h-[100dvh]">
      <div className="max-w-4xl mx-auto px-4 py-16 md:py-24">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-6xl tracking-tighter font-bold text-[#1A1A2E] mb-4">
            高中英语
            <span className="text-[#4F8C6C]">3500词</span>
          </h1>
          <p className="text-base leading-relaxed max-w-[65ch] mx-auto text-[#6B7280]">
            覆盖高考大纲全部词汇，支持多种练习模式，随时随地高效背单词
          </p>
        </motion.div>

        {/* 统计卡片 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12"
        >
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              onClick={() => stat.clickable && stat.href && router.push(stat.href)}
              className={`bg-[#FFFFFF] rounded-2xl p-4 border border-[#E5E7EB] text-center ${
                stat.clickable
                  ? 'cursor-pointer hover:border-[#4F8C6C] hover:shadow-sm transition-all'
                  : ''
              }`}
            >
              <div className="text-[#4F8C6C] mb-2 flex justify-center">{stat.icon}</div>
              <div className="text-2xl font-bold text-[#1A1A2E]">{stat.value}</div>
              <div className="text-xs text-[#6B7280] mt-1">
                {stat.label}
                {stat.clickable && <span className="ml-1 opacity-40">→</span>}
              </div>
            </div>
          ))}
        </motion.div>

        {/* 掌握进度 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="mb-12"
        >
          <Progress
            value={progress.masteredIds.length}
            max={3500}
            label="掌握进度"
            showPercentage
          />
        </motion.div>

        {/* 词表入口 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
          className="mb-8"
        >
          <Button
            onClick={() => router.push('/words')}
            variant="secondary"
            size="lg"
            className="w-full py-4 text-lg rounded-2xl"
          >
            <ListBullets size={24} weight="duotone" />
            查看完整词表
          </Button>
        </motion.div>

        {/* 练习模式选择 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          <h2 className="text-2xl md:text-3xl font-semibold text-[#1A1A2E] mb-6">
            选择练习模式
          </h2>
          <ModeSelector onSelect={handleModeSelect} />
        </motion.div>

        {/* 底部 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.4 }}
          className="text-center mt-16 text-sm text-[#6B7280]"
        >
          数据来源：高考英语大纲词汇表 · 共 3500 词
        </motion.div>
      </div>
    </main>
  );
}
