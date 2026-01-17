'use client';
import { useState, useEffect } from 'react';
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

export default function ResearchViewer() {
    const [docs, setDocs] = useState<ResearchDoc[]>([]);
    const [selectedDoc, setSelectedDoc] = useState<ResearchDoc | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDocs();
    }, []);

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

    // Group by category
    const groupedDocs = docs.reduce((acc, doc) => {
        acc[doc.category] = [...(acc[doc.category] || []), doc];
        return acc;
    }, {} as Record<string, ResearchDoc[]>);

    return (
        <div className="card" style={{ height: 'calc(100vh - 150px)', display: 'flex', flexDirection: 'column' }}>
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

                    {Object.keys(groupedDocs).length === 0 && !loading && (
                        <div style={{ padding: '20px', color: 'var(--text-muted)' }}>
                            No documents found. <br />
                            <small>Run the upload script to sync ALL_DATA.</small>
                        </div>
                    )}
                </div>

                {/* content Area */}
                <div className="file-content" style={{ flex: 1, padding: '24px', overflowY: 'auto', background: 'rgba(0,0,0,0.2)' }}>
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
            </div>
        </div>
    );
}
