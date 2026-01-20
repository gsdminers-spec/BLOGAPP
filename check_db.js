
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function check() {
    console.log('Checking blog_articles...');
    const { data, error } = await supabase
        .from('blog_articles')
        .select('slug, title, is_published');

    if (error) console.error(error);
    else console.table(data);
}

check();
