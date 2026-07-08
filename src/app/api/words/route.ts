import { NextRequest, NextResponse } from 'next/server';
import { dataStore } from '@/lib/data/store';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  try {
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const unit = searchParams.get('unit') || undefined;
    const search = searchParams.get('search') || undefined;
    const result = dataStore.getWords({ page, limit, unit, search });
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: { message: error.message } }, { status: 500 });
  }
}
