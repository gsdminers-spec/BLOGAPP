import { GoogleGenerativeAI } from "@google/generative-ai";
import { Groq } from "groq-sdk";

/**
 * DEEP CONSENSUS ENGINE (v3 - Groq Enhanced)
 * 
 * This client manages the "Council of Agents" for robust article generation.
 * It implements a 4-tier safety net:
 * 1. Primary OpenRouter Model (e.g., DeepSeek R1)
 * 2. The "Groq Bridge" (Llama 3.3 70B - Fast & Reliable)
 * 3. Alternate OpenRouter Model
 * 4. The "Gemini Floor" (Direct Google API - Last Resort)
 */

// ---------------------------------------------------------------------------
// 1. CONFIGURATION: The "Council" Roster
// ---------------------------------------------------------------------------

export type AgentRole = 'RESEARCHER' | 'REASONER' | 'OUTLINER' | 'WRITER';

interface ModelPair {
    primary: string;
    alternate: string;
}

// Map Roles to Specific Free Models
const AGENT_ROSTER: Record<AgentRole, ModelPair> = {
    RESEARCHER: {
        primary: "google/gemini-2.0-flash-exp:free",
        alternate: "google/gemini-2.0-pro-exp-02-05:free"
    },
    REASONER: {
        primary: "deepseek/deepseek-r1:free",
        alternate: "nvidia/llama-3.1-nemotron-70b-instruct:free"
    },
    OUTLINER: {
        primary: "meta-llama/llama-3.1-8b-instruct:free",
        alternate: "mistralai/mistral-7b-instruct:free"
    },
    WRITER: {
        primary: "google/gemini-2.0-flash-exp:free",
        alternate: "google/gemini-2.0-pro-exp-02-05:free"
    }
};

// ---------------------------------------------------------------------------
// 2. THE GEMINI FLOOR (Ultimate Safety Net)
// ---------------------------------------------------------------------------

async function callGeminiDirect(prompt: string, systemInstruction?: string): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("CRITICAL: No GEMINI_API_KEY found for emergency fallback.");

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        // Using 'gemini-1.5-flash-8b' as it is often separate quota from the main 2.0/1.5 models
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-8b" });

        const fullPrompt = systemInstruction ? `${systemInstruction}\n\n${prompt}` : prompt;
        const result = await model.generateContent(fullPrompt);
        return result.response.text();
    } catch (error) {
        console.error("❌ GEMINI FLOOR FAILED:", error);
        throw new Error("TOTAL SYSTEM FAILURE: OpenRouter, Groq, and Gemini all failed.");
    }
}

// ---------------------------------------------------------------------------
// 3. THE GROQ BRIDGE (Reliable Layer)
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
            messages: messages as any, // Groq SDK type compatibility
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
            max_completion_tokens: 4096
        });

        return completion.choices[0]?.message?.content || "";
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.warn("⚠️ Groq Bridge Failed:", errorMessage);
        throw error;
    }
}

// ---------------------------------------------------------------------------
// 4. OPENROUTER CLIENT (With Circuit Breakers)
// ---------------------------------------------------------------------------

async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function callOpenRouterRaw(modelId: string, prompt: string, systemInstruction?: string): Promise<string> {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new Error("No OPENROUTER_API_KEY configured.");

    const messages = [];
    if (systemInstruction) messages.push({ role: "system", content: systemInstruction });
    messages.push({ role: "user", content: prompt });

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "HTTP-Referer": "https://asicrepair.in",
            "X-Title": "ASIC Admin Consensus",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: modelId,
            messages: messages,
            temperature: 0.7,
            top_p: 0.9,
        })
    });

    if (!response.ok) {
        if (response.status === 429) throw new Error(`RATE_LIMIT`);
        const errorText = await response.text();
        throw new Error(`OpenRouter Error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "";
}

// ---------------------------------------------------------------------------
// 5. MAIN ORCHESTRATOR
// ---------------------------------------------------------------------------

export async function smartGenerate(
    role: AgentRole,
    prompt: string,
    systemInstruction?: string
): Promise<string> {
    const models = AGENT_ROSTER[role];
    console.log(`🤖 [${role}] Activating. Trying Chain: OpenRouter -> Groq -> Gemini.`);

    // ATTEMPT 1: Primary Model (OpenRouter)
    try {
        return await callOpenRouterRaw(models.primary, prompt, systemInstruction);
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.warn(`⚠️ [${role}] Primary (${models.primary}) failed. Switching to Groq...`);
        if (errorMessage.includes('RATE_LIMIT')) await sleep(1000);
    }

    // ATTEMPT 2: The Groq Bridge (Llama 3.3)
    try {
        const groqResult = await callGroqDirect(prompt, systemInstruction);
        console.log(`✅ [${role}] Saved by Groq Bridge.`);
        return groqResult;
    } catch (error: unknown) {
        console.warn(`⚠️ [${role}] Groq Bridge failed. Switching to Alternate OpenRouter...`);
    }

    // ATTEMPT 3: Alternate Model (OpenRouter)
    try {
        return await callOpenRouterRaw(models.alternate, prompt, systemInstruction);
    } catch (error: unknown) {
        console.error(`🚨 [${role}] Alternate (${models.alternate}) failed. ACTIVATING GEMINI FLOOR.`);
    }

    // ATTEMPT 4: Gemini Floor (Direct API)
    try {
        const floorResult = await callGeminiDirect(prompt, systemInstruction);
        console.log(`✅ [${role}] Saved by Gemini Floor.`);
        return floorResult;
    } catch (fatalError: unknown) {
        const errorMessage = fatalError instanceof Error ? fatalError.message : 'Unknown error';
        return `SYSTEM_ERROR: Unable to generate content. Details: ${errorMessage}`;
    }
}
