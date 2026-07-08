import { LocalProgress } from '@/types';

const STORAGE_KEY = 'english3500_progress';

export function getLocalProgress(): LocalProgress {
  if (typeof window === 'undefined') {
    return { masteredIds: [], weakIds: [], practiceCount: 0, lastPracticeDate: null, dailyStreak: 0 };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { masteredIds: [], weakIds: [], practiceCount: 0, lastPracticeDate: null, dailyStreak: 0 };
}

export function saveLocalProgress(progress: LocalProgress): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function updateProgress(wordId: number, isCorrect: boolean): LocalProgress {
  const progress = getLocalProgress();
  progress.practiceCount++;

  const today = new Date().toISOString().split('T')[0];

  // 连续打卡
  if (progress.lastPracticeDate) {
    const lastDate = new Date(progress.lastPracticeDate);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (progress.lastPracticeDate === yesterday.toISOString().split('T')[0]) {
      progress.dailyStreak++;
    } else if (progress.lastPracticeDate !== today) {
      progress.dailyStreak = 1;
    }
  } else {
    progress.dailyStreak = 1;
  }
  progress.lastPracticeDate = today;

  // 更新掌握/薄弱词
  if (isCorrect) {
    progress.weakIds = progress.weakIds.filter(id => id !== wordId);
    if (!progress.masteredIds.includes(wordId)) {
      progress.masteredIds.push(wordId);
    }
  } else {
    progress.masteredIds = progress.masteredIds.filter(id => id !== wordId);
    if (!progress.weakIds.includes(wordId)) {
      progress.weakIds.push(wordId);
    }
  }

  saveLocalProgress(progress);
  return progress;
}

export function getModeLabel(mode: string): string {
  const labels: Record<string, string> = {
    en2cn: '英译中',
    cn2en: '中译英',
    spelling: '拼写练习',
    choice: '选择题',
    dictation: '听写模式',
  };
  return labels[mode] || mode;
}
