import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * THE RESEARCHER AGENT (Gemini 2.0 Flash via Google AI Studio)
 * 
 * Capability: PROCESSED REASONING
 * This agent reads raw search results and synthesizes them into a Master Fact Sheet.
 */

interface ResearcherResponse {
    content: string;
    reasoning?: string;
    error?: string;
}

export async function mimoResearch(query: string, context: string): Promise<ResearcherResponse> {
    const apiKey = process.env.GEMINI_API_KEY; // Switching to Google AI Studio Key
    if (!apiKey) throw new Error("Missing GEMINI_API_KEY");

    // Safety Truncation: Gemini 2.0 has 1M context, but let's be safe and focused.
    // 100k chars is plenty for a summary and safe for the Flash model.
    const MAX_CONTEXT = 100000;
    const safeContext = context.length > MAX_CONTEXT
        ? context.substring(0, MAX_CONTEXT) + "\n...(Truncated)..."
        : context;

    const prompt = `
    QUERY: ${query}

    CONTEXT (Search Results):
    ${safeContext}

    TASK:
    You are an Expert Technical Researcher.
    Read the provided context deeply.
    Create a "Master Fact Sheet" in Markdown.
    
    Structure:
    1. **Key Specifications/Facts** (Hard data)
    2. **Common Issues & Solutions** (From Reddit/Forums)
    3. **Technical Nuances** (Hidden details)
    4. **Source Verification** (Which sources are credible?)

    Do NOT write a blog post. Write a dense internal briefing for a Writer.
    `;

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        // Switching to 'gemini-2.5-flash' (Stable, June 2025 Release)
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        if (!text) throw new Error("Received empty output from Gemini Researcher");

        return {
            content: text,
            reasoning: "" // Google SDK doesn't expose reasoning trace same way as DeepSeek/OpenRouter
        };

    } catch (error: any) {
        console.error("Research Agent (Google) Failed:", error);
        return { content: "", error: error.message };
    }
}
