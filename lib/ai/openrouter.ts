import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * DEEP CONSENSUS ENGINE
 * 
 * This client manages the "Council of Agents" for robust article generation.
 * It implements a 3-tier safety net:
 * 1. Primary OpenRouter Model (e.g., GPT-OSS-120B)
 * 2. Alternate OpenRouter Model (e.g., DeepSeek R1)
 * 3. The "Gemini Floor" (Direct Google API)
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
// Map Roles to Verified Free Models (Audited)
const AGENT_ROSTER: Record<AgentRole, ModelPair> = {
    RESEARCHER: {
        primary: "google/gemini-2.0-flash-exp:free", // Verified Working (1M Context)
        alternate: "google/gemini-2.0-pro-exp-02-05:free" // Good backup
    },
    REASONER: {
        // GPT-OSS might be flaky, switching to DeepSeek R1 as Primary (Strongest Free Reasoner)
        primary: "deepseek/deepseek-r1:free",
        alternate: "nvidia/llama-3.1-nemotron-70b-instruct:free" // Very strong alternative
    },
    OUTLINER: {
        // Upgrading to Llama 3.1 8B (Better instruction following)
        primary: "meta-llama/llama-3.1-8b-instruct:free",
        alternate: "mistralai/mistral-7b-instruct:free"
    },
    WRITER: {
        primary: "google/gemini-2.0-flash-exp:free", // Large context for long articles
        alternate: "google/gemini-2.0-pro-exp-02-05:free"
    }
};

// ---------------------------------------------------------------------------
// 2. THE GEMINI FLOOR (Ultimate Safety Net)
// ---------------------------------------------------------------------------

/**
 * Failsafe: Uses the direct Google Gemini API if OpenRouter is completely down.
 */
async function callGeminiDirect(prompt: string, systemInstruction?: string): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("CRITICAL: No GEMINI_API_KEY found for emergency fallback.");

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Fast, reliable floor

        const fullPrompt = systemInstruction ? `${systemInstruction}\n\n${prompt}` : prompt;
        const result = await model.generateContent(fullPrompt);
        return result.response.text();
    } catch (error) {
        console.error("❌ GEMINI FLOOR FAILED:", error);
        throw new Error("TOTAL SYSTEM FAILURE: Both OpenRouter and Gemini Direct failed.");
    }
}

// ---------------------------------------------------------------------------
// 3. OPENROUTER CLIENT (With Circuit Breakers)
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
        // Handle Rate Limits specifically
        if (response.status === 429) {
            throw new Error(`RATE_LIMIT`);
        }
        const errorText = await response.text();
        throw new Error(`OpenRouter Error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "";
}

// ---------------------------------------------------------------------------
// 4. MAIN ORCHESTRATOR
// ---------------------------------------------------------------------------

/**
 * Smart Generate: Tries Primary -> Alternate -> Gemini Floor
 */
export async function smartGenerate(
    role: AgentRole,
    prompt: string,
    systemInstruction?: string
): Promise<string> {
    const models = AGENT_ROSTER[role];
    console.log(`🤖 [${role}] Activating. Primary: ${models.primary} | Alternate: ${models.alternate}`);

    // ATTEMPT 1: Primary Model
    try {
        return await callOpenRouterRaw(models.primary, prompt, systemInstruction);
    } catch (error: any) {
        console.warn(`⚠️ [${role}] Primary (${models.primary}) failed: ${error.message}. Switching to Alternate...`);

        // Brief pause if it was a rate limit to let buffers clear
        if (error.message.includes('RATE_LIMIT')) await sleep(1000);
    }

    // ATTEMPT 2: Alternate Model
    try {
        return await callOpenRouterRaw(models.alternate, prompt, systemInstruction);
    } catch (error: any) {
        console.error(`🚨 [${role}] Alternate (${models.alternate}) failed: ${error.message}. ACTIVATING GEMINI FLOOR.`);
    }

    // ATTEMPT 3: Gemini Floor (Direct API)
    try {
        const floorResult = await callGeminiDirect(prompt, systemInstruction);
        console.log(`✅ [${role}] Saved by Gemini Floor.`);
        return floorResult;
    } catch (fatalError: any) {
        // If we get here, everything is broken.
        return `SYSTEM_ERROR: Unable to generate content. Details: ${fatalError.message}`;
    }
}
