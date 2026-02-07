
console.log("Script starting...");
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
    console.error('❌ Missing Supabase URL or Key');
    process.exit(1);
}

const supabase = createClient(url, key);

const PHASE_NAME = 'Phase 2';
const CATEGORY_NAME = 'General';
const SUBCATEGORY_NAME = 'General';

const TOPICS = [
    "ASIC Overheating Problems in Indian Summers",
    "How Dust Build-Up Causes ASIC Hardware Failure",
    "Moisture and Humidity Damage in ASIC Mining Environments",
    "Voltage Fluctuation Damage in Indian Mining Setup",
    "Why Monsoon Season Increases ASIC Failure Rates"
];

async function main() {
    console.log(`🚀 Starting Seed Script for ${PHASE_NAME} - ${CATEGORY_NAME} Articles...`);

    // 1. Find Phase
    const { data: phases, error: phaseError } = await supabase
        .from('phases')
        .select('*')
        .ilike('name', `%${PHASE_NAME}%`)
        .maybeSingle();

    if (phaseError || !phases) {
        console.error(`❌ Could not find "${PHASE_NAME}". Error: ${phaseError?.message}`);
        // List phases to help debugging
        const { data: allPhases } = await supabase.from('phases').select('id, name');
        console.log('Available Phases:', allPhases);
        return;
    }
    console.log(`✅ Found Phase: "${phases.name}" (${phases.id})`);

    // 2. Find or Create Category
    let categoryId: string | null = null;

    const { data: category } = await supabase
        .from('categories')
        .select('*')
        .eq('phase_id', phases.id)
        .ilike('name', CATEGORY_NAME)
        .maybeSingle();

    if (category) {
        console.log(`✅ Found Category: "${category.name}" (${category.id})`);
        categoryId = category.id;
    } else {
        console.log(`⚠️ Category "${CATEGORY_NAME}" not found in ${PHASE_NAME}. Creating...`);
        const { data: newCat, error: createCatErr } = await supabase
            .from('categories')
            .insert({ phase_id: phases.id, name: CATEGORY_NAME })
            .select()
            .single();

        if (createCatErr || !newCat) {
            console.error(`❌ Failed to create Category "${CATEGORY_NAME}":`, createCatErr?.message);
            return;
        }
        console.log(`✅ Created Category: "${newCat.name}" (${newCat.id})`);
        categoryId = newCat.id;
    }

    // 3. Find or Create Subcategory
    let subcategoryId: string | null = null;

    // We look for a subcategory named "General" specifically to hold these topics
    const { data: subcategories } = await supabase
        .from('subcategories')
        .select('*')
        .eq('category_id', categoryId)
        .ilike('name', SUBCATEGORY_NAME)
        .maybeSingle();

    if (subcategories) {
        subcategoryId = subcategories.id;
        console.log(`✅ Found Subcategory: "${subcategories.name}" (${subcategoryId})`);
    } else {
        console.log(`⚠️ No "${SUBCATEGORY_NAME}" subcategory found. Creating...`);
        const { data: newSub, error: createSubErr } = await supabase
            .from('subcategories')
            .insert({ category_id: categoryId, name: SUBCATEGORY_NAME })
            .select()
            .single();

        if (createSubErr || !newSub) {
            console.error(`❌ Failed to create Subcategory:`, createSubErr?.message);
            return;
        }
        subcategoryId = newSub.id;
        console.log(`✅ Created Subcategory: "${newSub.name}" (${subcategoryId})`);
    }

    // 4. Insert Topics
    console.log(`\n📥 Inserting ${TOPICS.length} topics...`);
    let added = 0;
    let skipped = 0;

    for (const title of TOPICS) {
        const { data: existing } = await supabase
            .from('topics')
            .select('id')
            .eq('subcategory_id', subcategoryId)
            .ilike('title', title)
            .maybeSingle();

        if (existing) {
            console.log(`  • Skipped (Exists): ${title}`);
            skipped++;
            continue;
        }

        const { error: insertErr } = await supabase
            .from('topics')
            .insert({
                subcategory_id: subcategoryId,
                title: title,
                status: 'pending'
            });

        if (insertErr) {
            console.error(`  ❌ Failed to add "${title}":`, insertErr.message);
        } else {
            console.log(`  ✅ Added: ${title}`);
            added++;
        }
    }
    console.log(`\n🎉 Done! Added: ${added}, Skipped: ${skipped}`);
}

main().catch(console.error);
