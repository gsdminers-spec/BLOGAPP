import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
dotenv.config({ path: '.env.local' });

async function findWorkingModel() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("FATAL: No GEMINI_API_KEY found.");
        return;
    }

    console.log("🔍 Starting Autonomous Model Search...");

    const candidates = [
        "gemini-1.5-flash",
        "gemini-1.5-flash-001",
        "gemini-1.5-flash-002",
        "gemini-1.5-flash-latest",
        "models/gemini-1.5-flash",
        "gemini-1.5-pro",
        "gemini-1.5-pro-001",
        "gemini-1.5-pro-002",
        "gemini-1.0-pro",
        "gemini-pro",
        "gemini-2.0-flash-exp" // Retesting just in case
    ];

    const genAI = new GoogleGenerativeAI(apiKey);

    for (const modelId of candidates) {
        process.stdout.write(`Testing ID: '${modelId}' ... `);
        try {
            const model = genAI.getGenerativeModel({ model: modelId });
            // Simple prompt, minimal tokens
            const result = await model.generateContent("Ping.");
            const response = await result.response;
            const text = response.text();

            if (text) {
                console.log(`\n✅ SUCCESS! Found working model: [ ${modelId} ]`);
                console.log(`   Output: "${text.trim()}"`);
                console.log(`   ACTION: Proceeding to use '${modelId}' for the application.`);
                return; // Exit on first success
            }
        } catch (e: any) {
            let msg = e.message || "Unknown Error";
            if (msg.includes("404")) msg = "404 Not Found";
            if (msg.includes("429")) msg = "429 Rate Limit";
            if (msg.includes("400")) msg = "400 Bad Request";
            console.log(`❌ (${msg})`);
        }
    }
    console.log("\n❌ CRITICAL: No working models found in candidate list.");
}

findWorkingModel();
