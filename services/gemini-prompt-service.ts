import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import { GEMINI_PROMPT_IMPROVER_INSTRUCTIONS } from '@/config/constants';
import { PromptImprovementResult } from '@/types';

const schema = z.object({
  improved_prompt: z.string().min(1),
  short_reasoning_summary: z.string().min(1),
  edit_type: z.enum(['edit', 'new_generation']),
  preserve_existing_image: z.literal(true)
});

let geminiClient: GoogleGenAI | null = null;

function getGeminiClient() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('Missing GEMINI_API_KEY');
  }

  geminiClient ??= new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  return geminiClient;
}

export async function improvePromptWithGemini({
  rawPrompt,
  mode
}: {
  rawPrompt: string;
  mode: 'edit' | 'new_generation';
}): Promise<PromptImprovementResult> {
  const client = getGeminiClient();
  const model = process.env.GEMINI_PROMPT_IMPROVER_MODEL || 'gemini-2.5-flash';

  const prompt = `${GEMINI_PROMPT_IMPROVER_INSTRUCTIONS}

Current mode:
${mode}

User request:
${rawPrompt}`;

  const response = await client.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: 'application/json'
    }
  });

  const payloadText = response.text || '{}';
  const payload = JSON.parse(payloadText);

  return schema.parse(payload);
}
