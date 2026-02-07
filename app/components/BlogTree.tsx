
'use client';

import { useState, useEffect } from 'react';
import {
    fetchFullBlogTree,
    addPhase, renamePhase, deletePhase,
    addCategory, renameCategory, deleteCategory,
    addSubcategory, renameSubcategory, deleteSubcategory,
    addTopic, renameTopic, deleteTopic
} from '@/lib/blogTreeActions';
import { Phase, Category, Subcategory, Topic } from '@/lib/supabase';

interface BlogTreeProps {
    onSelectTopic?: (topic: string) => void;
}

type View = 'phases' | 'categories' | 'subcategories' | 'topics';

// Extended TYPES to support nested structure in UI
type UIPhase = Phase & { categories: UICategory[] };
type UICategory = Category & { subcategories?: UISubcategory[], topics?: Topic[] };
type UISubcategory = Subcategory & { topics: Topic[] };

export default function BlogTree({ onSelectTopic }: BlogTreeProps) {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<UIPhase[]>([]);

    const [view, setView] = useState<View>('phases');
    const [selectedPhase, setSelectedPhase] = useState<UIPhase | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<UICategory | null>(null);
    const [selectedSubcategory, setSelectedSubcategory] = useState<UISubcategory | null>(null);

    // CRUD Modal State
    const [showMenu, setShowMenu] = useState(false);

    // Refresh Data Helper
    const refreshData = async () => {
        setLoading(true);
        const tree = await fetchFullBlogTree();
        // Use type assertion here as fetchFullBlogTree returns the nested structure we need
        setData(tree as unknown as UIPhase[]);
        setLoading(false);
    };

    useEffect(() => {
        refreshData();
    }, []);

    // --- Navigation & Syncing Selection ---
    // When data refreshes, we need to re-find the selected items to keep view active
    // --- Navigation & Syncing Selection ---
    // When data refreshes, we need to re-find the selected items to keep view active
    useEffect(() => {
        if (selectedPhase) {
            const p = data.find(p => p.id === selectedPhase.id);
            if (p) {
                setSelectedPhase(p);
                if (selectedCategory) {
                    const c = p.categories.find(c => c.id === selectedCategory.id);
                    if (c) {
                        setSelectedCategory(c);
                        if (selectedSubcategory) {
                            const s = c.subcategories?.find(s => s.id === selectedSubcategory.id);
                            if (s) setSelectedSubcategory(s);
                        }
                    }
                }
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data]);

    const goToPhases = () => {
        setView('phases');
        setSelectedPhase(null);
        setSelectedCategory(null);
        setSelectedSubcategory(null);
    };

    const goToCategories = (phase: UIPhase) => {
        setSelectedPhase(phase);
        setView('categories');
    };

    const goToSubcategories = (category: UICategory) => {
        setSelectedCategory(category);
        setView('subcategories');
    };

    const goToTopics = (subcategory: UISubcategory) => {
        setSelectedSubcategory(subcategory);
        setView('topics');
    };

    // --- CRUD Handlers ---
    const handleCrudAction = async (action: 'add' | 'rename' | 'delete', level: string, parentId?: string, currentId?: string, currentName?: string) => {
        setShowMenu(false);

        // DELETE
        if (action === 'delete') {
            if (!confirm(`Are you sure you want to delete this ${level}?`)) return;
            if (level === 'Phase' && currentId) await deletePhase(currentId);
            if (level === 'Category' && currentId) await deleteCategory(currentId);
            if (level === 'Sub-category' && currentId) await deleteSubcategory(currentId);
            if (level === 'Topic' && currentId) await deleteTopic(currentId);
            await refreshData();
            if (level === 'Phase') goToPhases(); // Reset View
            if (level === 'Category') setView('categories'); // Go up
            return;
        }

        // ADD / RENAME
        const promptText = action === 'add' ? `Enter new ${level} name:` : `Rename ${level} to:`;
        const input = prompt(promptText, action === 'rename' ? currentName : '');
        if (!input) return;

        if (action === 'add') {
            if (level === 'Phase') await addPhase(input, data.length + 1);
            if (level === 'Category' && parentId) await addCategory(parentId, input);
            if (level === 'Sub-category' && parentId) await addSubcategory(parentId, input);
            if (level === 'Topic' && parentId) await addTopic(parentId, input);
        }
        else if (action === 'rename' && currentId) {
            if (level === 'Phase') await renamePhase(currentId, input);
            if (level === 'Category') await renameCategory(currentId, input);
            if (level === 'Sub-category') await renameSubcategory(currentId, input);
            if (level === 'Topic') await renameTopic(currentId, input);
        }
        await refreshData();
    };

    // --- Render Helpers ---

    const renderBreadcrumb = () => (
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
            <button className="hover:text-indigo-600" onClick={goToPhases}>🌳 Blog Tree</button>
            {selectedPhase && (
                <>
                    <span>/</span>
                    <button className="hover:text-indigo-600" onClick={() => { setView('categories'); setSelectedCategory(null); setSelectedSubcategory(null); }}>
                        {selectedPhase.name}
                    </button>
                </>
            )}
            {selectedCategory && (
                <>
                    <span>/</span>
                    <button className="hover:text-indigo-600" onClick={() => { setView('subcategories'); setSelectedSubcategory(null); }}>
                        {selectedCategory.name}
                    </button>
                </>
            )}
            {selectedSubcategory && (
                <>
                    <span>/</span>
                    <span className="text-slate-800 font-medium">{selectedSubcategory.name}</span>
                </>
            )}
        </div>
    );

    const renderHamburgerMenu = (level: string, parentId?: string, currentId?: string, currentName?: string) => (
        <div className="relative">
            <button
                className="p-2 hover:bg-slate-100 rounded text-slate-500"
                onClick={() => setShowMenu(!showMenu)}
            >
                ☰
            </button>
            {showMenu && (
                <div className="absolute right-0 top-10 bg-white border shadow-lg rounded-lg z-50 w-48">
                    <button className="w-full text-left px-4 py-2 hover:bg-slate-50 text-sm" onClick={() => handleCrudAction('add', level, parentId)}>
                        ➕ Add {level}
                    </button>
                    {currentId && (
                        <>
                            <button className="w-full text-left px-4 py-2 hover:bg-slate-50 text-sm" onClick={() => handleCrudAction('rename', level, undefined, currentId, currentName)}>
                                ✏️ Rename {level}
                            </button>
                            <button className="w-full text-left px-4 py-2 hover:bg-red-50 text-sm text-red-600" onClick={() => handleCrudAction('delete', level, undefined, currentId)}>
                                🗑️ Delete {level}
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );

    if (loading && data.length === 0) return <div className="p-8 text-center text-slate-500">⏳ Loading Blog Tree...</div>;

    // --- PHASES VIEW ---
    if (view === 'phases') {
        return (
            <div className="flex flex-col gap-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-bold text-slate-800">📁 Content Roadmap (4 Phases)</h2>
                    <div className="flex gap-4 items-center">
                        <button
                            className="btn btn-primary text-sm py-2 px-4 shadow-md bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg flex items-center gap-2"
                            onClick={() => handleCrudAction('add', 'Phase')}
                        >
                            ➕ Add Phase
                        </button>
                        {renderHamburgerMenu('Phase')}
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {data.map(phase => {
                        const stats = {
                            cat: phase.categories.length,
                            sub: phase.categories.reduce((acc, c) => acc + (c.subcategories?.length || 0), 0),
                            // Flatten topics from subcategories AND direct topics
                            topics: phase.categories.flatMap(c => {
                                const subTopics = c.subcategories?.flatMap(s => s.topics) || [];
                                const directTopics = c.topics || [];
                                return [...subTopics, ...directTopics];
                            }).length
                        }
                        return (
                            <div
                                key={phase.id}
                                className="card hover:shadow-lg cursor-pointer transition-all border-l-4 border-l-indigo-500"
                                onClick={() => goToCategories(phase)}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-lg text-slate-800">{phase.name}</h3>
                                        <p className="text-slate-500 text-sm mt-1">{phase.description}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="text-xs p-1 hover:bg-slate-100 rounded" onClick={(e) => { e.stopPropagation(); handleCrudAction('rename', 'Phase', undefined, phase.id, phase.name) }}>✏️</button>
                                        <button className="text-xs p-1 hover:bg-red-100 text-red-500 rounded" onClick={(e) => { e.stopPropagation(); handleCrudAction('delete', 'Phase', undefined, phase.id) }}>🗑️</button>
                                    </div>
                                </div>
                                <div className="mt-4 flex gap-4 text-xs text-slate-500">
                                    <span className="bg-slate-100 px-2 py-1 rounded">{stats.topics} Articles</span>
                                    <span className="bg-slate-100 px-2 py-1 rounded">{stats.cat} Categories</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    // --- CATEGORIES VIEW ---
    if (view === 'categories' && selectedPhase) {
        return (
            <div className="flex flex-col gap-6">
                {renderBreadcrumb()}
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-bold text-slate-800">📁 {selectedPhase.name}</h2>
                    <div className="flex gap-4 items-center">
                        <button
                            className="btn btn-primary text-sm py-2 px-4 shadow-md bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg flex items-center gap-2"
                            onClick={() => handleCrudAction('add', 'Category', selectedPhase.id)}
                        >
                            ➕ Add Category
                        </button>
                        {renderHamburgerMenu('Category', selectedPhase.id)}
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    {selectedPhase.categories.map(cat => {
                        const subTopicsCount = cat.subcategories?.reduce((sum, sub) => sum + sub.topics.length, 0) || 0;
                        const directTopicsCount = cat.topics?.length || 0;
                        const articleCount = subTopicsCount + directTopicsCount;

                        // Hybrid Logic: If no subcategories but has topics, go straight to topics view
                        // We do this by "faking" a subcategory selection or using a new view mode
                        // Actually, easiest is to treat the Category AS a Subcategory context for the Topics View
                        const handleClick = () => {
                            if (cat.topics && cat.topics.length > 0) {
                                // Create a dummy subcategory wrapper to reuse the Topics View
                                const dummySub: any = {
                                    id: cat.id, // Reuse Category ID
                                    name: cat.name, // Reuse Category Name
                                    topics: cat.topics
                                };
                                goToTopics(dummySub);
                            } else if (cat.subcategories && cat.subcategories.length > 0) {
                                goToSubcategories(cat);
                            } else {
                                // Empty? Default to subcategories view so they can add one, 
                                // OR ideally allow adding topics directly to category (not implemented yet).
                                // Hybrid solution: Go to subcategories for now.
                                goToSubcategories(cat);
                            }
                        };

                        return (
                            <div
                                key={cat.id}
                                className="card hover:shadow-md cursor-pointer transition-all flex justify-between items-center"
                                onClick={handleClick}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">⚡</span>
                                    <div>
                                        <h4 className="font-bold text-slate-800">{cat.name}</h4>
                                        <span className="text-xs text-slate-500">
                                            {articleCount} articles
                                            {cat.subcategories && cat.subcategories.length > 0 ? ` • ${cat.subcategories.length} sub-categories` : ''}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                                    <button onClick={() => handleCrudAction('rename', 'Category', undefined, cat.id, cat.name)} className="p-1 hover:bg-slate-100">✏️</button>
                                    <button onClick={() => handleCrudAction('delete', 'Category', undefined, cat.id)} className="p-1 hover:bg-red-100 text-red-500">🗑️</button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    // --- SUBCATEGORIES VIEW ---
    if (view === 'subcategories' && selectedCategory) {
        return (
            <div className="flex flex-col gap-6">
                {renderBreadcrumb()}
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-bold text-slate-800">⚡ {selectedCategory.name}</h2>
                    {renderHamburgerMenu('Sub-category', selectedCategory.id)}
                </div>

                <div className="flex flex-col gap-3">
                    {(selectedCategory.subcategories || []).map(sub => (
                        <div
                            key={sub.id}
                            className="card hover:shadow-md cursor-pointer transition-all flex justify-between items-center py-3"
                            onClick={() => goToTopics(sub)}
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-xl">📂</span>
                                <div>
                                    <h4 className="font-semibold text-slate-800">{sub.name}</h4>
                                    <span className="text-xs text-slate-500">{sub.topics.length} articles</span>
                                </div>
                            </div>
                            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                                <button onClick={() => handleCrudAction('rename', 'Sub-category', undefined, sub.id, sub.name)} className="p-1 hover:bg-slate-100">✏️</button>
                                <button onClick={() => handleCrudAction('delete', 'Sub-category', undefined, sub.id)} className="p-1 hover:bg-red-100 text-red-500">🗑️</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // --- TOPICS VIEW ---
    if (view === 'topics' && selectedSubcategory) {
        return (
            <div className="flex flex-col gap-6">
                {renderBreadcrumb()}
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-bold text-slate-800">📂 {selectedSubcategory.name}</h2>
                    {renderHamburgerMenu('Topic', selectedSubcategory.id)}
                </div>

                <div className="card p-0 overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b">
                            <tr>
                                <th className="p-3 font-semibold text-slate-600 w-10">#</th>
                                <th className="p-3 font-semibold text-slate-600">Topic Title</th>
                                <th className="p-3 font-semibold text-slate-600 w-24">Status</th>
                                <th className="p-3 font-semibold text-slate-600 text-right w-48">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {selectedSubcategory.topics.map((topic, idx) => (
                                <tr key={topic.id} className="hover:bg-slate-50">
                                    <td className="p-3 text-slate-400">{idx + 1}</td>
                                    <td className="p-3 font-medium text-slate-800">{topic.title}</td>
                                    <td className="p-3">
                                        {topic.status === 'done' && <span className="badge badge-green">Done</span>}
                                        {topic.status === 'pending' && <span className="badge badge-gray">Pending</span>}
                                        {topic.status === 'in-progress' && <span className="badge badge-blue">In Progress</span>}
                                    </td>
                                    <td className="p-3 text-right space-x-2">
                                        {topic.status === 'done' ? (
                                            <button className="text-green-600 text-xs font-medium">✅ View Article</button>
                                        ) : (
                                            <button
                                                className="btn btn-primary text-xs py-1 px-2"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onSelectTopic?.(topic.title);
                                                }}
                                            >
                                                📤 Send to Research
                                            </button>
                                        )}
                                        <button
                                            className="text-slate-400 hover:text-slate-600 text-xs"
                                            onClick={(e) => { e.stopPropagation(); handleCrudAction('rename', 'Topic', undefined, topic.id, topic.title); }}
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            className="text-red-400 hover:text-red-600 text-xs"
                                            onClick={(e) => { e.stopPropagation(); handleCrudAction('delete', 'Topic', undefined, topic.id); }}
                                        >
                                            🗑️
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    return null;
}
