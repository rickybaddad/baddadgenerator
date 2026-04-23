import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const latestPredictions = await prisma.prediction.findMany({
    where: { match: { kickoffAt: { gte: new Date() } } },
    include: {
      match: { include: { homeTeam: true, awayTeam: true } }
    },
    orderBy: [{ match: { kickoffAt: 'asc' } }, { generatedAt: 'desc' }],
    take: 100
  });

  return NextResponse.json({ predictions: latestPredictions });
}
