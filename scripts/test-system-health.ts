import dotenv from 'dotenv';
import { Groq } from 'groq-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config({ path: '.env.local' });

async function checkSystemHealth() {
    console.log("\n🏥 SYSTEM HEALTH CHECK [Deep Diagnostic]\n" + "=".repeat(50));

    const keys = {
        GROQ: process.env.GROQ_API_KEY,
        GEMINI: process.env.GEMINI_API_KEY,
        OPENROUTER: process.env.OPENROUTER_API_KEY
    };

    // 1. API KEY AUDIT
    console.log("🔑 API KEY AUDIT:");
    for (const [name, key] of Object.entries(keys)) {
        if (!key) console.log(`   ❌ ${name}: MISSING`);
        else console.log(`   ✅ ${name}: Present (${key.substring(0, 8)}...)`);
    }
    console.log("");

    // 2. GROQ HEALTH CHECK (Latency & Limits)
    if (keys.GROQ) {
        console.log("🦙 GROQ DIAGNOSTIC (Llama 3.3):");
        try {
            const groq = new Groq({ apiKey: keys.GROQ });
            const start = Date.now();
            const completion = await groq.chat.completions.create({
                messages: [{ role: "user", content: "Ping" }],
                model: "llama-3.3-70b-versatile",
                max_completion_tokens: 10
            });
            const latency = Date.now() - start;
            console.log(`   ✅ STATUS: ONLINE (${latency}ms)`);
            console.log(`   📝 RESPONSE: "${completion.choices[0]?.message?.content}"`);
        } catch (e: any) {
            console.log(`   ❌ STATUS: FAILED (${e.message})`);
            if (e.message.includes("429")) console.log("   ⚠️  WARNING: Rate Limit Exceeded (12k TPM?)");
        }
    }

    // 3. OPENROUTER HEALTH CHECK (Payment & Access)
    if (keys.OPENROUTER) {
        console.log("\n🌐 OPENROUTER DIAGNOSTIC (Mimo/Chimera):");
        const scanOpenRouter = async (model: string) => {
            try {
                const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                    method: "POST",
                    headers: { "Authorization": `Bearer ${keys.OPENROUTER}`, "Content-Type": "application/json" },
                    body: JSON.stringify({ model: model, messages: [{ role: "user", content: "Ping" }] })
                });
                if (res.ok) console.log(`   ✅ ${model}: ONLINE`);
                else console.log(`   ❌ ${model}: FAILED (${res.status} ${res.statusText})`);
            } catch (e: any) {
                console.log(`   ❌ ${model}: NETWORK ERROR (${e.message})`);
            }
        };
        await scanOpenRouter("tngtech/deepseek-r1t2-chimera:free");
        await scanOpenRouter("google/gemini-2.0-flash-lite-preview-02-05:free");
    }

    // 4. GOOGLE GEMINI HEALTH CHECK (Quota & Models)
    if (keys.GEMINI) {
        console.log("\n💎 GEMINI DIAGNOSTIC (Google Direct):");
        const genAI = new GoogleGenerativeAI(keys.GEMINI);
        const models = ["gemini-1.5-flash", "gemini-1.5-flash-8b", "gemini-2.0-flash-exp"];

        for (const m of models) {
            try {
                const model = genAI.getGenerativeModel({ model: m });
                const result = await model.generateContent("Ping");
                const text = result.response.text();
                if (text) console.log(`   ✅ ${m}: ONLINE`);
            } catch (e: any) {
                let msg = e.message || "";
                if (msg.includes("429")) console.log(`   🔸 ${m}: RATE LIMITED (429)`);
                else if (msg.includes("404")) console.log(`   ❌ ${m}: NOT FOUND (404)`);
                else console.log(`   ❌ ${m}: FAILED (${msg.substring(0, 50)})`);
            }
        }
    }
    console.log("\n" + "=".repeat(50) + "\nDIAGNOSTIC COMPLETE");
}

checkSystemHealth();
