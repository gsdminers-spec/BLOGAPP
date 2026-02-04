import { supabase } from './supabase';

export type LogAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'PUBLISH' | 'LOGIN' | 'ERROR';
export type LogTarget = 'Topic' | 'Article' | 'Keyword' | 'System' | 'Phase' | 'Category';

export async function logActivity(action: LogAction, target: LogTarget, details: string) {
    try {
        await supabase.from('activity_logs').insert({
            action,
            target,
            details
        });
    } catch (e) {
        // Fail silently - don't break the app if logging fails
        console.error('Logging failed:', e);
    }
}
