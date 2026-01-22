import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { mimoResearch } from '../lib/ai/researcher';
import { runCommittee } from '../lib/ai/committee';
import { searchTavily } from '../lib/researchProviders';

async function verifyLogic() {
    console.log("🚦 STARTING LOGIC VERIFICATION");
    const topic = "Latest ASIC Miner Cooling Solutions 2026";

    // 1. RESEARCH
    console.log(`\n🔍 PHASE 1: TESTING RESEARCHER (Topic: ${topic})`);
    try {
        const rawSearch = await searchTavily(topic, process.env.TAVILY_API_KEY!);
        console.log(`✅ Tavily: Found ${rawSearch.results.length} results.`);

        const mimo = await mimoResearch(topic, JSON.stringify(rawSearch.results));
        if (!mimo.content) throw new Error("Mimo Summary Empty");
        console.log("✅ Mimo V2: Content Generated.");
        console.log("✅ Mimo V2: Reasoning Details Present? ", !!mimo.reasoning);

        // 2. COMMITTEE
        console.log(`\n✍️ PHASE 2: TESTING WRITER COMMITTEE`);
        const result = await runCommittee(topic, mimo.content);

        console.log("✅ Seo Architect: ", !!result.seoOutline);
        console.log("✅ Fact Verifier: ", !!result.verificationNotes);
        console.log("✅ Final Writer: ", !!result.finalArticle);

        if (result.finalArticle) {
            console.log("\n🎉 SUCCESS: Full chain executed correctly.");
            console.log("Sample Output:\n" + result.finalArticle.substring(0, 100) + "...");
        } else {
            console.error("❌ FAILURE: No final article generated.");
        }

    } catch (e: any) {
        console.error("❌ TEST FAILED:", e.message);
        process.exit(1);
    }
}

// Simple runner
verifyLogic();
