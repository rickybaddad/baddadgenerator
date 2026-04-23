import { NextResponse } from 'next/server';
import { importOddsJob } from '@/lib/jobs/import-odds';

export async function POST() {
  const result = await importOddsJob();
  return NextResponse.json({ ok: true, result });
}
