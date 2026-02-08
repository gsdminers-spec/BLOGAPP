'use client';

import { useState, useEffect } from 'react';
import LinkStudioNew from '@/app/components/LinkStudioNew';
import { marked } from 'marked';

export default function LinkStudioPage() {
    const [content, setContent] = useState('');
    const [articleTitle, setArticleTitle] = useState('');
    const [topicId, setTopicId] = useState('');
    const [loaded, setLoaded] = useState(false);

    // Load article from localStorage (sent from ClaudeOutput)
    useEffect(() => {
        const stored = localStorage.getItem('linkStudioArticle');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setContent(parsed.content || '');
                setArticleTitle(parsed.title || 'Untitled Article');
                setTopicId(parsed.topicId || '');
            } catch (e) {
                console.error('Failed to parse stored article:', e);
            }
        }
        setLoaded(true);
    }, []);

    const handleSaved = () => {
        // Clear storage after successful save
        localStorage.removeItem('linkStudioArticle');
    };

    if (!loaded) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin text-4xl">⏳</div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col gap-6">
            <header>
                <h1 className="text-3xl font-bold text-slate-800">🔗 Link Studio</h1>
                <p className="text-slate-500 mt-1">
                    Add internal links and CTAs to your article before saving.
                </p>
                {articleTitle && (
                    <div className="mt-2 bg-indigo-100 text-indigo-800 px-3 py-1 rounded inline-block text-sm font-medium">
                        📝 {articleTitle}
                    </div>
                )}
            </header>

            <div className="flex-1 grid lg:grid-cols-2 gap-6 min-h-0 overflow-hidden">
                {/* Left: Article Editor */}
                <div className="card flex flex-col h-full p-0 overflow-hidden">
                    <div className="bg-slate-100 p-3 border-b border-slate-200 font-bold text-slate-600 flex justify-between items-center">
                        <span>Article Content (Markdown)</span>
                        <span className="text-xs font-normal text-slate-400">
                            {content.split(' ').filter(w => w).length} words
                        </span>
                    </div>
                    <textarea
                        className="flex-1 p-4 resize-none outline-none font-mono text-sm bg-slate-50 min-h-[400px]"
                        placeholder="Paste your article markdown here or it will be loaded from Final Output..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />
                </div>

                {/* Right: Link Studio Controls */}
                <div className="h-full overflow-y-auto pr-2">
                    {content ? (
                        <LinkStudioNew
                            articleContent={content}
                            articleTitle={articleTitle}
                            topicId={topicId}
                            onUpdate={setContent}
                            onSaved={handleSaved}
                        />
                    ) : (
                        <div className="card bg-yellow-50 border-yellow-200 text-center py-12">
                            <span className="text-4xl mb-4 block">📋</span>
                            <h3 className="font-bold text-yellow-800 text-lg mb-2">No Article Loaded</h3>
                            <p className="text-sm text-yellow-700">
                                Go to <strong>Final Output</strong>, paste your article, and click <strong>&quot;Send to Link Studio&quot;</strong>.
                                <br /><br />
                                Or paste your markdown directly in the editor on the left.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Preview Panel (optional - collapsed by default) */}
            {content && (
                <details className="card">
                    <summary className="cursor-pointer font-bold text-slate-700 mb-2">
                        👁️ Preview Article
                    </summary>
                    <div
                        className="prose prose-sm max-w-none mt-4 p-4 bg-white rounded border"
                        dangerouslySetInnerHTML={{ __html: marked(content) as string }}
                    />
                </details>
            )}
        </div>
    );
}
