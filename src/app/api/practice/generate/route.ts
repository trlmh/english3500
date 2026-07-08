import { NextRequest, NextResponse } from 'next/server';
import { dataStore } from '@/lib/data/store';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  try {
    const mode = searchParams.get('mode') || 'en2cn';
    const count = parseInt(searchParams.get('count') || '10');
    const exclude = searchParams.get('exclude')?.split(',').map(Number).filter(Boolean);
    const words = dataStore.getRandomWords(Math.min(count, 30), exclude);

    const questions = words.map(word => {
      const q: any = { word };
      if (mode === 'choice') {
        const distractors = dataStore.getRandomWords(3, [word.id, ...(exclude || [])]);
        q.options = [word, ...distractors].sort(() => Math.random() - 0.5);
      }
      if (mode === 'context') {
        const sentence = dataStore.getSentenceByWordId(word.id);
        q.sentence = sentence || null;
      }
      return q;
    });

    return NextResponse.json({ questions });
  } catch (error: any) {
    return NextResponse.json({ error: { message: error.message } }, { status: 500 });
  }
}
