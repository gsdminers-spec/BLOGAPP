import { Groq } from 'groq-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * THE WRITER COMMITTEE
 * 
 * Orchestrates the 3-Step Writing Process:
 * 1. SEO ARCHITECT (Llama 3.3 via Groq)
 * 2. FACT VERIFIER (Chimera R1 via OpenRouter)
 * 3. FINAL WRITER (Gemini 2.5 Flash via Google)
 */

interface CommitteeOutput {
    seoOutline: string;
    verificationNotes: string;
    finalArticle: string;
    error?: string;
}

// --- 1. SEO ARCHITECT ---
async function runSeoArchitect(topic: string, researchContext: string): Promise<string> {
    console.log("🏗️ [Architect] Llama 3.3 starting...");
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    // Groq Rate Limit Protection: Llama 3.3 has a strict 12k TPM limit.
    // 20,000 chars is approx 5,000 tokens. + 2,000 output tokens = ~7,000 tokens. Safe.
    const SAFE_GROQ_CONTEXT = 20000;
    const truncatedContext = researchContext.substring(0, SAFE_GROQ_CONTEXT);

    const prompt = `
    TOPIC: ${topic}
    RESEARCH: ${truncatedContext} (Truncated for Groq Rate Limits)

    You are the SEO ARCHITECT.
    Create a comprehensive BLOG OUTLINE.
    
    1. Define the H1.
    2. Define H2s and H3s structure.
    3. List target keywords for each section.
    4. Define the Tone/Style.
    
    Return ONLY Markdown.
    `;

    const chatCompletion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.3-70b-versatile",
        temperature: 0.7,
        max_completion_tokens: 2048,
    });

    return chatCompletion.choices[0]?.message?.content || "";
}

// --- 2. FACT VERIFIER (RESILIENT) ---
async function runFactVerifier(outline: string, researchContext: string): Promise<string> {
    console.log("🕵️ [Verifier] Chimera R1 starting...");
    const apiKey = process.env.OPENROUTER_API_KEY;

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "https://asicrepair.in",
                "X-Title": "ASIC Admin Verifier"
            },
            body: JSON.stringify({
                "model": "tngtech/deepseek-r1t2-chimera:free",
                "messages": [{
                    "role": "user",
                    "content": `Verify outline. Return "VERIFIED" or issues.\n\nCONTEXT: ${researchContext.substring(0, 5000)}\n\nOUTLINE: ${outline}`
                }]
            })
        });

        if (!response.ok) throw new Error(`Primary failed: ${response.status}`);
        const data = await response.json();
        return data.choices[0]?.message?.content || "Verified";

    } catch (e) {
        console.warn("Verifier Failed (Skipping to preserve flow):", e);
        return "Verification Skipped (AI Provider Error). Proceeding with unverified outline.";
    }
}

// --- 3. FINAL WRITER (MULTI-MODEL BACKUP) ---
async function runFinalWriter(topic: string, outline: string, researchContext: string, verification: string): Promise<string> {
    console.log("✍️ [Writer] Starting...");
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("Missing GEMINI_API_KEY");
    const genAI = new GoogleGenerativeAI(apiKey);

    const finalPrompt = `
    TOPIC: ${topic}
    OUTLINE: ${outline}
    VERIFICATION: ${verification}
    RESEARCH: ${researchContext.substring(0, 50000)}
    TASK: Write the Full Blog Post (Markdown). Professional Tone.
    `;

    // Strategy: Try Primary -> Try Backup -> Fail Gracefully
    const models = ["gemini-2.0-flash-exp", "gemini-1.5-flash-8b"];

    for (const modelId of models) {
        try {
            console.log(`Trying Writer Model: ${modelId}`);
            const model = genAI.getGenerativeModel({ model: modelId });
            const result = await model.generateContent(finalPrompt);
            const text = result.response.text();
            if (text) return text;
        } catch (e: any) {
            console.warn(`Writer Model ${modelId} Failed:`, e.message);
        }
    }

    throw new Error("All Writer Models Failed (Quota Exceeded).");
}

// --- ORCHESTRATOR ---
export async function runCommittee(topic: string, researchContext: string): Promise<CommitteeOutput> {
    let outline = "";
    let verification = "";

    try {
        // 1. Architect (Groq - Usually Reliable)
        outline = await runSeoArchitect(topic, researchContext);

        // 2. Verifier (Soft Fail)
        verification = await runFactVerifier(outline, researchContext);

        // 3. Writer (With Fallback)
        const finalArticle = await runFinalWriter(topic, outline, researchContext, verification);

        return { seoOutline: outline, verificationNotes: verification, finalArticle };

    } catch (e: any) {
        console.error("Committee Critical Failure:", e);

        // RECOVERY: If we at least have the outline, return that!
        if (outline) {
            return {
                seoOutline: outline,
                verificationNotes: verification || "Skipped",
                finalArticle: `## ⚠️ AI Writer Quota Exceeded\n\n**The system generated the outline successfully, but the Writer AI is currently overloaded.**\n\n### Generated Outline:\n${outline}\n\n*Please copy this outline and use it manually, or try again in 10 minutes.*`,
                error: "Writer Failed, Outline Preserved."
            };
        }

        return { seoOutline: "", verificationNotes: "", finalArticle: "", error: e.message };
    }
}
