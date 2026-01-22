'use client';

import { useState } from 'react';
import { PromptData } from '@/lib/types';

export default function ArticleGenerator({ initialData }: { initialData?: PromptData | null }) {
    const [topic, setTopic] = useState(initialData?.topic || '');
    const [preferences, setPreferences] = useState('');
    const [generatedArticle, setGeneratedArticle] = useState('');
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        if (!topic) return;
        setLoading(true);
        try {
            const res = await fetch('/api/generate/article', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    topic,
                    scrapedData: initialData?.results,
                    preferences: { additionalNotes: preferences }
                }),
            });
            const data = await res.json();
            if (data.success) {
                setGeneratedArticle(data.article);
            } else {
                alert('Generation failed: ' + data.error);
            }
        } catch (e) {
            console.error('Article Gen Error', e);
            alert('Generation failed. See console.');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedArticle);
        alert('Article draft copied to clipboard!');
    };

    return (
        <div className="h-full grid md:grid-cols-2 gap-6">

            {/* Input Column */}
            <div className="flex flex-col gap-6">
                <div className="card">
                    <h3 className="card-title mb-4">✨ Writer Studio</h3>

                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Target Topic</label>
                        <input
                            className="form-input"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="e.g. ASIC Repair Guide"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Custom Instructions (Optional)</label>
                        <textarea
                            className="form-textarea h-32"
                            placeholder="E.g., Focus on voltage regulation, mention specific tools, tone should be very technical..."
                            value={preferences}
                            onChange={(e) => setPreferences(e.target.value)}
                        />
                    </div>

                    <div className="bg-blue-50 p-3 rounded text-xs text-blue-700 mb-4 border border-blue-100">
                        <strong>Research Context:</strong> {initialData?.results?.length || 0} research sources loaded from previous step.
                    </div>

                    <button
                        className="btn btn-primary w-full"
                        onClick={handleGenerate}
                        disabled={loading}
                    >
                        {loading ? '🧠 Generating Draft...' : '🚀 Generate Base Article'}
                    </button>
                </div>

                <div className="card bg-slate-50 border-slate-200">
                    <h4 className="font-semibold text-slate-700 text-sm mb-2">Workflow</h4>
                    <ol className="text-sm text-slate-600 list-decimal list-inside space-y-1">
                        <li>Review research context (loaded automatically).</li>
                        <li>Add any specific instructions above.</li>
                        <li>Click Generate to create a base draft.</li>
                        <li>Copy the draft and refine it manually.</li>
                    </ol>
                </div>
            </div>

            {/* Output Column */}
            <div className="flex flex-col h-full">
                <div className="card flex-1 flex flex-col p-0 overflow-hidden border-indigo-200 shadow-md">
                    <div className="bg-indigo-50 p-3 border-b border-indigo-100 flex justify-between items-center">
                        <h3 className="font-bold text-indigo-900 text-sm">📄 Generated Article Draft</h3>
                        <div className="flex gap-2">
                            <button
                                className="text-xs bg-white border border-indigo-200 px-3 py-1.5 rounded text-indigo-700 hover:bg-indigo-50 font-medium transition-colors"
                                onClick={copyToClipboard}
                                disabled={!generatedArticle}
                            >
                                📋 Copy Draft
                            </button>
                        </div>

                    </div>

                    <div className="flex-1 bg-white relative">
                        <textarea
                            className="w-full h-full p-6 resize-none border-none outline-none font-sans text-sm text-slate-800 bg-transparent leading-relaxed"
                            value={generatedArticle}
                            placeholder="Generated article draft will appear here..."
                            readOnly={false} // Allow user to edit locally if they want before copying? keeping editable might be good
                            onChange={(e) => setGeneratedArticle(e.target.value)}
                        />
                        {!generatedArticle && !loading && (
                            <div className="absolute inset-0 flex items-center justify-center text-slate-300 pointer-events-none">
                                <span className="flex flex-col items-center gap-2">
                                    <span className="text-4xl">📝</span>
                                    <span>Ready to generate draft</span>
                                </span>
                            </div>
                        )}
                        {loading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-10 text-indigo-600 font-medium animate-pulse">
                                Writing your article...
                            </div>
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
}
