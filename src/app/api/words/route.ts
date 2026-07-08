import { NextRequest, NextResponse } from 'next/server';
import { dataStore } from '@/lib/data/store';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  try {
    const ids = searchParams.get('ids');
    // 按 ID 列表查询（用于查看已掌握/待加强单词）
    if (ids) {
      const idList = ids.split(',').map(Number).filter(n => !isNaN(n));
      const words = idList.map(id => dataStore.getWordById(id)).filter(Boolean);
      return NextResponse.json({ words, total: words.length });
    }
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
