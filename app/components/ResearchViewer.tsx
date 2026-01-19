
'use client';

import { SearchResult } from '@/lib/types';

export default function ResearchViewer({ results }: { results: SearchResult[] }) {
    if (!results || results.length === 0) return null;

    return (
        <div className="flex flex-col gap-4">
            {results.map((item, i) => (
                <div key={i} className="card p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <h4 className="font-semibold text-blue-700 text-base mb-1 truncate max-w-[80%]">
                            <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                {item.title}
                            </a>
                        </h4>
                        <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded capitalize">
                            {item.source || `Src #${i + 1}`}
                        </span>
                    </div>
                    <p className="text-sm text-slate-600 mt-2 line-clamp-3">
                        {item.content}
                    </p>
                    <div className="mt-3 flex justify-end">
                        <button
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                            onClick={() => navigator.clipboard.writeText(item.content)}
                        >
                            📋 Copy Snippet
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
