'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import ModeSelector from '@/components/practice/ModeSelector';
import Progress from '@/components/ui/Progress';
import Button from '@/components/ui/Button';
import { PracticeMode } from '@/types';
import { getLocalProgress } from '@/lib/utils';
import { api } from '@/lib/api';
import {
  BookOpen, Fire, Target, Trophy, ListBullets,
  Funnel, CheckCircle, X,
} from '@phosphor-icons/react';

interface UnitGroup {
  unit: string;
  words: { id: number; word: string }[];
  selected: boolean;
}

export default function HomePage() {
  const router = useRouter();
  const [progress, setProgress] = useState(getLocalProgress());
  const [showRangeSelector, setShowRangeSelector] = useState(false);
  const [unitGroups, setUnitGroups] = useState<UnitGroup[]>([]);
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [selectedRange, setSelectedRange] = useState<{
    type: 'all' | 'units' | 'letters';
    label: string;
    wordIds?: number[];
  }>({ type: 'all', label: '全部 3500 词' });
  const [letterFilter, setLetterFilter] = useState<string[]>([]);

  useEffect(() => {
    setProgress(getLocalProgress());
  }, []);

  // 加载单元数据
  const loadUnitGroups = async () => {
    setLoadingUnits(true);
    try {
      // 获取所有单词（分页获取）
      const allWords: { id: number; word: string; unit: string }[] = [];
      let page = 1;
      while (true) {
        const res = await api.getWords({ page, limit: 100 });
        allWords.push(...res.words.map((w: any) => ({ id: w.id, word: w.word, unit: w.unit || '' })));
        if (page >= res.totalPages) break;
        page++;
      }
      // 按单元分组
      const groupMap = new Map<string, { id: number; word: string }[]>();
      for (const w of allWords) {
        const key = w.unit || '未分类';
        if (!groupMap.has(key)) groupMap.set(key, []);
        groupMap.get(key)!.push({ id: w.id, word: w.word });
      }
      const groups: UnitGroup[] = [];
      for (const [unit, words] of groupMap) {
        groups.push({ unit, words, selected: false });
      }
      groups.sort((a, b) => a.unit.localeCompare(b.unit));
      setUnitGroups(groups);
    } catch (e) {
      console.error('Failed to load units', e);
    }
    setLoadingUnits(false);
  };

  const handleOpenRangeSelector = () => {
    if (unitGroups.length === 0) loadUnitGroups();
    setShowRangeSelector(true);
  };

  // 切换单个单元
  const toggleUnit = (index: number) => {
    setUnitGroups(prev => prev.map((g, i) => i === index ? { ...g, selected: !g.selected } : g));
  };

  // 全选/取消全选
  const toggleAllUnits = () => {
    const allSelected = unitGroups.every(g => g.selected);
    setUnitGroups(prev => prev.map(g => ({ ...g, selected: !allSelected })));
  };

  // 按首字母选择
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const toggleLetter = (letter: string) => {
    setLetterFilter(prev =>
      prev.includes(letter) ? prev.filter(l => l !== letter) : [...prev, letter]
    );
  };

  // 确认范围选择
  const confirmRange = () => {
    const selectedUnits = unitGroups.filter(g => g.selected);
    const hasLetterFilter = letterFilter.length > 0;

    if (hasLetterFilter) {
      // 按首字母筛选：先按单元筛选（如果选了单元），再按首字母筛选
      let pool: { id: number; word: string }[] = [];
      if (selectedUnits.length > 0) {
        pool = selectedUnits.flatMap(g => g.words);
      } else {
        pool = unitGroups.flatMap(g => g.words);
      }
      const wordIds = pool
        .filter(w => letterFilter.includes(w.word[0].toUpperCase()))
        .map(w => w.id);

      const unitLabel = selectedUnits.length > 0
        ? selectedUnits.map(g => g.unit).join('、')
        : '全部单元';
      setSelectedRange({
        type: 'letters',
        label: `${unitLabel} · ${letterFilter.join('')}开头 · ${wordIds.length} 词`,
        wordIds,
      });
    } else if (selectedUnits.length > 0 && selectedUnits.length < unitGroups.length) {
      const wordIds = selectedUnits.flatMap(g => g.words.map(w => w.id));
      setSelectedRange({
        type: 'units',
        label: `${selectedUnits.map(g => g.unit).join('、')} · ${wordIds.length} 词`,
        wordIds,
      });
    } else {
      setSelectedRange({ type: 'all', label: '全部 3500 词' });
    }

    setShowRangeSelector(false);
  };

  const handleModeSelect = (mode: PracticeMode) => {
    const params = new URLSearchParams();
    params.set('mode', mode);
    if (selectedRange.wordIds && selectedRange.wordIds.length > 0) {
      params.set('wordIds', selectedRange.wordIds.join(','));
    }
    params.set('rangeLabel', selectedRange.label);
    router.push(`/practice/${mode}?${params.toString()}`);
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

  const allSelected = unitGroups.length > 0 && unitGroups.every(g => g.selected);

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

        {/* 范围选择区域 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38, duration: 0.4 }}
          className="mb-8"
        >
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E7EB] p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Funnel size={20} weight="duotone" className="text-[#4F8C6C]" />
                <span className="font-semibold text-[#1A1A2E]">练习范围</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleOpenRangeSelector}
              >
                更改范围
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#4F8C6C]/10 text-[#4F8C6C] text-sm font-medium">
                <CheckCircle size={16} weight="fill" />
                {selectedRange.label}
              </span>
            </div>
          </div>
        </motion.div>

        {/* 范围选择弹窗 */}
        {showRangeSelector && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] bg-black/40" onClick={() => setShowRangeSelector(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#FAFAF7] rounded-2xl shadow-xl border border-[#E5E7EB] w-full max-w-lg mx-4 max-h-[70vh] flex flex-col"
            >
              {/* 弹窗头部 */}
              <div className="flex items-center justify-between p-4 border-b border-[#E5E7EB]">
                <h3 className="font-semibold text-[#1A1A2E] text-lg">选择练习范围</h3>
                <button onClick={() => setShowRangeSelector(false)} className="p-1.5 rounded-lg hover:bg-[#E5E7EB] transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* 弹窗内容 */}
              <div className="overflow-y-auto p-4 space-y-4">
                {/* 快速选择 */}
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => { setUnitGroups(prev => prev.map(g => ({ ...g, selected: true }))); setLetterFilter([]); }}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${allSelected && letterFilter.length === 0 ? 'bg-[#4F8C6C] text-white' : 'bg-white border border-[#E5E7EB] text-[#6B7280] hover:border-[#4F8C6C]'}`}
                  >
                    全选
                  </button>
                  <button
                    onClick={() => { setUnitGroups(prev => prev.map(g => ({ ...g, selected: false }))); setLetterFilter([]); }}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium bg-white border border-[#E5E7EB] text-[#6B7280] hover:border-[#4F8C6C] transition-colors"
                  >
                    清空
                  </button>
                </div>

                {/* 按首字母筛选 */}
                <div>
                  <p className="text-xs text-[#6B7280] mb-2 font-medium">按首字母筛选</p>
                  <div className="flex flex-wrap gap-1.5">
                    {letters.map(l => (
                      <button
                        key={l}
                        onClick={() => toggleLetter(l)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${
                          letterFilter.includes(l)
                            ? 'bg-[#4F8C6C] text-white'
                            : 'bg-white border border-[#E5E7EB] text-[#6B7280] hover:border-[#4F8C6C]'
                        }`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 按单元选择 */}
                <div>
                  <p className="text-xs text-[#6B7280] mb-2 font-medium">按单元选择</p>
                  {loadingUnits ? (
                    <div className="text-center py-8 text-[#6B7280] text-sm">加载中...</div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-[30vh] overflow-y-auto">
                      {unitGroups.map((group, i) => (
                        <button
                          key={group.unit}
                          onClick={() => toggleUnit(i)}
                          className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                            group.selected
                              ? 'bg-[#4F8C6C]/10 border border-[#4F8C6C] text-[#4F8C6C]'
                              : 'bg-white border border-[#E5E7EB] text-[#6B7280] hover:border-[#4F8C6C]'
                          }`}
                        >
                          <span className="font-medium">{group.unit}</span>
                          <span className="text-xs ml-1 opacity-60">({group.words.length})</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 弹窗底部 */}
              <div className="p-4 border-t border-[#E5E7EB] flex gap-3">
                <Button variant="secondary" onClick={() => setShowRangeSelector(false)} className="flex-1">
                  取消
                </Button>
                <Button onClick={confirmRange} className="flex-1">
                  确认范围
                </Button>
              </div>
            </motion.div>
          </div>
        )}

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
