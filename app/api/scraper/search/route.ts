import { NextResponse } from 'next/server';
import { searchTavily, searchBrave, searchSerper, searchGemini } from '@/lib/researchProviders';
import { SearchResult } from '@/lib/types';
import { smartGenerate } from '@/lib/ai/openrouter';

export const maxDuration = 60; // Allow 1 minute for search & summarization

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const topic = body.topic || body.query;

        // Keys
        const tavilyKey = process.env.TAVILY_API_KEY;
        const braveKey = process.env.BRAVE_API_KEY;
        const serperKey = process.env.SERPER_API_KEY;
        const geminiKey = process.env.GEMINI_API_KEY;

        if (!topic) {
            return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
        }

        // 1. EXECUTE PARALLEL SEARCHES
        const promises = [];

        if (tavilyKey) promises.push(searchTavily(topic, tavilyKey));
        if (braveKey) promises.push(searchBrave(topic, braveKey));
        if (serperKey) promises.push(searchSerper(topic, serperKey));
        // Use Gemini Grounding as a search provider if key exists
        if (geminiKey) promises.push(searchGemini(topic, geminiKey));

        if (promises.length === 0) {
            return NextResponse.json({ error: 'No search providers configured' }, { status: 500 });
        }

        // Wait for all (fail resilient)
        const providerResults = await Promise.all(promises);

        // 2. AGGREGATE & DEDUPLICATE
        let allResults: SearchResult[] = [];
        const seenUrls = new Set<string>();

        providerResults.forEach(p => {
            if (p.results) {
                p.results.forEach(r => {
                    if (!seenUrls.has(r.url)) {
                        seenUrls.add(r.url);
                        allResults.push({ ...r, source: p.provider });
                    }
                });
            }
        });

        // Limit total context for Gemini (e.g., top 15 mixed results)
        allResults = allResults.slice(0, 15);

        // 3. GENERATE MASTER SUMMARY (Using Deep Consensus Client)
        let summary = "";

        if (allResults.length > 0) {
            const contextText = allResults.map(r => `[${r.title}] ${r.content}`).join('\n\n');
            const summaryPrompt = `
            Synthesize the following search results into a concise, high-level summary (3-4 sentences).
            TOPIC: ${topic}
            
            SEARCH RESULTS:
            ${contextText}
            
            Focus on technical accuracy and key facts.
            `;

            // Use 'RESEARCHER' role as it's optimized for reading context (Gemini Flash)
            try {
                // We use 'RESEARCHER' because it defaults to Gemini Flash Free (1M context) 
                // which is perfect for reading search results.
                summary = await smartGenerate('RESEARCHER', summaryPrompt, "You are a Research Assistant.");
            } catch (e) {
                console.error("SmartGenerate Summary Failed:", e);
                summary = "Summary generation failed, but results were captured below.";
            }

            // 4. FORMAT KEY FINDINGS
            const keyFindings = allResults.map(r => `[${r.title}] ${r.content.substring(0, 150)}...`);

            return NextResponse.json({
                success: true,
                results: allResults,
                aiSummary: summary,
                keyFindings: keyFindings,
                sources: providerResults.map(p => p.provider)
            });

        } else {
            return NextResponse.json({
                success: true,
                results: [],
                aiSummary: "No search results found.",
                keyFindings: [],
                sources: []
            });
        }

    } catch (error) {
        console.error('Search API Error:', error);
        return NextResponse.json({ error: 'Failed to perform search' }, { status: 500 });
    }
}
