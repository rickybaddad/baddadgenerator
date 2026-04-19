import { Content, GoogleGenAI, Part } from '@google/genai';
import { GeminiMetadata, ResolutionOption } from '@/types';

let geminiClient: GoogleGenAI | null = null;

function getGeminiClient() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('Missing GEMINI_API_KEY');
  }
  geminiClient ??= new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  return geminiClient;
}

function buildImageConfig(resolution: ResolutionOption) {
  if (resolution === 'default') {
    return undefined;
  }
  return { imageSize: resolution };
}

interface GenerateGeminiImageArgs {
  prompt: string;
  resolution: ResolutionOption;
  sourceImage?: { mimeType: string; data: string };
  previousConversationContents?: Content[];
}

export async function generateGeminiImage({
  prompt,
  resolution,
  sourceImage,
  previousConversationContents
}: GenerateGeminiImageArgs): Promise<{ imageBase64: string; metadata: GeminiMetadata; model: string }> {
  const client = getGeminiClient();
  const model = process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image';

  const currentMessageParts: Part[] = [{ text: prompt } as Part];
  if (sourceImage) {
    currentMessageParts.push({
      inlineData: {
        mimeType: sourceImage.mimeType,
        data: sourceImage.data
      }
    } as Part);
  }

  const contents: Content[] = [
    ...(Array.isArray(previousConversationContents) ? previousConversationContents : []),
    {
      role: 'user',
      parts: currentMessageParts
    } as Content
  ];

  const response = await client.models.generateContent({
    model,
    contents,
    config: {
      responseModalities: ['TEXT', 'IMAGE'],
      imageConfig: buildImageConfig(resolution)
    }
  });

  const parts = response.candidates?.[0]?.content?.parts ?? [];
  const imagePart = parts.find((part) => part.inlineData?.data);

  if (!imagePart?.inlineData?.data) {
    throw new Error('Gemini did not return an image for this request.');
  }

  const thoughtSignatureParts = parts
    .map((part) => part.thoughtSignature || part.inlineData?.thoughtSignature)
    .filter((item): item is string => Boolean(item));

  const metadata: GeminiMetadata = {
    model,
    thoughtSignatureParts,
    responseParts: parts.map((part) => ({
      text: part.text,
      inlineData: part.inlineData
        ? {
            mimeType: part.inlineData.mimeType ?? 'image/png',
            data: part.inlineData.data ?? '',
            thoughtSignature: part.inlineData.thoughtSignature
          }
        : undefined,
      thoughtSignature: part.thoughtSignature
    })),
    conversationContents: [
      ...contents,
      {
        role: 'model',
        parts
      } as Content
    ]
  };

  return {
    imageBase64: imagePart.inlineData.data,
    metadata,
    model
  };
}
