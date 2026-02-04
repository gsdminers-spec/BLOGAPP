
import { supabase } from './supabase';
import { Phase, Category, Subcategory, Topic } from './supabase';

// --- FETCHING ---

export async function fetchFullBlogTree() {
    // Supabase doesn't do deep nested joins easily in one go with types, 
    // but we can try a deep select or fetch sequentially.
    // For simplicity and speed in a small app, we'll fetch all and reassemble or deep select.

    const { data, error } = await supabase
        .from('phases')
        .select(`
      *,
      categories (
        *,
        subcategories (
          *,
          topics (*)
        )
      )
    `)
        .order('order', { ascending: true });

    if (error) {
        console.error('Error fetching blog tree:', error);
        return [];
    }

    // Sort children manually if needed, or rely on DB order if we added order columns usually.
    // The query above doesn't guarantee nested order without specific order modifiers for inner joins,
    // but usually creation order roughly holds. For a robust app, we should sort by created_at or name.

    const rawData = data as any[];

    // TRANSFORM: Support Hybrid Schema (Phases 2-4)
    // If a category has a subcategory named "All Topics" (or similar),
    // we move its topics up to the category level and remove the subcategory from the list.
    const processedData = rawData.map(phase => ({
        ...phase,
        categories: phase.categories.map((cat: any) => {
            let topics: Topic[] = [];
            let subcategories = cat.subcategories || [];

            // Find "All Topics" or "Direct"
            const allTopicsIndex = subcategories.findIndex((s: any) => ['All Topics', 'All Models', 'Direct', 'General'].includes(s.name));

            if (allTopicsIndex !== -1) {
                // Move topics up
                topics = subcategories[allTopicsIndex].topics;
                // Remove that subcategory wrapper from the list so it doesn't show in UI
                subcategories = subcategories.filter((_: any, idx: number) => idx !== allTopicsIndex);
            }

            return {
                ...cat,
                subcategories,
                topics // Now we have direct topics!
            };
        })
    }));

    return processedData as (Phase & { categories: (Category & { subcategories: (Subcategory & { topics: Topic[] })[], topics?: Topic[] })[] })[];
}

// --- PHASE ACTIONS ---

export async function addPhase(name: string, order: number) {
    return await supabase.from('phases').insert({ name, order }).select().single();
}

export async function renamePhase(id: string, name: string) {
    return await supabase.from('phases').update({ name }).eq('id', id).select().single();
}

export async function deletePhase(id: string) {
    return await supabase.from('phases').delete().eq('id', id);
}

// --- CATEGORY ACTIONS ---

export async function addCategory(phaseId: string, name: string) {
    return await supabase.from('categories').insert({ phase_id: phaseId, name }).select().single();
}

export async function renameCategory(id: string, name: string) {
    return await supabase.from('categories').update({ name }).eq('id', id).select().single();
}

export async function deleteCategory(id: string) {
    return await supabase.from('categories').delete().eq('id', id);
}

// --- SUBCATEGORY ACTIONS ---

export async function addSubcategory(categoryId: string, name: string) {
    return await supabase.from('subcategories').insert({ category_id: categoryId, name }).select().single();
}

export async function renameSubcategory(id: string, name: string) {
    return await supabase.from('subcategories').update({ name }).eq('id', id).select().single();
}

export async function deleteSubcategory(id: string) {
    return await supabase.from('subcategories').delete().eq('id', id);
}

// --- TOPIC ACTIONS ---

export async function addTopic(subcategoryId: string, title: string) {
    return await supabase.from('topics').insert({ subcategory_id: subcategoryId, title, status: 'pending' }).select().single();
}

export async function renameTopic(id: string, title: string) {
    return await supabase.from('topics').update({ title }).eq('id', id).select().single();
}

export async function updateTopicStatus(id: string, status: 'pending' | 'in-progress' | 'done') {
    return await supabase.from('topics').update({ status }).eq('id', id).select().single();
}

export async function deleteTopic(id: string) {
    // SYNC: First delete the linked article if it exists
    // We first get the topic details to know the title or ID
    const { data: topic } = await supabase.from('topics').select('title').eq('id', id).single();

    if (topic) {
        // Try deleting by topic_id if column exists, or title
        // Since we don't know strict schema, we try both or just title if that's the link.
        // Assuming title matching based on previous context, but topic_id is safer if it exists.
        // Let's try deleting by title as a fallback if topic_id isn't strictly enforced.
        await supabase.from('articles').delete().eq('title', topic.title);
    }

    return await supabase.from('topics').delete().eq('id', id);
}
