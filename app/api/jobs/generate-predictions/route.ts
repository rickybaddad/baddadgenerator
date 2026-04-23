import { NextResponse } from 'next/server';
import { generatePredictionsJob } from '@/lib/jobs/generate-predictions';

export async function POST() {
  const result = await generatePredictionsJob();
  return NextResponse.json({ ok: true, result });
}
