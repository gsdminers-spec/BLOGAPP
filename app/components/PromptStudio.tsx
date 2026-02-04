
'use client';

import { useState } from 'react';
import { PromptData } from '@/lib/types';

export default function PromptStudio({ initialData }: { initialData?: PromptData | null }) {
    const [topic, setTopic] = useState(initialData?.topic || '');
    const [preferences, setPreferences] = useState('');
    const [generatedPrompt, setGeneratedPrompt] = useState('');
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        if (!topic) return;
        setLoading(true);
        try {
            const res = await fetch('/api/prompt/generate', {
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
                setGeneratedPrompt(data.prompt);
            }
        } catch (e) {
            console.error('Prompt Gen Error', e);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedPrompt);
        alert('Prompt copied to clipboard!');
    };

    return (
        <div className="h-full grid md:grid-cols-2 gap-6">

            {/* Input Column */}
            <div className="flex flex-col gap-6">
                <div className="card">
                    <h3 className="card-title mb-4">✨ Generate Context</h3>

                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Target Topic</label>
                        <input
                            className="form-input"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Custom Preferences (Optional)</label>
                        <textarea
                            className="form-textarea h-32"
                            placeholder="E.g., Focus on voltage regulation steps, warning about ESD safety..."
                            value={preferences}
                            onChange={(e) => setPreferences(e.target.value)}
                        />
                    </div>

                    <div className="bg-slate-50 p-3 rounded text-xs text-slate-500 mb-4">
                        <strong>Context Data:</strong> {initialData?.results?.length || 0} research sources loaded.
                    </div>

                    <button
                        className="btn btn-primary w-full"
                        onClick={handleGenerate}
                        disabled={loading}
                    >
                        {loading ? '🧠 Generating via Gemini...' : '🚀 Generate Claude Prompt'}
                    </button>
                </div>
            </div>

            {/* Output Column */}
            <div className="flex flex-col h-full">
                <div className="card flex-1 flex flex-col p-0 overflow-hidden border-indigo-200">
                    <div className="bg-indigo-50 p-3 border-b border-indigo-100 flex justify-between items-center">
                        <h3 className="font-bold text-indigo-900 text-sm">📝 Claude-Ready Prompt</h3>
                        <button
                            className="text-xs bg-white border border-indigo-200 px-2 py-1 rounded text-indigo-700 hover:bg-indigo-50"
                            onClick={copyToClipboard}
                            disabled={!generatedPrompt}
                        >
                            📋 Copy
                        </button>
                    </div>

                    <div className="flex-1 bg-white relative">
                        <textarea
                            className="w-full h-full p-4 resize-none border-none outline-none font-mono text-sm text-slate-700 bg-transparent"
                            value={generatedPrompt}
                            placeholder="Generated prompt will appear here..."
                            readOnly
                        />
                        {!generatedPrompt && !loading && (
                            <div className="absolute inset-0 flex items-center justify-center text-slate-300 pointer-events-none">
                                Waiting for input...
                            </div>
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
}
