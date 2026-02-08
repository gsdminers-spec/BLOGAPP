import { supabase, Topic, Article } from './supabase';
import { slugify } from './utils';

// Fetch recent topics (History + Pending) for the Claude Output dropdown
// Fetch topics for the dropdown: ALL Pending/In-Progress + Last 50 History
export async function fetchRecentTopics(): Promise<Topic[]> {
    // 1. Fetch ALL pending/in-progress
    const { data: pendingData, error: pendingError } = await supabase
        .from('topics')
        .select('*')
        .in('status', ['pending', 'in-progress'])
        .order('created_at', { ascending: false });

    if (pendingError) {
        console.error('Error fetching pending topics:', pendingError);
        return [];
    }

    // 2. Fetch last 50 'done' (History)
    const { data: historyData, error: historyError } = await supabase
        .from('topics')
        .select('*')
        .eq('status', 'done')
        .order('created_at', { ascending: false })
        .limit(50);

    if (historyError) {
        console.error('Error fetching history topics:', historyError);
    }

    // 3. Combine
    return [...(pendingData || []), ...(historyData || [])];
}

// Keep this for compatibility if needed, or deprecate
export async function fetchPendingTopics(): Promise<Topic[]> {
    return fetchRecentTopics();
}

// Save article from Claude Output and update topic status
// Now supports optional SEO fields for Production Blog Brain v3.0
export async function saveArticle(
    topicId: string,
    title: string,
    content: string,
    category?: string,
    seoMeta?: { title?: string; h1?: string; metaDescription?: string }
): Promise<{ success: boolean; articleId?: string; error?: string }> {
    // 1. Insert article with optional SEO fields
    const insertData: any = {
        topic_id: topicId,
        title,
        content,
        category,
        status: 'ready',
        slug: slugify(title) // Generate slug from title
    };

    // Add SEO fields if provided
    if (seoMeta) {
        if (seoMeta.title) insertData.seo_title = seoMeta.title;
        if (seoMeta.h1) insertData.seo_h1 = seoMeta.h1;
        if (seoMeta.metaDescription) insertData.seo_meta_description = seoMeta.metaDescription;
    }

    const { data: articleData, error: articleError } = await supabase
        .from('articles')
        .insert(insertData)
        .select()
        .single();

    if (articleError) {
        console.error('Error saving article:', articleError);
        return { success: false, error: articleError.message };
    }

    // 2. Update topic status to 'done'
    const { error: topicError } = await supabase
        .from('topics')
        .update({ status: 'done' })
        .eq('id', topicId);

    if (topicError) {
        console.error('Error updating topic status:', topicError);
        // Article was saved, but topic status failed - partial success
    }

    // Log user activity
    await import('./logger').then(l => l.logActivity('CREATE', 'Article', `Created article: ${title}`));

    return { success: true, articleId: articleData.id };
}

// Convenience wrapper for v3.0 pipeline with explicit SEO params
export async function saveArticleWithSEO(
    topicId: string,
    title: string,
    content: string,
    seoTitle: string,
    seoH1: string,
    seoMetaDescription: string,
    category?: string
): Promise<{ success: boolean; articleId?: string; error?: string }> {
    return saveArticle(topicId, title, content, category, {
        title: seoTitle,
        h1: seoH1,
        metaDescription: seoMetaDescription
    });
}


// Fetch all articles
export async function fetchArticles(): Promise<Article[]> {
    const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching articles:', error);
        return [];
    }
    return data || [];
}

// Move article to publish queue with optional scheduling
export async function moveToPublish(
    articleId: string,
    scheduledDate?: string,
    scheduledTime?: string,
    category?: string
): Promise<{ success: boolean; error?: string; queueId?: string }> {
    // Check if already in queue
    const { data: existing } = await supabase
        .from('publish_queue')
        .select('id')
        .eq('article_id', articleId)
        .single();

    if (existing) {
        return { success: false, error: 'Article already in publish queue' };
    }

    // Default to tomorrow 09:00 IST if not provided
    let dateToUse = scheduledDate;
    let timeToUse = scheduledTime || '09:00:00';

    if (!dateToUse) {
        // Calculate tomorrow in IST (GMT+5:30)
        const now = new Date();
        const istOffset = 5.5 * 60 * 60 * 1000; // 5h 30m in ms
        const istNow = new Date(now.getTime() + istOffset);
        istNow.setDate(istNow.getDate() + 1); // Tomorrow
        dateToUse = istNow.toISOString().split('T')[0];
    }

    const { data, error } = await supabase
        .from('publish_queue')
        .insert({
            article_id: articleId,
            scheduled_date: dateToUse,
            scheduled_time: timeToUse,
            status: 'scheduled'
        })
        .select('id')
        .single();

    if (error) {
        console.error('Error moving to publish:', error);
        return { success: false, error: error.message };
    }

    // Update article status AND category
    const updateData: any = { status: 'scheduled' };
    if (category) {
        updateData.category = category;
    }

    await supabase.from('articles').update(updateData).eq('id', articleId);

    // Log activity
    await import('./logger').then(l => l.logActivity('UPDATE', 'Article', `Scheduled article for publishing: ${articleId}`));

    return { success: true, queueId: data.id };
}

// Unpublish article - removes from public blog but keeps in admin
export async function unpublishArticle(articleId: string): Promise<{ success: boolean; error?: string; deploymentTriggered?: boolean; deploymentError?: string | null }> {
    try {
        const response = await fetch('/api/articles/unpublish', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ articleId })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Failed to unpublish');
        }

        // Log activity
        await import('./logger').then(l => l.logActivity('UPDATE', 'Article', `Unpublished article ID: ${articleId}`));

        return {
            success: true,
            deploymentTriggered: result.deploymentTriggered,
            deploymentError: result.deploymentError
        };
    } catch (err: any) {
        console.error('Error unpublishing article:', err);
        return { success: false, error: err.message };
    }
}

// Delete article completely - removes from admin, queue, and public blog
export async function deleteArticle(articleId: string): Promise<{ success: boolean; error?: string }> {
    try {
        const response = await fetch('/api/articles/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ articleId })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Failed to delete');
        }

        // Log activity
        await import('./logger').then(l => l.logActivity('DELETE', 'Article', `Deleted article ID: ${articleId}`));

        return { success: true };
    } catch (err: any) {
        console.error('Error deleting article:', err);
        return { success: false, error: err.message };
    }
}

// Update article content/title
export async function updateArticle(articleId: string, title: string, content: string): Promise<{ success: boolean; error?: string }> {
    try {
        const { error } = await supabase
            .from('articles')
            .update({
                title,
                content,
                // If it was published/ready, maybe we should keep status? 
                // For now, let's assume editing doesn't unpublish unless specified.
            })
            .eq('id', articleId);

        if (error) throw error;

        // Log activity
        await import('./logger').then(l => l.logActivity('UPDATE', 'Article', `Updated article: ${title}`));

        return { success: true };
    } catch (err: any) {
        console.error('Error updating article:', err);
        return { success: false, error: err.message };
    }
}
// Check if a bucket exists
export async function checkBucketExists(bucketName: string): Promise<boolean> {
    const { data, error } = await supabase.storage.getBucket(bucketName);
    return !error && !!data;
}

// Upload image to Supabase Storage
export async function uploadImage(file: File): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
        const bucketName = 'blog-images'; // Using the bucket user created

        // Generate unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `uploads/${fileName}`;

        // Upload
        const { error: uploadError } = await supabase.storage
            .from(bucketName)
            .upload(filePath, file);

        if (uploadError) {
            console.error('Upload error:', uploadError);
            return { success: false, error: uploadError.message };
        }

        // Get Public URL
        const { data } = supabase.storage
            .from(bucketName)
            .getPublicUrl(filePath);

        return { success: true, url: data.publicUrl };

    } catch (err: any) {
        console.error('Unexpected upload error:', err);
        return { success: false, error: err.message };
    }
}
