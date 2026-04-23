import { prisma } from '../prisma';

export function normalizeTeamName(name: string) {
  return name
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export async function resolveTeamId(rawName: string) {
  const normalized = normalizeTeamName(rawName);
  const alias = await prisma.teamAlias.findUnique({ where: { normalizedAlias: normalized } });
  return alias?.teamId ?? null;
}
