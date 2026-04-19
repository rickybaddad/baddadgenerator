'use client';

interface ActivePreviewProps {
  imageBase64?: string;
  onDownload: () => void;
  onUseAsSource: () => void;
}

export function ActivePreview({ imageBase64, onDownload, onUseAsSource }: ActivePreviewProps) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-panel p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Active Image</h2>
        <div className="flex gap-2">
          <button
            onClick={onUseAsSource}
            disabled={!imageBase64}
            className="rounded-lg border border-slate-700 px-3 py-1 text-xs disabled:opacity-40"
          >
            Use as source
          </button>
          <button
            onClick={onDownload}
            disabled={!imageBase64}
            className="rounded-lg bg-violet-600 px-3 py-1 text-xs font-semibold text-white disabled:opacity-40"
          >
            Download PNG
          </button>
        </div>
      </div>
      {imageBase64 ? (
        <img src={`data:image/png;base64,${imageBase64}`} alt="Active generated image" className="max-h-[420px] w-full rounded-xl object-contain" />
      ) : (
        <div className="rounded-xl border border-dashed border-slate-700 p-10 text-center text-sm text-slate-400">
          Generate an image to preview it here.
        </div>
      )}
    </section>
  );
}
