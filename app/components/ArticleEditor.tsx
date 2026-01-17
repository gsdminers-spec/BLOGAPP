'use client';
import { useState, useRef } from 'react';
import SeoAnalyzer from './SeoAnalyzer';

interface ArticleEditorProps {
    onBack: () => void;
}

export default function ArticleEditor({ onBack }: ArticleEditorProps) {
    const [title, setTitle] = useState('Antminer S19 Pro Hashboard Not Detected Guide');
    const [content, setContent] = useState(`# Antminer S19 Pro Hashboard Not Detected Guide

If your Antminer S19 Pro hashboard is not detected, it can be a major issue for your mining operation. This guide will help you troubleshoot.

## Symptoms of Undetected Hashboard
The main symptom is the kernel log showing "chain 0 found 0 asic". This means...
  `);
    const [keyword, setKeyword] = useState('hashboard not detected');

    // AI State
    const [isAiProcessing, setIsAiProcessing] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleAiImprove = async (instruction: string) => {
        if (!textareaRef.current) return;

        const textarea = textareaRef.current;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = content.substring(start, end);

        // Use selected text or fallback to whole content (safe?) 
        // Let's force selection for specific edits, or handle whole doc if nothing selected.
        const textToProcess = selectedText || content;

        if (!textToProcess.trim()) return;

        setIsAiProcessing(true);
        try {
            const res = await fetch('/api/editor/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: textToProcess,
                    instruction: instruction
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            // Replace text
            if (selectedText) {
                const newContent = content.substring(0, start) + data.rewritten + content.substring(end);
                setContent(newContent);
            } else {
                setContent(data.rewritten);
            }

        } catch (err) {
            console.error(err);
            alert('AI Error: Could not process text. Check API limits.');
        } finally {
            setIsAiProcessing(false);
        }
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', height: 'calc(100vh - 100px)' }}>
            {/* Editor Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div className="page-header">
                        <button className="btn btn-secondary" onClick={onBack}>← Back</button>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button className="btn btn-secondary">💾 Save Draft</button>
                            <button className="btn btn-primary">🚀 Publish</button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Article Title</label>
                        <input
                            className="form-input"
                            style={{ fontSize: '1.2rem', fontWeight: 'bold' }}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    {/* AI Toolbar */}
                    <div style={{
                        padding: '10px',
                        background: 'linear-gradient(90deg, #f8fafc 0%, #eff6ff 100%)',
                        border: '1px solid var(--border-subtle)',
                        borderBottom: 'none',
                        borderTopLeftRadius: '8px',
                        borderTopRightRadius: '8px',
                        display: 'flex',
                        gap: '8px',
                        alignItems: 'center'
                    }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#4f46e5', marginRight: '8px' }}>✨ God Mode:</span>

                        {[
                            { label: '🧹 Fix Grammar', prompt: 'Fix grammar and spelling errors' },
                            { label: '👔 Professional', prompt: 'Make the tone professional and technical' },
                            { label: '📝 Expand', prompt: 'Expand this significantly with more detail' },
                            { label: '✂️ Summarize', prompt: 'Summarize this concisely' },
                        ].map(action => (
                            <button
                                key={action.label}
                                onClick={() => handleAiImprove(action.prompt)}
                                disabled={isAiProcessing}
                                style={{
                                    background: 'white',
                                    border: '1px solid #cbd5e1',
                                    borderRadius: '6px',
                                    padding: '4px 10px',
                                    fontSize: '0.8rem',
                                    cursor: isAiProcessing ? 'wait' : 'pointer',
                                    transition: 'all 0.2s',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                }}
                            >
                                {action.label}
                            </button>
                        ))}

                        {isAiProcessing && <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Processing...</span>}
                    </div>

                    <div className="form-group" style={{ flex: 1 }}>
                        <textarea
                            ref={textareaRef}
                            className="form-textarea"
                            style={{
                                flex: 1,
                                resize: 'none',
                                height: '100%',
                                fontFamily: 'monospace',
                                borderTopLeftRadius: 0,
                                borderTopRightRadius: 0
                            }}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Write your article here... Highlight text to use AI tools."
                        />
                    </div>
                </div>
            </div>

            {/* Sidebar Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
                <div className="card">
                    <h3 className="card-title">🎯 Target Keyword</h3>
                    <input
                        className="form-input"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        placeholder="Enter target keyword..."
                        style={{ marginTop: '8px' }}
                    />
                </div>

                <SeoAnalyzer content={content} title={title} targetKeyword={keyword} />

                <div className="card">
                    <h3 className="card-title">🖼️ Media</h3>
                    <div style={{ height: '100px', border: '2px dashed var(--glass-border)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '12px', color: 'var(--text-muted)' }}>
                        Drag & Drop Images
                    </div>
                </div>
            </div>
        </div>
    );
}
