import OpenAI from 'openai';
import { z } from 'zod';
import { OPENAI_PROMPT_IMPROVER_SYSTEM_PROMPT } from '@/config/constants';
import { PromptImprovementResult } from '@/types';

const schema = z.object({
  improved_prompt: z.string().min(1),
  short_reasoning_summary: z.string().min(1),
  edit_type: z.enum(['edit', 'new_generation']),
  preserve_existing_image: z.literal(true)
});

let openaiClient: OpenAI | null = null;

function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('Missing OPENAI_API_KEY');
  }

  openaiClient ??= new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return openaiClient;
}

export async function improvePrompt({ rawPrompt, mode }: { rawPrompt: string; mode: 'edit' | 'new_generation' }): Promise<PromptImprovementResult> {
  const client = getOpenAIClient();

  const userTemplate = `Rewrite this into a better Gemini image prompt.\n\nCurrent mode:\n${mode}\n\nUser request:\n${rawPrompt}`;

  const response = await client.responses.create({
    model: process.env.OPENAI_PROMPT_IMPROVER_MODEL || 'gpt-5-mini',
    input: [
      { role: 'system', content: OPENAI_PROMPT_IMPROVER_SYSTEM_PROMPT },
      { role: 'user', content: userTemplate }
    ],
    text: {
      format: {
        type: 'json_schema',
        name: 'prompt_improvement',
        strict: true,
        schema: {
          type: 'object',
          additionalProperties: false,
          properties: {
            improved_prompt: { type: 'string' },
            short_reasoning_summary: { type: 'string' },
            edit_type: { type: 'string', enum: ['edit', 'new_generation'] },
            preserve_existing_image: { type: 'boolean', const: true }
          },
          required: ['improved_prompt', 'short_reasoning_summary', 'edit_type', 'preserve_existing_image']
        }
      }
    }
  });

  // Responses API generally returns JSON text in output_text when using text.format JSON schema.
  const payload = JSON.parse(response.output_text || '{}');
  return schema.parse(payload);
}
