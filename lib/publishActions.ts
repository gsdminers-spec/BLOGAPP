import { supabase } from './supabase';
import { PublishItem, Article } from './supabase';


// Fetch publish queue with article details
export async function fetchPublishQueue(): Promise<(PublishItem & { articles: Article })[]> {
    const { data, error } = await supabase
        .from('publish_queue')
        .select(`
            *,
            articles (*)
        `)
        .order('scheduled_date', { ascending: true });

    if (error) {
        console.error('Error fetching publish queue:', error);
        return [];
    }
    return (data || []) as (PublishItem & { articles: Article })[];
}

// Update schedule for a publish queue item
export async function updateSchedule(id: string, date: string, time: string): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase
        .from('publish_queue')
        .update({
            scheduled_date: date,
            scheduled_time: time,
            status: 'scheduled'
        })
        .eq('id', id);

    if (error) {
        console.error('Error updating schedule:', error);
        return { success: false, error: error.message };
    }
    return { success: true };
}

// Publish immediately (via Server API to bypass RLS)
export async function publishNow(queueId: string, articleId: string): Promise<{ success: boolean; error?: string; deploymentTriggered?: boolean; deploymentError?: string | null }> {
    try {
        const response = await fetch('/api/publish', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ queueId, articleId })
        });

        const result = await response.json();

        if (!response.ok) {
            return { success: false, error: result.error || 'Failed to publish via API' };
        }

        return {
            success: true,
            deploymentTriggered: result.deploymentTriggered,
            deploymentError: result.deploymentError
        };
    } catch (err: any) {
        console.error('Error calling publish API:', err);
        return { success: false, error: err.message };
    }
}

// Cancel scheduling
export async function cancelSchedule(queueId: string, articleId: string): Promise<{ success: boolean; error?: string }> {
    // Delete from queue
    const { error: queueError } = await supabase
        .from('publish_queue')
        .delete()
        .eq('id', queueId);

    if (queueError) {
        console.error('Error deleting from queue:', queueError);
        return { success: false, error: queueError.message };
    }

    // Update article status back to ready
    await supabase.from('articles').update({ status: 'ready' }).eq('id', articleId);

    return { success: true };
}

// Trigger GitHub Deployment
export async function triggerDeployment(): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
        const response = await fetch('/api/deploy', {
            method: 'POST',
        });

        const result = await response.json();

        if (!response.ok) {
            return { success: false, error: result.error || 'Failed to trigger deployment' };
        }

        return { success: true, message: result.message };
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('Error triggering deployment:', errorMessage);
        return { success: false, error: errorMessage };
    }
}
