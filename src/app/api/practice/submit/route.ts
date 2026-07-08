import { NextRequest, NextResponse } from 'next/server';
import { dataStore } from '@/lib/data/store';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { wordId, mode, userAnswer, isCorrect } = body;

    if (!wordId || !mode) {
      return NextResponse.json({ error: { message: 'wordId and mode are required' } }, { status: 400 });
    }

    const word = dataStore.getWordById(wordId);
    if (!word) {
      return NextResponse.json({ error: { message: `Word ${wordId} not found` } }, { status: 404 });
    }

    let correct = false;
    let correctAnswer = '';

    switch (mode) {
      case 'en2cn':
        correctAnswer = word.translation;
        correct = checkTranslation(userAnswer, word.translation);
        break;
      case 'cn2en':
      case 'spelling':
      case 'dictation':
        correctAnswer = word.word;
        correct = userAnswer.trim().toLowerCase() === word.word.toLowerCase();
        break;
      case 'choice':
        correctAnswer = word.translation;
        correct = isCorrect;
        break;
      default:
        return NextResponse.json({ error: { message: `Unknown mode: ${mode}` } }, { status: 400 });
    }

    dataStore.saveRecord(wordId, mode, correct, userAnswer);

    return NextResponse.json({ correct, correctAnswer });
  } catch (error: any) {
    return NextResponse.json({ error: { message: error.message } }, { status: 500 });
  }
}

function checkTranslation(user: string, correct: string): boolean {
  user = user.trim();
  if (user === correct) return true;
  if (user.includes(correct) || correct.includes(user)) return true;
  const parts = correct.split(/[;；,，]/).map(p => p.trim());
  return parts.some(p => user.includes(p) || p.includes(user));
}
