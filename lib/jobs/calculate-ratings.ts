import { ImportType, MatchStatus } from '@prisma/client';
import { prisma } from '../prisma';
import { env } from '../config';
import { updateEloRatings } from '../model/elo';
import { withImportRun } from './import-run';

export async function calculateRatingsJob() {
  return withImportRun(ImportType.CALCULATE_RATINGS, async () => {
    const matches = await prisma.match.findMany({
      where: { status: MatchStatus.COMPLETED, homeScore: { not: null }, awayScore: { not: null } },
      orderBy: { kickoffAt: 'asc' }
    });

    const ratings = new Map<string, number>();
    let snapshots = 0;

    for (const match of matches) {
      const homePre = ratings.get(match.homeTeamId) ?? env.STARTING_ELO;
      const awayPre = ratings.get(match.awayTeamId) ?? env.STARTING_ELO;

      const result = updateEloRatings(homePre, awayPre, match.homeScore ?? 0, match.awayScore ?? 0);
      ratings.set(match.homeTeamId, result.homePost);
      ratings.set(match.awayTeamId, result.awayPost);

      await prisma.teamRatingSnapshot.upsert({
        where: { matchId: match.id },
        create: {
          matchId: match.id,
          season: match.season,
          homeTeamId: match.homeTeamId,
          awayTeamId: match.awayTeamId,
          homePreElo: homePre,
          awayPreElo: awayPre,
          homePostElo: result.homePost,
          awayPostElo: result.awayPost
        },
        update: {
          homePreElo: homePre,
          awayPreElo: awayPre,
          homePostElo: result.homePost,
          awayPostElo: result.awayPost,
          calculatedAt: new Date()
        }
      });
      snapshots += 1;
    }

    return {
      data: { snapshots, teamCount: ratings.size },
      message: `Calculated ratings across ${snapshots} completed matches`,
      metadata: { snapshots, teamCount: ratings.size }
    };
  });
}
