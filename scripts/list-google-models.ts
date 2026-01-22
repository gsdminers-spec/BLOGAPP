import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
dotenv.config({ path: '.env.local' });

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("No GEMINI_API_KEY found.");
        return;
    }

    console.log("Listing Available Google Models...");

    // We can't list models directly easily with the high-level SDK 'getGenerativeModel'
    // But we can try to hit the REST endpoint or just test a few known variations.

    const candidates = [
        "gemini-1.5-flash",
        "gemini-1.5-flash-latest",
        "gemini-1.5-flash-001",
        "gemini-1.5-flash-002",
        "models/gemini-1.5-flash"
    ];

    const genAI = new GoogleGenerativeAI(apiKey);

    for (const modelId of candidates) {
        process.stdout.write(`Testing ${modelId}... `);
        try {
            const model = genAI.getGenerativeModel({ model: modelId });
            const result = await model.generateContent("Test.");
            console.log(`✅ SUCCESS! (Output: ${result.response.text().substring(0, 10)}...)`);
            return; // Found one!
        } catch (e: any) {
            console.log(`❌ Failed (${e.message.substring(0, 50)}...)`);
        }
    }
}

listModels();
