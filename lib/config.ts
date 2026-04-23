import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1).default("postgresql://localhost:5432/nrl_model"),
  ODDS_API_KEY: z.string().optional().default(''),
  ODDS_API_REGION: z.string().default('au'),
  ODDS_API_MARKETS: z.string().default('h2h'),
  STARTING_ELO: z.coerce.number().default(1500),
  K_FACTOR: z.coerce.number().default(30),
  HOME_ADVANTAGE_ELO: z.coerce.number().default(50),
  VALUE_EDGE_THRESHOLD: z.coerce.number().default(0.04),
  CONFIDENCE_MEDIUM_THRESHOLD: z.coerce.number().default(0.03),
  CONFIDENCE_HIGH_THRESHOLD: z.coerce.number().default(0.06)
});

export const env = envSchema.parse(process.env);

export type AppEnv = typeof env;
