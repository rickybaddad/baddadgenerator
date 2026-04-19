'use client';

import { IterationStep } from '@/types';
import { truncateText } from '@/services/client-utils';

interface IterationTimelineProps {
  steps: IterationStep[];
  activeId?: string;
  onUseActive: (id: string) => void;
  onBranchFrom: (id: string) => void;
  onView: (id: string) => void;
  onDownload: (id: string) => void;
}

export function IterationTimeline({ steps, activeId, onUseActive, onBranchFrom, onView, onDownload }: IterationTimelineProps) {
  if (!steps.length) {
    return <div className="rounded-xl border border-dashed border-slate-700 p-4 text-sm text-slate-400">No iterations yet.</div>;
  }

  return (
    <div className="space-y-3">
      {steps.map((step) => (
        <div
          key={step.id}
          className={`rounded-xl border p-3 ${activeId === step.id ? 'border-violet-500 bg-violet-500/10' : 'border-slate-800 bg-slate-900/60'}`}
        >
          <div className="flex gap-3">
            <img
              src={`data:image/png;base64,${step.resultImage}`}
              alt={`Step ${step.stepNumber}`}
              className="h-20 w-20 rounded-md object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-slate-400">Step #{step.stepNumber} · {step.resolution} · {new Date(step.createdAt).toLocaleString()}</p>
              <p className="mt-1 text-sm font-medium">{truncateText(step.improvedPrompt || step.rawPrompt)}</p>
              <p className="text-xs text-slate-500">Branch: {step.branchId.slice(0, 8)}</p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                <button onClick={() => onView(step.id)} className="rounded bg-slate-800 px-2 py-1">View</button>
                <button onClick={() => onDownload(step.id)} className="rounded bg-slate-800 px-2 py-1">Download</button>
                <button onClick={() => onUseActive(step.id)} className="rounded bg-slate-800 px-2 py-1">Use as active</button>
                <button onClick={() => onBranchFrom(step.id)} className="rounded bg-slate-800 px-2 py-1">Branch from here</button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
