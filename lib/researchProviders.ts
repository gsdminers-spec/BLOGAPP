import { SearchResult } from './types';

interface ProviderResult {
    provider: 'tavily' | 'brave' | 'serper';
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
