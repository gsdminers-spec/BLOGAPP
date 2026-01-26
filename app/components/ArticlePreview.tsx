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

    // Fix: Move date calculation to useMemo to avoid impure function during render
    const createdDate = useMemo(() => {
        return new Date(article.created_at || new Date().toISOString());
    }, [article.created_at]);

    return (
        <div
            className="h-full flex flex-col overflow-y-auto custom-scrollbar selection:bg-cyan-500/30 selection:text-cyan-200 bg-[#0a0a0a] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"
        >
            {/* Toolbar / Header within Preview */}
            <div className="sticky top-0 z-10 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-[#30363D] p-4 flex justify-between items-center shadow-md">
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

            <div className="p-8 md:p-12 max-w-7xl mx-auto w-full">
                <article className="bg-[#0a0a0a] rounded-xl border border-[#30363D] overflow-hidden shadow-2xl">
                    <div className="p-8 md:p-12 lg:p-16">
                        {/* Category Badge */}
                        <div className="flex items-center gap-3 mb-6">
                            <span className="px-3 py-1 text-xs font-bold tracking-wider uppercase rounded-full bg-[#F7931A]/10 text-[#F7931A]">
                                {article.category || 'Uncategorized'}
                            </span>
                        </div>

                        {/* Title */}
                        <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-6 leading-tight tracking-tight">
                            {article.title}
                        </h1>

                        {/* Metadata */}
                        <div className="flex flex-wrap items-center gap-6 mb-8 text-gray-400 text-sm font-medium">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>{createdDate.toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                <span>{readingTime} min read</span>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="w-full h-px bg-[#30363D] mb-10"></div>

                        {/* Article Content - THE HOLY GRAIL STYLES */}
                        <div
                            className="prose prose-invert md:prose-xl max-w-none
                                prose-headings:text-white prose-headings:font-bold prose-headings:tracking-tight
                                prose-h2:text-2xl md:prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:pb-4 prose-h2:border-b prose-h2:border-[#30363D]
                                prose-h3:text-xl md:prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
                                prose-p:text-gray-300 prose-p:leading-8 prose-p:mb-6 prose-p:text-lg
                                prose-a:text-[#F7931A] prose-a:no-underline hover:prose-a:underline
                                prose-strong:text-white prose-strong:font-bold
                                prose-ul:text-gray-300 prose-ul:my-6 prose-ul:list-disc prose-ul:pl-6
                                prose-ol:text-gray-300 prose-ol:my-6 prose-ol:list-decimal prose-ol:pl-6
                                prose-li:my-2 prose-li:text-lg
                                prose-code:text-[#F7931A] prose-code:bg-[#161B22] prose-code:px-2 prose-code:py-0.5 prose-code:rounded-md prose-code:text-sm prose-code:font-mono prose-code:border prose-code:border-[#30363D]
                                prose-pre:bg-[#161B22] prose-pre:border prose-pre:border-[#30363D] prose-pre:p-4 prose-pre:rounded-lg"
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
