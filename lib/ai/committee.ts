import { GoogleGenerativeAI } from '@google/generative-ai';
import { AGENT_ROLES, AI_CONFIG } from './modelConfig';

/**
 * THE WRITER COMMITTEE (Gemini 2.5 Powered)
 * 
 * Orchestrates the 3-Step Writing Process:
 * 1. SEO ARCHITECT (Gemini 2.5 Flash) - Huge Context Window
 * 2. FACT VERIFIER (DeepSeek R1 via OpenRouter) - Logic Check
 * 3. FINAL WRITER (Gemini 2.5 Flash) - High Quality Output
 */

interface CommitteeOutput {
    seoOutline: string;
    verificationNotes: string;
    finalArticle: string;
    error?: string;
}

// --- 1. SEO ARCHITECT (GEMINI 2.5) ---
async function runSeoArchitect(topic: string, researchContext: string): Promise<string> {
    console.log(`🏗️ [Architect] ${AGENT_ROLES.ARCHITECT} starting...`);

    const apiKey = process.env[AI_CONFIG.GEMINI.API_KEY_ENV];
    if (!apiKey) throw new Error("Missing GEMINI_API_KEY");

    // Safety Truncation: Gemini 2.5 has 1M context, so we can be generous.
    // 500,000 chars is safe and huge.
    const SAFE_CONTEXT_LIMIT = 500000;
    const safeContext = researchContext.substring(0, SAFE_CONTEXT_LIMIT);

    const prompt = `
    TOPIC: ${topic}
    RESEARCH: ${safeContext}

    You are the SEO ARCHITECT.
    Create a comprehensive BLOG OUTLINE.
    
    1. Define the H1.
    2. Define H2s and H3s structure.
    3. List target keywords for each section.
    4. Define the Tone/Style.
    
    Return ONLY Markdown.
    `;

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: AGENT_ROLES.ARCHITECT });

        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error: any) {
        console.error("Architect Failed:", error);
        throw new Error(`Architect (${AGENT_ROLES.ARCHITECT}) Failed: ${error.message}`);
    }
}

// --- 2. FACT VERIFIER (GEMINI 2.5) ---
async function runFactVerifier(outline: string, researchContext: string): Promise<string> {
    console.log(`🕵️ [Verifier] ${AGENT_ROLES.VERIFIER} starting...`);
    const apiKey = process.env[AI_CONFIG.GEMINI.API_KEY_ENV]; // Use Gemini Key
    if (!apiKey) throw new Error("Missing GEMINI_API_KEY");

    // Optimization: We don't need the FULL 1M context for just verifying the outline structure.
    // We can truncate to 50k chars to save processing time/latency.
    // The Architect already did the heavy lifting.
    const OPTIMIZED_CONTEXT_LIMIT = 50000;

    const prompt = `
    TASK: Verify this Blog Outline against the Research Context.
    
    RESEARCH CONTEXT (Truncated):
    ${researchContext.substring(0, OPTIMIZED_CONTEXT_LIMIT)}

    OUTLINE TO VERIFY:
    ${outline}

    INSTRUCTIONS:
    1. Check if the H2/H3s match the research facts.
    2. Check for any hallucinations (claims not in research).
    3. Return "VERIFIED" if good.
    4. If bad, list specific bullet points to fix.
    `;

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: AGENT_ROLES.VERIFIER });

        const result = await model.generateContent(prompt);
        return result.response.text();

    } catch (e: any) {
        console.warn("Verifier Failed (Skipping to preserve flow):", e);
        return "Verification Skipped (AI Error).";
    }
}

// --- 3. FINAL WRITER (GEMINI 2.5) ---
async function runFinalWriter(topic: string, outline: string, researchContext: string, verification: string): Promise<string> {
    console.log(`✍️ [Writer] ${AGENT_ROLES.WRITER} starting...`);

    const apiKey = process.env[AI_CONFIG.GEMINI.API_KEY_ENV];
    if (!apiKey) throw new Error("Missing GEMINI_API_KEY");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: AGENT_ROLES.WRITER });

    // GEMINI SUPER POWER: 1 MILLION CONTEXT
    // We pass almost everything. 
    const MAX_CONTEXT_CHARS = 800000;

    const finalPrompt = `
    You are the FINAL WRITER.
    
    TOPIC: ${topic}
    OUTLINE: ${outline}
    VERIFICATION NOTES: ${verification}
    
    RESEARCH DATA:
    ${researchContext.substring(0, MAX_CONTEXT_CHARS)}
    
    TASK:
    Write a High-Quality, Human-Like Blog Post (400 - 2000 words) with YAML Frontmatter.
    
    Start the response with a YAML Frontmatter block containing a focused SEO description (150-160 chars).
    Example:
    ---
    description: "Learn how to diagnose Antminer S19 hashboard failures with this step-by-step guide. Fix 0 asic errors and overheat issues today."
    ---
    
    STYLE & GOALS:
    1. **REPAIR CENTRIC**: You are an Expert ASIC Technician. Use correct industry jargon (e.g., "logs", "hashboards", "soldering", "diagnostics"). Be authoritative.
    2. **SEO FRIENDLY**: Naturally integrate keywords. Do not keyword stuff. Structure with clear H2/H3 for readability.
    3. **HUMANIZED & SALES DRIVEN**: 
       - ❌ Avoid AI fluff ("In the realm of...", "Unlock the potential...").
       - ✅ Write like a human speaking to a customer.
       - ✅ **GOAL**: Attract customers to our repair services/courses. solve their problem, then offer our help.
       - 🔗 **MANDATORY INTERNAL LINKS**:
         - You **MUST** include a link to "https://asicrepair.in/parts" when mentioning replacement parts (e.g., "Buy replacement fans here").
         - You **MUST** include a link to "https://asicrepair.in/#repair" when mentioning complex diagnostics (e.g., "Book a professional repair").
    4. **LENGTH**: 400 - 2000 words (including space for human edits).
    
    STRUCTURE:
    - **Hook**: Grab attention immediately (Repair problem/solution).
    - **Body**: Technical steps, diagrams (described), or analysis.
    - **Conclusion**: Summary + **Strong Call to Action** (Visit ASICREPAIR.IN).
    
    Synthesize the research. If research is thin, rely on your "Technician Persona" to fill gaps logically.
    `;

    try {
        const result = await model.generateContent(finalPrompt);
        return result.response.text();
    } catch (e: any) {
        console.error("Writer (Gemini) Failed:", e);
        throw new Error(`Writer Failed: ${e.message}`);
    }
}

// --- ORCHESTRATOR ---
export async function runCommittee(topic: string, researchContext: string): Promise<CommitteeOutput> {
    let outline = "";
    let verification = "";

    try {
        // 1. Architect 
        outline = await runSeoArchitect(topic, researchContext);

        // 2. Verifier (Soft Fail)
        verification = await runFactVerifier(outline, researchContext);

        // 3. Writer
        const finalArticle = await runFinalWriter(topic, outline, researchContext, verification);

        return { seoOutline: outline, verificationNotes: verification, finalArticle };

    } catch (e: any) {
        console.error("Committee Critical Failure:", e);

        // Recovery: If Outline exists, return it safely.
        if (outline) {
            return {
                seoOutline: outline,
                verificationNotes: verification || "Skipped",
                finalArticle: `## ⚠️ AI Writer Failed\n\n**The Writer AI encountered an error.**\n\n### Generated Outline:\n${outline}\n\n*Error: ${e.message}*`,
                error: e.message
            };
        }

        return { seoOutline: "", verificationNotes: "", finalArticle: "", error: e.message };
    }
}
