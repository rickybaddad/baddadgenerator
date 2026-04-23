import { ImportType } from '@prisma/client';
import { seedTeamsJob } from './seed-teams';
import { importHistoryJob } from './import-history';
import { calculateRatingsJob } from './calculate-ratings';
import { importFixturesJob } from './import-fixtures';
import { importOddsJob } from './import-odds';
import { generatePredictionsJob } from './generate-predictions';
import { withImportRun } from './import-run';

export async function bootstrapJob() {
  return withImportRun(ImportType.BOOTSTRAP, async () => {
    const seeded = await seedTeamsJob();
    const history = await importHistoryJob();
    const ratings = await calculateRatingsJob();
    const fixtures = await importFixturesJob();
    const odds = await importOddsJob();
    const predictions = await generatePredictionsJob();

    return {
      data: { seeded, history, ratings, fixtures, odds, predictions },
      metadata: { seeded, history, ratings, fixtures, odds, predictions },
      message: 'Bootstrap pipeline complete'
    };
  });
}
