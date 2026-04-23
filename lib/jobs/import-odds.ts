import { ImportStatus, ImportType, MatchStatus } from '@prisma/client';
import { addDays, subDays } from 'date-fns';
import { prisma } from '../prisma';
import { fetchOddsApi, type OddsApiMarket, type OddsApiOutcome } from '../scrapers/odds';
import { normalizeMarketProbabilities } from '../model/probability';
import { resolveTeamId } from '../utils/teams';
import { withImportRun } from './import-run';

export async function importOddsJob() {
  return withImportRun(ImportType.IMPORT_ODDS, async () => {
    const events = await fetchOddsApi();
    let stored = 0;
    const unmatched: string[] = [];

    for (const event of events) {
      const homeTeamId = await resolveTeamId(event.home_team);
      const awayTeamId = await resolveTeamId(event.away_team);

      if (!homeTeamId || !awayTeamId) {
        unmatched.push(`${event.home_team} vs ${event.away_team}`);
        continue;
      }

      const commence = new Date(event.commence_time);
      const match = await prisma.match.findFirst({
        where: {
          homeTeamId,
          awayTeamId,
          kickoffAt: {
            gte: subDays(commence, 2),
            lte: addDays(commence, 2)
          },
          status: MatchStatus.SCHEDULED
        }
      });

      if (!match) {
        unmatched.push(`No fixture found for ${event.home_team} vs ${event.away_team}`);
        continue;
      }

      for (const bookmaker of event.bookmakers) {
        const market = bookmaker.markets.find((m: OddsApiMarket) => m.key === 'h2h');
        if (!market) continue;

        const homeOutcome = market.outcomes.find((o: OddsApiOutcome) => o.name === event.home_team);
        const awayOutcome = market.outcomes.find((o: OddsApiOutcome) => o.name === event.away_team);
        if (!homeOutcome || !awayOutcome) continue;

        const p = normalizeMarketProbabilities(homeOutcome.price, awayOutcome.price);
        const now = new Date();
        await prisma.oddsSnapshot.create({
          data: {
            matchId: match.id,
            bookmakerKey: bookmaker.key,
            bookmakerName: bookmaker.title,
            market: 'h2h',
            homePriceDecimal: homeOutcome.price,
            awayPriceDecimal: awayOutcome.price,
            homeImpliedProb: p.homeImplied,
            awayImpliedProb: p.awayImplied,
            homeNormalizedProb: p.homeNormalized,
            awayNormalizedProb: p.awayNormalized,
            overround: p.overround,
            fetchedAt: now
          }
        });
        stored += 1;
      }
    }

    return {
      data: { stored, unmatched },
      status: unmatched.length ? ImportStatus.PARTIAL : ImportStatus.SUCCESS,
      message: `Stored ${stored} odds snapshots`,
      metadata: { stored, unmatched }
    };
  });
}
