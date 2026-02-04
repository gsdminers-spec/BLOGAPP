'use client';

import { useState, useEffect } from 'react';
import { PromptData } from '@/lib/types';
import { fetchFullBlogTree } from '@/lib/blogTreeActions';
import { Topic } from '@/lib/supabase';
import { saveArticle } from '@/lib/articleActions';

export default function ArticleGenerator({ initialData }: { initialData?: PromptData | null }) {
    const [topic, setTopic] = useState(initialData?.topic || '');
    const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
    const [preferences, setPreferences] = useState('');
    const [generatedArticle, setGeneratedArticle] = useState('');
    const [loading, setLoading] = useState(false);

    const [availableTopics, setAvailableTopics] = useState<Topic[]>([]);
    const [loadingTree, setLoadingTree] = useState(true);
    const [lastUsedTopic, setLastUsedTopic] = useState('');

    // Load Topics Logic
    useEffect(() => {
        const loadTopics = async () => {
            setLoadingTree(true);
            const savedTopic = localStorage.getItem('lastUsedTopic');
            if (savedTopic) setLastUsedTopic(savedTopic);

            const tree = await fetchFullBlogTree();

            // Flatten all topics from the tree (supporting both hybrid structures)
            const allTopics: Topic[] = [];

            // Use type assertion to handle the complex nested structure including topics
            (tree as any[]).forEach(phase => {
                phase.categories.forEach((cat: any) => {
                    if (cat.topics) allTopics.push(...cat.topics);
                    if (cat.subcategories) {
                        cat.subcategories.forEach((sub: any) => {
                            if (sub.topics) allTopics.push(...sub.topics);
                        });
                    }
                });
            });

            // Filter for PENDING topics only
            const pendingTopics = allTopics.filter(t => t.status === 'pending');

            // Logic: Top topic = Last Used (if found in pending), followed by 4 others
            let finalTopics: Topic[] = [];

            if (savedTopic) {
                const lastUsedIndex = pendingTopics.findIndex(t => t.title === savedTopic);
                if (lastUsedIndex !== -1) {
                    finalTopics.push(pendingTopics[lastUsedIndex]);
                    // Remove from pending so we don't duplicate
                    pendingTopics.splice(lastUsedIndex, 1);
                }
            }

            // Take next 4 (or 5 if no last used found)
            const takeCount = 5 - finalTopics.length;
            finalTopics = [...finalTopics, ...pendingTopics.slice(0, takeCount)];

            setAvailableTopics(finalTopics);
            setLoadingTree(false);
        };

        loadTopics();
    }, []);

    // FIX: Sync state when initialData arrives from parent (e.g. after async session load)
    useEffect(() => {
        if (initialData?.topic) {
            setTopic(initialData.topic);
            console.log("Syncing Topic:", initialData.topic);
        }
    }, [initialData]);

    const handleGenerate = async () => {
        if (!topic || topic === 'custom') {
            alert('Please select a valid topic first');
            return;
        }
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

    const handleSave = async () => {
        if (!generatedArticle || !topic) return;

        // If no ID (custom topic), we can't link it easily yet without asking for category.
        if (!selectedTopicId) {
            alert('Cannot save Custom Topics to DB yet. Please copy manually or select a valid topic.');
            return;
        }

        const res = await saveArticle(selectedTopicId, topic, generatedArticle);
        if (res.success) {
            alert('Article saved to Database! Topic marked as Done. ✅');
            // Clear state after save
            setGeneratedArticle('');
            setTopic('');
            setSelectedTopicId(null);
        } else {
            alert('Failed to save: ' + res.error);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedArticle);
        alert('Article draft copied to clipboard!');
    };

    return (
        <div className="md:h-full grid md:grid-cols-2 gap-6">
            {/* Input Column */}
            <div className="flex flex-col gap-6">
                <div className="card">
                    <h3 className="card-title mb-4">✨ Writer Studio</h3>

                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Target Topic</label>
                        {loadingTree ? (
                            <div className="text-xs text-slate-400 animate-pulse">Loading topics...</div>
                        ) : (
                            <select
                                className="form-select w-full"
                                value={topic}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setTopic(val);
                                    if (val && val !== 'custom') {
                                        localStorage.setItem('lastUsedTopic', val);
                                    }
                                    // Find ID
                                    const found = availableTopics.find(t => t.title === val);
                                    setSelectedTopicId(found?.id || null);
                                }}
                            >
                                <option value="" disabled>-- Select a Topic --</option>
                                {availableTopics.map(t => (
                                    <option key={t.id} value={t.title}>
                                        {t.title} {t.title === lastUsedTopic ? '(Last Used)' : ''}
                                    </option>
                                ))}
                                <option value="custom">-- Type Custom Topic --</option>
                            </select>
                        )}
                        {topic === 'custom' && (
                            <input
                                className="form-input mt-2 w-full"
                                placeholder="Type your custom topic..."
                                onChange={(e) => {
                                    setTopic(e.target.value);
                                    setSelectedTopicId(null); // Custom topics have no ID
                                }}
                            />
                        )}
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Custom Instructions (Optional)</label>
                        <textarea
                            className="form-textarea h-32 w-full"
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
                        disabled={loading || !topic || topic === 'custom'}
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
            <div className="flex flex-col md:h-full min-h-[500px]">
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

                    <div className="flex-1 bg-white relative min-h-[300px]">
                        <textarea
                            className="w-full h-full p-6 resize-none border-none outline-none font-sans text-sm text-slate-800 bg-transparent leading-relaxed"
                            value={generatedArticle}
                            placeholder="Generated article draft will appear here..."
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

                    {/* Action Footer */}
                    <div className="p-3 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                        <button
                            className="btn btn-secondary text-sm"
                            onClick={handleSave}
                            disabled={!generatedArticle || !selectedTopicId}
                            title={!selectedTopicId ? "Select a valid topic to save" : "Save to Database"}
                        >
                            💾 Save &amp; Mark Done
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
