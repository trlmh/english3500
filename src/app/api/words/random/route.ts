import { NextRequest, NextResponse } from 'next/server';
import { dataStore } from '@/lib/data/store';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  try {
    const count = parseInt(searchParams.get('count') || '10');
    const exclude = searchParams.get('exclude')?.split(',').map(Number).filter(Boolean);
    const words = dataStore.getRandomWords(count, exclude);
    return NextResponse.json({ words });
  } catch (error: any) {
    return NextResponse.json({ error: { message: error.message } }, { status: 500 });
  }
}
