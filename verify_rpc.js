const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkRpc() {
    console.log("Checking RPC function 'match_documents'...");

    // Create a dummy 768-dim vector
    const dummyVector = Array(768).fill(0.1);

    const { data, error } = await supabase.rpc('match_documents', {
        query_embedding: dummyVector,
        match_threshold: 0.1,
        match_count: 1
    });

    if (error) {
        console.error("❌ RPC Check Failed:", error.message);
        console.log("👉 Suggestion: You might need to run the SQL in 'research_schema.sql' in your Supabase SQL Editor.");
    } else {
        console.log("✅ RPC Function exists! Data returned:", data ? data.length : 0);
    }
}

checkRpc();
