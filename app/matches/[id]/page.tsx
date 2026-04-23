import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';

export default async function MatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const match = await prisma.match.findUnique({
    where: { id },
    include: {
      homeTeam: true,
      awayTeam: true,
      predictions: { orderBy: { generatedAt: 'desc' }, take: 1 },
      oddsSnapshots: { orderBy: { fetchedAt: 'desc' }, take: 8 }
    }
  });

  if (!match) return notFound();

  const latest = match.predictions[0];
  const recent = await prisma.match.findMany({
    where: {
      OR: [{ homeTeamId: match.homeTeamId }, { awayTeamId: match.homeTeamId }, { homeTeamId: match.awayTeamId }, { awayTeamId: match.awayTeamId }],
      status: 'COMPLETED'
    },
    orderBy: { kickoffAt: 'desc' },
    take: 5,
    include: { homeTeam: true, awayTeam: true }
  });

  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="text-3xl font-bold">{match.homeTeam.name} vs {match.awayTeam.name}</h1>
      <p className="mt-2 text-slate-300">Model explanation: Elo updates based on historical results with configurable K-factor and home advantage.</p>

      <section className="mt-6 rounded-lg border border-slate-800 bg-slate-900 p-4">
        <h2 className="text-xl font-semibold">Probability Breakdown</h2>
        {latest ? (
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <div>Home Elo: {latest.homeElo.toFixed(1)}</div>
            <div>Away Elo: {latest.awayElo.toFixed(1)}</div>
            <div>Home Win: {(latest.homeWinProbability * 100).toFixed(2)}%</div>
            <div>Away Win: {(latest.awayWinProbability * 100).toFixed(2)}%</div>
            <div>Market Home: {latest.marketHomeProbability ? `${(latest.marketHomeProbability * 100).toFixed(2)}%` : 'N/A'}</div>
            <div>Edge Home: {latest.edgeHome ? `${(latest.edgeHome * 100).toFixed(2)}%` : 'N/A'}</div>
          </div>
        ) : <p className="mt-2 text-slate-300">No prediction generated yet.</p>}
      </section>

      <section className="mt-6 rounded-lg border border-slate-800 bg-slate-900 p-4">
        <h2 className="text-xl font-semibold">Odds Used</h2>
        <div className="mt-3 space-y-2 text-sm">
          {match.oddsSnapshots.map((odds: (typeof match.oddsSnapshots)[number]) => (
            <div key={odds.id} className="rounded bg-slate-800 p-2">
              {odds.bookmakerName}: {odds.homePriceDecimal.toFixed(2)} / {odds.awayPriceDecimal.toFixed(2)} (overround {(odds.overround * 100).toFixed(2)}%)
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-lg border border-slate-800 bg-slate-900 p-4">
        <h2 className="text-xl font-semibold">Last 5 Results (Both Teams)</h2>
        <div className="mt-3 space-y-2 text-sm">
          {recent.map((r: (typeof recent)[number]) => (
            <div key={r.id} className="rounded bg-slate-800 p-2">
              {r.homeTeam.shortName} {r.homeScore} - {r.awayScore} {r.awayTeam.shortName}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
