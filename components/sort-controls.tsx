'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

const options = [
  { value: 'time', label: 'Time' },
  { value: 'edge', label: 'Biggest Edge' },
  { value: 'confidence', label: 'Confidence' }
] as const;

export function SortControls() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get('sort') ?? 'time';

  return (
    <div className="flex gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          className={`rounded px-3 py-2 text-sm ${currentSort === option.value ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300'}`}
          onClick={() => {
            const params = new URLSearchParams(searchParams.toString());
            params.set('sort', option.value);
            router.push(`${pathname}?${params.toString()}`);
          }}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
