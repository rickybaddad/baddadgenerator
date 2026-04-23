import { ImportType, MatchStatus } from '@prisma/client';
import { prisma } from '../prisma';
import { env } from '../config';
import { confidenceLabel } from '../model/confidence';
import { edge } from '../model/probability';
import { expectedProbability } from '../model/elo';
import { withImportRun } from './import-run';

async function latestTeamElo(teamId: string) {
  const homeSnap = await prisma.teamRatingSnapshot.findFirst({ where: { homeTeamId: teamId }, orderBy: { match: { kickoffAt: 'desc' } } });
  const awaySnap = await prisma.teamRatingSnapshot.findFirst({ where: { awayTeamId: teamId }, orderBy: { match: { kickoffAt: 'desc' } } });

  const homeDate = homeSnap?.calculatedAt?.getTime() ?? 0;
  const awayDate = awaySnap?.calculatedAt?.getTime() ?? 0;

  if (homeDate >= awayDate && homeSnap) return homeSnap.homePostElo;
  if (awaySnap) return awaySnap.awayPostElo;
  return env.STARTING_ELO;
}

export async function generatePredictionsJob() {
  return withImportRun(ImportType.GENERATE_PREDICTIONS, async () => {
    const matches = await prisma.match.findMany({
      where: { status: MatchStatus.SCHEDULED, kickoffAt: { gte: new Date() } },
      include: { oddsSnapshots: { orderBy: { fetchedAt: 'desc' } } },
      orderBy: { kickoffAt: 'asc' },
      take: 64
    });

    let generated = 0;
    for (const match of matches) {
      const homeElo = await latestTeamElo(match.homeTeamId);
      const awayElo = await latestTeamElo(match.awayTeamId);
      const homeWinProbability = expectedProbability(homeElo, awayElo);
      const awayWinProbability = 1 - homeWinProbability;

      const odds = match.oddsSnapshots[0];
      const marketHome = odds?.homeNormalizedProb;
      const marketAway = odds?.awayNormalizedProb;
      const edgeHome = marketHome !== undefined ? edge(homeWinProbability, marketHome) : null;
      const edgeAway = marketAway !== undefined ? edge(awayWinProbability, marketAway) : null;
      const confidence = confidenceLabel(Math.max(Math.abs(edgeHome ?? 0), Math.abs(edgeAway ?? 0)));

      await prisma.prediction.create({
        data: {
          matchId: match.id,
          sourceOddsSnapshotId: odds?.id,
          homeElo,
          awayElo,
          homeWinProbability,
          awayWinProbability,
          marketHomeProbability: marketHome,
          marketAwayProbability: marketAway,
          marketHomeOddsDecimal: odds?.homePriceDecimal,
          marketAwayOddsDecimal: odds?.awayPriceDecimal,
          edgeHome,
          edgeAway,
          confidenceLabel: confidence
        }
      });
      generated += 1;
    }

    return {
      data: { generated },
      message: `Generated ${generated} predictions`,
      metadata: { generated }
    };
  });
}
