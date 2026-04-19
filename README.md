# Iterative Gemini Creative Studio

A premium, dark-mode, Vercel-deployable creative web app for iterative AI image generation and editing.

- **Gemini (Nano Banana)** handles image generation/editing only.
- **OpenAI** handles optional prompt improvement only.

## Features

- Start from **text** or **upload an image**
- Raw prompt workflow with optional OpenAI prompt improvement
- Prompt mode switch:
  - `Using: Raw Prompt`
  - `Using: Improved Prompt`
- Stale warning when raw prompt changes after improvement
- Resolution selector:
  - Default (omits `imageSize`)
  - `2K` (`imageSize: "2K"`)
  - `4K` (`imageSize: "4K"`)
- Iterative Gemini editing with preserved conversation metadata
- Visual timeline + branching + active selection + download

## Tech Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Server-only API routes for AI calls
- Vercel-ready

## Project Structure

```txt
app/
  api/
    improve-prompt/route.ts
    generate-image/route.ts
  globals.css
  layout.tsx
  page.tsx
components/
  active-preview.tsx
  control-panel.tsx
  iteration-timeline.tsx
services/
  client-utils.ts
  openai-service.ts
  gemini-service.ts
types/
  index.ts
config/
  constants.ts
.env.example
```

## 1) Install

```bash
npm install
```

## 2) Configure API keys

Copy and edit environment variables:

```bash
cp .env.example .env.local
```

Add values:

- `OPENAI_API_KEY`
- `GEMINI_API_KEY`

Optional model overrides:

- `OPENAI_PROMPT_IMPROVER_MODEL` (default: `gpt-5-mini`)
- `GEMINI_IMAGE_MODEL` (default: `gemini-2.5-flash-image`)

## 3) Run locally

```bash
npm run dev
```

Open: [http://localhost:3000](http://localhost:3000)

## 4) Deploy to Vercel

1. Push repo to GitHub/GitLab/Bitbucket.
2. Import project into Vercel.
3. Set env vars in Vercel Project Settings:
   - `OPENAI_API_KEY`
   - `GEMINI_API_KEY`
   - (optional model env vars)
4. Deploy.

## Prompt Improver Flow (OpenAI)

- Triggered **only** when user clicks **Improve Prompt**.
- Endpoint: `POST /api/improve-prompt`
- Uses the exact system prompt in `config/constants.ts`.
- Returns strict JSON schema:

```json
{
  "improved_prompt": "string",
  "short_reasoning_summary": "string",
  "edit_type": "edit | new_generation",
  "preserve_existing_image": true
}
```

- Improved prompt is editable in UI.
- If raw prompt changes after improvement, app marks improved prompt stale and shows warning.

## Gemini Flow (Generation + Iterative Editing)

- Endpoint: `POST /api/generate-image`
- Supports:
  - prompt-only generation
  - prompt + source image editing via inline base64 image
- Resolution mapping:
  - Default => omit `imageConfig.imageSize`
  - `2K` => `imageConfig.imageSize = "2K"`
  - `4K` => `imageConfig.imageSize = "4K"`

### Metadata preservation

For iterative edits, each generated step stores Gemini metadata including:
- returned parts
- thought signatures when present
- accumulated conversation contents

Each follow-up edit sends forward previous `conversationContents` so the workflow remains conversational, not stateless.

> Note: Gemini SDK behavior can evolve. If SDK signatures differ, adjust fields in `services/gemini-service.ts` (comments and code are structured to make this straightforward).

## Iteration Chain

Each iteration stores:

- `id`
- `parentId`
- `branchId`
- `stepNumber`
- `createdAt`
- `mode` (`edit` / `new_generation`)
- `rawPrompt`
- `improvedPrompt`
- `reasoningSummary`
- `resolution`
- `sourceImage`
- `resultImage`
- `geminiMetadata`
- `active`

UI supports:

- View step
- Download step
- Use as active
- Branch from step
- Highlight active step

## Validation

- Prompt required
- Image optional (used for edits)
- Supported mime types: png/jpg/jpeg/webp
- File size limit: 12 MB
- Graceful API/client error handling

## Production Notes

- AI keys are server-side only.
- No client-side key exposure.
- API routes isolate all model calls.
- App is ready for Vercel serverless deployment.
