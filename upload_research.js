const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '../Scraper app/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const BASE_DIR = 'E:\\scraper2.0\\ALL_DATA';

// Valid extensions to upload
const EXTENSIONS = ['.md', '.json', '.txt'];

async function processDirectory(dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true });

    for (const file of files) {
        const fullPath = path.join(dir, file.name);
        const relativePath = path.relative(BASE_DIR, fullPath);

        if (file.isDirectory()) {
            await processDirectory(fullPath);
        } else if (EXTENSIONS.includes(path.extname(file.name))) {
            await uploadFile(fullPath, relativePath);
        }
    }
}

async function uploadFile(filePath, relativePath) {
    console.log(`Processing: ${relativePath}...`);

    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const category = relativePath.split(path.sep)[0]; // First folder is category
        const title = path.basename(filePath, path.extname(filePath));

        // Check if exists
        const { data: existing } = await supabase
            .from('research_documents')
            .select('id')
            .eq('file_path', relativePath)
            .single();

        if (existing) {
            console.log(`  Updating existing record...`);
            const { error } = await supabase
                .from('research_documents')
                .update({
                    content,
                    updated_at: new Date()
                })
                .eq('id', existing.id);

            if (error) console.error('  ❌ Error updating:', error.message);
            else console.log('  ✅ Updated');

        } else {
            console.log(`  Creating new record...`);
            const { error } = await supabase
                .from('research_documents')
                .insert({
                    title,
                    content,
                    file_path: relativePath,
                    category,
                    tags: [category]
                });

            if (error) console.error('  ❌ Error inserting:', error.message);
            else console.log('  ✅ Inserted');
        }

    } catch (err) {
        console.error(`  ❌ Failed to read/upload ${relativePath}:`, err.message);
    }
}

async function main() {
    console.log('🚀 Starting Research Data Sync...');
    console.log(`📂 Source: ${BASE_DIR}`);
    console.log(`📡 Target: ${supabaseUrl}`);

    // Make sure table exists (rough check, usually should run SQL first)
    // We assume the user has run the SQL or we can try to create it via RPC if we had a function, 
    // but for now we rely on the table being there.

    if (fs.existsSync(BASE_DIR)) {
        await processDirectory(BASE_DIR);
        console.log('✅ Sync Completed!');
    } else {
        console.error(`❌ Directory not found: ${BASE_DIR}`);
    }
}

main();
