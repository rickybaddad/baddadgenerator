import { ImportStatus, ImportType, MatchStatus } from '@prisma/client';
import { getYear } from 'date-fns';
import { prisma } from '../prisma';
import { fetchSeasonResults } from '../scrapers/rugby-league-project';
import { resolveTeamId } from '../utils/teams';
import { withImportRun } from './import-run';

const START_SEASON = 1998;

export async function importHistoryJob() {
  return withImportRun(ImportType.IMPORT_HISTORY, async () => {
    const latestCompleted = await prisma.importRun.findFirst({
      where: { type: ImportType.IMPORT_HISTORY, status: 'SUCCESS' },
      orderBy: { startedAt: 'desc' }
    });

    const lastSeason = Number((latestCompleted?.metadata as { lastSeason?: number } | undefined)?.lastSeason ?? START_SEASON - 1);
    const currentYear = getYear(new Date());

    let imported = 0;
    const unmatched: string[] = [];

    for (let season = Math.max(START_SEASON, lastSeason); season <= currentYear; season += 1) {
      const matches = await fetchSeasonResults(season);
      for (const match of matches) {
        const homeTeamId = await resolveTeamId(match.homeTeam);
        const awayTeamId = await resolveTeamId(match.awayTeam);
        if (!homeTeamId || !awayTeamId) {
          unmatched.push(`${season}: ${match.homeTeam} vs ${match.awayTeam}`);
          continue;
        }

        await prisma.match.upsert({
          where: { source_externalId: { source: 'rugbyleagueproject.org', externalId: match.externalId } },
          create: {
            source: 'rugbyleagueproject.org',
            externalId: match.externalId,
            season: season,
            round: match.round,
            kickoffAt: match.date,
            status: MatchStatus.COMPLETED,
            homeTeamId,
            awayTeamId,
            homeScore: match.homeScore,
            awayScore: match.awayScore
          },
          update: {
            kickoffAt: match.date,
            round: match.round,
            status: MatchStatus.COMPLETED,
            homeScore: match.homeScore,
            awayScore: match.awayScore,
            homeTeamId,
            awayTeamId
          }
        });
        imported += 1;
      }
    }

    return {
      data: { imported, unmatched },
      status: unmatched.length ? ImportStatus.PARTIAL : ImportStatus.SUCCESS,
      message: `Imported ${imported} historical matches`,
      metadata: { imported, unmatched, lastSeason: currentYear }
    };
  });
}
