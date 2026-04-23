import { SortControls } from '@/components/sort-controls';
import { MatchCard } from '@/components/match-card';
import { prisma } from '@/lib/prisma';

export default async function Home({ searchParams }: { searchParams?: Promise<{ sort?: string }> }) {
  const sort = (await searchParams)?.sort ?? 'time';

  const predictions = await prisma.prediction.findMany({
    where: { match: { kickoffAt: { gte: new Date() } } },
    include: { match: { include: { homeTeam: true, awayTeam: true } } },
    orderBy:
      sort === 'edge'
        ? { edgeHome: 'desc' }
        : sort === 'confidence'
          ? { confidenceLabel: 'desc' }
          : { match: { kickoffAt: 'asc' } },
    take: 50
  });

  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="mb-2 text-4xl font-bold">NRL Model</h1>
      <p className="mb-6 text-slate-300">Elo-driven model vs bookmaker market edges for upcoming matches.</p>
      <div className="mb-6">
        <SortControls />
      </div>
      <div className="grid gap-4">
        {predictions.map((prediction: (typeof predictions)[number]) => (
          <MatchCard key={prediction.id} prediction={prediction} />
        ))}
      </div>
    </main>
  );
}
