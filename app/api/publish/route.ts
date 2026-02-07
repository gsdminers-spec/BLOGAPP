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

        const contentHtml = await marked.parse(articleData.content || '');

        // --- AUTO-CATEGORIZATION LOGIC ---
        // We need to determine the Public Category based on the Phase.
        // Logic: Article -> Topic -> Subcategory -> Category -> Phase -> Public Name

        // Default fallback
        let publicCategory = 'ASIC Repair Insights';

        // 1. Prefer Existing Manual Category
        if (articleData.category && articleData.category !== 'Uncategorized') {
            publicCategory = articleData.category;
            console.log(`ℹ️ Using Manual Category: ${publicCategory}`);
        }
        // 2. Auto-Detect if no manual category
        else if (articleData.topic_id) {
            try {
                // 1. Get Topic -> Subcategory
                const { data: topic } = await supabase
                    .from('topics')
                    .select('subcategory_id')
                    .eq('id', articleData.topic_id)
                    .single();

                if (topic?.subcategory_id) {
                    // 2. Get Subcategory -> Category
                    const { data: subcat } = await supabase
                        .from('subcategories')
                        .select('category_id')
                        .eq('id', topic.subcategory_id)
                        .single();

                    if (subcat?.category_id) {
                        // 3. Get Category -> Phase
                        const { data: cat } = await supabase
                            .from('categories')
                            .select('phase_id')
                            .eq('id', subcat.category_id)
                            .single();

                        if (cat?.phase_id) {
                            // 4. Get Phase Name
                            const { data: phase } = await supabase
                                .from('phases')
                                .select('name')
                                .eq('id', cat.phase_id)
                                .single();

                            if (phase?.name) {
                                // 5. Map Phase Name to Public Category slug/name
                                // Phase 1: Hashboard Not Detected -> "Hashboard Problems"
                                // Phase 2: Repair Insights... -> "ASIC Repair Insights"
                                // Phase 3: Seasonal... -> "Environmental Damage"
                                // Phase 4: Repair Decisions... -> "Repair Decisions"

                                const pName = phase.name.toLowerCase();
                                if (pName.includes('hashboard') || pName.includes('phase 1')) {
                                    publicCategory = 'Hashboard Problems';
                                } else if (pName.includes('insight') || pName.includes('phase 2')) {
                                    publicCategory = 'ASIC Repair Insights';
                                } else if (pName.includes('seasonal') || pName.includes('environmental') || pName.includes('phase 3')) {
                                    publicCategory = 'Environmental Damage';
                                } else if (pName.includes('decision') || pName.includes('operation') || pName.includes('phase 4')) {
                                    publicCategory = 'Repair Decisions';
                                } else if (pName.includes('internal') || pName.includes('linking')) {
                                    publicCategory = 'Internal Linking';
                                }
                                console.log(`🔍 Auto-Categorized: ${articleData.title} -> Phase: ${phase.name} -> Public: ${publicCategory}`);
                            }
                        }
                    }
                }
            } catch (catError) {
                console.error('Auto-categorization error (using fallback):', catError);
            }
        }

        // --- EXTRACT META DESCRIPTION (FRONTMATTER) ---
        let metaDescription = '';
        let finalContent = articleData.content || '';

        const frontmatterRegex = /^---\s*[\r\n]+([\s\S]*?)[\r\n]+---\s*[\r\n]+/;
        const match = finalContent.match(frontmatterRegex);

        if (match) {
            const frontmatterBlock = match[1];
            // Simple key-value parser for "description: ..."
            const descMatch = frontmatterBlock.match(/description:\s*(["'])(.*?)\1/);
            if (descMatch) {
                metaDescription = descMatch[2];
            } else {
                // Try without quotes
                const descMatchSimple = frontmatterBlock.match(/description:\s*(.*)/);
                if (descMatchSimple) {
                    metaDescription = descMatchSimple[1].trim();
                }
            }

            // Remove Frontmatter from content before saving/rendering
            finalContent = finalContent.replace(frontmatterRegex, '');
            console.log(`📝 Extracted Meta Description: ${metaDescription.substring(0, 50)}...`);
        } else {
            // Fallback: Generate snippet from first paragraph
            const plainText = finalContent.replace(/[#*`]/g, '').replace(/\n+/g, ' ').substring(0, 160).trim();
            metaDescription = plainText + '...';
        }

        // Re-render HTML without Frontmatter
        let cleanContentHtml = await marked.parse(finalContent);

        // --- INJECT MID-ARTICLE CTA ---

        // --- HARDCODED CTA REMOVED --- 
        // User now manually injects CTAs via Link Studio.


        const { error: syncError } = await supabase
            .from('blog_articles')
            .upsert({
                title: articleData.title,
                slug: slug,
                content: finalContent, // Store CLEAN content
                content_html: cleanContentHtml, // Store HTML WITH CTA
                id: articleData.id,
                category: publicCategory, // Use the Auto-Detected Category
                excerpt: metaDescription, // Add excerpt from frontmatter
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
                    console.log(`🚀 Deployment triggered successfully for ${repoOwner}/${repoName}`);
                    deploymentTriggered = true;
                } else {
                    const errorText = await deployResponse.text();
                    console.error(`⚠️ Failed to trigger deployment: ${deployResponse.status} ${errorText}`);
                    deploymentError = `GitHub API returned ${deployResponse.status}: ${errorText}`;
                }
            } catch (deployError) {
                console.error('⚠️ Deployment trigger exception:', deployError);
                deploymentError = deployError instanceof Error ? deployError.message : 'Unknown error';
            }
        } else {
            console.log('ℹ️ GITHUB_PAT not found. Skipping automated deployment trigger.');
            deploymentError = 'GITHUB_PAT environment variable not set';
        }

        return NextResponse.json({
            success: true,
            slug,
            deploymentTriggered,
            deploymentError
        });

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Publish API Error:', errorMessage);
        return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
    }
}
