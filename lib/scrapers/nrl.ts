import axios from 'axios';
import * as cheerio from 'cheerio';
import type { Element } from 'domhandler';

export type ScrapedFixture = {
  externalId: string;
  kickoffAt: Date;
  homeTeam: string;
  awayTeam: string;
  round?: string;
  venue?: string;
};

export async function fetchNrlFixtures(): Promise<ScrapedFixture[]> {
  const { data } = await axios.get<string>('https://www.nrl.com/draw/', {
    headers: { 'User-Agent': 'NRL-Model-Bot/1.0' },
    timeout: 20_000
  });

  const $ = cheerio.load(data);
  const fixtures: ScrapedFixture[] = [];

  $('[data-testid="match-card"], .u-match-centre-card').each((idx: number, el: Element) => {
    const externalId = $(el).attr('data-match-id') || $(el).find('[href*="/draw/"]').attr('href') || `nrl-${idx}`;
    const homeTeam = $(el).find('[data-testid="home-team-name"], .u-match-centre-card__team--home .u-font-weight-500').first().text().trim();
    const awayTeam = $(el).find('[data-testid="away-team-name"], .u-match-centre-card__team--away .u-font-weight-500').first().text().trim();
    const dateText = $(el).find('time').attr('datetime') || $(el).find('[data-testid="match-time"]').text().trim();
    const kickoffAt = new Date(dateText);
    const round = $(el).closest('[data-round]').attr('data-round') || $(el).find('[data-testid="round-label"]').text().trim();
    const venue = $(el).find('[data-testid="venue"], .u-match-centre-card__venue').text().trim();

    if (homeTeam && awayTeam && !Number.isNaN(kickoffAt.getTime())) {
      fixtures.push({
        externalId,
        kickoffAt,
        homeTeam,
        awayTeam,
        round: round || undefined,
        venue: venue || undefined
      });
    }
  });

  return fixtures;
}
