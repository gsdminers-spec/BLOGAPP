const https = require('https');

const SUPABASE_URL = 'hrmluylwiqzowmzbbxdv.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhybWx1eWx3aXF6b3dtemJieGR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4MjAzOTIsImV4cCI6MjA4MTM5NjM5Mn0.2HxEaIKC9GaynuGNlKedrDGccsErsC_ITBkmqlyAbGg';

function supabaseRequest(path, method, body = null) {
    return new Promise((resolve, reject) => {
        const postData = body ? JSON.stringify(body) : null;
        const options = {
            hostname: SUPABASE_URL,
            port: 443,
            path: `/rest/v1/${path}`,
            method: method,
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            }
        };

        if (postData) {
            options.headers['Content-Length'] = Buffer.byteLength(postData);
        }

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        resolve(data);
                    }
                } else {
                    reject(new Error(`HTTP ${res.statusCode}: ${data}`));
                }
            });
        });

        req.on('error', reject);
        if (postData) req.write(postData);
        req.end();
    });
}

// Convert markdown to basic HTML for content_html field
function simpleMarkdownToHtml(md) {
    if (!md) return '';
    let html = md
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
        .replace(/\n\n/g, '</p><p>');
    return `<p>${html}</p>`;
}

// Backdated dates array (spanning Jan 2026 - June 2026 for realistic Google indexing)
const BACKDATES = [
    '2026-01-18T09:30:00.000Z',
    '2026-02-04T11:15:00.000Z',
    '2026-02-22T14:45:00.000Z',
    '2026-03-15T08:20:00.000Z',
    '2026-04-02T16:00:00.000Z',
    '2026-04-20T10:10:00.000Z',
    '2026-05-11T13:30:00.000Z',
    '2026-06-01T11:00:00.000Z'
];

async function syncToBlogArticlesTable() {
    console.log('🚀 Syncing all published articles into `blog_articles` with staggered backdates & content_html...\n');

    const articles = await supabaseRequest('articles?status=eq.published&select=*', 'GET');
    console.log(`📦 Found ${articles.length} published articles in \`articles\` table.`);

    let index = 0;
    for (const art of articles) {
        const backdate = BACKDATES[index % BACKDATES.length];
        index++;

        const slug = art.slug || art.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const excerpt = art.seo_meta_description || art.content.substring(0, 160).replace(/[#*`>]/g, '').trim();
        const contentHtml = simpleMarkdownToHtml(art.content);

        const payload = {
            title: art.title,
            slug: slug,
            content: art.content,
            content_html: contentHtml,
            excerpt: excerpt,
            category: art.category || 'ASIC Repair',
            is_published: true,
            published_date: backdate,
            created_at: backdate,
            updated_date: backdate,
            reading_time: Math.ceil(art.content.split(/\s+/).length / 200),
            author_name: art.author_name || 'ASICREPAIR.in Technical Team',
            author_url: 'https://asicrepair.in'
        };

        try {
            const existing = await supabaseRequest(`blog_articles?slug=eq.${encodeURIComponent(slug)}&select=id`, 'GET');

            if (existing && existing.length > 0) {
                console.log(`🔄 Updating existing blog_articles record for "${art.title}" (Date: ${backdate.split('T')[0]})...`);
                await supabaseRequest(`blog_articles?id=eq.${existing[0].id}`, 'PATCH', payload);
            } else {
                console.log(`✨ Inserting new blog_articles record for "${art.title}" (Date: ${backdate.split('T')[0]})...`);
                await supabaseRequest('blog_articles', 'POST', payload);
            }
            console.log(`✅ Synced: ${slug}`);
        } catch (err) {
            console.error(`❌ Failed to sync "${art.title}":`, err.message);
        }
    }

    console.log('\n🎉 Finished syncing all articles to `blog_articles` table!');
}

syncToBlogArticlesTable();
