import { supabase } from './supabase';
import { Keyword } from './supabase';

// Fetch all keywords
export async function fetchKeywords(): Promise<Keyword[]> {
    const { data, error } = await supabase
        .from('keywords')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching keywords:', error);
        return [];
    }
    return data || [];
}

// Add new keyword
export async function addKeyword(phrase: string, model?: string, category?: string): Promise<{ success: boolean; keyword?: Keyword; error?: string }> {
    const { data, error } = await supabase
        .from('keywords')
        .insert({
            phrase,
            model,
            category,
            status: 'pending',
            volume: 'medium'
        })
        .select()
        .single();

    if (error) {
        console.error('Error adding keyword:', error);
        return { success: false, error: error.message };
    }
    return { success: true, keyword: data };
}

// Update keyword status (approve/reject)
export async function updateKeywordStatus(id: string, status: 'approved' | 'rejected', notes?: string): Promise<{ success: boolean; error?: string }> {
    const updateData: { status: string; notes?: string } = { status };
    if (notes) updateData.notes = notes;

    const { error } = await supabase
        .from('keywords')
        .update(updateData)
        .eq('id', id);

    if (error) {
        console.error('Error updating keyword status:', error);
        return { success: false, error: error.message };
    }
    return { success: true };
}

// Update keyword details
export async function updateKeyword(id: string, updates: Partial<Keyword>): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase
        .from('keywords')
        .update(updates)
        .eq('id', id);

    if (error) {
        console.error('Error updating keyword:', error);
        return { success: false, error: error.message };
    }
    return { success: true };
}

// Delete keyword
export async function deleteKeyword(id: string): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase
        .from('keywords')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting keyword:', error);
        return { success: false, error: error.message };
    }
    return { success: true };
}
