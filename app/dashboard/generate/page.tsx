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
        // Method 1: Check URL Param (Direct Navigation)
        if (topic) {
            setLoading(true);
            try {
                // Try old method
                const stored = sessionStorage.getItem(`researchData_${topic}`);
                if (stored) {
                    const data = JSON.parse(stored);
                    setInitialData({
                        topic: topic,
                        results: data.results,
                        aiSummary: data.summary
                    });
                } else {
                    setInitialData({ topic });
                }
            } catch (e) {
                setInitialData({ topic });
            } finally {
                setLoading(false);
            }
            return;
        }

        // Method 2: Check Active Session (From Research Lab)
        const activeTopic = sessionStorage.getItem('activeResearchTopic');
        const activeContext = sessionStorage.getItem('activeResearchContext');

        if (activeTopic && activeContext) {
            setInitialData({
                topic: activeTopic,
                aiSummary: activeContext
            });
            // Clear it so it doesn't persist forever
            sessionStorage.removeItem('activeResearchTopic');
            sessionStorage.removeItem('activeResearchContext');
            setLoading(false);
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
