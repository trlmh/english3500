// 纯内存数据存储 - 无数据库依赖，适合 Vercel Serverless
import wordsData from './words.json';
import sentencesData from './sentences.json';

export interface Word {
  id: number;
  word: string;
  translation: string;
  phonetic: string;
  part_of_speech: string;
  unit: string;
  difficulty: number;
}

export interface Sentence {
  word_id: number;
  word: string;
  translation: string;
  phonetic: string;
  part_of_speech: string;
  full_sentence: string;
  blank_sentence: string;
  hint_type: 'first_letter' | 'translation' | 'phonetic';
}

export interface PracticeRecord {
  id: number;
  word_id: number;
  mode: string;
  is_correct: boolean;
  user_answer: string;
  created_at: string;
}

// 从 JSON 加载并分配 ID
let nextId = 1;
const words: Word[] = (wordsData as any[]).map((w) => ({
  id: nextId++,
  word: w.word,
  translation: w.translation,
  phonetic: w.phonetic || '',
  part_of_speech: w.part_of_speech || '',
  unit: w.unit || '',
  difficulty: w.difficulty || 1,
}));

// 内存中的练习记录（Serverless 重启会丢失，用户进度主要靠前端 localStorage）
const practiceRecords: PracticeRecord[] = [];
let recordIdCounter = 1;

// 句子数据
const sentences: Sentence[] = sentencesData as Sentence[];
const sentencesByWordId = new Map<number, Sentence>();
for (const s of sentences) {
  sentencesByWordId.set(s.word_id, s);
}

// 索引
const wordById = new Map<number, Word>();
for (const w of words) {
  wordById.set(w.id, w);
}

export const dataStore = {
  getWordById(id: number): Word | undefined {
    return wordById.get(id);
  },

  getWords(params: { page?: number; limit?: number; unit?: string; search?: string }) {
    const page = params.page || 1;
    const limit = Math.min(params.limit || 20, 100);
    let filtered = [...words];

    if (params.unit) {
      filtered = filtered.filter(w => w.unit === params.unit);
    }
    if (params.search) {
      const s = params.search.toLowerCase();
      filtered = filtered.filter(w =>
        w.word.toLowerCase().includes(s) || w.translation.includes(s)
      );
    }

    filtered.sort((a, b) => a.word.localeCompare(b.word));
    const total = filtered.length;
    const offset = (page - 1) * limit;
    const pageWords = filtered.slice(offset, offset + limit);

    return { words: pageWords, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  getRandomWords(count: number = 10, excludeIds?: number[]): Word[] {
    const excludeSet = new Set(excludeIds || []);
    const pool = words.filter(w => !excludeSet.has(w.id));
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, count);
  },

  getUnits(): string[] {
    const units = new Set<string>();
    for (const w of words) {
      if (w.unit) units.add(w.unit);
    }
    return [...units].sort();
  },

  getTotalCount(): number {
    return words.length;
  },

  saveRecord(wordId: number, mode: string, isCorrect: boolean, userAnswer: string): PracticeRecord {
    const record: PracticeRecord = {
      id: recordIdCounter++,
      word_id: wordId,
      mode,
      is_correct: isCorrect,
      user_answer: userAnswer,
      created_at: new Date().toISOString(),
    };
    practiceRecords.push(record);
    return record;
  },

  getStats(days?: number) {
    let records = practiceRecords;
    if (days) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      records = records.filter(r => new Date(r.created_at) >= cutoff);
    }
    const total = records.length;
    const correct = records.filter(r => r.is_correct).length;
    const byMode: Record<string, { total: number; correct: number; accuracy: number }> = {};
    for (const r of records) {
      if (!byMode[r.mode]) byMode[r.mode] = { total: 0, correct: 0, accuracy: 0 };
      byMode[r.mode].total++;
      if (r.is_correct) byMode[r.mode].correct++;
    }
    for (const mode of Object.keys(byMode)) {
      byMode[mode].accuracy = byMode[mode].total > 0
        ? Math.round((byMode[mode].correct / byMode[mode].total) * 100) : 0;
    }
    return { total, correct, accuracy: total > 0 ? Math.round((correct / total) * 100) : 0, byMode };
  },

  getWrongWords(limit: number = 20): Array<Word & { wrong_count: number }> {
    const wrongMap = new Map<number, number>();
    for (const r of practiceRecords) {
      if (!r.is_correct) wrongMap.set(r.word_id, (wrongMap.get(r.word_id) || 0) + 1);
    }
    return [...wrongMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([wordId, count]) => ({ ...wordById.get(wordId)!, wrong_count: count }))
      .filter(w => w.id);
  },

  getWordMasteryStats() {
    const stats = new Map<number, { total: number; correct: number }>();
    for (const r of practiceRecords) {
      if (!stats.has(r.word_id)) stats.set(r.word_id, { total: 0, correct: 0 });
      const s = stats.get(r.word_id)!;
      s.total++;
      if (r.is_correct) s.correct++;
    }
    return [...stats.entries()]
      .map(([word_id, s]) => ({ word_id, total: s.total, correct: s.correct, accuracy: s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0 }))
      .sort((a, b) => a.accuracy - b.accuracy);
  },

  getDailyStats(days: number = 7) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const dayMap = new Map<string, { total: number; correct: number }>();
    for (const r of practiceRecords) {
      const d = new Date(r.created_at);
      if (d >= cutoff) {
        const key = d.toISOString().split('T')[0];
        if (!dayMap.has(key)) dayMap.set(key, { total: 0, correct: 0 });
        const s = dayMap.get(key)!;
        s.total++;
        if (r.is_correct) s.correct++;
      }
    }
    return [...dayMap.entries()].map(([date, s]) => ({ date, ...s })).sort((a, b) => b.date.localeCompare(a.date));
  },

  getSentenceByWordId(wordId: number): Sentence | undefined {
    return sentencesByWordId.get(wordId);
  },

  getRandomSentences(count: number = 10, excludeWordIds?: number[]): Sentence[] {
    const excludeSet = new Set(excludeWordIds || []);
    const pool = sentences.filter(s => !excludeSet.has(s.word_id));
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, count);
  },
};
