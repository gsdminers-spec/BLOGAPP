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

// Slugs of authentic, human-grade, deeply technical articles to keep
const AUTHENTIC_SLUGS = [
    'antminer-s21-hydro-0-asic-chip-error',
    'whatsminer-m50s-error-202-250-repair',
    'antminer-apw12-power-supply-failure-repair',
    'picobt-pt3-test-fixture-guide',
    'thermal-paste-replacement-guide-asic-miners'
];

async function purgeUnauthenticArticles() {
    console.log('🧹 Cleaning out generic templated articles from Supabase...\n');

    // Fetch all articles from blog_articles
    const blogArticles = await supabaseRequest('blog_articles?select=id,title,slug', 'GET');
    let blogPurged = 0;

    for (const art of blogArticles) {
        if (!AUTHENTIC_SLUGS.includes(art.slug)) {
            await supabaseRequest(`blog_articles?id=eq.${art.id}`, 'DELETE');
            console.log(`🗑️ Removed unauthentic blog_article: "${art.title}" (${art.slug})`);
            blogPurged++;
        }
    }

    // Fetch all articles from main articles table
    const articles = await supabaseRequest('articles?select=id,title,slug', 'GET');
    let articlesPurged = 0;

    for (const art of articles) {
        if (!AUTHENTIC_SLUGS.includes(art.slug)) {
            await supabaseRequest(`articles?id=eq.${art.id}`, 'DELETE');
            console.log(`🗑️ Removed unauthentic article: "${art.title}" (${art.slug})`);
            articlesPurged++;
        }
    }

    console.log(`\n🎉 Cleanup Complete! Purged ${blogPurged} from blog_articles and ${articlesPurged} from articles.`);
}

purgeUnauthenticArticles();
