
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

// Load environment variables from the parent directory's .env.local or .env
dotenv.config({ path: path.resolve(__dirname, '../../asicrepair.in/.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../../asicrepair.in/.env') });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
    console.error('❌ Missing Supabase URL or Key in environment variables.');
    process.exit(1);
}

const supabase = createClient(url, key);

const ARTICLES_LIST = [
    "ASIC Repair vs Replacement: How to Decide",
    "When ASIC Hashboard Repair Is Worth It",
    "When Replacing an ASIC Miner Makes More Sense",
    "Cost Impact of Ignoring Early ASIC Failure Signs",
    "How to Reduce Downtime With Timely ASIC Repair"
];

const PHASE_SEARCH_TERM = '%Phase 3%';
const CATEGORY_NAME = 'General';

async function main() {
    console.log('🚀 Starting Seed Script for Phase 3 General Articles...');

    // 1. Find Phase 3
    const { data: phases, error: phaseError } = await supabase
        .from('phases')
        .select('*')
        .ilike('name', PHASE_SEARCH_TERM)
        .maybeSingle();

    if (phaseError || !phases) {
        console.error(`❌ Could not find Phase matching "${PHASE_SEARCH_TERM}". Error:`, phaseError?.message);
        const { data: allPhases } = await supabase.from('phases').select('id, name');
        console.log('Available Phases:', allPhases);
        return;
    }

    console.log(`✅ Found Phase: "${phases.name}" (${phases.id})`);

    // 2. Find or Create Category "General"
    let { data: category, error: catError } = await supabase
        .from('categories')
        .select('*')
        .eq('phase_id', phases.id)
        .ilike('name', `${CATEGORY_NAME}%`) // Handle potential trailing spaces
        .maybeSingle();

    if (!category) {
        console.log(`⚠️ Category "${CATEGORY_NAME}" not found. Creating it...`);
        const { data: newCat, error: createCatErr } = await supabase
            .from('categories')
            .insert({ phase_id: phases.id, name: CATEGORY_NAME })
            .select()
            .single();

        if (createCatErr || !newCat) {
            console.error('❌ Failed to create category:', createCatErr?.message);
            return;
        }
        category = newCat;
        console.log(`✅ Created Category: "${category.name}" (${category.id})`);
    } else {
        console.log(`✅ Found Category: "${category.name}" (${category.id})`);
    }

    // 3. Find Subcategory (Container)
    const { data: subcategories } = await supabase
        .from('subcategories')
        .select('*')
        .eq('category_id', category.id);

    let targetSubcategoryId = null;

    if (subcategories && subcategories.length > 0) {
        // Use the first available subcategory
        targetSubcategoryId = subcategories[0].id;
        console.log(`✅ Found existing Subcategory container: "${subcategories[0].name}" (${targetSubcategoryId})`);
    } else {
        console.log('⚠️ No subcategory found. Creating technical container "General" to hold topics...');
        const { data: newSub, error: createErr } = await supabase
            .from('subcategories')
            .insert({ category_id: category.id, name: 'General' })
            .select()
            .single();

        if (createErr || !newSub) {
            console.error('❌ Failed to create subcategory container:', createErr?.message);
            return;
        }
        targetSubcategoryId = newSub.id;
        console.log(`✅ Created container Subcategory: "${newSub.name}" (${targetSubcategoryId})`);
    }

    // 4. Insert Topics
    console.log(`\n📥 Inserting ${ARTICLES_LIST.length} topics...`);
    let addedCount = 0;
    let skippedCount = 0;

    for (const title of ARTICLES_LIST) {
        // Check duplicates
        const { data: existing } = await supabase
            .from('topics')
            .select('id')
            .eq('subcategory_id', targetSubcategoryId)
            .ilike('title', title)
            .maybeSingle();

        if (existing) {
            console.log(`  • Skipped (Exists): ${title}`);
            skippedCount++;
            continue;
        }

        const { error: insertErr } = await supabase
            .from('topics')
            .insert({
                subcategory_id: targetSubcategoryId,
                title: title,
                status: 'pending'
            });

        if (insertErr) {
            console.error(`  ❌ Failed to add "${title}":`, insertErr.message);
        } else {
            console.log(`  ✅ Added: ${title}`);
            addedCount++;
        }
    }

    console.log(`\n🎉 Done! Added: ${addedCount}, Skipped: ${skippedCount}`);
}

main().catch(console.error);
