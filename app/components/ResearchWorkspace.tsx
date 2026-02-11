
'use client';

import { useState, useEffect } from 'react';
import ResearchViewer from './ResearchViewer';
import ReactMarkdown from 'react-markdown';
import { SearchResult } from '@/lib/types';

interface ResearchWorkspaceProps {
    initialTopic?: string;
    onNavigateToPrompt?: (data: { topic: string, results: SearchResult[], aiSummary: string }) => void;
}

export default function ResearchWorkspace({ initialTopic = '', onNavigateToPrompt }: ResearchWorkspaceProps) {
    const [topic, setTopic] = useState(initialTopic);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<SearchResult[]>([]);
    const [aiSummary, setAiSummary] = useState('');
    const [keyFindings, setKeyFindings] = useState<string[]>([]);
    const [isSaved, setIsSaved] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    // Initial Load - Check if topic has data locally
    useEffect(() => {
        if (initialTopic) {
            checkExistingResearch(initialTopic);
        }
    }, [initialTopic]);

    const checkExistingResearch = async (title: string) => {
        // Try to load from session storage
        try {
            const stored = sessionStorage.getItem(`researchData_${title}`);
            if (stored) {
                const data = JSON.parse(stored);
                if (data.results?.length > 0 || data.summary) {
                    setResults(data.results || []);
                    setAiSummary(data.summary || '');
                    setKeyFindings(data.keyFindings || []);
                    setIsSaved(true);
                    setHasSearched(true);
                }
            }
        } catch (e) {
            console.error("Failed to load session research", e);
        }
    };

    const handleSearch = async () => {
        if (!topic) return;
        setLoading(true);
        setKeyFindings([]);
        setAiSummary('');
        setAiSummary('');
        setIsSaved(false);
        setHasSearched(false);

        try {
            const res = await fetch('/api/scraper/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: topic }),
            });

            const data = await res.json();
            if (data.success) {
                setResults(data.results || []); // Moved this line here
                setAiSummary(data.aiSummary || ''); // Moved this line here
                setKeyFindings(data.keyFindings || []);
                setHasSearched(true);

                if (data.results?.length > 0 || data.aiSummary) {
                    // Save to SESSION STORAGE (Temporary)
                    const sessionData = {
                        results: data.results || [],
                        summary: data.aiSummary || '',
                        keyFindings: data.keyFindings || [],
                        lastUpdated: new Date().toISOString()
                    };
                    sessionStorage.setItem(`researchData_${topic}`, JSON.stringify(sessionData));

                    setIsSaved(true);
                }
            } else {
                alert('Search failed: ' + data.error);
            }

        } catch (e) {
            console.error('Search failed', e);
            alert('Search failed. See console.');
        } finally {
            setLoading(false);
        }
    };

    const handleCopyAll = () => {
        const content = `
Topic: ${topic}

Key Findings:
${keyFindings.map((f, i) => `${i + 1}. ${f}`).join('\n')}

AI Summary:
${aiSummary}

Sources:
${results.map((r, i) => `${i + 1}. ${r.title} - ${r.url}`).join('\n')}
    `.trim();
        navigator.clipboard.writeText(content);
        alert('Research data copied to clipboard!');
    };

    const handleSearchAgain = () => {
        setResults([]);
        setKeyFindings([]);
        setAiSummary('');
        setIsSaved(false);
        setHasSearched(false);
    };

    return (
        <div className="flex flex-col gap-6 h-full">
            {/* Search Input Area */}
            <div className="card">
                <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-semibold text-slate-700">🔬 Research Topic</label>
                    {isSaved && <span className="text-xs text-green-600 font-medium">✅ Saved to Session</span>}
                </div>

                <div className="flex gap-2">
                    <input
                        type="text"
                        className="form-input flex-1"
                        placeholder="Enter topic (e.g., Antminer S19 Pro Hashboard Not Detected)"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <button
                        className="btn btn-primary min-w-[120px]"
                        onClick={handleSearch}
                        disabled={loading}
                    >
                        {loading ? '🔍 Searching...' : '🔍 Search'}
                    </button>
                </div>
            </div>

            {/* Results Area */}
            {(results.length > 0 || aiSummary) && (
                <div className="grid md:grid-cols-3 gap-6 flex-1 min-h-0">

                    {/* Left Col: Key Findings + Sources */}
                    <div className="md:col-span-2 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">

                        {/* KEY FINDINGS BOX */}
                        <div className="card bg-amber-50 border-amber-200">
                            <h3 className="font-bold text-amber-900 text-sm mb-3 flex items-center gap-2">
                                📊 Key Findings
                            </h3>
                            {keyFindings.length > 0 ? (
                                <ul className="space-y-2">
                                    {keyFindings.map((finding, i) => (
                                        <li key={i} className="text-sm text-amber-800 flex items-start gap-2">
                                            <span className="text-amber-600">•</span>
                                            {finding}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-amber-800 italic">No key findings extracted.</p>
                            )}
                        </div>

                        {/* SOURCES */}
                        <div>
                            <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                                📚 Sources ({results.length} found)
                            </h3>
                            {results.length > 0 ? (
                                <ResearchViewer results={results} />
                            ) : (
                                <p className="text-sm text-slate-500 italic">No sources returned from search providers.</p>
                            )}
                        </div>
                    </div>

                    {/* Right Col: AI Summary & Actions */}
                    <div className="flex flex-col gap-4">
                        {/* AI Summary Card */}
                        <div className="card bg-indigo-50 border-indigo-100 flex-1 overflow-visible">
                            <h3 className="text-base font-bold text-indigo-900 mb-3 flex items-center gap-2">
                                🧠 AI Master Fact Sheet
                            </h3>
                            <div className="text-sm text-indigo-900 leading-relaxed overflow-x-hidden">
                                {aiSummary ? (
                                    <div className="prose prose-sm prose-indigo max-w-none">
                                        <ReactMarkdown>
                                            {aiSummary}
                                        </ReactMarkdown>
                                    </div>
                                ) : (
                                    <span className="italic text-indigo-400">Analysis pending...</span>
                                )}
                            </div>
                        </div>

                        {/* ACTION BUTTONS */}
                        <div className="card bg-slate-800 text-white border-none">
                            <h3 className="text-sm font-bold mb-3 text-slate-200">Actions</h3>
                            <div className="flex flex-col gap-2">
                                <button
                                    className="btn w-full bg-slate-700 hover:bg-slate-600 text-white border-none text-sm"
                                    onClick={handleSearchAgain}
                                >
                                    🔄 Search Again
                                </button>
                                <button
                                    className="btn w-full bg-slate-700 hover:bg-slate-600 text-white border-none text-sm"
                                    onClick={handleCopyAll}
                                >
                                    📋 Copy All Research
                                </button>
                                <button
                                    className="btn w-full bg-indigo-600 hover:bg-indigo-700 text-white border-none text-sm"
                                    onClick={() => onNavigateToPrompt?.({ topic, results, aiSummary })}
                                >
                                    ➡️ Draft Article
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Empty State vs No Results State */}
            {results.length === 0 && !aiSummary && !loading && (
                <div className="flex-1 flex items-center justify-center">
                    {hasSearched ? (
                        <div className="text-center text-slate-400 py-20">
                            <span className="text-5xl block mb-4">🤷‍♂️</span>
                            <p className="text-lg font-medium text-slate-600">No results found</p>
                            <p className="text-sm mt-2">Try checking your spelling or a more general topic.</p>
                        </div>
                    ) : (
                        <div className="text-center text-slate-400 py-20">
                            <span className="text-5xl block mb-4">🔬</span>
                            <p className="text-lg">Enter a topic above to start research</p>
                            <p className="text-sm mt-2">Data will be gathered from DuckDuckGo & Summarized by Gemini</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
