import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { marked } from 'marked';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { queueId, articleId } = body;

        if (!queueId || !articleId) {
            return NextResponse.json({ error: 'Missing queueId or articleId' }, { status: 400 });
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseServiceKey) {
            console.error('Supabase credentials missing on server');
            return NextResponse.json({ error: 'Server configuration error: Missing Supabase Credentials' }, { status: 500 });
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // 1. Update publish_queue status
        // We do this with Service Role to ensure it works even if RLS is strict
        const { error: queueError } = await supabase
            .from('publish_queue')
            .update({ status: 'published' })
            .eq('id', queueId);

        if (queueError) {
            throw new Error('Queue update failed: ' + queueError.message);
        }

        // 2. Update article status
        const { data: articleData, error: articleError } = await supabase
            .from('articles')
            .update({
                status: 'published',
                publish_date: new Date().toISOString()
            })
            .eq('id', articleId)
            .select('*')
            .single();

        if (articleError || !articleData) {
            throw new Error('Article update failed: ' + (articleError?.message || 'Article not found'));
        }

        // 3. Sync to Public Blog (Bypassing RLS)
        const slug = articleData.title
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-');

        // marked.parse can be synchronous or return a Promise depending on options/extensions.
        // Awaiting it is safe.
        const contentHtml = await marked.parse(articleData.content || '');

        // Note: We store clean HTML - the public website has its own prose styling classes
        const { error: syncError } = await supabase
            .from('blog_articles')
            .upsert({
                title: articleData.title,
                slug: slug,
                content: articleData.content,
                // content_html: contentHtml, // REMOVED: Optimizing storage, generate HTML on frontend/build
                id: articleData.id, // Ensure we map ID if schema allows, or let it auto-gen/match by slug
                // Note: If blog_articles schema has different ID, remove this line.
                // Assuming upsert on 'slug' handles it.
                category: articleData.category || 'Uncategorized',
                is_published: true,
                published_date: new Date().toISOString(),
                updated_date: new Date().toISOString()
            }, { onConflict: 'slug' });

        if (syncError) {
            console.error('Sync error:', syncError);
            throw new Error('Sync to public blog failed: ' + syncError.message);
        }

        // 4. Trigger GitHub Actions Website Rebuild (Automated Deployment)
        const githubToken = process.env.GITHUB_PAT;
        const repoOwner = process.env.GITHUB_REPO_OWNER || 'gsdminers-spec';
        const repoName = process.env.GITHUB_REPO_NAME || 'asicrepair.test1';
        const workflowFile = 'deploy.yml';

        if (githubToken) {
            try {
                // We don't await this to keep the UI snappy - fire and forget (or await if you want confirmation)
                // Better to await to catch errors, but keep it inside this try/catch block so DB success isn't blocked.
                const deployResponse = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/actions/workflows/${workflowFile}/dispatches`, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/vnd.github.v3+json',
                        'Authorization': `Bearer ${githubToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        ref: 'main', // The branch to deploy
                    }),
                });

                if (deployResponse.ok) {
                    console.log(`🚀 Deployment triggered successfully for ${repoOwner}/${repoName}`);
                } else {
                    const errorText = await deployResponse.text();
                    console.error(`⚠️ Failed to trigger deployment: ${deployResponse.status} ${errorText}`);
                }
            } catch (deployError) {
                console.error('⚠️ Deployment trigger exception:', deployError);
            }
        } else {
            console.log('ℹ️ GITHUB_PAT not found. Skipping automated deployment trigger.');
        }

        return NextResponse.json({ success: true, slug });

    } catch (error: any) {
        console.error('Publish API Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
