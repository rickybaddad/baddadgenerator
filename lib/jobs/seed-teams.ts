import { ImportType } from '@prisma/client';
import { seedTeams } from '../../prisma/seed';
import { prisma } from '../prisma';
import { withImportRun } from './import-run';

export async function seedTeamsJob() {
  return withImportRun(ImportType.SEED_TEAMS, async () => {
    await seedTeams();
    const teamCount = await prisma.team.count();
    return { data: { teamCount }, message: `Seeded teams: ${teamCount}`, metadata: { teamCount } };
  });
}
