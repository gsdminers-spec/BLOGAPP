'use client';

import { useState, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';

function ResearchLabContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Fix: Initialize with empty string to avoid Hydration Mismatch
    const [topic, setTopic] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState('Ready');

    useEffect(() => {
        const urlTopic = searchParams.get('topic');
        if (urlTopic) {
            setTopic(urlTopic);
        }
    }, [searchParams]);

    // Research Results
    const [factSheet, setFactSheet] = useState('');
    const [reasoning, setReasoning] = useState('');
    const [sources, setSources] = useState<any[]>([]);

    // Committee Logs (Visualizer)
    const [logs, setLogs] = useState<string[]>([]);

    const addLog = (msg: string) => setLogs(prev => [...prev, `> ${msg}`]);

    // Auto-run if topic came from URL? 
    // For now, we pre-fill it. User clicks Run.

    const handleResearch = async () => {
        if (!topic) return;
        setIsLoading(true);
        setStatus('Initializing Deep Research...');
        setLogs([]);
        setFactSheet('');
        setReasoning('');

        try {
            addLog(`Starting Tri-Engine Search for: "${topic}"`);

            // Call API Action: Research
            const res = await fetch('/api/research', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'research', topic })
            });

            const json = await res.json();

            if (!json.success) throw new Error(json.error);

            addLog("Tri-Engine Search Complete.");
            addLog(`Found ${json.data.rawSources.length} sources.`);
            addLog("Gemini Lite Analysis Complete.");

            const safeFactSheet = typeof json.data.factSheet === 'string'
                ? json.data.factSheet
                : typeof json.data.factSheet === 'object'
                    ? JSON.stringify(json.data.factSheet, null, 2)
                    : String(json.data.factSheet || '');

            const safeReasoning = typeof json.data.reasoning === 'string'
                ? json.data.reasoning
                : typeof json.data.reasoning === 'object'
                    ? JSON.stringify(json.data.reasoning, null, 2)
                    : String(json.data.reasoning || '');

            setSources(Array.isArray(json.data.rawSources) ? json.data.rawSources : []);
            setFactSheet(safeFactSheet);
            setReasoning(safeReasoning);
            setStatus('Research Complete. Ready to Draft.');

        } catch (e: any) {
            console.error(e);
            const errorMessage = typeof e.message === 'string' ? e.message : 'Unknown Error';
            setStatus('Error: ' + errorMessage);
            addLog(`ERROR: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDraft = () => {
        // Save using the standard format expected by ArticleGenerator
        const payload = {
            results: sources,
            summary: factSheet + (reasoning ? `\n\n### Reasoning Trace\n${reasoning}` : "")
        };

        try {
            sessionStorage.setItem(`researchData_${topic}`, JSON.stringify(payload));
            // Navigate WITH topic param to trigger the robust "Method 1" loading logic
            router.push(`/dashboard/generate?topic=${encodeURIComponent(topic)}`);
        } catch (e) {
            console.error("Session Save Failed", e);
            alert("Failed to save research data. Storage might be full.");
        }
    };

    return (
        <div className="h-full flex flex-col p-6 gap-6 max-w-7xl mx-auto">
            {/* HEADER */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">🔬 Intelligence Lab</h1>
                    <p className="text-sm text-slate-500">Mimo V2 • Llama 3.3 • Chimera R1 • Gemini 2.5</p>
                </div>
                <div className={`px-3 py-1 rounded text-xs font-mono ${isLoading ? 'bg-yellow-100 text-yellow-700 animate-pulse' : 'bg-slate-100 text-slate-600'}`}>
                    STATUS: {typeof status === 'string' ? status : 'Status Unknown'}
                </div>
            </div>

            {/* MAIN GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">

                {/* LEFT COLUMN: Controls & Logs (4 cols) */}
                <div className="lg:col-span-4 flex flex-col gap-4">
                    {/* INPUT CARD */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <label className="text-sm font-semibold text-slate-700 mb-2 block">Research Topic</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="e.g. ASIC Repair Guide"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleResearch()}
                            />
                            <button
                                onClick={handleResearch}
                                disabled={isLoading || !topic}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                            >
                                {isLoading ? 'Running...' : 'Run'}
                            </button>
                        </div>
                    </div>

                    {/* SOURCE LIST */}
                    <div className="bg-slate-50 rounded-xl border border-slate-200 flex-1 flex flex-col min-h-0 overflow-hidden">
                        <div className="p-3 border-b border-slate-200 bg-slate-100 font-semibold text-xs text-slate-600">
                            DATA SOURCES ({sources.length})
                        </div>
                        <div className="p-2 overflow-y-auto flex-1 space-y-2">
                            {sources.length === 0 && <div className="text-center text-slate-400 text-xs py-4">No sources yet. Run research.</div>}
                            {sources.map((s, i) => (
                                <a key={i} href={s.url} target="_blank" className="block p-2 bg-white rounded border border-slate-100 hover:border-indigo-300 transition-colors text-xs text-slate-700 truncate">
                                    <span className="font-bold text-indigo-600 mr-2">[{i + 1}]</span>
                                    {s.title}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* SYSTEM LOGS */}
                    <div className="bg-black rounded-xl p-4 font-mono text-xs text-green-400 h-48 overflow-y-auto">
                        <div className="opacity-50 mb-2">// SYSTEM LOGS</div>
                        {logs.map((log, i) => (
                            <div key={i}>{typeof log === 'string' ? log : JSON.stringify(log)}</div>
                        ))}
                    </div>
                </div>

                {/* RIGHT COLUMN: Output (8 cols) */}
                <div className="lg:col-span-8 flex flex-col gap-4">
                    {/* RESULTS VIEWER */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex-1 flex flex-col overflow-hidden relative">
                        {/* Reasoning Drawer (Collapsible-ish) */}
                        {reasoning && (
                            <div className="bg-amber-50 border-b border-amber-100 p-4 max-h-48 overflow-y-auto">
                                <h3 className="text-xs font-bold text-amber-800 mb-1">🤖 MIMO REASONING TRACE</h3>
                                <p className="text-xs text-amber-700 whitespace-pre-wrap">{reasoning}</p>
                            </div>
                        )}

                        <div className="flex-1 overflow-y-auto p-8 prose prose-slate max-w-none">
                            {factSheet ? (
                                <ReactMarkdown>{factSheet}</ReactMarkdown>
                            ) : (
                                <div className="h-full flex items-center justify-center text-slate-300">
                                    <div className="text-center">
                                        <div className="text-4xl mb-4">🧬</div>
                                        <p>The Lab is empty.</p>
                                        <p className="text-sm">Enter a topic to activate the Tri-Engine.</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ACTION BAR */}
                        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
                            <button
                                onClick={handleDraft}
                                disabled={!factSheet}
                                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-bold shadow-lg shadow-emerald-200 transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none"
                            >
                                <span>Enter Writer Studio</span>
                                <span>👉</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ResearchLab() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading Research Lab...</div>}>
            <ResearchLabContent />
        </Suspense>
    );
}
