'use client';

import ArticlesManager from '@/app/components/ArticlesManager';
import { useRouter } from 'next/navigation';

export default function ArticlesPage() {
    const router = useRouter();

    return (
        <ArticlesManager
            onNavigateToPublish={() => router.push('/dashboard/publish')}
        />
    );
}
