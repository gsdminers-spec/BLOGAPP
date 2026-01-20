
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: NextRequest) {
    try {
        const { articleId } = await request.json();

        if (!articleId) {
            return NextResponse.json({ error: 'Article ID is required' }, { status: 400 });
        }

        // 1. Get the article
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

        // 2. Delete from blog_articles (public blog) if published
        await supabaseAdmin
            .from('blog_articles')
            .delete()
            .eq('slug', slug);

        // 3. Delete from publish_queue
        await supabaseAdmin
            .from('publish_queue')
            .delete()
            .eq('article_id', articleId);

        // 4. Delete the article itself
        const { error: deleteError } = await supabaseAdmin
            .from('articles')
            .delete()
            .eq('id', articleId);

        if (deleteError) {
            return NextResponse.json({ error: deleteError.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: `Deleted: ${article.title}` });

    } catch (error: any) {
        console.error('Delete error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
