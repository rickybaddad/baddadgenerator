export const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
export const MAX_FILE_SIZE_MB = 12;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export const GEMINI_IMAGE_MODELS = [
  {
    id: 'gemini-3.1-flash-image-preview',
    name: 'Gemini 3.1 Flash Image',
    description: 'Fast image generation and editing for iterative work'
  },
  {
    id: 'gemini-3-pro-image-preview',
    name: 'Gemini 3 Pro Image',
    description: 'Higher-quality final image generation'
  }
] as const;

export type GeminiImageModelId = (typeof GEMINI_IMAGE_MODELS)[number]['id'];
export const DEFAULT_GEMINI_IMAGE_MODEL: GeminiImageModelId = GEMINI_IMAGE_MODELS[0].id;

export const OPENAI_PROMPT_IMPROVER_SYSTEM_PROMPT = `You are an expert AI image prompt editor.

Your job is to turn a user's rough image-generation or image-editing request into a clearer, stronger, more effective prompt for Google Gemini image generation/editing.

This tool is mainly used for iterative edits.

Priorities:

* Preserve intent
* Improve clarity
* Increase precision
* Assume minimal change unless stated

Rules:

* Do not add random elements
* Keep composition consistent
* Prefer edit instructions over full rewrites

Return JSON:
{
"improved_prompt": "string",
"short_reasoning_summary": "string",
"edit_type": "edit" | "new_generation",
"preserve_existing_image": true
}`;
