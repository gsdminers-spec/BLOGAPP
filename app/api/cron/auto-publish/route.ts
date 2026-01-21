import { createClient } from '@supabase/supabase-js';
import { marked } from 'marked';
import { NextRequest, NextResponse } from 'next/server';

// Type for the joined query result
interface QueueItemWithArticle {
    id: string;
    article_id: string;
    scheduled_date: string;
    scheduled_time: string;
    status: string;
    articles: {
        id: string;
        title: string;
        content: string;
        category: string;
    } | null;
}

/**
 * Auto-publish cron endpoint
 * Checks publish_queue for scheduled articles and publishes them if the time has passed
 * 
 * Call this endpoint periodically (e.g., every minute via Vercel Cron or external service)
 * 
 * GET /api/cron/auto-publish
 * Optional: Add ?secret=YOUR_SECRET for security
 */
export async function GET(request: NextRequest) {
    // --- INIT ADMIN CLIENT ---
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        console.error('[Auto-Publish] Missing Supabase Service Key');
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    try {
        // Optional: Verify cron secret for security
        const { searchParams } = new URL(request.url);
        const secret = searchParams.get('secret');

        // Uncomment this to enable secret verification
        // if (secret !== process.env.CRON_SECRET) {
        //     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        // }

        // Get current time in IST (GMT+5:30)
        const now = new Date();
        const istOffset = 5.5 * 60 * 60 * 1000;
        const istNow = new Date(now.getTime() + istOffset);

        const currentDate = istNow.toISOString().split('T')[0];
        const currentTime = istNow.toISOString().split('T')[1].slice(0, 8);

        console.log(`[Auto-Publish] Checking at ${currentDate} ${currentTime} IST`);

        // Fetch scheduled articles that are due
        const { data: dueItems, error: fetchError } = await supabase
            .from('publish_queue')
            .select(`
                id,
                article_id,
                scheduled_date,
                scheduled_time,
                status,
                articles (
                    id,
                    title,
                    content,
                    category
                )
            `)
            .eq('status', 'scheduled')
            .lte('scheduled_date', currentDate);

        if (fetchError) {
            console.error('[Auto-Publish] Error fetching queue:', fetchError);
            return NextResponse.json({ error: fetchError.message }, { status: 500 });
        }

        if (!dueItems || dueItems.length === 0) {
            return NextResponse.json({
                message: 'No articles due for publishing',
                checked_at: `${currentDate} ${currentTime} IST`
            });
        }

        // Cast to typed array
        const typedItems = dueItems as unknown as QueueItemWithArticle[];

        // Filter items where scheduled time has passed
        const readyToPublish = typedItems.filter(item => {
            if (item.scheduled_date < currentDate) return true;
            if (item.scheduled_date === currentDate && item.scheduled_time <= currentTime) return true;
            return false;
        });

        if (readyToPublish.length === 0) {
            return NextResponse.json({
                message: 'No articles ready yet',
                pending: dueItems.length,
                checked_at: `${currentDate} ${currentTime} IST`
            });
        }

        const published: { id: string; title: string; slug: string; scheduled: string }[] = [];
        const errors: { id: string; title?: string; error: string }[] = [];

        for (const item of readyToPublish) {
            try {
                const article = item.articles;
                if (!article) {
                    errors.push({ id: item.id, error: 'Article not found' });
                    continue;
                }

                // Generate slug
                const slug = article.title
                    .toLowerCase()
                    .replace(/[^\w\s-]/g, '')
                    .replace(/\s+/g, '-');

                // Convert markdown to HTML
                const contentHtml = marked.parse(article.content || '');

                // Upsert to blog_articles (public blog table)
                const { error: upsertError } = await supabase
                    .from('blog_articles')
                    .upsert({
                        title: article.title,
                        slug: slug,
                        content: article.content,
                        content_html: contentHtml,
                        category: article.category || 'Uncategorized',
                        is_published: true,
                        published_date: new Date().toISOString(),
                        updated_date: new Date().toISOString()
                    }, { onConflict: 'slug' });

                if (upsertError) {
                    errors.push({ id: item.id, title: article.title, error: upsertError.message });
                    continue;
                }

                // Update publish_queue status
                await supabase
                    .from('publish_queue')
                    .update({ status: 'published' })
                    .eq('id', item.id);

                // Update article status in admin
                await supabase
                    .from('articles')
                    .update({
                        status: 'published',
                        publish_date: new Date().toISOString()
                    })
                    .eq('id', article.id);

                published.push({
                    id: item.id,
                    title: article.title,
                    slug: slug,
                    scheduled: `${item.scheduled_date} ${item.scheduled_time}`
                });

                console.log(`[Auto-Publish] ✅ Published: ${article.title}`);

            } catch (err: unknown) {
                const errorMessage = err instanceof Error ? err.message : 'Unknown error';
                errors.push({ id: item.id, error: errorMessage });
            }
        }

        return NextResponse.json({
            success: true,
            published: published.length,
            errors: errors.length,
            details: {
                published,
                errors
            },
            checked_at: `${currentDate} ${currentTime} IST`
        });

    } catch (error: unknown) {
        console.error('[Auto-Publish] Fatal error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
