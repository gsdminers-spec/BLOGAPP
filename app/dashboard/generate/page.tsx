'use client';

import ArticleGenerator from '@/app/components/ArticleGenerator';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';

import { PromptData } from '@/lib/types';

function ArticleGeneratorWrapper() {
    const searchParams = useSearchParams();
    const topic = searchParams.get('topic') || '';
    const [initialData, setInitialData] = useState<PromptData | null>(null);
    const [loading, setLoading] = useState(!!topic);

    useEffect(() => {
        if (topic) {
            // Try to recover from session storage
            try {
                const stored = sessionStorage.getItem(`researchData_${topic}`);
                if (stored) {
                    const data = JSON.parse(stored);
                    setInitialData({
                        topic: topic,
                        results: data.results,
                        aiSummary: data.summary
                    });
                } else {
                    // Fallback or just set topic
                    setInitialData({ topic });
                }
            } catch (e) {
                console.error("Session load error", e);
                setInitialData({ topic });
            } finally {
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    }, [topic]);

    if (loading) {
        return <div className="p-8 text-center text-slate-500">Loading research context...</div>;
    }

    return (
        <ArticleGenerator initialData={initialData} />
    );
}

export default function GeneratePage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ArticleGeneratorWrapper />
        </Suspense>
    );
}
