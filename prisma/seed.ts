import { prisma } from '../lib/prisma';
import { normalizeTeamName } from '../lib/utils/teams';

const teams = [
  { name: 'Brisbane Broncos', shortName: 'Broncos', slug: 'brisbane-broncos', aliases: ['Brisbane', 'BRI', 'Broncos'] },
  { name: 'Canberra Raiders', shortName: 'Raiders', slug: 'canberra-raiders', aliases: ['Canberra', 'CAN', 'Raiders'] },
  { name: 'Canterbury-Bankstown Bulldogs', shortName: 'Bulldogs', slug: 'canterbury-bulldogs', aliases: ['Canterbury', 'Bulldogs', 'CBY'] },
  { name: 'Cronulla-Sutherland Sharks', shortName: 'Sharks', slug: 'cronulla-sharks', aliases: ['Cronulla', 'Sharks', 'CRO'] },
  { name: 'Dolphins', shortName: 'Dolphins', slug: 'dolphins', aliases: ['The Dolphins', 'Redcliffe Dolphins', 'DOL'] },
  { name: 'Gold Coast Titans', shortName: 'Titans', slug: 'gold-coast-titans', aliases: ['Gold Coast', 'Titans', 'GLD'] },
  { name: 'Manly-Warringah Sea Eagles', shortName: 'Sea Eagles', slug: 'manly-sea-eagles', aliases: ['Manly', 'Sea Eagles', 'MAN'] },
  { name: 'Melbourne Storm', shortName: 'Storm', slug: 'melbourne-storm', aliases: ['Melbourne', 'Storm', 'MEL'] },
  { name: 'Newcastle Knights', shortName: 'Knights', slug: 'newcastle-knights', aliases: ['Newcastle', 'Knights', 'NEW'] },
  { name: 'New Zealand Warriors', shortName: 'Warriors', slug: 'new-zealand-warriors', aliases: ['Warriors', 'NZ Warriors', 'NZW'] },
  { name: 'North Queensland Cowboys', shortName: 'Cowboys', slug: 'north-queensland-cowboys', aliases: ['Cowboys', 'NQL', 'North Queensland'] },
  { name: 'Parramatta Eels', shortName: 'Eels', slug: 'parramatta-eels', aliases: ['Parramatta', 'Eels', 'PAR'] },
  { name: 'Penrith Panthers', shortName: 'Panthers', slug: 'penrith-panthers', aliases: ['Penrith', 'Panthers', 'PEN'] },
  { name: 'South Sydney Rabbitohs', shortName: 'Rabbitohs', slug: 'south-sydney-rabbitohs', aliases: ['South Sydney', 'Rabbitohs', 'SOU'] },
  { name: 'St. George Illawarra Dragons', shortName: 'Dragons', slug: 'st-george-illawarra-dragons', aliases: ['St George Illawarra', 'Dragons', 'STI'] },
  { name: 'Sydney Roosters', shortName: 'Roosters', slug: 'sydney-roosters', aliases: ['Roosters', 'SYD', 'Eastern Suburbs'] },
  { name: 'Wests Tigers', shortName: 'Tigers', slug: 'wests-tigers', aliases: ['Wests Tigers', 'Tigers', 'WST'] }
] as const;

export async function seedTeams() {
  for (const team of teams) {
    const created = await prisma.team.upsert({
      where: { slug: team.slug },
      update: { name: team.name, shortName: team.shortName },
      create: { name: team.name, shortName: team.shortName, slug: team.slug }
    });

    const aliasSet = new Set([team.name, team.shortName, ...team.aliases]);
    for (const alias of aliasSet) {
      await prisma.teamAlias.upsert({
        where: { normalizedAlias: normalizeTeamName(alias) },
        update: { teamId: created.id, alias },
        create: {
          teamId: created.id,
          alias,
          normalizedAlias: normalizeTeamName(alias)
        }
      });
    }
  }
}

if (require.main === module) {
  seedTeams()
    .then(async () => {
      await prisma.$disconnect();
    })
    .catch(async (error) => {
      console.error(error);
      await prisma.$disconnect();
      process.exit(1);
    });
}
