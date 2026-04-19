import type { Content } from '@google/genai';

export type PromptMode = 'raw' | 'improved';
export type ResolutionOption = 'default' | '2K' | '4K';
export type EditMode = 'edit' | 'new_generation';

export interface PromptImprovementResult {
  improved_prompt: string;
  short_reasoning_summary: string;
  edit_type: EditMode;
  preserve_existing_image: true;
}

export interface GeminiMetadata {
  thoughtSignatureParts?: string[];
  responseParts?: Array<{
    text?: string;
    inlineData?: {
      mimeType: string;
      data: string;
      thoughtSignature?: string;
    };
    thoughtSignature?: string;
  }>;
  conversationContents?: Content[];
  model: string;
}

export interface IterationStep {
  id: string;
  parentId: string | null;
  branchId: string;
  stepNumber: number;
  createdAt: string;
  mode: EditMode;
  rawPrompt: string;
  improvedPrompt?: string;
  reasoningSummary?: string;
  resolution: ResolutionOption;
  sourceImage?: string;
  resultImage: string;
  geminiMetadata: GeminiMetadata;
  active: boolean;
}
