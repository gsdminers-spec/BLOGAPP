'use client';
import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client (CLIENT SIDE - uses Anon Key)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = (supabaseUrl && supabaseKey)
    ? createClient(supabaseUrl, supabaseKey)
    : null;

interface ResearchDoc {
    id: number;
    title: string;
    category: string;
    file_path: string;
    content: string;
}

interface ChatMessage {
    role: 'user' | 'ai';
    content: string;
    sources?: string[];
}

export default function ResearchViewer() {
    // Viewer State
    const [docs, setDocs] = useState<ResearchDoc[]>([]);
    const [selectedDoc, setSelectedDoc] = useState<ResearchDoc | null>(null);
    const [loading, setLoading] = useState(true);

    // Chat State
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatInput, setChatInput] = useState('');
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [isThinking, setIsThinking] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchDocs();
    }, []);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory, isThinking]);

    const fetchDocs = async () => {
        try {
            if (!supabase) {
                console.warn('Supabase credentials missing');
                setDocs([]);
                return;
            }

            const { data, error } = await supabase
                .from('research_documents')
                .select('*')
                .order('category');

            if (error) throw error;
            setDocs(data || []);
        } catch (err) {
            console.error('Error fetching docs:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleChatSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim()) return;

        const userMessage = chatInput;
        setChatInput('');
        setChatHistory(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsThinking(true);

        try {
            const res = await fetch('/api/research/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMessage })
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Failed to fetch');

            setChatHistory(prev => [...prev, {
                role: 'ai',
                content: data.answer,
                sources: data.sources
            }]);

        } catch (err) {
            console.error(err);
            setChatHistory(prev => [...prev, { role: 'ai', content: '⚠️ Error: Could not reach the ASIC Brain.' }]);
        } finally {
            setIsThinking(false);
        }
    };

    // Group by category
    const groupedDocs = docs.reduce((acc, doc) => {
        acc[doc.category] = [...(acc[doc.category] || []), doc];
        return acc;
    }, {} as Record<string, ResearchDoc[]>);

    return (
        <div className="card" style={{ height: 'calc(100vh - 150px)', display: 'flex', flexDirection: 'column', position: 'relative' }}>

            {/* Header / Toolbar */}
            <div style={{ padding: '10px 20px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 'bold' }}>📚 Research Library</span>
                <button
                    onClick={() => setIsChatOpen(!isChatOpen)}
                    style={{
                        background: isChatOpen ? 'var(--primary-color)' : 'transparent',
                        color: isChatOpen ? 'white' : 'var(--primary-color)',
                        border: '1px solid var(--primary-color)',
                        padding: '5px 15px',
                        borderRadius: '20px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                    }}
                >
                    🤖 {isChatOpen ? 'Close Brain' : 'Ask ASIC Brain'}
                </button>
            </div>

            <div className="file-browser" style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

                {/* Sidebar: File Tree */}
                <div className="file-tree" style={{ width: '250px', borderRight: '1px solid var(--glass-border)', overflowY: 'auto' }}>
                    {loading ? (
                        <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>
                    ) : (
                        Object.entries(groupedDocs).map(([category, items]) => (
                            <div key={category} className="folder">
                                <span className="folder-name" style={{ textTransform: 'capitalize' }}>▼ {category.replace(/[_-]/g, ' ')}</span>
                                {items.map(doc => (
                                    <div
                                        key={doc.id}
                                        className={`file-item ${selectedDoc?.id === doc.id ? 'active' : ''}`}
                                        onClick={() => setSelectedDoc(doc)}
                                    >
                                        📄 {doc.title}
                                    </div>
                                ))}
                            </div>
                        ))
                    )}
                </div>

                {/* Content Area */}
                <div className="file-content" style={{ flex: 1, padding: '24px', overflowY: 'auto', background: 'rgba(0,0,0,0.02)' }}>
                    {selectedDoc ? (
                        <div>
                            <div style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '12px', marginBottom: '16px' }}>
                                <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>{selectedDoc.title}</h2>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{selectedDoc.file_path}</div>
                            </div>
                            <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                                {selectedDoc.content}
                            </pre>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                            Select a document to view
                        </div>
                    )}
                </div>

                {/* Chat Panel (Right Side) */}
                {isChatOpen && (
                    <div style={{
                        width: '350px',
                        borderLeft: '1px solid var(--glass-border)',
                        background: 'white',
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: '-5px 0 15px rgba(0,0,0,0.05)'
                    }}>
                        <div style={{ padding: '15px', borderBottom: '1px solid var(--border-subtle)', background: '#f8fafc' }}>
                            <strong>🧠 ASIC Brain</strong>
                            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>Ask about repair guides, logs, and specs.</p>
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto', padding: '15px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {chatHistory.length === 0 && (
                                <div style={{ textAlign: 'center', marginTop: '40px', color: '#94a3b8' }}>
                                    <div style={{ fontSize: '2rem', marginBottom: '10px' }}>👋</div>
                                    ask me anything about<br />ASIC repair!
                                </div>
                            )}

                            {chatHistory.map((msg, idx) => (
                                <div key={idx} style={{
                                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                    maxWidth: '90%'
                                }}>
                                    <div style={{
                                        background: msg.role === 'user' ? '#4f46e5' : '#f1f5f9',
                                        color: msg.role === 'user' ? 'white' : '#1e293b',
                                        padding: '10px 15px',
                                        borderRadius: '12px',
                                        borderBottomRightRadius: msg.role === 'user' ? '2px' : '12px',
                                        borderBottomLeftRadius: msg.role === 'ai' ? '2px' : '12px',
                                        fontSize: '0.9rem',
                                        lineHeight: '1.4'
                                    }}>
                                        {msg.content}
                                    </div>
                                    {msg.sources && msg.sources.length > 0 && (
                                        <div style={{ fontSize: '0.75rem', marginTop: '5px', color: '#64748b', marginLeft: '5px' }}>
                                            📚 Sources: {msg.sources.slice(0, 3).join(', ')}
                                        </div>
                                    )}
                                </div>
                            ))}
                            {isThinking && (
                                <div style={{ alignSelf: 'flex-start', color: '#94a3b8', fontSize: '0.85rem' }}>
                                    🧠 Thinking...
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        <form onSubmit={handleChatSubmit} style={{ padding: '15px', borderTop: '1px solid var(--border-subtle)' }}>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input
                                    type="text"
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    placeholder="Ask a question..."
                                    style={{
                                        flex: 1,
                                        padding: '10px',
                                        borderRadius: '8px',
                                        border: '1px solid #cbd5e1',
                                        outline: 'none'
                                    }}
                                />
                                <button
                                    type="submit"
                                    disabled={isThinking || !chatInput.trim()}
                                    style={{
                                        background: '#4f46e5',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        padding: '0 15px',
                                        cursor: 'pointer',
                                        opacity: isThinking ? 0.7 : 1
                                    }}
                                >
                                    ➤
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
