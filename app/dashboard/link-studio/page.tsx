'use client';

import { useState } from 'react';
import LinkStudio from '@/app/components/LinkStudio';
import { saveArticle } from '@/lib/articleActions';

export default function LinkStudioPage() {
    const [content, setContent] = useState('');
    const [articleId, setArticleId] = useState<string | null>(null);

    const handleSave = async () => {
        // Here we would save to DB. 
        // For now, since this is a manual tool, we can just Copy to Clipboard or
        // if we have an ID, update the DB.

        if (articleId) {
            // Update logic if we have an ID
            // await updateArticle(articleId, { content });
            alert('Integrate update logic here or manually copy/paste for now.');
        } else {
            navigator.clipboard.writeText(content);
            alert('Content copied to clipboard! You can now publish it.');
        }
    };

    return (
        <div className="h-full flex flex-col gap-6">
            <header>
                <h1 className="text-3xl font-bold text-slate-800">🔗 Link & CTA Studio</h1>
                <p className="text-slate-500">
                    Manually inject internal links and CTAs into your articles.
                </p>
            </header>

            <div className="flex-1 grid md:grid-cols-2 gap-6 min-h-0">
                {/* Input / Editor Side */}
                <div className="card flex flex-col h-full p-0 overflow-hidden">
                    <div className="bg-slate-100 p-3 border-b border-slate-200 font-bold text-slate-600">
                        Input Article (Markdown)
                    </div>
                    <textarea
                        className="flex-1 p-4 resize-none outline-none font-mono text-sm bg-slate-50"
                        placeholder="Paste your article markdown here..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />
                </div>

                {/* Studio Controls */}
                <div className="h-full overflow-y-auto">
                    <LinkStudio
                        articleContent={content}
                        onUpdate={setContent}
                        onSave={handleSave}
                    />

                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                        <strong>Tip:</strong> Paste your article on the left, use the buttons above to inject links/CTAs, then copy the result to publish.
                    </div>
                </div>
            </div>
        </div>
    );
}
