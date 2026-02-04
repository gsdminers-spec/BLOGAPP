
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

        // 5. Trigger GitHub Actions Website Rebuild (to remove article from static site)
        const githubToken = process.env.GITHUB_PAT;
        const repoOwner = process.env.GITHUB_REPO_OWNER || 'gsdminers-spec';
        const repoName = process.env.GITHUB_REPO_NAME || 'asicrepair.in';
        const workflowFile = 'deploy.yml';

        if (githubToken) {
            try {
                // Fire and forget, but log errors
                fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/actions/workflows/${workflowFile}/dispatches`, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/vnd.github.v3+json',
                        'Authorization': `Bearer ${githubToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        ref: 'main',
                    }),
                }).then(async (res) => {
                    if (res.ok) {
                        console.log(`🚀 Rebuild triggered after deletion: ${article.title}`);
                    } else {
                        const txt = await res.text();
                        console.error(`⚠️ Failed to trigger rebuild after delete: ${res.status} ${txt}`);
                    }
                }).catch(err => console.error('Deployment trigger error on delete:', err));

            } catch (deployError) {
                console.error('⚠️ Deployment trigger exception on delete:', deployError);
            }
        }

        return NextResponse.json({ success: true, message: `Deleted: ${article.title}` });

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Delete error:', errorMessage);
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
