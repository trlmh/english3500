const API_BASE = '/api';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: { message: 'Network error' } }));
    throw new Error(error.error?.message || `HTTP ${res.status}`);
  }

  return res.json();
}

export const api = {
  getWords: (params?: { page?: number; limit?: number; unit?: string; search?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.unit) searchParams.set('unit', params.unit);
    if (params?.search) searchParams.set('search', params.search);
    const qs = searchParams.toString();
    return request<any>(`/words${qs ? `?${qs}` : ''}`);
  },

  getRandomWords: (count?: number, exclude?: number[]) => {
    const params = new URLSearchParams();
    if (count) params.set('count', String(count));
    if (exclude?.length) params.set('exclude', exclude.join(','));
    return request<any>(`/words/random?${params}`);
  },

  getUnits: () => request<any>('/words/units'),

  generateQuestions: (mode: string, count?: number, exclude?: number[]) => {
    const params = new URLSearchParams();
    params.set('mode', mode);
    if (count) params.set('count', String(count));
    if (exclude?.length) params.set('exclude', exclude.join(','));
    return request<any>(`/practice/generate?${params}`);
  },

  submitAnswer: (data: { wordId: number; mode: string; userAnswer: string; isCorrect: boolean }) => {
    return request<any>('/practice/submit', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getStats: (days?: number) => {
    const params = days ? `?days=${days}` : '';
    return request<any>(`/practice/stats${params}`);
  },

  getWrongWords: (limit?: number) => {
    return request<any>(`/practice/wrong-words?limit=${limit || 20}`);
  },

  getMastery: () => request<any>('/progress/mastery'),

  getDailyStats: (days?: number) => {
    return request<any>(`/progress/daily?days=${days || 7}`);
  },
};
