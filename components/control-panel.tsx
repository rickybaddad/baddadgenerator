'use client';

import { ResolutionOption } from '@/types';

interface ControlPanelProps {
  rawPrompt: string;
  improvedPrompt: string;
  promptMode: 'raw' | 'improved';
  isStale: boolean;
  resolution: ResolutionOption;
  hasSourceImage: boolean;
  loadingImprove: boolean;
  loadingGenerate: boolean;
  status: string;
  onRawPromptChange: (value: string) => void;
  onImprovedPromptChange: (value: string) => void;
  onPromptModeChange: (value: 'raw' | 'improved') => void;
  onResolutionChange: (value: ResolutionOption) => void;
  onImprovePrompt: () => void;
  onGenerate: () => void;
  onReset: () => void;
  onFileSelected: (file: File) => void;
}

export function ControlPanel(props: ControlPanelProps) {
  const {
    rawPrompt,
    improvedPrompt,
    promptMode,
    isStale,
    resolution,
    hasSourceImage,
    loadingImprove,
    loadingGenerate,
    status,
    onRawPromptChange,
    onImprovedPromptChange,
    onPromptModeChange,
    onResolutionChange,
    onImprovePrompt,
    onGenerate,
    onReset,
    onFileSelected
  } = props;

  const isBusy = loadingImprove || loadingGenerate;

  return (
    <section className="rounded-2xl border border-slate-800 bg-panel p-5 shadow-2xl shadow-violet-900/10">
      <div className="mb-5">
        <h2 className="text-lg font-semibold">Creation Controls</h2>
        <p className="text-sm text-slate-400">Start from text or upload a source image for iterative edits.</p>
      </div>

      <div className="space-y-4">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">Source Image (optional)</span>
          <input
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            disabled={isBusy}
            className="w-full cursor-pointer rounded-lg border border-slate-700 bg-slate-900 p-2 text-sm"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onFileSelected(file);
            }}
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">Raw prompt</span>
          <textarea
            value={rawPrompt}
            onChange={(e) => onRawPromptChange(e.target.value)}
            rows={5}
            disabled={isBusy}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 p-3 text-sm"
            placeholder={hasSourceImage ? 'Describe edit changes...' : 'Describe the image to generate...'}
          />
        </label>

        <div className="flex items-center gap-2">
          <button
            onClick={onImprovePrompt}
            disabled={!rawPrompt.trim() || isBusy}
            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-700"
          >
            {loadingImprove ? 'Improving...' : 'Improve Prompt'}
          </button>
          {isStale && <span className="text-xs text-amber-300">Prompt changed — re-improve recommended.</span>}
        </div>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">Improved prompt (optional)</span>
          <textarea
            value={improvedPrompt}
            onChange={(e) => onImprovedPromptChange(e.target.value)}
            rows={4}
            disabled={isBusy}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 p-3 text-sm"
            placeholder="Improved prompt appears here after clicking Improve Prompt..."
          />
        </label>

        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-slate-400">Using:</span>
          <button
            type="button"
            disabled={isBusy}
            onClick={() => onPromptModeChange('raw')}
            className={`rounded-lg px-3 py-1 ${promptMode === 'raw' ? 'bg-violet-600 text-white' : 'bg-slate-800 text-slate-300'}`}
          >
            Raw Prompt
          </button>
          <button
            type="button"
            disabled={isBusy || !improvedPrompt.trim()}
            onClick={() => onPromptModeChange('improved')}
            className={`rounded-lg px-3 py-1 ${promptMode === 'improved' ? 'bg-violet-600 text-white' : 'bg-slate-800 text-slate-300'} disabled:opacity-40`}
          >
            Improved Prompt
          </button>
        </div>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">Resolution</span>
          <select
            value={resolution}
            onChange={(e) => onResolutionChange(e.target.value as ResolutionOption)}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 p-2 text-sm"
            disabled={isBusy}
          >
            <option value="default">Default</option>
            <option value="2K">2K</option>
            <option value="4K">4K</option>
          </select>
        </label>

        <div className="flex gap-2">
          <button
            onClick={onGenerate}
            disabled={!rawPrompt.trim() || isBusy}
            className="flex-1 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-700"
          >
            {loadingGenerate ? 'Generating...' : 'Generate'}
          </button>
          <button
            onClick={onReset}
            disabled={isBusy}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200"
          >
            Reset
          </button>
        </div>
      </div>

      {status && <p className="mt-4 rounded-lg bg-slate-900/70 p-2 text-xs text-slate-300">{status}</p>}
    </section>
  );
}
