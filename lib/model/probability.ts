export function impliedProbability(decimalOdds: number) {
  if (decimalOdds <= 1) return 0;
  return 1 / decimalOdds;
}

export function normalizeMarketProbabilities(homeDecimal: number, awayDecimal: number) {
  const home = impliedProbability(homeDecimal);
  const away = impliedProbability(awayDecimal);
  const total = home + away;

  if (!total) {
    return {
      homeImplied: 0,
      awayImplied: 0,
      homeNormalized: 0,
      awayNormalized: 0,
      overround: 0
    };
  }

  return {
    homeImplied: home,
    awayImplied: away,
    homeNormalized: home / total,
    awayNormalized: away / total,
    overround: total - 1
  };
}

export function edge(modelProbability: number, marketProbability: number) {
  return modelProbability - marketProbability;
}
