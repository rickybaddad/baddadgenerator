import { env } from '../config';

export function expectedProbability(homeElo: number, awayElo: number, homeAdvantage = env.HOME_ADVANTAGE_ELO) {
  const exp = (awayElo - (homeElo + homeAdvantage)) / 400;
  return 1 / (1 + 10 ** exp);
}

export function updateEloRatings(
  homeElo: number,
  awayElo: number,
  homeScore: number,
  awayScore: number,
  kFactor = env.K_FACTOR
) {
  const expectedHome = expectedProbability(homeElo, awayElo);
  const homeActual = homeScore === awayScore ? 0.5 : homeScore > awayScore ? 1 : 0;
  const awayActual = 1 - homeActual;

  return {
    homePost: homeElo + kFactor * (homeActual - expectedHome),
    awayPost: awayElo + kFactor * (awayActual - (1 - expectedHome)),
    expectedHome
  };
}
