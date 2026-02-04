
'use client';

import { useState, useEffect, useRef } from 'react';
import { fetchRecentTopics, saveArticle, uploadImage } from '@/lib/articleActions';
import { fetchFullBlogTree } from '@/lib/blogTreeActions';
import { Topic } from '@/lib/supabase';
import { Skeleton } from './ui/Skeleton';
import imageCompression from 'browser-image-compression';

export default function ClaudeOutput() {
    const [topics, setTopics] = useState<Topic[]>([]);
    const [selectedTopicId, setSelectedTopicId] = useState('');
    const [selectedTopicTitle, setSelectedTopicTitle] = useState('');
    const [content, setContent] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'saving' | 'saved' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-save logic
    useEffect(() => {
        const timer = setTimeout(() => {
            if (content && selectedTopicId && status !== 'saving' && status !== 'saved') {
                localStorage.setItem(`draft-${selectedTopicId}`, content);
                setLastSaved(new Date());
            }
        }, 3000);

        return () => clearTimeout(timer);
    }, [content, selectedTopicId, status]);

    // Restore draft
    useEffect(() => {
        if (selectedTopicId) {
            const draft = localStorage.getItem(`draft-${selectedTopicId}`);
            if (draft) setContent(draft);
        }
    }, [selectedTopicId]);

    // Fix: Move function declaration before useEffect to avoid React Hook violation
    const loadTopics = async () => {
        setStatus('loading');

        // 1. Fetch Pending from Tree (Same logic as Writer Studio)
        const tree = await fetchFullBlogTree();
        const allTreeTopics: Topic[] = [];

        // Use type assertion to handle the complex nested structure including topics
        (tree as any[]).forEach(phase => {
            phase.categories.forEach((cat: any) => {
                if (cat.topics) allTreeTopics.push(...cat.topics);
                if (cat.subcategories) {
                    cat.subcategories.forEach((sub: any) => {
                        if (sub.topics) allTreeTopics.push(...sub.topics);
                    });
                }
            });
        });

        // Filter for PENDING topics only (from Tree)
        const pendingTopics = allTreeTopics.filter(t => t.status === 'pending' || t.status === 'in-progress');

        // 2. Fetch History (Last 50 Done) - Keep existing logic for history
        const { data: historyData } = await import('@/lib/supabase').then(m => m.supabase
            .from('topics')
            .select('*')
            .eq('status', 'done')
            .order('created_at', { ascending: false })
            .limit(50)
        );

        // 3. Combine
        // We prioritize the Tree's Pending list, then append History
        setTopics([...pendingTopics, ...(historyData || [])]);
        setStatus('idle');
    };

    // Fetch pending topics on mount
    useEffect(() => {
        loadTopics();
    }, []);

    const handleTopicChange = (topicId: string) => {
        setSelectedTopicId(topicId);
        const topic = topics.find(t => t.id === topicId);
        setSelectedTopicTitle(topic?.title || '');
        setContent('');
    };

    const handleSave = async () => {
        if (!selectedTopicId || !content) return;
        setStatus('saving');
        setErrorMessage('');

        const result = await saveArticle(selectedTopicId, selectedTopicTitle, content, undefined, 'draft');

        if (result.success) {
            setStatus('saved');
            localStorage.removeItem(`draft-${selectedTopicId}`);
            setTimeout(() => {
                setStatus('idle');
                setContent('');
                setSelectedTopicId('');
                setSelectedTopicTitle('');
                loadTopics();
            }, 2000);
        } else {
            setStatus('error');
            setErrorMessage(result.error || 'Failed to save article');
        }
    };

    return (
        <div className="flex flex-col gap-6 md:h-full max-w-4xl mx-auto">

            {/* Introduction Card */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 flex items-start gap-3">
                <span className="text-2xl">📋</span>
                <div>
                    <h3 className="font-bold text-indigo-900 text-sm">Step: Paste & Save Article</h3>
                    <p className="text-sm text-indigo-700 mt-1">
                        After generating the article in Final Output, copy the Markdown content and paste it here.
                        This will save the article to the database.
                    </p>
                </div>
            </div>

            {/* Step 1: Select Topic */}
            <div className="card">
                <h3 className="card-title mb-4">1. Select Topic Title</h3>
                {status === 'loading' ? (
                    <div className="space-y-2">
                        <Skeleton className="h-10 w-full" />
                    </div>
                ) : topics.length === 0 ? (
                    <div className="text-slate-500 text-sm">No pending topics found. Add topics in Blog Tree first.</div>
                ) : (
                    <select
                        className="form-select"
                        value={selectedTopicId}
                        onChange={(e) => handleTopicChange(e.target.value)}
                    >
                        <option value="">-- Choose a Topic --</option>

                        <optgroup label="Pending / In Progress">
                            {topics.filter(t => ['pending', 'in-progress'].includes(t.status)).map(t => (
                                <option key={t.id} value={t.id}>[{t.status.toUpperCase()}] {t.title}</option>
                            ))}
                        </optgroup>

                        <optgroup label="Recent History">
                            {topics.filter(t => !['pending', 'in-progress'].includes(t.status)).map(t => (
                                <option key={t.id} value={t.id}>[{t.status.toUpperCase()}] {t.title}</option>
                            ))}
                        </optgroup>
                    </select>
                )}
            </div>

            {/* Step 2: Paste Content */}
            <div className="card flex-1 flex flex-col min-h-[400px]">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="card-title">2. Paste Final Article (Markdown)</h3>
                    {lastSaved && <span className="text-xs text-slate-400">Draft saved locally {lastSaved.toLocaleTimeString()}</span>}
                </div>
                <textarea
                    ref={textareaRef}
                    className="form-textarea flex-1 font-mono text-sm leading-relaxed"
                    placeholder="# Article Title
                    
Content goes here..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                />
            </div>

            {/* Error Message */}
            {status === 'error' && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {errorMessage}
                </div>
            )}

            {/* Step 3: Action */}
            <div className="card sticky bottom-4 shadow-xl border-t-2 border-indigo-500">
                <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                        {content.length > 0 ? `${content.split(' ').length} words detected` : 'Waiting for content...'}
                    </div>

                    <div className="flex gap-3">
                        {/* Image Upload Button */}
                        <div className="relative">
                            <input
                                type="file"
                                accept="image/*"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;

                                    if (file.size > 5 * 1024 * 1024) {
                                        alert("File size too large. Max 5MB.");
                                        return;
                                    }

                                    // Save cursor position since upload is async
                                    const startPos = textareaRef.current?.selectionStart || content.length;
                                    const endPos = textareaRef.current?.selectionEnd || startPos;

                                    // COMPRESSION LOGIC (Mobile Optimized)
                                    const options = {
                                        maxSizeMB: 0.1,          // 100KB Goal
                                        maxWidthOrHeight: 1200,
                                        useWebWorker: true,
                                        fileType: 'image/webp',
                                        initialQuality: 0.7,
                                    };

                                    setStatus('saving'); // Re-using saving status to show activity

                                    try {
                                        let compressedFile = await imageCompression(file, options);
                                        // If still > 100KB, try harder
                                        if (compressedFile.size > 100 * 1024) {
                                            compressedFile = await imageCompression(file, { ...options, maxSizeMB: 0.08, initialQuality: 0.6 });
                                        }

                                        const { success, url, error } = await uploadImage(compressedFile);
                                        setStatus('idle');

                                        if (success && url) {
                                            // Logical Insertion: Add newlines before and after to ensure block separation
                                            const markdownImage = `\n\n![${file.name}](${url})\n\n`;

                                            const newContent = content.substring(0, startPos) + markdownImage + content.substring(endPos);

                                            setContent(newContent);

                                            // Restore focus and cursor position
                                            setTimeout(() => {
                                                if (textareaRef.current) {
                                                    textareaRef.current.focus();
                                                    const newCursorPos = startPos + markdownImage.length;
                                                    textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
                                                }
                                            }, 0);

                                        } else {
                                            alert(`Upload Failed: ${error}`);
                                        }
                                    } catch (err) {
                                        console.error('Image processing error:', err);
                                        alert('Failed to process image');
                                        setStatus('idle');
                                    }
                                }}
                            />
                            <button className="btn btn-secondary flex items-center gap-2">
                                <span>📷</span> Add Photos
                            </button>
                        </div>

                        <button
                            className={`btn ${status === 'saved' ? 'badge-green text-green-800' : 'btn-primary'} min-w-[200px]`}
                            onClick={handleSave}
                            disabled={!selectedTopicId || !content || status === 'saving'}
                        >
                            {status === 'saving' ? '💾 Saving...' : status === 'saved' ? '✅ Sent to SEO!' : '📥 Add to SEO Staging'}
                        </button>
                    </div>
                </div>
            </div>
        </div >
    );
}
