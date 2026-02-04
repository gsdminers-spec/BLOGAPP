'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Trash2, Plus, ExternalLink } from 'lucide-react';

interface Keyword {
    id: string;
    phrase: string;
    url: string;
    tag?: string;
}

export default function KeywordManager() {
    const [keywords, setKeywords] = useState<Keyword[]>([]);
    const [loading, setLoading] = useState(true);
    const [newPhrase, setNewPhrase] = useState('');
    const [newUrl, setNewUrl] = useState('');
    const [newTag, setNewTag] = useState('');

    const fetchKeywords = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('seo_keywords')
            .select('*')
            .order('created_at', { ascending: false });

        if (data) setKeywords(data);
        if (error) console.error('Error fetching keywords:', error);
        setLoading(false);
    };

    useEffect(() => {
        fetchKeywords();
    }, []);

    const handleAdd = async () => {
        if (!newPhrase || !newUrl) return alert('Phrase and URL are required');

        const { error } = await supabase
            .from('seo_keywords')
            .insert([{ phrase: newPhrase, url: newUrl, tag: newTag }]);

        if (error) {
            alert('Error adding keyword: ' + error.message);
        } else {
            setNewPhrase('');
            setNewUrl('');
            setNewTag('');
            fetchKeywords();
        }
    };

    const handleDelete = async (id: string) => {
        const { error } = await supabase.from('seo_keywords').delete().eq('id', id);
        if (error) alert('Error deleting: ' + error.message);
        else fetchKeywords();
    };

    return (
        <div className="card h-full flex flex-col">
            <h3 className="card-title mb-4 flex items-center gap-2">
                🔗 SEO Link Manager
                <span className="badge badge-blue text-xs ml-auto">
                    {keywords.length} Active
                </span>
            </h3>

            {/* Input Form */}
            <div className="bg-slate-50 p-4 rounded-lg mb-6 border border-slate-100 grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                <div className="md:col-span-4">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Phrase</label>
                    <input
                        className="form-input w-full mt-1"
                        placeholder="e.g. Antminer S19"
                        value={newPhrase}
                        onChange={e => setNewPhrase(e.target.value)}
                    />
                </div>
                <div className="md:col-span-4">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Target URL</label>
                    <input
                        className="form-input w-full mt-1"
                        placeholder="/parts/s19-fan"
                        value={newUrl}
                        onChange={e => setNewUrl(e.target.value)}
                    />
                </div>
                <div className="md:col-span-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Tag (Opt)</label>
                    <input
                        className="form-input w-full mt-1"
                        placeholder="Parts"
                        value={newTag}
                        onChange={e => setNewTag(e.target.value)}
                    />
                </div>
                <div className="md:col-span-2">
                    <button
                        className="btn btn-primary w-full h-[42px]"
                        onClick={handleAdd}
                    >
                        <Plus className="w-4 h-4" /> Add
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {loading ? (
                    <div className="text-center py-10 text-slate-400">Loading keywords...</div>
                ) : keywords.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 border-2 border-dashed border-slate-100 rounded-lg">
                        No keywords found. Add your first one above!
                    </div>
                ) : (
                    <div className="space-y-2">
                        {keywords.map(k => (
                            <div key={k.id} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded hover:border-blue-100 transition-colors group">
                                <div className="flex flex-col">
                                    <span className="font-bold text-slate-700">{k.phrase}</span>
                                    <a href={k.url} target="_blank" className="text-xs text-blue-500 hover:underline flex items-center gap-1">
                                        {k.url} <ExternalLink className="w-3 h-3" />
                                    </a>
                                </div>
                                <div className="flex items-center gap-3">
                                    {k.tag && <span className="badge badge-gray">{k.tag}</span>}
                                    <button
                                        onClick={() => handleDelete(k.id)}
                                        className="text-slate-400 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
