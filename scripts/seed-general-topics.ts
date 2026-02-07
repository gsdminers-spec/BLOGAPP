
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables from the parent directory's .env.local or .env
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' }); // Fallback

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
    console.error('❌ Missing Supabase URL or Key in environment variables.');
    process.exit(1);
}

const supabase = createClient(url, key);

const ARTICLES_LIST = [
    "When Hashboard Not Detected Needs Professional Repair",
    "How ASIC Repair Diagnostics Are Done at Chip Level",
    "Why Rebooting Does Not Fix Hardware ASIC Issues",
    "Common Misdiagnoses in ASIC Miner Failures",
    "Difference Between Software Errors and Hardware Damage in ASIC Miners",
    "How Overheating Damages ASIC Hashboards",
    "How Voltage Fluctuation Affects ASIC Hashboards",
    "Why ASIC Hashboards Fail After Power Outages",
    "How PSU Issues Lead to Hashboard Failure",
    "Early Signs of Hashboard Failure Miners Often Ignore",
    "How ASIC Control Boards Detect Hashboards",
    "Why a Hashboard Can Be Intermittently Detected",
    "What Causes Hashboard Communication Failure",
    "Why One Hashboard Fails While Others Work",
    "What Happens During Professional ASIC Hashboard Repair",
    "Repairable vs Non-Repairable ASIC Hashboard Damage",
    "Why Delayed ASIC Repair Increases Cost",
    "How Repeated Restarts Can Worsen Hardware Damage"
];

async function main() {
    console.log('🚀 Starting Seed Script for General Articles...');

    // 1. Find Phase 1
    const { data: phases, error: phaseError } = await supabase
        .from('phases')
        .select('*')
        .ilike('name', '%Phase 1%')
        .maybeSingle();

    if (phaseError || !phases) {
        console.error('❌ Could not find "Phase 1". Error:', phaseError?.message);
        // Fallback: Try to find ANY phase if strict "Phase 1" fails, or just list them to help debug.
        const { data: allPhases } = await supabase.from('phases').select('id, name');
        console.log('Available Phases:', allPhases);
        return;
    }

    console.log(`✅ Found Phase: "${phases.name}" (${phases.id})`);

    // 2. Find Category "General"
    const { data: category, error: catError } = await supabase
        .from('categories')
        .select('*')
        .eq('phase_id', phases.id)
        .ilike('name', 'General')
        .maybeSingle();

    if (catError || !category) {
        console.error('❌ Could not find "General" category in Phase 1.');
        console.log('Please ensure you created the category named "General".');
        return;
    }

    console.log(`✅ Found Category: "${category.name}" (${category.id})`);

    // 3. Find Subcategory (Container)
    // The user said "Just paste in the category", but the DB requires a subcategory.
    // We look for ANY existing subcategory to use as the container.
    const { data: subcategories, error: subError } = await supabase
        .from('subcategories')
        .select('*')
        .eq('category_id', category.id);

    let targetSubcategoryId = null;

    if (subcategories && subcategories.length > 0) {
        // Use the first available subcategory
        targetSubcategoryId = subcategories[0].id;
        console.log(`✅ Found existing Subcategory container: "${subcategories[0].name}" (${targetSubcategoryId})`);
    } else {
        // If NO subcategory exists, we MUST create one technically to hold the topics.
        // We'll name it "General" to match the category, which is often flattened by the UI logic.
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
