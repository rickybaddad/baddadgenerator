import Link from 'next/link';
import { format } from 'date-fns';

type MatchCardProps = {
  prediction: {
    id: string;
    confidenceLabel: string;
    homeWinProbability: number;
    marketHomeProbability: number | null;
    marketHomeOddsDecimal: number | null;
    edgeHome: number | null;
    match: {
      id: string;
      kickoffAt: Date;
      homeTeam: { shortName: string };
      awayTeam: { shortName: string };
    };
  };
};

const pct = (value: number | null) => (value === null ? 'N/A' : `${(value * 100).toFixed(1)}%`);

export function MatchCard({ prediction }: MatchCardProps) {
  return (
    <Link href={`/matches/${prediction.match.id}`} className="block rounded-lg border border-slate-800 bg-slate-900 p-4 hover:border-slate-600">
      <div className="mb-3 flex items-center justify-between text-sm text-slate-300">
        <span>{format(prediction.match.kickoffAt, 'EEE d MMM yyyy, h:mm a')}</span>
        <span className="rounded bg-slate-800 px-2 py-1">{prediction.confidenceLabel}</span>
      </div>
      <h3 className="text-lg font-semibold">
        {prediction.match.homeTeam.shortName} vs {prediction.match.awayTeam.shortName}
      </h3>
      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <div>Model: {pct(prediction.homeWinProbability)}</div>
        <div>Market: {pct(prediction.marketHomeProbability)}</div>
        <div>Odds: {prediction.marketHomeOddsDecimal ? prediction.marketHomeOddsDecimal.toFixed(2) : 'N/A'}</div>
        <div>Edge: {pct(prediction.edgeHome)}</div>
      </div>
    </Link>
  );
}
