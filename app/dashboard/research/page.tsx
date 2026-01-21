'use client';

import ResearchWorkspace from '@/app/components/ResearchWorkspace';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function ResearchWrapper() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialTopic = searchParams.get('topic') || '';

    return (
        <ResearchWorkspace
            initialTopic={initialTopic}
            onNavigateToPrompt={(data) => {
                // Navigate to prompt studio with topic
                // Data is already saved to DB by ResearchWorkspace, so we just pass the topic
                router.push(`/dashboard/generate?topic=${encodeURIComponent(data.topic)}`);
            }}
        />
    );
}

export default function ResearchPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ResearchWrapper />
        </Suspense>
    );
}
