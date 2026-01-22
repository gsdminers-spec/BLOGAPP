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

    const prompt = `
    QUERY: ${query}

    CONTEXT (Search Results):
    ${context}

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
        // First API call with reasoning enabled (User provided pattern)
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "https://asicrepair.in",
                "X-Title": "ASIC Admin Researcher"
            },
            body: JSON.stringify({
                "model": "xiaomi/mimo-v2-flash:free",
                "messages": [
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "reasoning": { "enabled": true }
            })
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`Mimo API Error: ${err}`);
        }

        const result = await response.json();
        const choice = result.choices?.[0]?.message;

        if (!choice) throw new Error("No output from Mimo");

        // We capture both the content AND the reasoning details
        return {
            content: choice.content,
            reasoning: choice.reasoning_details || "No reasoning details provided by model."
        };

    } catch (error: any) {
        console.error("Mimo Research Failed:", error);
        return { content: "", error: error.message };
    }
}
