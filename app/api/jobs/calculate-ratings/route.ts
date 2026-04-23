import { NextResponse } from 'next/server';
import { calculateRatingsJob } from '@/lib/jobs/calculate-ratings';

export async function POST() {
  const result = await calculateRatingsJob();
  return NextResponse.json({ ok: true, result });
}
