
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: NextRequest) {
    try {
        const { articleId } = await request.json();

        if (!articleId) {
            return NextResponse.json({ error: 'Article ID is required' }, { status: 400 });
        }

        // 1. Get the article to find its slug
        const { data: article, error: fetchError } = await supabaseAdmin
            .from('articles')
            .select('title')
            .eq('id', articleId)
            .single();

        if (fetchError || !article) {
            return NextResponse.json({ error: 'Article not found' }, { status: 404 });
        }

        // Generate slug
        const slug = article.title
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-');

        // 2. Delete from blog_articles (public blog) - BYPASSES RLS
        const { error: deleteError } = await supabaseAdmin
            .from('blog_articles')
            .delete()
            .eq('slug', slug);

        if (deleteError) {
            console.error('Error removing from blog_articles:', deleteError);
            return NextResponse.json({ error: deleteError.message }, { status: 500 });
        }

        // 3. Update article status back to 'ready'
        await supabaseAdmin
            .from('articles')
            .update({ status: 'ready', publish_date: null })
            .eq('id', articleId);

        // 4. Remove from publish_queue if exists
        await supabaseAdmin
            .from('publish_queue')
            .delete()
            .eq('article_id', articleId);

        return NextResponse.json({ success: true, message: `Unpublished: ${article.title}` });

    } catch (error: any) {
        console.error('Unpublish error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
