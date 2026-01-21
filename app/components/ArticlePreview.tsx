'use client';

import { Article } from '@/lib/supabase';
import { marked } from 'marked';
import { useMemo } from 'react';
import { Calendar, Clock, ArrowLeft } from 'lucide-react';
// import { Button } from '@/components/ui/button'; // Using native button with classes instead

// Helper to estimate reading time
function getReadingTime(text: string) {
    const wpm = 200;
    const words = text.trim().split(/\s+/).length;
    return Math.ceil(words / wpm);
}

export interface ArticlePreviewProps {
    article: Article;
    onClose: () => void;
    onPublish: (article: Article) => void;
    onUnpublish: (article: Article) => void;
    onDelete: (article: Article) => void;
    onCopy: (content: string) => void;
    onEdit: (article: Article) => void;
}

export default function ArticlePreview({ article, onClose, onPublish, onUnpublish, onDelete, onCopy, onEdit }: ArticlePreviewProps) {
    const htmlContent = useMemo(() => {
        return marked.parse(article.content) as string;
    }, [article.content]);

    const readingTime = getReadingTime(article.content);

    return (
        <div
            className="h-full flex flex-col overflow-y-auto custom-scrollbar selection:bg-cyan-500/30 selection:text-cyan-200"
            style={{
                backgroundColor: '#050505',
                backgroundImage: `
                    linear-gradient(rgba(0, 243, 255, 0.03) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(0, 243, 255, 0.03) 1px, transparent 1px),
                    radial-gradient(circle at 50% 0%, rgba(0, 243, 255, 0.1), transparent 50%),
                    radial-gradient(circle at 0% 50%, rgba(208, 0, 255, 0.05), transparent 40%)
                `,
                backgroundSize: '50px 50px, 50px 50px, 100% 100%, 100% 100%',
                backgroundAttachment: 'fixed'
            }}
        >
            {/* Toolbar / Header within Preview */}
            <div className="sticky top-0 z-10 bg-[#050505]/95 backdrop-blur-md border-b border-[#30363D] p-4 flex justify-between items-center shadow-md">
                <button
                    onClick={onClose}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-medium"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Editor
                </button>

                {/* ADMIN ACTIONS TOOLBAR */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onCopy(article.content)}
                        className="px-3 py-1.5 text-xs font-medium text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-md border border-white/10 transition-all"
                    >
                        📋 Copy
                    </button>

                    <button
                        onClick={() => onEdit(article)}
                        className="px-3 py-1.5 text-xs font-medium text-blue-400 border border-blue-400/30 hover:bg-blue-400/10 rounded-md transition-all"
                    >
                        ✏️ Edit
                    </button>

                    {article.status !== 'scheduled' && article.status !== 'published' && (
                        <button
                            onClick={() => onPublish(article)}
                            className="px-3 py-1.5 text-xs font-medium text-black bg-[#F7931A] hover:bg-[#F7931A]/90 rounded-md transition-all shadow-[0_0_10px_rgba(247,147,26,0.2)]"
                        >
                            🚀 Publish
                        </button>
                    )}

                    {article.status === 'published' && (
                        <button
                            onClick={() => onUnpublish(article)}
                            className="px-3 py-1.5 text-xs font-medium text-orange-400 border border-orange-400/30 hover:bg-orange-400/10 rounded-md transition-all"
                        >
                            🔙 Unpublish
                        </button>
                    )}

                    <button
                        onClick={() => onDelete(article)}
                        className="px-3 py-1.5 text-xs font-medium text-red-500 border border-red-500/30 hover:bg-red-500/10 rounded-md transition-all ml-2"
                    >
                        🗑️ Delete
                    </button>
                </div>
            </div>

            <div className="p-8 md:p-12 max-w-4xl mx-auto w-full">
                <article className="bg-[#161B22] rounded-xl border border-[#30363D] overflow-hidden shadow-2xl">
                    <div className="p-8 md:p-12">
                        {/* Category Badge */}
                        <div className="flex items-center gap-3 mb-6">
                            <span className="px-3 py-1 text-sm font-semibold rounded-full bg-[#F7931A]/10 text-[#F7931A]">
                                {article.category || 'Uncategorized'}
                            </span>
                        </div>

                        {/* Title */}
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">
                            {article.title}
                        </h1>

                        {/* Metadata */}
                        <div className="flex flex-wrap items-center gap-4 mb-8 pb-8 border-b border-[#30363D]">
                            <div className="flex items-center gap-2 text-gray-400 text-sm">
                                <Calendar className="w-4 h-4" />
                                <span>{new Date(article.created_at || Date.now()).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-400 text-sm">
                                <Clock className="w-4 h-4" />
                                <span>{readingTime} min read</span>
                            </div>
                        </div>

                        {/* Article Content - THE HOLY GRAIL STYLES */}
                        <div
                            className="prose prose-invert prose-lg max-w-none
                                prose-headings:text-white prose-headings:font-bold
                                prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:border-b prose-h2:border-[#30363D] prose-h2:pb-2
                                prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
                                prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-4
                                prose-a:text-[#2ECC71] prose-a:no-underline hover:prose-a:underline
                                prose-strong:text-white prose-strong:font-semibold
                                prose-ul:text-gray-300 prose-ul:my-4
                                prose-ol:text-gray-300 prose-ol:my-4
                                prose-li:my-2
                                prose-code:text-[#F7931A] prose-code:bg-[#0E1116] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
                                prose-pre:bg-[#0E1116] prose-pre:border prose-pre:border-[#30363D]
                                [&>blockquote]:border-l-4 [&>blockquote]:border-[#F7931A] [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:text-gray-400"
                            dangerouslySetInnerHTML={{ __html: htmlContent }}
                        />

                        {/* CTA Footer Simulation */}
                        <div className="mt-12 p-6 bg-[#0E1116] rounded-lg border border-[#30363D]">
                            <h3 className="text-xl font-bold text-white mb-3">
                                Need Professional ASIC Repair Services?
                            </h3>
                            <p className="text-gray-400 mb-4">
                                ASICREPAIR.in provides expert repair and maintenance services...
                            </p>
                            <button className="btn btn-primary bg-[#F7931A] hover:bg-[#F7931A]/90 text-white px-4 py-2 rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                                Contact Us
                            </button>
                        </div>
                    </div>
                </article>
            </div>
        </div>
    );
}
