import { describe, expect, test } from 'vitest';
import { expectedProbability, updateEloRatings } from '../lib/model/elo';
import { edge, impliedProbability, normalizeMarketProbabilities } from '../lib/model/probability';

describe('probabilities', () => {
  test('calculates implied probability', () => {
    expect(impliedProbability(2)).toBeCloseTo(0.5, 5);
  });

  test('normalizes market probabilities', () => {
    const result = normalizeMarketProbabilities(1.9, 1.9);
    expect(result.homeNormalized).toBeCloseTo(0.5, 2);
    expect(result.awayNormalized).toBeCloseTo(0.5, 2);
    expect(result.overround).toBeGreaterThan(0);
  });

  test('calculates edge', () => {
    expect(edge(0.55, 0.5)).toBeCloseTo(0.05, 5);
  });
});

describe('elo', () => {
  test('gives home team > 50% when ratings equal and home advantage active', () => {
    expect(expectedProbability(1500, 1500)).toBeGreaterThan(0.5);
  });

  test('updates ratings after home win', () => {
    const result = updateEloRatings(1500, 1500, 24, 12, 30);
    expect(result.homePost).toBeGreaterThan(1500);
    expect(result.awayPost).toBeLessThan(1500);
  });
});
