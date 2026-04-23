import { env } from '../config';

export function confidenceLabel(absEdge: number) {
  if (absEdge >= env.CONFIDENCE_HIGH_THRESHOLD) return 'High';
  if (absEdge >= env.CONFIDENCE_MEDIUM_THRESHOLD) return 'Medium';
  return 'Low';
}
