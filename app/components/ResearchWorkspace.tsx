'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

interface Topic {
    id: number;
    title: string;
    category: string;
    status: string;
    priority: number;
}

interface ScrapedResult {
    title: string;
    url: string;
    snippet: string;
}

export default function ResearchWorkspace() {
    // Topics State
    const [topics, setTopics] = useState<Topic[]>([]);
    const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
    const [newTopicInput, setNewTopicInput] = useState('');

    // Workflow State
    const [step, setStep] = useState<'select' | 'research' | 'generate' | 'copy'>('select');
    const [scrapedResults, setScrapedResults] = useState<ScrapedResult[]>([]);
    const [generatedPrompt, setGeneratedPrompt] = useState('');

    // Loading States
    const [isSearching, setIsSearching] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        loadTopics();
    }, []);

    const loadTopics = async () => {
        if (!supabase) {
            // Use sample data if Supabase not configured
            setTopics([
                { id: 1, title: 'S19 Pro Hashboard Not Detected', category: 'Antminer', status: 'pending', priority: 1 },
                { id: 2, title: 'M30S Overheating Solutions', category: 'WhatsMiner', status: 'pending', priority: 2 },
                { id: 3, title: 'Avalon A1246 PSU Replacement', category: 'Avalon', status: 'pending', priority: 3 },
            ]);
            return;
        }

        const { data } = await supabase.from('topics').select('*').order('priority', { ascending: false });
        if (data) setTopics(data);
    };

    const addTopic = async () => {
        if (!newTopicInput.trim()) return;

        if (supabase) {
            await supabase.from('topics').insert({ title: newTopicInput, status: 'pending' });
            loadTopics();
        } else {
            setTopics(prev => [...prev, { id: Date.now(), title: newTopicInput, category: '', status: 'pending', priority: 0 }]);
        }
        setNewTopicInput('');
    };

    const selectTopic = (topic: Topic) => {
        setSelectedTopic(topic);
        setStep('research');
        setScrapedResults([]);
        setGeneratedPrompt('');
    };

    const startResearch = async () => {
        if (!selectedTopic) return;
        setIsSearching(true);

        try {
            const res = await fetch('/api/scraper/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: selectedTopic.title + ' repair guide troubleshooting', maxResults: 8 })
            });

            const data = await res.json();
            if (data.results) {
                setScrapedResults(data.results);
                setStep('generate');
            }
        } catch (err) {
            console.error(err);
            alert('Research failed. Try again.');
        } finally {
            setIsSearching(false);
        }
    };

    const generatePrompt = async () => {
        if (!selectedTopic) return;
        setIsGenerating(true);

        try {
            const res = await fetch('/api/prompt/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    topic: selectedTopic.title,
                    scrapedData: scrapedResults
                })
            });

            const data = await res.json();
            if (data.prompt) {
                setGeneratedPrompt(data.prompt);
                setStep('copy');
            }
        } catch (err) {
            console.error(err);
            alert('Prompt generation failed. Try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const copyToClipboard = async () => {
        await navigator.clipboard.writeText(generatedPrompt);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const resetWorkflow = () => {
        setSelectedTopic(null);
        setStep('select');
        setScrapedResults([]);
        setGeneratedPrompt('');
    };

    return (
        <div style={{ display: 'flex', gap: '24px', height: 'calc(100vh - 100px)' }}>
            {/* Left Panel: Topics Queue */}
            <div className="card" style={{ width: '300px', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ marginBottom: '16px' }}>📋 Topics Queue</h3>

                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                    <input
                        className="form-input"
                        placeholder="Add new topic..."
                        value={newTopicInput}
                        onChange={(e) => setNewTopicInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addTopic()}
                        style={{ flex: 1 }}
                    />
                    <button className="btn btn-primary" onClick={addTopic}>+</button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {topics.map(topic => (
                        <div
                            key={topic.id}
                            onClick={() => selectTopic(topic)}
                            style={{
                                padding: '12px',
                                marginBottom: '8px',
                                background: selectedTopic?.id === topic.id ? '#eff6ff' : 'white',
                                border: selectedTopic?.id === topic.id ? '2px solid #4f46e5' : '1px solid #e2e8f0',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            <div style={{ fontWeight: 500 }}>{topic.title}</div>
                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                {topic.category || 'Uncategorized'} • {topic.status}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Panel: Research Workspace */}
            <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {!selectedTopic ? (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>👈</div>
                            <div>Select a topic from the queue to start</div>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--border-subtle)' }}>
                            <div>
                                <h2 style={{ margin: 0 }}>🎯 {selectedTopic.title}</h2>
                                <div style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '4px' }}>
                                    Step {step === 'research' ? '1' : step === 'generate' ? '2' : '3'} of 3
                                </div>
                            </div>
                            <button className="btn btn-secondary" onClick={resetWorkflow}>✕ Cancel</button>
                        </div>

                        {/* Step 1: Research */}
                        {step === 'research' && (
                            <div style={{ flex: 1 }}>
                                <h3>🕷️ Step 1: Web Research</h3>
                                <p style={{ color: '#64748b' }}>Click below to search the web for relevant information about this topic.</p>

                                <button
                                    className="btn btn-primary"
                                    onClick={startResearch}
                                    disabled={isSearching}
                                    style={{ marginTop: '16px' }}
                                >
                                    {isSearching ? '🔍 Searching the web...' : '🔍 Start Web Research'}
                                </button>
                            </div>
                        )}

                        {/* Step 2: Generate */}
                        {step === 'generate' && (
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <h3>📊 Research Results ({scrapedResults.length} sources)</h3>

                                <div style={{ flex: 1, overflowY: 'auto', marginBottom: '16px', background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                                    {scrapedResults.map((result, i) => (
                                        <div key={i} style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #e2e8f0' }}>
                                            <div style={{ fontWeight: 500 }}>{i + 1}. {result.title}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{result.snippet}</div>
                                            <a href={result.url} target="_blank" style={{ fontSize: '0.75rem', color: '#4f46e5' }}>{result.url}</a>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    className="btn btn-primary"
                                    onClick={generatePrompt}
                                    disabled={isGenerating}
                                >
                                    {isGenerating ? '🧠 Generating prompt...' : '🧠 Generate Claude Prompt'}
                                </button>
                            </div>
                        )}

                        {/* Step 3: Copy */}
                        {step === 'copy' && (
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <h3>✨ Claude-Ready Prompt</h3>

                                <textarea
                                    readOnly
                                    value={generatedPrompt}
                                    style={{
                                        flex: 1,
                                        padding: '16px',
                                        fontFamily: 'monospace',
                                        fontSize: '0.85rem',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                        background: '#f8fafc',
                                        resize: 'none',
                                        marginBottom: '16px'
                                    }}
                                />

                                <button
                                    className="btn btn-primary"
                                    onClick={copyToClipboard}
                                    style={{
                                        background: copied ? '#10b981' : undefined
                                    }}
                                >
                                    {copied ? '✅ Copied to Clipboard!' : '📋 Copy Prompt for Claude'}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
