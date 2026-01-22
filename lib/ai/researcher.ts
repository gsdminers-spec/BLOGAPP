/**
 * THE RESEARCHER AGENT (Xiaomi Mimo V2 Flash via OpenRouter)
 * 
 * Capability: PROCESSED REASONING
 * This agent reads raw search results and synthesizes them into a Master Fact Sheet.
 * It uses the 'reasoning' parameter to think through the connections.
 */

interface ResearcherResponse {
    content: string;
    reasoning?: string;
    error?: string;
}

export async function mimoResearch(query: string, context: string): Promise<ResearcherResponse> {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) throw new Error("Missing OPENROUTER_API_KEY");

    // Safety Truncation: Limit context to avoid hitting token limits (Gemini Lite has limits)
    const MAX_CONTEXT = 30000;
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
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "https://asicrepair.in",
                "X-Title": "ASIC Admin Researcher"
            },
            body: JSON.stringify({
                "model": "google/gemini-2.0-flash-lite-preview-02-05:free",
                "messages": [
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            })
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`Gemini API Error: ${err}`);
        }

        const result = await response.json();
        const choice = result.choices?.[0]?.message;

        if (!choice || !choice.content) throw new Error("Received empty output from Researcher Model");

        return {
            content: choice.content,
            reasoning: choice.reasoning_details || ""
        };

    } catch (error: any) {
        console.error("Research Agent Failed:", error);
        return { content: "", error: error.message };
    }
}
