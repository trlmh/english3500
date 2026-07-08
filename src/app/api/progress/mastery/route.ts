import { NextResponse } from 'next/server';
import { dataStore } from '@/lib/data/store';

export async function GET() {
  const stats = dataStore.getWordMasteryStats();
  return NextResponse.json({ stats });
}
