import { ImportStatus, ImportType, MatchStatus } from '@prisma/client';
import { getYear } from 'date-fns';
import { prisma } from '../prisma';
import { fetchNrlFixtures } from '../scrapers/nrl';
import { resolveTeamId } from '../utils/teams';
import { withImportRun } from './import-run';

export async function importFixturesJob() {
  return withImportRun(ImportType.IMPORT_FIXTURES, async () => {
    const fixtures = await fetchNrlFixtures();
    let imported = 0;
    const unmatched: string[] = [];

    for (const item of fixtures) {
      const homeTeamId = await resolveTeamId(item.homeTeam);
      const awayTeamId = await resolveTeamId(item.awayTeam);

      if (!homeTeamId || !awayTeamId) {
        unmatched.push(`${item.homeTeam} vs ${item.awayTeam}`);
        continue;
      }

      await prisma.match.upsert({
        where: { source_externalId: { source: 'nrl.com', externalId: item.externalId } },
        create: {
          source: 'nrl.com',
          externalId: item.externalId,
          season: getYear(item.kickoffAt),
          round: item.round,
          kickoffAt: item.kickoffAt,
          venue: item.venue,
          status: MatchStatus.SCHEDULED,
          homeTeamId,
          awayTeamId
        },
        update: {
          kickoffAt: item.kickoffAt,
          round: item.round,
          venue: item.venue,
          homeTeamId,
          awayTeamId
        }
      });
      imported += 1;
    }

    return {
      data: { imported, unmatched },
      status: unmatched.length ? ImportStatus.PARTIAL : ImportStatus.SUCCESS,
      message: `Imported ${imported} fixtures`,
      metadata: { imported, unmatched, scanned: fixtures.length }
    };
  });
}
