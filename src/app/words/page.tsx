'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Word } from '@/types';
import { getLocalProgress } from '@/lib/utils';
import {
  ArrowLeft,
  CheckCircle,
  Warning,
  MagnifyingGlass,
  BookOpen,
  ListBullets,
  Trophy,
  Target,
  CaretLeft,
  CaretRight,
} from '@phosphor-icons/react';

type FilterType = 'all' | 'mastered' | 'weak';

function WordListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const typeParam = searchParams.get('type') as FilterType | null;

  const [words, setWords] = useState<Word[]>([]);
  const [filtered, setFiltered] = useState<Word[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<FilterType>(typeParam || 'all');
  const [masteredIds, setMasteredIds] = useState<Set<number>>(new Set());
  const [weakIds, setWeakIds] = useState<Set<number>>(new Set());

  // 分页
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const PAGE_SIZE = 50;

  // 加载进度数据
  useEffect(() => {
    const progress = getLocalProgress();
    setMasteredIds(new Set(progress.masteredIds));
    setWeakIds(new Set(progress.weakIds));
  }, []);

  // 同步 URL 参数
  useEffect(() => {
    if (typeParam && typeParam !== filterType) {
      setFilterType(typeParam);
    }
  }, [typeParam]);

  // 加载单词
  const fetchWords = useCallback(async (p: number, fType: FilterType, s: string) => {
    setLoading(true);
    try {
      const progress = getLocalProgress();

      if (fType === 'mastered') {
        const ids = progress.masteredIds.join(',');
        if (!ids) { setWords([]); setFiltered([]); setTotal(0); setLoading(false); return; }
        const res = await fetch(`/api/words?ids=${ids}`);
        const data = await res.json();
        const all = data.words || [];
        if (s) {
          const lower = s.toLowerCase();
          const filtered = all.filter((w: Word) =>
            w.word.toLowerCase().includes(lower) || w.translation.includes(lower)
          );
          setWords(filtered);
          setFiltered(filtered);
          setTotal(filtered.length);
        } else {
          setWords(all);
          setFiltered(all);
          setTotal(all.length);
        }
      } else if (fType === 'weak') {
        const ids = progress.weakIds.join(',');
        if (!ids) { setWords([]); setFiltered([]); setTotal(0); setLoading(false); return; }
        const res = await fetch(`/api/words?ids=${ids}`);
        const data = await res.json();
        const all = data.words || [];
        if (s) {
          const lower = s.toLowerCase();
          const filtered = all.filter((w: Word) =>
            w.word.toLowerCase().includes(lower) || w.translation.includes(lower)
          );
          setWords(filtered);
          setFiltered(filtered);
          setTotal(filtered.length);
        } else {
          setWords(all);
          setFiltered(all);
          setTotal(all.length);
        }
      } else {
        const res = await fetch(`/api/words?page=${p}&limit=${PAGE_SIZE}&search=${encodeURIComponent(s)}`);
        const data = await res.json();
        setWords(data.words || []);
        setFiltered(data.words || []);
        setTotal(data.total || 0);
      }
    } catch {
      setWords([]);
      setFiltered([]);
      setTotal(0);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchWords(page, filterType, search);
  }, [page, filterType, search, fetchWords]);

  const handleFilterChange = (type: FilterType) => {
    setFilterType(type);
    setPage(1);
    setSearch('');
    // 更新 URL
    if (type === 'all') {
      router.replace('/words');
    } else {
      router.replace(`/words?type=${type}`);
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const getTitle = () => {
    switch (filterType) {
      case 'mastered': return '已掌握单词';
      case 'weak': return '待加强单词';
      default: return '完整词表';
    }
  };

  const getIcon = () => {
    switch (filterType) {
      case 'mastered': return <Trophy size={24} weight="duotone" color="#4F8C6C" />;
      case 'weak': return <Target size={24} weight="duotone" color="#E07B39" />;
      default: return <ListBullets size={24} weight="duotone" color="#4F8C6C" />;
    }
  };

  return (
    <main className="min-h-[100dvh] bg-[#FAFAF7]">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* 头部 */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.push('/')}
            className="p-2 rounded-xl hover:bg-[#E5E7EB] transition-colors"
          >
            <ArrowLeft size={22} />
          </button>
          {getIcon()}
          <h1 className="text-2xl font-bold text-[#1A1A2E]">{getTitle()}</h1>
          <span className="text-sm text-[#6B7280] ml-auto">
            共 {total} 词
          </span>
        </div>

        {/* 筛选标签 */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => handleFilterChange('all')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filterType === 'all'
                ? 'bg-[#4F8C6C] text-white'
                : 'bg-white border border-[#E5E7EB] text-[#6B7280] hover:border-[#4F8C6C]'
            }`}
          >
            全部 ({3500})
          </button>
          <button
            onClick={() => handleFilterChange('mastered')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
              filterType === 'mastered'
                ? 'bg-[#4F8C6C] text-white'
                : 'bg-white border border-[#E5E7EB] text-[#6B7280] hover:border-[#4F8C6C]'
            }`}
          >
            <CheckCircle size={16} weight="fill" />
            已掌握 ({masteredIds.size})
          </button>
          <button
            onClick={() => handleFilterChange('weak')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
              filterType === 'weak'
                ? 'bg-[#E07B39] text-white'
                : 'bg-white border border-[#E5E7EB] text-[#6B7280] hover:border-[#E07B39]'
            }`}
          >
            <Warning size={16} weight="fill" />
            待加强 ({weakIds.size})
          </button>
        </div>

        {/* 搜索 */}
        <div className="relative mb-6">
          <MagnifyingGlass
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
          />
          <input
            type="text"
            placeholder="搜索单词或释义..."
            value={search}
            onChange={e => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-[#E5E7EB] bg-white text-[#1A1A2E] placeholder-[#9CA3AF] focus:outline-none focus:border-[#4F8C6C] transition-colors"
          />
        </div>

        {/* 内容 */}
        {loading ? (
          <div className="text-center py-20 text-[#6B7280]">加载中...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen size={48} weight="duotone" className="text-[#D1D5DB] mx-auto mb-4" />
            <p className="text-[#6B7280]">
              {search ? '没有匹配的单词' : '暂无数据，快去练习吧！'}
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {filtered.map((word, i) => {
                const isMastered = masteredIds.has(word.id);
                const isWeak = weakIds.has(word.id);
                return (
                  <motion.div
                    key={word.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.01, 0.3), duration: 0.2 }}
                    className={`bg-white rounded-2xl p-4 border transition-colors ${
                      isMastered
                        ? 'border-[#4F8C6C] bg-[#F0FDF4]'
                        : isWeak
                        ? 'border-[#FED7AA] bg-[#FFF7ED]'
                        : 'border-[#E5E7EB] hover:border-[#4F8C6C]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold text-[#1A1A2E]">
                          {word.word}
                        </span>
                        {word.phonetic && (
                          <span className="text-sm text-[#9CA3AF]">
                            /{word.phonetic}/
                          </span>
                        )}
                        {isMastered && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-[#4F8C6C] text-white">
                            已掌握
                          </span>
                        )}
                        {isWeak && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-[#E07B39] text-white">
                            待加强
                          </span>
                        )}
                      </div>
                      {word.part_of_speech && (
                        <span className="text-xs px-2 py-1 rounded-full bg-[#F3F4F6] text-[#6B7280]">
                          {word.part_of_speech}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[#6B7280] mt-2">{word.translation}</p>
                    {word.unit && (
                      <p className="text-xs text-[#9CA3AF] mt-1">单元：{word.unit}</p>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* 分页（仅全词表模式） */}
            {filterType === 'all' && totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="p-2 rounded-xl border border-[#E5E7EB] bg-white disabled:opacity-30 hover:border-[#4F8C6C] transition-colors"
                >
                  <CaretLeft size={20} />
                </button>
                <span className="text-sm text-[#6B7280]">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="p-2 rounded-xl border border-[#E5E7EB] bg-white disabled:opacity-30 hover:border-[#4F8C6C] transition-colors"
                >
                  <CaretRight size={20} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

export default function WordListPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[100dvh] flex items-center justify-center text-[#6B7280]">
        加载中...
      </div>
    }>
      <WordListContent />
    </Suspense>
  );
}
