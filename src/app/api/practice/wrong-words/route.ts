import { NextRequest, NextResponse } from 'next/server';
import { dataStore } from '@/lib/data/store';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '20');
  const words = dataStore.getWrongWords(limit);
  return NextResponse.json({ words });
}
