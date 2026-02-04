'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { updateArticle, fetchRecentTopics } from '@/lib/articleActions'; // Updated: Using updateArticle
import { Topic, Article } from '@/lib/supabase';
import { Save, Link as LinkIcon, Edit3, ArrowRight } from 'lucide-react';

// Static Parts Data
const sparePartsCategories = [
    { title: "Stabilizers", link: "/parts/stabilizers" },
    { title: "Silencers / Blowers", link: "/parts/silencers" },
    { title: "Thermal Paste", link: "/parts/thermal-paste" },
    { title: "Power Cables", link: "/parts/power-cables" },
    { title: "Power Supplies (PSU)", link: "/parts/power-supplies" },
    { title: "Control Boards", link: "/parts/control-boards" },
    { title: "Shrouds", link: "/parts/shrouds" },
    { title: "Cleaning Kits", link: "/parts/cleaning-kits" }
];

export default function SeoLinksPage() {
    // List State
    const [drafts, setDrafts] = useState<Article[]>([]);
    const [selectedDraftId, setSelectedDraftId] = useState<string | null>(null);

    // Editor State
    const [content, setContent] = useState('');
    const [title, setTitle] = useState('');

    // Dropdown Data
    const [blogs, setBlogs] = useState<{ title: string, slug: string }[]>([]);
    const [loading, setLoading] = useState(false);

    // Load Data
    const loadDrafts = async () => {
        const { data, error } = await supabase
            .from('articles')
            .select('*')
            .eq('status', 'draft') // Only fetch Staging articles
            .order('created_at', { ascending: false });

        if (data) setDrafts(data);
    };

    useEffect(() => {
        const init = async () => {
            await loadDrafts();

            // Fetch Published Blogs for Linking (From 'Internal Linking' category only)
            const { data: blogData } = await supabase
                .from('blog_articles')
                .select('title, slug')
                .eq('category', 'Internal Linking') // Filter by Internal Linking category
                .order('published_date', { ascending: false });

            if (blogData) setBlogs(blogData);
        };
        init();
    }, []);

    const handleSelectDraft = (article: Article) => {
        setSelectedDraftId(article.id);
        setTitle(article.title);
        setContent(article.content);
    };

    const insertTextAtCursor = (textToInsert: string) => {
        const textarea = document.getElementById('md-editor') as HTMLTextAreaElement;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const before = text.substring(0, start);
        const after = text.substring(end, text.length);

        const newText = before + textToInsert + after;
        setContent(newText);

        // Restore focus
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + textToInsert.length, start + textToInsert.length);
        }, 0);
    };

    const handleInsertBlog = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const slug = e.target.value;
        if (!slug) return;
        const blog = blogs.find(b => b.slug === slug);
        if (blog) insertTextAtCursor(`[${blog.title}](/blog/${slug})`);
        e.target.value = "";
    };

    const handleInsertPart = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const link = e.target.value;
        if (!link) return;
        const part = sparePartsCategories.find(p => p.link === link);
        if (part) insertTextAtCursor(`[${part.title}](${link})`);
        e.target.value = "";
    };

    const handlePushToArticles = async () => {
        if (!selectedDraftId) return;
        if (!title.trim() || !content.trim()) return alert('Title and content required.');

        setLoading(true);
        try {
            // 1. Update Content First
            const { error: updateError } = await supabase
                .from('articles')
                .update({ title, content, status: 'ready' }) // Promote to 'ready'
                .eq('id', selectedDraftId);

            if (updateError) throw updateError;

            alert('✅ Article Pushed to Articles List!');

            // Reset
            setSelectedDraftId(null);
            setTitle('');
            setContent('');
            loadDrafts(); // Refresh list

        } catch (error: any) {
            console.error(error);
            alert('Error: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-full flex flex-col gap-4">
            <header className="border-b border-slate-200 pb-4">
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    🔗 SEO Link Staging
                </h1>
                <p className="text-slate-500 text-sm">
                    Select a draft, add internal links, and push to the main Articles list.
                </p>
            </header>

            <div className="flex-1 grid md:grid-cols-12 gap-6 min-h-0">

                {/* LIST PANEL (Left - 3 cols) */}
                <div className="md:col-span-3 border-r border-slate-200 pr-4 flex flex-col gap-3 overflow-y-auto custom-scrollbar">
                    <h3 className="text-xs font-bold text-slate-500 uppercase">Pending Drafts ({drafts.length})</h3>
                    {drafts.length === 0 ? (
                        <div className="text-sm text-slate-400 italic py-4">No drafts found. Add from Final Output.</div>
                    ) : (
                        drafts.map(d => (
                            <button
                                key={d.id}
                                onClick={() => handleSelectDraft(d)}
                                className={`text-left p-3 rounded-lg border transition-all text-sm group ${selectedDraftId === d.id
                                    ? 'bg-blue-50 border-blue-400 ring-1 ring-blue-400'
                                    : 'bg-white border-slate-200 hover:border-blue-300'
                                    }`}
                            >
                                <div className="font-semibold text-slate-800 line-clamp-2 group-hover:text-blue-700">
                                    {d.title}
                                </div>
                                <div className="text-[10px] text-slate-400 mt-1">
                                    {new Date(d.created_at!).toLocaleDateString()}
                                </div>
                            </button>
                        ))
                    )}
                </div>

                {/* EDITOR PANEL (Center - 6 cols) */}
                <div className="md:col-span-6 flex flex-col gap-4 h-full relative">
                    {!selectedDraftId && (
                        <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center text-slate-400">
                            Select a draft to edit...
                        </div>
                    )}
                    <div className="flex flex-col gap-2 h-full">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Editing Title</label>
                            <input
                                className="form-input w-full font-bold"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                disabled={!selectedDraftId}
                            />
                        </div>
                        <div className="flex-1 flex flex-col min-h-0">
                            <label className="text-xs font-bold text-slate-500 uppercase mb-1">Content</label>
                            <textarea
                                id="md-editor"
                                className="flex-1 p-4 resize-none border rounded-md outline-none font-mono text-sm bg-slate-50 focus:bg-white focus:border-blue-400 transition-colors custom-scrollbar"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                disabled={!selectedDraftId}
                            />
                        </div>
                    </div>
                </div>

                {/* TOOLS PANEL (Right - 3 cols) */}
                <div className="md:col-span-3 flex flex-col gap-4 h-full pl-2">
                    <div className="card p-4 bg-blue-50 border-blue-200 flex flex-col gap-4">
                        <h3 className="font-bold text-blue-900 flex items-center gap-2 text-sm">
                            <LinkIcon className="w-4 h-4" /> Insert Links
                        </h3>

                        <div>
                            <label className="text-[10px] font-semibold text-blue-800 mb-1 block uppercase">Link Blog</label>
                            <select
                                className="form-select w-full text-xs"
                                onChange={handleInsertBlog}
                                disabled={!selectedDraftId}
                                defaultValue=""
                            >
                                <option value="" disabled>Select...</option>
                                {blogs.map(b => (
                                    <option key={b.slug} value={b.slug}>{b.title.substring(0, 30)}...</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-[10px] font-semibold text-blue-800 mb-1 block uppercase">Link Part</label>
                            <select
                                className="form-select w-full text-xs"
                                onChange={handleInsertPart}
                                disabled={!selectedDraftId}
                                defaultValue=""
                            >
                                <option value="" disabled>Select...</option>
                                {sparePartsCategories.map(p => (
                                    <option key={p.link} value={p.link}>{p.title}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <button
                        onClick={handlePushToArticles}
                        disabled={!selectedDraftId || loading}
                        className={`btn w-full py-3 flex items-center justify-center gap-2 ${!selectedDraftId ? 'btn-disabled opacity-50 cursor-not-allowed' : 'btn-primary bg-green-600 hover:bg-green-700'
                            }`}
                    >
                        {loading ? 'Saving...' : (
                            <>
                                <Save className="w-4 h-4" /> Push to Articles
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
