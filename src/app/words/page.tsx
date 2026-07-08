'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Word } from '@/types';
import { getLocalProgress } from '@/lib/utils';
import { ArrowLeft, CheckCircle, Warning, MagnifyingGlass, BookOpen } from '@phosphor-icons/react';

function WordListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get('type') || 'mastered';

  const [words, setWords] = useState<Word[]>([]);
  const [filtered, setFiltered] = useState<Word[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const progress = getLocalProgress();
    const ids = type === 'mastered' ? progress.masteredIds : progress.weakIds;

    const fetchWords = async () => {
      try {
        const allIds = ids.join(',');
        if (!allIds) {
          setWords([]);
          setFiltered([]);
          setLoading(false);
          return;
        }
        const res = await fetch(`/api/words?ids=${allIds}`);
        const data = await res.json();
        setWords(data.words || []);
        setFiltered(data.words || []);
      } catch {
        setWords([]);
        setFiltered([]);
      }
      setLoading(false);
    };

    fetchWords();
  }, [type]);

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(words);
      return;
    }
    const s = search.toLowerCase();
    setFiltered(
      words.filter(
        w => w.word.toLowerCase().includes(s) || w.translation.includes(s)
      )
    );
  }, [search, words]);

  const title = type === 'mastered' ? '已掌握单词' : '待加强单词';
  const Icon = type === 'mastered' ? CheckCircle : Warning;
  const color = type === 'mastered' ? '#4F8C6C' : '#E07B39';

  return (
    <main className="min-h-[100dvh] bg-[#FAFAF7]">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.push('/')}
            className="p-2 rounded-xl hover:bg-[#E5E7EB] transition-colors"
          >
            <ArrowLeft size={22} />
          </button>
          <div className="flex items-center gap-2">
            <Icon size={24} weight="duotone" color={color} />
            <h1 className="text-2xl font-bold text-[#1A1A2E]">{title}</h1>
          </div>
          <span className="text-sm text-[#6B7280] ml-auto">
            共 {words.length} 词
          </span>
        </div>

        <div className="relative mb-6">
          <MagnifyingGlass
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
          />
          <input
            type="text"
            placeholder="搜索单词或释义..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-[#E5E7EB] bg-white text-[#1A1A2E] placeholder-[#9CA3AF] focus:outline-none focus:border-[#4F8C6C] transition-colors"
          />
        </div>

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
          <div className="space-y-2">
            {filtered.map((word, i) => (
              <motion.div
                key={word.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02, duration: 0.2 }}
                className="bg-white rounded-2xl p-4 border border-[#E5E7EB] hover:border-[#4F8C6C] transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-lg font-semibold text-[#1A1A2E]">
                      {word.word}
                    </span>
                    {word.phonetic && (
                      <span className="text-sm text-[#9CA3AF] ml-2">
                        /{word.phonetic}/
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
            ))}
          </div>
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
