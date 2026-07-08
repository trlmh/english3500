import { NextRequest, NextResponse } from 'next/server';
import { dataStore } from '@/lib/data/store';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get('days') || '0') || undefined;
  const stats = dataStore.getStats(days);
  return NextResponse.json(stats);
}
