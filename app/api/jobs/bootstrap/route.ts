import { NextResponse } from 'next/server';
import { bootstrapJob } from '@/lib/jobs/bootstrap';

export async function POST() {
  const result = await bootstrapJob();
  return NextResponse.json({ ok: true, result });
}
