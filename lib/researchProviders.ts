import { SearchResult } from './types';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface ProviderResult {
    provider: 'tavily' | 'brave' | 'serper' | 'gemini';
    results: SearchResult[];
    error?: string;
}

const SLEEP_MS = 5000; // 5 seconds wait for rate limits

async function wait(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// --- TAVILY ---
export async function searchTavily(query: string, apiKey: string): Promise<ProviderResult> {
    try {
        const response = await fetch('https://api.tavily.com/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                api_key: apiKey,
                query: query,
                search_depth: "advanced", // UPDATED: Advanced depth for deep context
                include_answer: true,
                max_results: 5
            }),
        });

        if (!response.ok) throw new Error(`Tavily error: ${response.statusText}`);
        const data = await response.json();

        const results = (data.results || []).map((r: any) => ({
            title: r.title,
            url: r.url,
            content: r.content,
            score: r.score
        }));

        return { provider: 'tavily', results };
    } catch (e: any) {
        console.error('Tavily Search Failed:', e.message);
        return { provider: 'tavily', results: [], error: e.message };
    }
}

// --- BRAVE SEARCH ---
export async function searchBrave(query: string, apiKey: string): Promise<ProviderResult> {
    try {
        const url = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=5`;
        const response = await fetch(url, {
            headers: {
                'Accept': 'application/json',
                'X-Subscription-Token': apiKey
            }
        });

        if (!response.ok) throw new Error(`Brave error: ${response.statusText}`);
        const data = await response.json();

        // Brave structure: web.results[]
        const results: SearchResult[] = (data.web?.results || []).map((r: any) => ({
            title: r.title,
            url: r.url,
            content: r.content,
            description: r.description || r.snippet || '',
        }));

        return { provider: 'brave', results };
    } catch (e: any) {
        console.error('Brave Search Failed:', e.message);
        return { provider: 'brave', results: [], error: e.message };
    }
}

// --- SERPER.DEV ---
export async function searchSerper(query: string, apiKey: string): Promise<ProviderResult> {
    try {
        const response = await fetch('https://google.serper.dev/search', {
            method: 'POST',
            headers: {
                'X-API-KEY': apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ q: query, num: 5 })
        });

        if (!response.ok) throw new Error(`Serper error: ${response.statusText}`);
        const data = await response.json();

        // 1. Organic Results
        const results: SearchResult[] = (data.organic || []).map((r: any) => ({
            title: r.title,
            url: r.link,
            content: r.snippet || '',
        }));

        // 2. Knowledge Graph (Extract if available)
        if (data.knowledgeGraph) {
            results.unshift({
                title: `[Knowledge Graph] ${data.knowledgeGraph.title || query}`,
                url: data.knowledgeGraph.website || 'https://google.com',
                content: `${data.knowledgeGraph.description || ''} ${data.knowledgeGraph.attributes ? JSON.stringify(data.knowledgeGraph.attributes) : ''}`
            });
        }

        // 3. People Also Ask (Extract definitions/facts)
        if (data.peopleAlsoAsk && data.peopleAlsoAsk.length > 0) {
            const paaContent = data.peopleAlsoAsk.map((p: any) => `Q: ${p.question} A: ${p.snippet}`).join(' | ');
            results.push({
                title: '[People Also Ask] Related Questions',
                url: 'https://google.com',
                content: paaContent
            });
        }

        return { provider: 'serper', results };
    } catch (e: any) {
        console.error('Serper Search Failed:', e.message);
        return { provider: 'serper', results: [], error: e.message };
    }
}

// --- GEMINI GROUNDING ---

export async function searchGemini(query: string, apiKey: string): Promise<ProviderResult> {
    const genAI = new GoogleGenerativeAI(apiKey);
    // Fallback to 1.5-flash failing (404), so retry 2.0-flash-exp which exists.
    // With robust parsing, this should now work.
    const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash-exp",
        tools: [{ googleSearchRetrieval: {} }]
    });

    const prompt = `Perform a google search for: "${query}".
    Return a JSON object with a key "results" which is an array of the top 5 search results.
    Each result must have:
    - "title": string
    - "url": string
    - "content": string (a brief summary or snippet of the page info)
    Ensure the output is raw JSON only, no markdown formatting.`;

    let attempt = 0;
    const maxAttempts = 2;

    while (attempt < maxAttempts) {
        try {
            const result = await model.generateContent(prompt);
            const text = result.response.text();

            let data;
            let jsonStr = "";
            try {
                // Robust JSON extraction: look for { "results": ... }
                const match = text.match(/\{[\s\S]*\}/);
                if (match) {
                    jsonStr = match[0];
                    data = JSON.parse(jsonStr);
                } else {
                    throw new Error("No JSON object found in response");
                }
            } catch (parseError) {
                console.error("Gemini Search Parse Error. Raw text:", text);
                // FAILSAFE: If JSON fails, treat the whole response as one "source"
                return {
                    provider: 'gemini',
                    results: [{
                        title: "Gemini Research Summary (Fallback)",
                        url: "https://google.com/search?q=" + encodeURIComponent(query),
                        content: text
                    }]
                };
            }

            const results: SearchResult[] = (data.results || []).map((r: any) => ({
                title: r.title,
                url: r.url,
                content: r.content,
            }));

            if (results.length === 0) {
                console.warn("Gemini returned 0 results. Raw response:", text);
                return {
                    provider: 'gemini',
                    results: [{
                        title: "Gemini Research (Raw)",
                        url: "#",
                        content: text
                    }]
                };
            }

            return { provider: 'gemini', results };

        } catch (e: any) {
            // CHECK FOR RATE LIMIT (429)
            if (e.message.includes('429') && attempt < maxAttempts - 1) {
                console.warn(`Gemini 429 Rate Limit hit. Retrying in ${SLEEP_MS / 1000}s...`);
                await wait(SLEEP_MS);
                attempt++;
                continue; // Retry loop
            }

            console.error('Gemini Search Failed:', e.message);
            return { provider: 'gemini', results: [], error: `Gemini Error: ${e.message}` };
        }
    }

    return { provider: 'gemini', results: [], error: "Gemini Failed after retries." };
}
