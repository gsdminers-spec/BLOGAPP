import { SearchResult } from './types';

interface ProviderResult {
    provider: 'tavily' | 'brave' | 'serper' | 'gemini';
    results: SearchResult[];
    error?: string;
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
                search_depth: "basic",
                include_answer: true,
                max_results: 5
            }),
        });

        if (!response.ok) throw new Error(`Tavily error: ${response.statusText}`);
        const data = await response.json();

        // Tavily gives specific answer, we'll attach it to the first result or handle upstream
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
            content: r.description || r.snippet || '', // Brave uses 'description' often
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

        const results: SearchResult[] = (data.organic || []).map((r: any) => ({
            title: r.title,
            url: r.link,
            content: r.snippet || '',
        }));

        return { provider: 'serper', results };
    } catch (e: any) {
        console.error('Serper Search Failed:', e.message);
        return { provider: 'serper', results: [], error: e.message };
    }
}

// --- GEMINI GROUNDING ---
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function searchGemini(query: string, apiKey: string): Promise<ProviderResult> {
    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash-exp", // Verify if 2.0 is available, otherwise 1.5-flash
            tools: [{ googleSearchRetrieval: {} }]
        });

        const prompt = `Perform a google search for: "${query}".
        Return a JSON object with a key "results" which is an array of the top 5 search results.
        Each result must have:
        - "title": string
        - "url": string
        - "content": string (a brief summary or snippet of the page info)
        Ensure the output is raw JSON only, no markdown formatting.`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(jsonStr);

        const results: SearchResult[] = (data.results || []).map((r: any) => ({
            title: r.title,
            url: r.url,
            content: r.content,
        }));

        return { provider: 'gemini', results };
    } catch (e: any) {
        console.error('Gemini Search Failed:', e.message);
        return { provider: 'gemini', results: [], error: e.message };
    }
}
