
'use client';

import { useState, useEffect } from 'react';
import { fetchKeywords, addKeyword, updateKeywordStatus } from '@/lib/keywordActions';
import { Keyword } from '@/lib/supabase';

export default function KeywordTracker() {
    const [keywords, setKeywords] = useState<Keyword[]>([]);
    const [loading, setLoading] = useState(true);
    const [newPhrase, setNewPhrase] = useState('');
    const [newModel, setNewModel] = useState('');
    const [newCategory, setNewCategory] = useState('');
    const [expandedId, setExpandedId] = useState<string | null>(null);

    // Fix: Move function declaration before useEffect to avoid React Hook violation
    const loadKeywords = async () => {
        setLoading(true);
        const data = await fetchKeywords();
        setKeywords(data);
        setLoading(false);
    };

    useEffect(() => {
        loadKeywords();
    }, []);

    const handleAdd = async () => {
        if (!newPhrase.trim()) {
            alert('Please enter a keyword phrase.');
            return;
        }
        const result = await addKeyword(newPhrase.trim(), newModel.trim() || undefined, newCategory.trim() || undefined);
        if (result.success) {
            setNewPhrase('');
            setNewModel('');
            setNewCategory('');
            loadKeywords();
        } else {
            alert(result.error || 'Failed to add keyword');
        }
    };

    const handleStatusUpdate = async (id: string, status: 'approved' | 'rejected') => {
        const result = await updateKeywordStatus(id, status);
        if (result.success) {
            loadKeywords();
        } else {
            alert(result.error || 'Failed to update status');
        }
    };

    const toggleExpand = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved': return <span className="badge badge-green">Approved</span>;
            case 'rejected': return <span className="badge badge-gray">Rejected</span>;
            default: return <span className="badge badge-blue">Pending</span>;
        }
    };

    const getVolumeBadge = (volume: string) => {
        switch (volume) {
            case 'high': return <span className="text-green-600 font-semibold">High</span>;
            case 'low': return <span className="text-slate-400">Low</span>;
            default: return <span className="text-blue-600">Medium</span>;
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-slate-500">⏳ Loading keywords...</div>;
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Add Keyword Card */}
            <div className="card">
                <h3 className="card-title mb-4">➕ Add New Keyword</h3>
                <div className="grid md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1">Keyword Phrase *</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="e.g., s19 pro hashboard repair"
                            value={newPhrase}
                            onChange={e => setNewPhrase(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Model</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="e.g., Antminer S19"
                            value={newModel}
                            onChange={e => setNewModel(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Category</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="e.g., Hashboard"
                            value={newCategory}
                            onChange={e => setNewCategory(e.target.value)}
                        />
                    </div>
                </div>
                <button className="btn btn-primary mt-4" onClick={handleAdd}>
                    Add Keyword
                </button>
            </div>

            {/* Keywords List */}
            <div className="card p-0 overflow-hidden">
                {keywords.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                        No keywords yet. Add your first keyword above.
                    </div>
                ) : (
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="p-4 font-semibold text-slate-600">Phrase</th>
                                <th className="p-4 font-semibold text-slate-600">Model</th>
                                <th className="p-4 font-semibold text-slate-600">Category</th>
                                <th className="p-4 font-semibold text-slate-600">Volume</th>
                                <th className="p-4 font-semibold text-slate-600">Status</th>
                                <th className="p-4 font-semibold text-slate-600 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {keywords.map(kw => (
                                <>
                                    <tr key={kw.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => toggleExpand(kw.id)}>
                                        <td className="p-4 font-medium text-slate-800">{kw.phrase}</td>
                                        <td className="p-4 text-slate-500">{kw.model || '-'}</td>
                                        <td className="p-4 text-slate-500">{kw.category || '-'}</td>
                                        <td className="p-4">{getVolumeBadge(kw.volume)}</td>
                                        <td className="p-4">{getStatusBadge(kw.status)}</td>
                                        <td className="p-4 text-right space-x-2" onClick={e => e.stopPropagation()}>
                                            {kw.status === 'pending' && (
                                                <>
                                                    <button
                                                        className="text-green-600 hover:text-green-800 font-medium"
                                                        onClick={() => handleStatusUpdate(kw.id, 'approved')}
                                                    >
                                                        ✅ Approve
                                                    </button>
                                                    <button
                                                        className="text-red-500 hover:text-red-700"
                                                        onClick={() => handleStatusUpdate(kw.id, 'rejected')}
                                                    >
                                                        ❌ Reject
                                                    </button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                    {expandedId === kw.id && (
                                        <tr className="bg-slate-50">
                                            <td colSpan={6} className="p-4">
                                                <div className="text-sm text-slate-600">
                                                    <strong>Notes:</strong> {kw.notes || 'No notes'}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
