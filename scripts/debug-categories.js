
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../asicrepair.in/.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../../asicrepair.in/.env') });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(url, key);

async function main() {
    console.log('🔍 Inspecting Phase 1 Categories...');

    // 1. Find Phase 1
    const { data: phases } = await supabase
        .from('phases')
        .select('id, name')
        .ilike('name', '%Phase 1%');

    if (!phases || phases.length === 0) {
        console.log('❌ No Phase 1 found.');
        return;
    }

    const phase = phases[0];
    console.log(`✅ Using Phase: "${phase.name}" (${phase.id})`);

    // 2. List Categories
    const { data: categories } = await supabase
        .from('categories')
        .select('id, name')
        .eq('phase_id', phase.id);

    console.log('📋 Categories found in this phase:');
    if (categories && categories.length > 0) {
        categories.forEach(c => console.log(`   - "${c.name}" (ID: ${c.id})`));
    } else {
        console.log('   (No categories found)');
    }
}

main();
