'use client';

import BlogTree from '@/app/components/BlogTree';
import { useRouter } from 'next/navigation';

export default function BlogTreePage() {
    const router = useRouter();

    return (
        <BlogTree
            onSelectTopic={(topic) => {
                // Navigate to research with topic pre-filled
                router.push(`/dashboard/research?topic=${encodeURIComponent(topic)}`);
            }}
        />
    );
}
