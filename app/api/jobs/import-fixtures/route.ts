import { NextResponse } from 'next/server';
import { importFixturesJob } from '@/lib/jobs/import-fixtures';

export async function POST() {
  const result = await importFixturesJob();
  return NextResponse.json({ ok: true, result });
}
