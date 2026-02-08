'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { saveArticle } from '@/lib/articleActions';
import { useRouter } from 'next/navigation';

// Spare Parts from asicrepair.in website
const sparePartsLinks = [
    { title: "Stabilizers for ASIC Miners", url: "/stabilizers" },
    { title: "Silencers / Blowers", url: "/silencers" },
    { title: "Thermal Paste", url: "/thermal-paste" },
    { title: "Power Cables", url: "/power-cables" },
    { title: "Power Supplies (PSU)", url: "/psu" },
    { title: "Control Boards", url: "/control-boards" },
    { title: "Shrouds", url: "/shrouds" },
    { title: "Hashboard Cleaning Kit", url: "/cleaning-kits" },
];

// Simple interface for the articles we're fetching
interface SupportArticleLink {
    id: string;
    title: string;
    slug: string;
}

interface LinkStudioProps {
    articleContent: string;
    articleTitle: string;
    topicId: string;
    onUpdate: (newContent: string) => void;
    onSaved?: () => void;
}

export default function LinkStudioNew({ articleContent, articleTitle, topicId, onUpdate, onSaved }: LinkStudioProps) {
    const [status, setStatus] = useState<string>('');
    const [supportArticles, setSupportArticles] = useState<SupportArticleLink[]>([]);
    const [selectedSupportArticle, setSelectedSupportArticle] = useState<string>('');
    const [selectedSparePart, setSelectedSparePart] = useState<string>('');
    const [saving, setSaving] = useState(false);
    const router = useRouter();

    // Fetch support articles on mount
    useEffect(() => {
        const fetchSupportArticles = async () => {
            const { data, error } = await supabase
                .from('articles')
                .select('id, title, slug')
                .eq('category', 'support')
                .order('created_at', { ascending: false });

            if (data && !error) {
                setSupportArticles(data as SupportArticleLink[]);
            }
        };
        fetchSupportArticles();
    }, []);

    // 1. WhatsApp CTA Injection
    const injectWhatsAppCTA = () => {
        const ctaBlock = `\n\n> **Need Professional Help?**  \n> [Chat with us on WhatsApp](https://wa.me/918208752205) for instant repair quotes. 🛠️\n\n`;
        onUpdate(articleContent + ctaBlock);
        setStatus('WhatsApp CTA inserted! ✅');
        setTimeout(() => setStatus(''), 3000);
    };

    // 2. Insert Support Article Link
    const insertSupportArticleLink = () => {
        if (!selectedSupportArticle) {
            setStatus('Please select a support article first');
            return;
        }
        const article = supportArticles.find(a => a.id === selectedSupportArticle);
        if (!article) return;

        const linkText = `[${article.title}](/blog/${article.slug})`;

        // Find a good spot to insert (after first paragraph or at cursor)
        // For simplicity, append a helpful sentence
        const insertBlock = `\n\n📖 **Related Guide:** ${linkText}\n\n`;
        onUpdate(articleContent + insertBlock);
        setStatus(`Support article link added! ✅`);
        setSelectedSupportArticle('');
        setTimeout(() => setStatus(''), 3000);
    };

    // 3. Insert Spare Part Link
    const insertSparePartLink = () => {
        if (!selectedSparePart) {
            setStatus('Please select a spare part first');
            return;
        }
        const part = sparePartsLinks.find(p => p.url === selectedSparePart);
        if (!part) return;

        const linkText = `[${part.title}](${part.url})`;
        const insertBlock = `\n\n🛒 **Need Parts?** Check out our ${linkText} for quality replacements.\n\n`;
        onUpdate(articleContent + insertBlock);
        setStatus(`Spare parts link added! ✅`);
        setSelectedSparePart('');
        setTimeout(() => setStatus(''), 3000);
    };

    // 4. Save to Articles
    const handleSaveToArticles = async () => {
        if (!topicId || !articleContent) {
            setStatus('Missing topic or content');
            return;
        }

        setSaving(true);
        setStatus('Saving to articles...');

        const result = await saveArticle(topicId, articleTitle, articleContent);

        if (result.success) {
            setStatus('Article saved successfully! ✅');
            localStorage.removeItem('linkStudioArticle');
            if (onSaved) onSaved();
            setTimeout(() => {
                router.push('/dashboard/articles');
            }, 1500);
        } else {
            setStatus(`Error: ${result.error}`);
        }
        setSaving(false);
    };

    return (
        <div className="space-y-6">
            {/* Section 1: WhatsApp CTA */}
            <div className="card bg-green-50 border-green-200">
                <h4 className="font-bold text-green-900 mb-3 flex items-center gap-2">
                    <span className="text-xl">💬</span> 1. WhatsApp CTA
                </h4>
                <p className="text-sm text-green-700 mb-4">
                    Add a WhatsApp contact call-to-action for service inquiries.
                </p>
                <button
                    className="btn bg-green-600 hover:bg-green-700 text-white w-full"
                    onClick={injectWhatsAppCTA}
                >
                    ➕ Insert WhatsApp CTA
                </button>
            </div>

            {/* Section 2: Support Articles */}
            <div className="card bg-blue-50 border-blue-200">
                <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                    <span className="text-xl">📖</span> 2. Link to Support Article
                </h4>
                <p className="text-sm text-blue-700 mb-3">
                    Link to related support/troubleshooting guides.
                </p>
                <div className="flex gap-2">
                    <select
                        className="form-select flex-1 text-sm"
                        value={selectedSupportArticle}
                        onChange={(e) => setSelectedSupportArticle(e.target.value)}
                    >
                        <option value="">-- Select Support Article --</option>
                        {supportArticles.map(article => (
                            <option key={article.id} value={article.id}>
                                {article.title}
                            </option>
                        ))}
                    </select>
                    <button
                        className="btn bg-blue-600 hover:bg-blue-700 text-white px-4"
                        onClick={insertSupportArticleLink}
                        disabled={!selectedSupportArticle}
                    >
                        Insert
                    </button>
                </div>
                {supportArticles.length === 0 && (
                    <p className="text-xs text-blue-600 mt-2">
                        No support articles found. Create some in Articles with category &quot;support&quot;.
                    </p>
                )}
            </div>

            {/* Section 3: Spare Parts */}
            <div className="card bg-orange-50 border-orange-200">
                <h4 className="font-bold text-orange-900 mb-3 flex items-center gap-2">
                    <span className="text-xl">🛒</span> 3. Link to Spare Parts
                </h4>
                <p className="text-sm text-orange-700 mb-3">
                    Link to spare parts pages for product mentions.
                </p>
                <div className="flex gap-2">
                    <select
                        className="form-select flex-1 text-sm"
                        value={selectedSparePart}
                        onChange={(e) => setSelectedSparePart(e.target.value)}
                    >
                        <option value="">-- Select Spare Part --</option>
                        {sparePartsLinks.map(part => (
                            <option key={part.url} value={part.url}>
                                {part.title}
                            </option>
                        ))}
                    </select>
                    <button
                        className="btn bg-orange-600 hover:bg-orange-700 text-white px-4"
                        onClick={insertSparePartLink}
                        disabled={!selectedSparePart}
                    >
                        Insert
                    </button>
                </div>
            </div>

            {/* Status Message */}
            {status && (
                <div className={`p-3 rounded text-sm font-medium text-center ${status.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                    }`}>
                    {status}
                </div>
            )}

            {/* Section 4: Save to Articles */}
            <div className="card bg-indigo-50 border-indigo-200 border-2">
                <h4 className="font-bold text-indigo-900 mb-3 flex items-center gap-2">
                    <span className="text-xl">💾</span> 4. Save to Articles
                </h4>
                <p className="text-sm text-indigo-700 mb-4">
                    Once you&apos;ve added all links, save the article to your database.
                </p>
                <button
                    className="btn bg-indigo-600 hover:bg-indigo-700 text-white w-full text-lg py-3 font-bold"
                    onClick={handleSaveToArticles}
                    disabled={saving || !articleContent}
                >
                    {saving ? '⏳ Saving...' : '💾 SAVE TO ARTICLES'}
                </button>
            </div>
        </div>
    );
}
