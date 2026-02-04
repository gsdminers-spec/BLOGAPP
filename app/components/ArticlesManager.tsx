
'use client';

import { useState, useEffect } from 'react';
import { fetchArticles, moveToPublish, unpublishArticle, deleteArticle, updateArticle } from '@/lib/articleActions';
import { publishNow, triggerDeployment } from '@/lib/publishActions';
import { Article } from '@/lib/supabase';
import { TableRowSkeleton } from './ui/Skeleton';
import ArticlePreview from './ArticlePreview';
import LinkStudio from './LinkStudio';
import ImageUploader from './ImageUploader';

// IST Timezone Helpers (GMT+5:30)
const getISTDateString = () => {
    const now = new Date();
    // Get UTC time and add IST offset
    const istTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    return istTime.toISOString().split('T')[0];
};



export default function ArticlesManager({ onNavigateToPublish }: { onNavigateToPublish: () => void }) {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewingArticle, setViewingArticle] = useState<Article | null>(null);

    // Scheduling Modal State
    const [schedulingArticle, setSchedulingArticle] = useState<Article | null>(null);
    const [scheduleDate, setScheduleDate] = useState('');
    const [scheduleTime, setScheduleTime] = useState('09:00');
    const [selectedCategory, setSelectedCategory] = useState('ASIC Repair Insights');

    // Editing State
    const [editingArticle, setEditingArticle] = useState<Article | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editContent, setEditContent] = useState('');
    const [showImageUploader, setShowImageUploader] = useState(false);

    // Fix: Move function declaration before useEffect to avoid React Hook violation
    const loadArticles = async () => {
        setLoading(true);
        const data = await fetchArticles();
        setArticles(data);
        setLoading(false);
    };

    useEffect(() => {
        loadArticles();
    }, []);

    const handleCopy = (content: string) => {
        navigator.clipboard.writeText(content);
        alert('Article content copied to clipboard!');
    };

    // Open scheduling modal instead of direct publish
    const handlePublishClick = (article: Article) => {
        setSchedulingArticle(article);
        setScheduleDate(getISTDateString());
        setScheduleTime('09:00');
        setSelectedCategory(article.category && article.category !== 'Uncategorized' ? article.category : 'ASIC Repair Insights');
    };

    // Schedule for later
    const handleScheduleConfirm = async () => {
        if (!schedulingArticle) return;

        const result = await moveToPublish(schedulingArticle.id, scheduleDate, scheduleTime, selectedCategory);
        if (result.success) {
            alert(`${schedulingArticle.title} scheduled for ${scheduleDate} at ${scheduleTime} IST!`);
            setSchedulingArticle(null);
            loadArticles();
            onNavigateToPublish();
        } else {
            alert(result.error || 'Failed to schedule');
        }
    };

    // Publish immediately (no scheduling)
    const handlePublishNowFromModal = async () => {
        if (!schedulingArticle) return;

        // First move to queue (with category), then publish immediately
        const moveResult = await moveToPublish(schedulingArticle.id, undefined, undefined, selectedCategory);
        if (!moveResult.success || !moveResult.queueId) {
            alert(moveResult.error || 'Failed to move to publish queue');
            return;
        }

        // Immediately publish using the new queueId
        const publishResult = await publishNow(moveResult.queueId, schedulingArticle.id);

        if (publishResult.success) {
            let message = `${schedulingArticle.title} has been successfully PUBLISHED! 🚀`;
            if (publishResult.deploymentTriggered) {
                message += '\n\n✅ Website rebuild triggered! Changes will be live in ~3 minutes.';
            } else if (publishResult.deploymentError) {
                message += `\n\n⚠️ Website rebuild NOT triggered: ${publishResult.deploymentError}`;
            }
            alert(message);
            setSchedulingArticle(null);
            loadArticles();
            onNavigateToPublish();
        } else {
            alert(`Moved to queue, but immediate publish failed: ${publishResult.error}`);
            setSchedulingArticle(null);
            loadArticles();
            onNavigateToPublish();
        }
    };

    // Unpublish - remove from public blog but keep in admin
    const handleUnpublish = async (article: Article) => {
        if (!confirm(`Unpublish "${article.title}"? This will remove it from the public blog.`)) return;

        const result = await unpublishArticle(article.id);
        if (result.success) {
            let message = `${article.title} has been unpublished!`;
            if (result.deploymentTriggered) {
                message += '\n\n🚀 Website rebuild triggered! Changes will be live in ~3 minutes.';
            } else if (result.deploymentError) {
                message += `\n\n⚠️ Website rebuild NOT triggered: ${result.deploymentError}`;
            }
            alert(message);
            setViewingArticle(null);
            loadArticles();
        } else {
            alert(result.error || 'Failed to unpublish');
        }
    };

    // Delete - remove completely from everywhere
    const handleDelete = async (article: Article) => {
        if (!confirm(`DELETE "${article.title}"? This will permanently remove it from admin AND the public blog.`)) return;
        if (!confirm('Are you SURE? This cannot be undone!')) return;

        const result = await deleteArticle(article.id);
        if (result.success) {
            alert(`${article.title} has been deleted!`);
            setViewingArticle(null);
            loadArticles();
        } else {
            alert(result.error || 'Failed to delete');
        }
    };

    // Edit Handlers
    const handleEditClick = (article: Article) => {
        setEditingArticle(article);
        setEditTitle(article.title);
        setEditContent(article.content);
        // If we are in preview mode, we might want to keep viewing it or close it?
        // Let's keep viewing it, but the modal will overlay.
    };

    const handleSaveEdit = async () => {
        if (!editingArticle) return;

        const result = await updateArticle(editingArticle.id, editTitle, editContent);

        if (result.success) {
            alert('Article updated successfully!');

            // Update local state to reflect changes immediately
            setArticles(articles.map(a =>
                a.id === editingArticle.id
                    ? { ...a, title: editTitle, content: editContent }
                    : a
            ));

            // If viewing this article, update it too
            if (viewingArticle?.id === editingArticle.id) {
                setViewingArticle({ ...viewingArticle, title: editTitle, content: editContent });
            }

            setEditingArticle(null);
        } else {
            alert(result.error || 'Failed to update article');
        }
    };

    // Deploy to Live Site
    const handleDeploy = async () => {
        if (!confirm('🚀 Are you sure you want to PUBLISH LIVE?\n\nThis will trigger the automated robot to build the website and upload it to Hostinger.\n\nIt takes about 2-3 minutes to complete.')) return;

        alert('Initializing deployment robot... 🤖');
        const result = await triggerDeployment();

        if (result.success) {
            alert('✅ Deployment Signal Sent!\n\nThe robot is now building your site. Check asicrepair.in in 3 minutes.');
        } else {
            alert(`❌ Failed to trigger robot: ${result.error}`);
        }
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return 'N/A';
        return new Date(dateStr).toLocaleDateString();
    };

    if (loading) {
        return (
            <div className="card p-0 overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 p-4 font-semibold text-slate-600">Loading Articles...</div>
                <TableRowSkeleton />
                <TableRowSkeleton />
                <TableRowSkeleton />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full gap-6">

            {viewingArticle ? (
                // PREVIEW MODE (Full Screen Overlay Style)
                <div className="fixed inset-0 z-50 bg-[#0E1116] flex flex-col">
                    <ArticlePreview
                        article={viewingArticle}
                        onClose={() => setViewingArticle(null)}
                        onPublish={handlePublishClick}
                        onUnpublish={handleUnpublish}
                        onDelete={handleDelete}
                        onCopy={handleCopy}
                        onEdit={handleEditClick}
                    />
                </div>
            ) : (
                // ARTICLE LIST VIEW
                <div className="card p-0 overflow-hidden">
                    {articles.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">
                            No articles yet. Save articles from Final Output to see them here.
                        </div>
                    ) : (
                        <>
                            {/* Mobile Card View */}
                            <div className="md:hidden flex flex-col divide-y divide-slate-100">
                                {articles.map((article, index) => (
                                    <div key={article.id} className="p-4 hover:bg-slate-50 active:bg-slate-100">
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <div className="flex-1 min-w-0">
                                                <span className="text-xs text-slate-400 mr-2">#{index + 1}</span>
                                                <h4 className="font-medium text-slate-800 text-sm line-clamp-2">{article.title}</h4>
                                            </div>
                                            <div className="flex-shrink-0">
                                                {article.status === 'published' && <span className="badge badge-green text-xs">Published</span>}
                                                {article.status === 'scheduled' && <span className="badge badge-blue text-xs">Scheduled</span>}
                                                {article.status === 'ready' && <span className="badge badge-gray text-xs">Ready</span>}
                                                {article.status === 'draft' && <span className="badge badge-gray text-xs">Draft</span>}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                                            <span className="badge badge-blue text-xs">{article.category || 'Uncategorized'}</span>
                                            <span>•</span>
                                            <span>{formatDate(article.created_at)}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                className="btn btn-secondary text-xs py-1.5 px-3 flex-1"
                                                onClick={() => setViewingArticle(article)}
                                            >
                                                👁️ View
                                            </button>
                                            <button
                                                className="btn btn-secondary text-xs py-1.5 px-3"
                                                onClick={() => handleCopy(article.content)}
                                            >
                                                📋
                                            </button>
                                            {article.status !== 'scheduled' && article.status !== 'published' && (
                                                <button
                                                    className="btn btn-primary text-xs py-1.5 px-3 flex-1"
                                                    onClick={() => handlePublishClick(article)}
                                                >
                                                    🚀 Publish
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Desktop Table View */}
                            <div className="flex justify-end mb-4 px-4 w-full">
                                <button
                                    onClick={handleDeploy}
                                    className="btn btn-primary bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-200 transform hover:scale-105 transition-all text-sm font-bold flex items-center gap-2"
                                >
                                    🚀 Publish Live to Hostinger
                                </button>
                            </div>
                            <table className="hidden md:table w-full text-left text-sm">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="p-4 font-semibold text-slate-600">#</th>
                                        <th className="p-4 font-semibold text-slate-600">Title</th>
                                        <th className="p-4 font-semibold text-slate-600">Category</th>
                                        <th className="p-4 font-semibold text-slate-600">Status</th>
                                        <th className="p-4 font-semibold text-slate-600">Date</th>
                                        <th className="p-4 font-semibold text-slate-600 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {articles.map((article, index) => (
                                        <tr key={article.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="p-4 text-slate-400">{index + 1}</td>
                                            <td className="p-4 font-medium text-slate-800">{article.title}</td>
                                            <td className="p-4 text-slate-500">
                                                <span className="badge badge-blue">{article.category || 'Uncategorized'}</span>
                                            </td>
                                            <td className="p-4">
                                                {article.status === 'published' && <span className="badge badge-green">Published</span>}
                                                {article.status === 'scheduled' && <span className="badge badge-blue">Scheduled</span>}
                                                {article.status === 'ready' && <span className="badge badge-gray">Ready</span>}
                                                {article.status === 'draft' && <span className="badge badge-gray">Draft</span>}
                                            </td>
                                            <td className="p-4 text-slate-500">{formatDate(article.created_at)}</td>
                                            <td className="p-4 text-right space-x-2">
                                                <button
                                                    className="text-indigo-600 hover:text-indigo-800 font-medium"
                                                    onClick={() => setViewingArticle(article)}
                                                    title="View Preview"
                                                >
                                                    👁️ View
                                                </button>
                                                <button
                                                    className="text-slate-400 hover:text-slate-600"
                                                    onClick={() => handleCopy(article.content)}
                                                    title="Copy markdown"
                                                >
                                                    📋
                                                </button>
                                                {article.status !== 'scheduled' && article.status !== 'published' && (
                                                    <button
                                                        className="text-green-600 hover:text-green-800 font-medium ml-2"
                                                        onClick={() => handlePublishClick(article)}
                                                        title="Move to Publish Hub"
                                                    >
                                                        🚀 Publish
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </>
                    )}
                </div>
            )}

            {/* Schedule Modal */}
            {schedulingArticle && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4 animate-in zoom-in-95">
                        <h3 className="text-lg font-bold text-slate-800 mb-2">📅 Schedule Publishing</h3>
                        <p className="text-sm text-slate-500 mb-4 truncate">
                            {schedulingArticle.title}
                        </p>

                        <div className="bg-slate-50 p-4 rounded-lg mb-4 space-y-4">
                            {/* Category Selector */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">
                                    Publish Category (Public)
                                </label>
                                <select
                                    className="form-select w-full"
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                >
                                    <option value="ASIC Repair Insights">ASIC Repair Insights</option>
                                    <option value="Hashboard Problems">Hashboard Problems</option>
                                    <option value="Environmental Damage">Environmental Damage</option>
                                    <option value="Repair Decisions">Repair Decisions</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                                        Date (IST)
                                    </label>
                                    <input
                                        type="date"
                                        className="form-input w-full"
                                        value={scheduleDate}
                                        onChange={e => setScheduleDate(e.target.value)}
                                        min={getISTDateString()}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                                        Time (IST)
                                    </label>
                                    <input
                                        type="time"
                                        className="form-input w-full"
                                        value={scheduleTime}
                                        onChange={e => setScheduleTime(e.target.value)}
                                    />
                                </div>
                            </div>
                            <p className="text-xs text-slate-400 text-center">
                                All times are in Indian Standard Time (GMT+5:30)
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                className="btn btn-secondary flex-1"
                                onClick={() => setSchedulingArticle(null)}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-primary flex-1"
                                onClick={handleScheduleConfirm}
                            >
                                ⏰ Schedule
                            </button>
                        </div>

                        <div className="mt-3 pt-3 border-t border-slate-100">
                            <button
                                className="btn btn-secondary w-full text-green-700 border-green-200 hover:bg-green-50"
                                onClick={handlePublishNowFromModal}
                            >
                                🚀 Publish Live to Hostinger
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Edit Modal */}
            {editingArticle && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] animate-in fade-in">
                    <div className="bg-white rounded-xl shadow-2xl flex flex-col w-full max-w-4xl max-h-[90vh] mx-4 animate-in zoom-in-95">
                        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-xl">
                            <h3 className="text-lg font-bold text-slate-800">✏️ Edit Article</h3>
                            <button onClick={() => setEditingArticle(null)} className="text-slate-400 hover:text-slate-600">
                                ✕
                            </button>
                        </div>
                        <div className="p-6 flex-1 overflow-y-auto">
                            <div className="mb-4">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Title</label>
                                <input
                                    type="text"
                                    className="form-input w-full text-lg font-medium"
                                    value={editTitle}
                                    onChange={e => setEditTitle(e.target.value)}
                                />
                            </div>

                            {/* Image Uploader Toggle */}
                            <div className="mb-4">
                                <button
                                    className="text-sm font-semibold text-[#F7931A] hover:text-[#E8870E] flex items-center gap-2 mb-2"
                                    onClick={() => setShowImageUploader(!showImageUploader)}
                                >
                                    {showImageUploader ? '▼ Hide Image Uploader' : '▶ Add Image to Article'}
                                </button>

                                {showImageUploader && (
                                    <div className="bg-[#0d1117] p-4 rounded-xl border border-[#30363D] mb-4">
                                        <ImageUploader
                                            onImageUploaded={(url) => {
                                                const imageMarkdown = `\n![Image Description](${url})\n`;
                                                setEditContent(prev => prev + imageMarkdown);
                                                alert('Image added to content! scroll down to see it.');
                                            }}
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="h-full min-h-[400px]">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Content (Markdown)</label>
                                <textarea
                                    className="form-input w-full h-[400px] font-mono text-sm leading-relaxed"
                                    value={editContent}
                                    onChange={e => setEditContent(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="p-4 border-t border-slate-200 bg-slate-50 rounded-b-xl flex justify-end gap-3">
                            <button
                                className="btn btn-secondary"
                                onClick={() => setEditingArticle(null)}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-primary min-w-[100px]"
                                onClick={handleSaveEdit}
                            >
                                💾 Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
