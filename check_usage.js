
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Use SERVICE KEY to ensure we have permission to view system stats if needed
// (Though typically only dashboard users see exact bytes, we can try to count rows as a proxy)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkStorage() {
    console.log('--- Database Row Counts ---');

    const tables = ['articles', 'blog_articles', 'keywords', 'topics', 'publish_queue'];

    for (const table of tables) {
        const { count, error } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true });

        if (error) console.error(`${table}: Error ${error.message}`);
        else console.log(`${table}: ${count} rows`);
    }

    console.log('\n--- Note ---');
    console.log('Actual disk size (MB) is best viewed in the Supabase Dashboard -> Database -> usage.');
    console.log('But with this few rows, you are likely using < 10 MB of your 500 MB free tier.');
}

checkStorage();
