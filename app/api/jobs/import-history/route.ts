import { NextResponse } from 'next/server';
import { importHistoryJob } from '@/lib/jobs/import-history';

export async function POST() {
  const result = await importHistoryJob();
  return NextResponse.json({ ok: true, result });
}
