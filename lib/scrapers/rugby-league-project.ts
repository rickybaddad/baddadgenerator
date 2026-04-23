import axios from 'axios';
import * as cheerio from 'cheerio';
import type { Element } from 'domhandler';

export type HistoricalMatch = {
  externalId: string;
  season: number;
  date: Date;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  round?: string;
};

export async function fetchSeasonResults(season: number): Promise<HistoricalMatch[]> {
  const url = `https://www.rugbyleagueproject.org/seasons/nrl-${season}/results.html`;
  const { data } = await axios.get<string>(url, {
    headers: { 'User-Agent': 'NRL-Model-Bot/1.0' },
    timeout: 30_000
  });

  const $ = cheerio.load(data);
  const matches: HistoricalMatch[] = [];

  $('table tr').each((idx: number, row: Element) => {
    const cells = $(row).find('td');
    if (cells.length < 7) return;

    const dateText = $(cells[0]).text().trim();
    const homeTeam = $(cells[2]).text().trim();
    const scoreText = $(cells[3]).text().trim();
    const awayTeam = $(cells[4]).text().trim();
    const round = $(cells[1]).text().trim();
    const matchLink = $(cells[3]).find('a').attr('href') || `${season}-${idx}`;
    const scoreMatch = scoreText.match(/(\d+)\s*-\s*(\d+)/);
    const date = new Date(dateText);

    if (!scoreMatch || !homeTeam || !awayTeam || Number.isNaN(date.getTime())) return;

    matches.push({
      externalId: matchLink,
      season,
      date,
      homeTeam,
      awayTeam,
      homeScore: Number(scoreMatch[1]),
      awayScore: Number(scoreMatch[2]),
      round: round || undefined
    });
  });

  return matches;
}
