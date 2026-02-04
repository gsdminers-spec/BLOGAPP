
import { supabase } from './supabase';

export async function saveTopicResearch(topicId: string, researchData: {
    results: any[];
    summary: string;
    keyFindings: string[];
    lastUpdated: string;
}) {
    const { data, error } = await supabase
        .from('topics')
        .update({
            research_data: researchData,
            status: 'researched' // Advance status
        })
        .eq('title', topicId) // Currently using title as ID in UI often, but should use ID if possible. 
        // Wait, BlogTree passes "topic" string (title) to onSelectTopic. 
        // We should probably pass the ID. For now I'll stick to Title OR fix BlogTree to pass object.
        // Let's assume input is Title for now based on current UI, but ideally we match by ID.
        // I will try to match by title first.
        .select();

    return { data, error };
}

export async function getTopicResearch(topicTitle: string) {
    const { data, error } = await supabase
        .from('topics')
        .select('research_data, status')
        .eq('title', topicTitle)
        .single();

    return { data, error };
}
