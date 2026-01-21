'use client';

import PromptStudio from '@/app/components/PromptStudio';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { getTopicResearch } from '@/lib/researchActions';
import { PromptData } from '@/lib/types';

function PromptStudioWrapper() {
    const searchParams = useSearchParams();
    const topic = searchParams.get('topic') || '';
    const [initialData, setInitialData] = useState<PromptData | null>(null);
    const [loading, setLoading] = useState(!!topic);

    useEffect(() => {
        if (topic) {
            // Fetch the saved research data for this topic
            getTopicResearch(topic).then(({ data }) => {
                if (data?.research_data) {
                    setInitialData({
                        topic: topic,
                        results: data.research_data.results,
                        aiSummary: data.research_data.summary
                    });
                } else {
                    // No data found, just set topic
                    setInitialData({ topic });
                }
                setLoading(false);
            });
        }
    }, [topic]);

    if (loading) {
        return <div className="p-8 text-center text-slate-500">Loading research context...</div>;
    }

    return (
        <PromptStudio initialData={initialData} />
    );
}

export default function GeneratePage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <PromptStudioWrapper />
        </Suspense>
    );
}
