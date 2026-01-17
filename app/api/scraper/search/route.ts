import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { query, maxResults = 10 } = await req.json();

        if (!query) {
            return NextResponse.json({ error: 'Query is required' }, { status: 400 });
        }

        // Use DuckDuckGo Instant Answer API (free, no key required)
        // For more comprehensive results, we'll scrape the HTML search page
        const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;

        const response = await fetch(searchUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        if (!response.ok) {
            throw new Error('Search request failed');
        }

        const html = await response.text();

        // Parse search results from HTML
        const results = parseSearchResults(html, maxResults);

        return NextResponse.json({
            success: true,
            query,
            results,
            count: results.length
        });

    } catch (error: any) {
        console.error('Scraper API Error:', error);
        return NextResponse.json({ error: error.message || 'Search failed' }, { status: 500 });
    }
}

function parseSearchResults(html: string, maxResults: number) {
    const results: Array<{ title: string, url: string, snippet: string }> = [];

    // Simple regex-based extraction (works for DuckDuckGo HTML)
    const resultRegex = /<a[^>]*class="result__a"[^>]*href="([^"]*)"[^>]*>([^<]*)<\/a>[\s\S]*?<a[^>]*class="result__snippet"[^>]*>([^<]*)/g;

    let match;
    while ((match = resultRegex.exec(html)) !== null && results.length < maxResults) {
        const url = match[1];
        const title = match[2].trim();
        const snippet = match[3].trim();

        if (title && url) {
            results.push({ title, url, snippet });
        }
    }

    // Alternative extraction if regex didn't work well
    if (results.length === 0) {
        // Fallback: extract any links with reasonable text
        const linkRegex = /<a[^>]*href="(https?:\/\/[^"]+)"[^>]*>([^<]{10,})<\/a>/g;
        while ((match = linkRegex.exec(html)) !== null && results.length < maxResults) {
            const url = match[1];
            const title = match[2].trim();
            if (!url.includes('duckduckgo.com') && title.length > 10) {
                results.push({ title, url, snippet: '' });
            }
        }
    }

    return results;
}
