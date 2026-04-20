import { NextRequest, NextResponse } from 'next/server';
import type { Content } from '@google/genai';
import { GEMINI_IMAGE_MODELS } from '@/config/constants';
import { generateGeminiImage } from '@/services/gemini-service';
import { GeminiImageModelId, ResolutionOption } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const prompt = String(body.prompt || '').trim();
    const resolution = (body.resolution || 'default') as ResolutionOption;
    const model = String(body.model || '').trim();
    const validModel = GEMINI_IMAGE_MODELS.some((item) => item.id === model)
      ? (model as GeminiImageModelId)
      : undefined;

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required.' }, { status: 400 });
    }

    const sourceImage = body.sourceImage && body.sourceImage.data && body.sourceImage.mimeType
      ? {
          data: String(body.sourceImage.data),
          mimeType: String(body.sourceImage.mimeType)
        }
      : undefined;

    const result = await generateGeminiImage({
      prompt,
      resolution,
      model: validModel,
      sourceImage,
      previousConversationContents: Array.isArray(body.previousConversationContents)
        ? (body.previousConversationContents as Content[])
        : undefined
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Image generation failed.' },
      { status: 500 }
    );
  }
}
