import { GoogleGenerativeAI } from "@google/generative-ai";
import { Groq } from "groq-sdk";

/**
 * AI ENGINE (v4 - Groq + Gemini Only)
 * 
 * Simplified 2-tier fallback:
 * 1. Groq (Llama 3.3 70B - Primary)
 * 2. Gemini (Direct API - Fallback)
 * 
 * OpenRouter has been removed as per user request.
 */

// ---------------------------------------------------------------------------
// 1. CONFIGURATION
// ---------------------------------------------------------------------------

export type AgentRole = 'RESEARCHER' | 'REASONER' | 'OUTLINER' | 'WRITER';

// ---------------------------------------------------------------------------
// 2. THE GEMINI FALLBACK
// ---------------------------------------------------------------------------

async function callGeminiDirect(prompt: string, systemInstruction?: string): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("CRITICAL: No GEMINI_API_KEY found for fallback.");

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-8b" });

        const fullPrompt = systemInstruction ? `${systemInstruction}\n\n${prompt}` : prompt;
        const result = await model.generateContent(fullPrompt);
        return result.response.text();
    } catch (error) {
        console.error("❌ GEMINI FALLBACK FAILED:", error);
        throw new Error("GEMINI FALLBACK FAILED.");
    }
}

// ---------------------------------------------------------------------------
// 3. THE GROQ PRIMARY
// ---------------------------------------------------------------------------

async function callGroqDirect(prompt: string, systemInstruction?: string): Promise<string> {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error("No GROQ_API_KEY configured.");

    try {
        const groq = new Groq({ apiKey });
        const messages = [];
        if (systemInstruction) messages.push({ role: "system" as const, content: systemInstruction });
        messages.push({ role: "user" as const, content: prompt });

        const completion = await groq.chat.completions.create({
            messages: messages as any,
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
            max_completion_tokens: 4096
        });

        return completion.choices[0]?.message?.content || "";
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.warn("⚠️ Groq Primary Failed:", errorMessage);
        throw error;
    }
}

// ---------------------------------------------------------------------------
// 4. MAIN ORCHESTRATOR (Groq → Gemini only)
// ---------------------------------------------------------------------------

export async function smartGenerate(
    role: AgentRole,
    prompt: string,
    systemInstruction?: string
): Promise<string> {
    console.log(`🤖 [${role}] Activating. Trying Chain: Groq -> Gemini.`);

    // ATTEMPT 1: Groq (Primary)
    try {
        const result = await callGroqDirect(prompt, systemInstruction);
        console.log(`✅ [${role}] Groq success.`);
        return result;
    } catch (error: unknown) {
        console.warn(`⚠️ [${role}] Groq failed. Switching to Gemini fallback...`);
    }

    // ATTEMPT 2: Gemini (Fallback)
    try {
        const result = await callGeminiDirect(prompt, systemInstruction);
        console.log(`✅ [${role}] Saved by Gemini fallback.`);
        return result;
    } catch (fatalError: unknown) {
        const errorMessage = fatalError instanceof Error ? fatalError.message : 'Unknown error';
        return `SYSTEM_ERROR: Unable to generate content. Details: ${errorMessage}`;
    }
}
