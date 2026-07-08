import { NextResponse } from 'next/server';
import { dataStore } from '@/lib/data/store';

export async function GET() {
  const units = dataStore.getUnits();
  return NextResponse.json({ units, total: units.length });
}
