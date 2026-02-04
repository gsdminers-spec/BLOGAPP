require('dotenv').config({ path: '.env.local' });
// We need to bundle/transpile to run TS in Node, but for this simple test we can try to mock or just run if we had ts-node.
// Since we don't have ts-node easily, we will create a JS version of the test that attempts to use the SAME logic as researcher.ts
// effectively duplicating it for a standalone test to verify the KEY and MODEL.

const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testResearcher() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) { console.log('NO_API_KEY'); return; }

    console.log("🧪 Testing Research Agent (Gemini 2.5 Flash)...");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const dummyContext = `
    [1] Reddit: Antminer S19 Pro 0 ASIC Error
    User1: Check the LDO regulators, typically 1.8V and 0.8V.
    User2: Also check the PIC firmware version.
    
    [2] Bitcointalk: S19 Repair Guide
    ProTip: The C52 capacitor is a common failure point causing 0 ASIC.
    `;

    const prompt = `
    QUERY: Antminer S19 0 ASIC Error
    CONTEXT: ${dummyContext}
    TASK: Create a Master Fact Sheet.
    `;

    try {
        const result = await model.generateContent(prompt);
        console.log("✅ Research Agent Validated!");
        console.log("--- OUTPUT ---");
        console.log(result.response.text());
    } catch (error) {
        console.error("❌ Research Agent Failed:", error.message);
    }
}

testResearcher();
