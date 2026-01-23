import dotenv from 'dotenv';
import { Groq } from 'groq-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config({ path: '.env.local' });

async function debugWriter() {
    const geminiKey = process.env.GEMINI_API_KEY;
    const groqKey = process.env.GROQ_API_KEY;
    const openRouterKey = process.env.OPENROUTER_API_KEY;

    console.log("--- DEBUGGING WRITER COMMITTEE ---");

    // 1. Test Groq (Architect)
    try {
        console.log("\n1. Testing Groq (Llama 3.3)...");
        const groq = new Groq({ apiKey: groqKey });
        const res = await groq.chat.completions.create({
            messages: [{ role: "user", content: "Hi" }],
            model: "llama-3.3-70b-versatile"
        });
        console.log("✅ Groq OK:", res.choices[0]?.message?.content);
    } catch (e: any) {
        console.log("❌ Groq FAILED:", e.message);
    }

    // 2. Test OpenRouter (Verifier - Primary)
    try {
        console.log("\n2. Testing OpenRouter (Chimera R1)...");
        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: { "Authorization": `Bearer ${openRouterKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "tngtech/deepseek-r1t2-chimera:free",
                messages: [{ role: "user", content: "Hi" }]
            })
        });
        if (res.ok) console.log("✅ Chimera OK");
        else console.log("❌ Chimera FAILED:", res.status, await res.text());
    } catch (e: any) {
        console.log("❌ Chimera NETWORK ERR:", e.message);
    }

    // 3. Test Google (Writer)
    const geminiModels = ["gemini-2.0-flash-exp", "gemini-1.5-flash", "gemini-1.5-flash-8b"];
    console.log("\n3. Testing Google AI Studio (Writer)...");

    for (const modelId of geminiModels) {
        try {
            const genAI = new GoogleGenerativeAI(geminiKey || "");
            const model = genAI.getGenerativeModel({ model: modelId });
            const res = await model.generateContent("Hi");
            console.log(`✅ Google (${modelId}) OK:`, res.response.text());
            break; // Found one
        } catch (e: any) {
            let msg = e.message || "Unknown";
            if (msg.includes("429")) msg = "429 Quota Exceeded";
            if (msg.includes("404")) msg = "404 Not Found";
            console.log(`❌ Google (${modelId}) FAILED:`, msg);
        }
    }
}

debugWriter();
