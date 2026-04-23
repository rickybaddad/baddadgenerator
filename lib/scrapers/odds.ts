import axios from 'axios';
import { env } from '../config';

export type OddsApiOutcome = { name: string; price: number };
export type OddsApiMarket = { key: string; outcomes: OddsApiOutcome[] };
export type OddsApiBookmaker = { key: string; title: string; markets: OddsApiMarket[] };
export type OddsApiEvent = {
  id: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: OddsApiBookmaker[];
};

export async function fetchOddsApi(): Promise<OddsApiEvent[]> {
  if (!env.ODDS_API_KEY) {
    return [];
  }

  const { data } = await axios.get<OddsApiEvent[]>(
    'https://api.the-odds-api.com/v4/sports/rugby_league_nrl/odds',
    {
      params: {
        apiKey: env.ODDS_API_KEY,
        regions: env.ODDS_API_REGION,
        markets: env.ODDS_API_MARKETS,
        oddsFormat: 'decimal'
      },
      timeout: 20_000
    }
  );

  return data;
}
