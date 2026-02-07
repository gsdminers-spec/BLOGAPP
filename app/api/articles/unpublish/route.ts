
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

        // 5. Trigger GitHub Actions Website Rebuild (to remove article from static site)
        const githubToken = process.env.GITHUB_PAT;
        const repoOwner = process.env.GITHUB_REPO_OWNER || 'gsdminers-spec';
        const repoName = process.env.GITHUB_REPO_NAME || 'asicrepair.in';
        const workflowFile = 'deploy.yml';

        let deploymentTriggered = false;
        let deploymentError: string | null = null;

        if (githubToken) {
            try {
                const deployResponse = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/actions/workflows/${workflowFile}/dispatches`, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/vnd.github.v3+json',
                        'Authorization': `Bearer ${githubToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        ref: 'main',
                    }),
                });

                if (deployResponse.ok || deployResponse.status === 204) {
                    console.log(`🚀 Rebuild triggered after unpublishing: ${article.title}`);
                    deploymentTriggered = true;
                } else {
                    const errorText = await deployResponse.text();
                    console.error(`⚠️ Failed to trigger rebuild after unpublish: ${deployResponse.status} ${errorText}`);
                    deploymentError = `GitHub API returned ${deployResponse.status}: ${errorText}`;
                }
            } catch (deployError) {
                console.error('⚠️ Deployment trigger exception on unpublish:', deployError);
                deploymentError = deployError instanceof Error ? deployError.message : 'Unknown error';
            }
        } else {
            console.log('ℹ️ GITHUB_PAT not found. Skipping automated rebuild trigger after unpublish.');
            deploymentError = 'GITHUB_PAT environment variable not set';
        }

        return NextResponse.json({
            success: true,
            message: `Unpublished: ${article.title}`,
            deploymentTriggered,
            deploymentError
        });

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Unpublish error:', errorMessage);
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
