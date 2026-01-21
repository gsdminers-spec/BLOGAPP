'use client';

import { useState, useEffect } from 'react';
import { getDashboardStats, supabase } from '@/lib/supabase';
import { Skeleton } from '@/app/components/ui/Skeleton'; // Adjusted import path
import Link from 'next/link';

interface ActivityLog {
    id: string;
    action: string;
    details: string;
    created_at: string;
    target: string;
}

export default function DashboardPage() {
    const [stats, setStats] = useState({
        articlesCreated: 0,
        pendingTopics: 0,
        readyToPublish: 0,
        published: 0
    });

    const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
    const [loadingLogs, setLoadingLogs] = useState(true);

    useEffect(() => {
        getDashboardStats().then(setStats);
        fetchActivityLogs();
    }, []);

    const fetchActivityLogs = async () => {
        setLoadingLogs(true);
        const { data } = await supabase
            .from('activity_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(5);

        if (data) setActivityLogs(data);
        setLoadingLogs(false);
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="page-header">
                <h1 className="page-title">Dashboard</h1>
            </div>

            {/* Stats Grid */}
            <div className="grid-2 md:grid-4">
                <div className="card border-l-4 border-l-blue-500">
                    <div className="text-sm text-slate-500">Articles Created</div>
                    <div className="text-3xl font-bold mt-1">{stats.articlesCreated}</div>
                </div>
                <div className="card border-l-4 border-l-amber-500">
                    <div className="text-sm text-slate-500">Pending Topics</div>
                    <div className="text-3xl font-bold mt-1">{stats.pendingTopics}</div>
                </div>
                <div className="card border-l-4 border-l-purple-500">
                    <div className="text-sm text-slate-500">Ready to Publish</div>
                    <div className="text-3xl font-bold mt-1">{stats.readyToPublish}</div>
                </div>
                <div className="card border-l-4 border-l-green-500">
                    <div className="text-sm text-slate-500">Published Live</div>
                    <div className="text-3xl font-bold mt-1">{stats.published}</div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-6">
                <div className="card">
                    <h3 className="card-title mb-4">Quick Navigation</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <Link href="/dashboard/research" className="btn btn-secondary text-left">
                            🔬 Start Research
                        </Link>
                        <Link href="/dashboard/publish" className="btn btn-secondary text-left">
                            🚀 Scheduled Posts
                        </Link>
                        <Link href="/dashboard/keywords" className="btn btn-secondary text-left">
                            🔑 Review Keywords
                        </Link>
                        <Link href="/dashboard/claude" className="btn btn-secondary text-left">
                            📋 Paste Article
                        </Link>
                    </div>
                </div>
                <div className="card bg-slate-50 border-dashed">
                    <h3 className="card-title text-slate-400 mb-4">System Activity</h3>
                    <div className="space-y-3">
                        {loadingLogs ? (
                            <>
                                <Skeleton className="h-5 w-full" />
                                <Skeleton className="h-5 w-3/4" />
                                <Skeleton className="h-5 w-5/6" />
                            </>
                        ) : activityLogs.length === 0 ? (
                            <div className="text-sm text-slate-400">No activity recorded yet.</div>
                        ) : (
                            activityLogs.map(log => (
                                <div key={log.id} className="text-sm text-slate-500 flex gap-2 overflow-hidden">
                                    <span className="text-slate-400 shrink-0">
                                        {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    <span className="truncate">{log.details}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
