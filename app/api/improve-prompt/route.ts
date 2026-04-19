import { NextRequest, NextResponse } from 'next/server';
import { improvePrompt } from '@/services/openai-service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawPrompt = String(body.rawPrompt || '').trim();
    const mode = body.mode === 'edit' ? 'edit' : 'new_generation';

    if (!rawPrompt) {
      return NextResponse.json({ error: 'Prompt is required.' }, { status: 400 });
    }

    const result = await improvePrompt({ rawPrompt, mode });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to improve prompt.' },
      { status: 500 }
    );
  }
}
