export interface Word {
  id: number;
  word: string;
  translation: string;
  phonetic: string;
  part_of_speech: string;
  unit: string;
  difficulty: number;
}

export type PracticeMode = 'en2cn' | 'cn2en' | 'spelling' | 'choice' | 'dictation' | 'context';

export interface PracticeModeInfo {
  id: PracticeMode;
  name: string;
  description: string;
  icon: string;
}

export interface PracticeQuestion {
  word: Word;
  options?: Word[];
  sentence?: {
    word_id: number;
    word: string;
    translation: string;
    phonetic: string;
    full_sentence: string;
    blank_sentence: string;
    hint_type: 'first_letter' | 'translation' | 'phonetic';
  } | null;
}

export interface PracticeResult {
  correct: boolean;
  correctAnswer: string;
}

export interface PracticeStats {
  total: number;
  correct: number;
  accuracy: number;
  byMode: Record<string, { total: number; correct: number; accuracy: number }>;
}

export interface WordListResult {
  words: Word[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 本地进度存储
export interface LocalProgress {
  masteredIds: number[];
  weakIds: number[];
  practiceCount: number;
  lastPracticeDate: string | null;
  dailyStreak: number;
}
