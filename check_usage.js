const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '../Scraper app/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUsage() {
    console.log('📊 Calculating Database Usage...');

    try {
        let count = 0;
        let totalSize = 0;
        let page = 0;
        const pageSize = 1000;

        while (true) {
            const { data, error } = await supabase
                .from('research_documents')
                .select('content')
                .range(page * pageSize, (page + 1) * pageSize - 1);

            if (error) throw error;
            if (!data || data.length === 0) break;

            count += data.length;
            data.forEach(row => {
                if (row.content) totalSize += Buffer.byteLength(row.content, 'utf8');
            });

            console.log(`  Fetched ${count} records...`);
            if (data.length < pageSize) break;
            page++;
        }

        const sizeMB = (totalSize / (1024 * 1024)).toFixed(2);
        const sizeKB = (totalSize / 1024).toFixed(2);

        const report = `
✅ Usage Report:
------------------
Total Documents: ${count}
Total Text Content Size: ${sizeMB} MB (${sizeKB} KB)
Estimated Vector Size: ~${(count * 2).toFixed(2)} KB (approx)
------------------
Note: This is an application-level estimate.
Check Supabase Dashboard > Settings > Billing for exact DB size (wal + indexes).
`;
        console.log(report);
        fs.writeFileSync('usage_report.txt', report);

    } catch (err) {
        console.error('Error:', err.message);
    }
}

checkUsage();
