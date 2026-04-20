'use client';

import { useMemo, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ActivePreview } from '@/components/active-preview';
import { ControlPanel } from '@/components/control-panel';
import { DEFAULT_GEMINI_IMAGE_MODEL } from '@/config/constants';
import { IterationTimeline } from '@/components/iteration-timeline';
import { downloadBase64Png, fileToDataUrl, parseDataUrl, validateImageFile } from '@/services/client-utils';
import { GeminiImageModelId, IterationStep, PromptImprovementResult, PromptMode, ResolutionOption } from '@/types';

export default function Home() {
  const [rawPrompt, setRawPrompt] = useState('');
  const [improvedPrompt, setImprovedPrompt] = useState('');
  const [isImprovedPromptStale, setIsImprovedPromptStale] = useState(false);
  const [activePromptMode, setActivePromptMode] = useState<PromptMode>('raw');
  const [resolution, setResolution] = useState<ResolutionOption>('default');
  const [model, setModel] = useState<GeminiImageModelId>(DEFAULT_GEMINI_IMAGE_MODEL);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [sourceImageDataUrl, setSourceImageDataUrl] = useState<string | undefined>();
  const [currentImage, setCurrentImage] = useState<string | undefined>();
  const [iterationChain, setIterationChain] = useState<IterationStep[]>([]);
  const [activeStepId, setActiveStepId] = useState<string | undefined>();
  const [loadingImprove, setLoadingImprove] = useState(false);
  const [loadingGenerate, setLoadingGenerate] = useState(false);
  const [lastReasoningSummary, setLastReasoningSummary] = useState('');

  const activeStep = useMemo(
    () => iterationChain.find((step) => step.id === activeStepId),
    [activeStepId, iterationChain]
  );

  const selectedPrompt = activePromptMode === 'improved' && improvedPrompt.trim() ? improvedPrompt : rawPrompt;

  const handleRawPromptChange = (value: string) => {
    setRawPrompt(value);
    if (improvedPrompt.trim()) {
      setIsImprovedPromptStale(true);
    }
  };

  const handleImprovePrompt = async () => {
    setError('');
    if (!rawPrompt.trim()) {
      setError('Prompt required.');
      return;
    }

    setLoadingImprove(true);
    setStatus('Improving prompt with Gemini...');

    try {
      const mode = sourceImageDataUrl || currentImage ? 'edit' : 'new_generation';
      const res = await fetch('/api/improve-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawPrompt, mode })
      });
      const json = (await res.json()) as PromptImprovementResult & { error?: string };

      if (!res.ok) {
        throw new Error(json.error || 'Failed to improve prompt');
      }

      setImprovedPrompt(json.improved_prompt);
      setActivePromptMode('improved');
      setIsImprovedPromptStale(false);
      setLastReasoningSummary(json.short_reasoning_summary);
      setStatus('Prompt improved. Ready to generate.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Prompt improvement failed.');
    } finally {
      setLoadingImprove(false);
    }
  };

  const handleGenerate = async () => {
    setError('');
    const promptToUse = selectedPrompt.trim();

    if (!promptToUse) {
      setError('Prompt required.');
      return;
    }

    setLoadingGenerate(true);
    setStatus('Generating image with Gemini...');

    try {
      const source = sourceImageDataUrl || (activeStep ? `data:image/png;base64,${activeStep.resultImage}` : undefined);
      const sourceImage = source ? parseDataUrl(source) : undefined;

      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptToUse,
          model,
          resolution,
          sourceImage,
          previousConversationContents: activeStep?.geminiMetadata.conversationContents
        })
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Generation failed');
      }

      const newId = uuidv4();
      const parentId = activeStep?.id || null;
      const branchId = activeStep ? activeStep.branchId : newId;

      const newStep: IterationStep = {
        id: newId,
        parentId,
        branchId,
        stepNumber: iterationChain.length + 1,
        createdAt: new Date().toISOString(),
        mode: sourceImage ? 'edit' : 'new_generation',
        rawPrompt,
        improvedPrompt: improvedPrompt || undefined,
        reasoningSummary: lastReasoningSummary || undefined,
        resolution,
        sourceImage: sourceImage?.data,
        resultImage: json.imageBase64,
        geminiMetadata: json.metadata,
        active: true
      };

      setIterationChain((prev) => prev.map((step) => ({ ...step, active: false })).concat(newStep));
      setActiveStepId(newId);
      setCurrentImage(json.imageBase64);
      setStatus('Image generated successfully.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setLoadingGenerate(false);
    }
  };

  const handleBranchFrom = (id: string) => {
    const step = iterationChain.find((s) => s.id === id);
    if (!step) return;

    const newBranchId = uuidv4();
    setActiveStepId(step.id);
    setCurrentImage(step.resultImage);
    setIterationChain((prev) => prev.map((s) => ({ ...s, active: s.id === step.id, branchId: s.id === step.id ? newBranchId : s.branchId })));
    setStatus(`Branched from step #${step.stepNumber}. Next generation will continue from here.`);
  };

  const handleUseActive = (id: string) => {
    const step = iterationChain.find((s) => s.id === id);
    if (!step) return;
    setActiveStepId(id);
    setCurrentImage(step.resultImage);
    setIterationChain((prev) => prev.map((s) => ({ ...s, active: s.id === id })));
  };

  const handleView = (id: string) => {
    handleUseActive(id);
  };

  const handleDownloadStep = (id: string) => {
    const step = iterationChain.find((s) => s.id === id);
    if (!step) return;
    downloadBase64Png(step.resultImage, `iteration-step-${step.stepNumber}.png`);
  };

  const handleUpload = async (file: File) => {
    setError('');
    try {
      validateImageFile(file);
      const dataUrl = await fileToDataUrl(file);
      setSourceImageDataUrl(dataUrl);
      setStatus('Source image loaded. Ready for edit flow.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process image.');
    }
  };

  const handleReset = () => {
    setRawPrompt('');
    setImprovedPrompt('');
    setIsImprovedPromptStale(false);
    setActivePromptMode('raw');
    setResolution('default');
    setModel(DEFAULT_GEMINI_IMAGE_MODEL);
    setSourceImageDataUrl(undefined);
    setCurrentImage(undefined);
    setIterationChain([]);
    setActiveStepId(undefined);
    setError('');
    setStatus('Session reset.');
    setLastReasoningSummary('');
  };

  const handleUseAsSource = () => {
    if (!currentImage) return;
    setSourceImageDataUrl(`data:image/png;base64,${currentImage}`);
    setStatus('Active image set as source for next edit.');
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 md:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">Iterative Gemini Creative Studio</h1>
          <p className="mt-1 text-sm text-slate-400">Premium AI workflow: raw prompts, optional OpenAI improvement, iterative Gemini generation, visual chain history.</p>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          <ControlPanel
            rawPrompt={rawPrompt}
            improvedPrompt={improvedPrompt}
            promptMode={activePromptMode}
            isStale={isImprovedPromptStale}
            resolution={resolution}
            model={model}
            hasSourceImage={Boolean(sourceImageDataUrl || currentImage)}
            loadingImprove={loadingImprove}
            loadingGenerate={loadingGenerate}
            status={status}
            onRawPromptChange={handleRawPromptChange}
            onImprovedPromptChange={setImprovedPrompt}
            onPromptModeChange={setActivePromptMode}
            onResolutionChange={setResolution}
            onModelChange={setModel}
            onImprovePrompt={handleImprovePrompt}
            onGenerate={handleGenerate}
            onReset={handleReset}
            onFileSelected={handleUpload}
          />

          <section className="space-y-4">
            <ActivePreview
              imageBase64={currentImage}
              onDownload={() => currentImage && downloadBase64Png(currentImage, 'gemini-output.png')}
              onUseAsSource={handleUseAsSource}
            />

            <section className="rounded-2xl border border-slate-800 bg-panel p-5">
              <h2 className="mb-3 text-lg font-semibold">Iteration Timeline</h2>
              <IterationTimeline
                steps={iterationChain}
                activeId={activeStepId}
                onUseActive={handleUseActive}
                onBranchFrom={handleBranchFrom}
                onView={handleView}
                onDownload={handleDownloadStep}
              />
            </section>

            {error && <p className="rounded-xl border border-rose-800 bg-rose-950/40 p-3 text-sm text-rose-200">{error}</p>}
          </section>
        </div>
      </div>
    </main>
  );
}
