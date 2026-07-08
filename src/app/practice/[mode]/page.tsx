'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import WordCard from '@/components/practice/WordCard';
import AnswerInput from '@/components/practice/AnswerInput';
import ChoiceGrid from '@/components/practice/ChoiceGrid';
import Progress from '@/components/ui/Progress';
import Button from '@/components/ui/Button';
import { PracticeMode, PracticeQuestion } from '@/types';
import { api } from '@/lib/api';
import { updateProgress, getLocalProgress, getModeLabel } from '@/lib/utils';
import { ArrowLeft, Play } from '@phosphor-icons/react';

const QUESTIONS_PER_ROUND = 10;

interface QuestionState {
  isCorrect?: boolean;
  correctAnswer?: string;
  userAnswer?: string;
}

export default function PracticePage() {
  const params = useParams();
  const router = useRouter();
  const mode = params.mode as PracticeMode;

  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [questionStates, setQuestionStates] = useState<Record<number, QuestionState>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [roundFinished, setRoundFinished] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const isChoiceMode = mode === 'choice';

  const loadQuestions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const progress = getLocalProgress();
      const excludeIds = [...progress.masteredIds.slice(-100), ...progress.weakIds.slice(-50)];
      const { questions: qs } = await api.generateQuestions(mode, QUESTIONS_PER_ROUND, excludeIds);
      setQuestions(qs);
      setCurrentIndex(0);
      setQuestionStates({});
      setSelectedChoice(null);
      setRoundFinished(false);
      setScore({ correct: 0, total: 0 });
    } catch (err: any) {
      setError(err.message || '加载题目失败');
    } finally {
      setLoading(false);
    }
  }, [mode]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  const currentQuestion = questions[currentIndex];
  const currentState = questionStates[currentIndex];

  // 后端异步记录（不阻塞 UI）
  const recordToBackend = (wordId: number, userAnswer: string, isCorrect: boolean) => {
    api.submitAnswer({
      wordId,
      mode,
      userAnswer,
      isCorrect,
    }).catch(() => {}); // 静默失败，不阻塞 UI
  };

  // 选择题：即时判断，无需等后端
  const handleChoiceSelect = (wordId: number) => {
    if (currentState) return; // 已回答
    if (!currentQuestion) return;

    setSelectedChoice(wordId);
    const isCorrect = wordId === currentQuestion.word.id;
    const correctAnswer = currentQuestion.word.translation;
    const selectedWord = currentQuestion.options?.find(w => w.id === wordId);
    const userAnswer = selectedWord?.translation || '';

    // 即时更新状态
    setQuestionStates(prev => ({
      ...prev,
      [currentIndex]: { isCorrect, correctAnswer, userAnswer },
    }));
    setScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }));

    // 更新本地进度
    updateProgress(currentQuestion.word.id, isCorrect);

    // 异步记录到后端
    recordToBackend(currentQuestion.word.id, userAnswer, isCorrect);
  };

  // 输入题：需要等后端判断
  const handleInputSubmit = async (answer: string) => {
    if (currentState) return;
    if (!currentQuestion) return;

    try {
      const result = await api.submitAnswer({
        wordId: currentQuestion.word.id,
        mode,
        userAnswer: answer,
        isCorrect: false, // 后端判断
      });

      const isCorrect = result.correct;
      updateProgress(currentQuestion.word.id, isCorrect);

      setQuestionStates(prev => ({
        ...prev,
        [currentIndex]: {
          isCorrect,
          correctAnswer: result.correctAnswer,
          userAnswer: answer,
        },
      }));
      setScore(prev => ({
        correct: prev.correct + (isCorrect ? 1 : 0),
        total: prev.total + 1,
      }));
    } catch (err: any) {
      console.error('Submit error:', err);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedChoice(null);
    } else {
      setRoundFinished(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-[#4F8C6C] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#6B7280]">加载题目中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center">
        <div className="text-center max-w-md">
          <p className="text-[#F87171] mb-4">{error}</p>
          <Button onClick={loadQuestions}>重试</Button>
        </div>
      </div>
    );
  }

  if (roundFinished) {
    const accuracy = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;
    return (
      <div className="min-h-[100dvh] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          className="bg-[#FFFFFF] rounded-2xl shadow-sm border border-[#E5E7EB] p-8 md:p-10 max-w-md w-full text-center"
        >
          <div className="text-5xl mb-4">
            {accuracy >= 80 ? '🎉' : accuracy >= 60 ? '👍' : '💪'}
          </div>
          <h2 className="text-2xl font-bold text-[#1A1A2E] mb-2">本轮完成！</h2>
          <p className="text-[#6B7280] mb-6">
            {getModeLabel(mode)} · 正确率 {accuracy}%
          </p>

          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{score.correct}</div>
              <div className="text-xs text-[#6B7280]">正确</div>
            </div>
            <div className="text-2xl text-[#6B7280]">/</div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#1A1A2E]">{score.total}</div>
              <div className="text-xs text-[#6B7280]">总计</div>
            </div>
          </div>

          <Progress value={accuracy} label="正确率" showPercentage className="mb-8" />

          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => router.push('/')} className="flex-1">
              <ArrowLeft size={18} />
              返回首页
            </Button>
            <Button onClick={loadQuestions} className="flex-1">
              <Play size={18} />
              再来一轮
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh]">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-[#1A1A2E] transition-colors"
          >
            <ArrowLeft size={18} />
            返回
          </button>
          <span className="text-sm font-medium text-[#1A1A2E]">
            {getModeLabel(mode)}
          </span>
          <div className="flex items-center gap-1 text-sm">
            <span className="text-green-500 font-medium">{score.correct}</span>
            <span className="text-[#6B7280]">/</span>
            <span className="text-[#6B7280]">{score.total}</span>
          </div>
        </div>

        <Progress
          value={currentIndex + 1}
          max={questions.length}
          size="sm"
          className="mb-8"
        />

        {currentQuestion && (
          <WordCard
            word={currentQuestion.word}
            mode={mode}
            showAnswer={!!currentState}
            isCorrect={currentState?.isCorrect}
            questionNumber={currentIndex + 1}
            totalQuestions={questions.length}
          />
        )}

        <div className="mt-6">
          {isChoiceMode && currentQuestion?.options ? (
            <ChoiceGrid
              options={currentQuestion.options}
              correctWordId={currentQuestion.word.id}
              mode={mode}
              onSelect={handleChoiceSelect}
              disabled={!!currentState}
              selectedId={selectedChoice}
              showResult={!!currentState}
            />
          ) : (
            <AnswerInput
              mode={mode}
              onSubmit={handleInputSubmit}
              disabled={!!currentState}
            />
          )}
        </div>

        {currentState && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }}
            className="mt-6 flex justify-center"
          >
            <Button onClick={handleNext} size="lg">
              {currentIndex < questions.length - 1 ? '下一题' : '查看结果'}
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
